"use client";

import { atom, useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { USER_STATUS, userAtom } from "../_state/user-atom";
import { friendAtom } from "../_state/friend-atom";
import { apiCall, GetCookie } from "../_helper/api-client";
import { socketAtom } from "../_state/socket-atom";
import { serverAtom } from "../_state/server-atom";
import { mediaAtom } from "../_state/media-atom";
import { usePathname, useRouter } from "next/navigation";
import { channelListAtom } from "../_state/channel-list-atom";
import {
  MemberList,
  memberListServerAtom,
} from "../_state/membet-list-server-atom";
import { dmAtom } from "../_state/dm-list-atom";

export default function AuthProvider(props: { children: React.ReactNode }) {
  const [loadingCount, setLoadingCount] = useState(6);
  const [user, setUser] = useAtom(userAtom);
  const [friend, setFriend] = useAtom(friendAtom);
  const idleDelay = 1 * 60 * 1000; // 1 menit
  const idleTimeout = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [socket, setSocket] = useAtom(socketAtom);
  const lastStatus = useRef<"online" | "idle">("online");
  const [server, setServer] = useAtom(serverAtom);
  const [media, setMedia] = useAtom(mediaAtom);
  const [channels, setChannels] = useAtom(channelListAtom);
  const [members, setMembers] = useAtom(memberListServerAtom);
  const [dm, setDM] = useAtom(dmAtom);

  useEffect(() => {
    apiCall(`${process.env.NEXT_PUBLIC_HOST_API}auth/me`, {
      method: "GET",
    })
      .then(async (resp) => {
        if (resp.ok) {
          const res = await resp.json();
          setUser(res.data);
          setLoadingCount((p) => p - 1);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (loadingCount == 5) {
      apiCall(`${process.env.NEXT_PUBLIC_HOST_API}friends`, {
        method: "GET",
      })
        .then(async (resp) => {
          if (resp.ok) {
            const res = await resp.json();
            setFriend(res.data);
            setLoadingCount((p) => p - 1);
          }
        })
        .catch(() => {});
    }
  }, [loadingCount]);

  useEffect(() => {
    if (loadingCount == 4) {
      apiCall(`${process.env.NEXT_PUBLIC_HOST_API}server/me`, {
        method: "GET",
      })
        .then(async (resp) => {
          if (resp.ok) {
            const res = await resp.json();
            setServer(res.data);
            setLoadingCount((p) => p - 1);
          }
        })
        .catch(() => {});
    }
  }, [loadingCount]);

  useEffect(() => {
    if (loadingCount == 3) {
      apiCall(`${process.env.NEXT_PUBLIC_HOST_API}server/channels`, {
        method: "GET",
      })
        .then(async (resp) => {
          if (resp.ok) {
            const res = await resp.json();
            setChannels(res.data);
            setLoadingCount((p) => p - 1);
          }
        })
        .catch(() => {});
    }
  }, [loadingCount]);

  useEffect(() => {
    if (loadingCount == 2) {
      apiCall(`${process.env.NEXT_PUBLIC_HOST_API}dm`, {
        method: "GET",
      })
        .then(async (resp) => {
          if (resp.ok) {
            const res = await resp.json();
            setDM(res.data);
            setLoadingCount((p) => p - 1);
          }
        })
        .catch(() => {});
    }
  }, [loadingCount]);

  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket(
        `${process.env.NEXT_PUBLIC_HOST_WS}?token=${GetCookie("token")}`
      );
      socketRef.current = ws;

      ws.onopen = () => {
        console.log("websocket is Connected");
        setSocket(ws);
        ws.send("online");
        // setLoadingCount((p) => p - 1);
      };

      ws.onclose = () => {
        const interval = setInterval(async () => {
          console.log("websocket Reconnect ...");

          await fetch(`${process.env.NEXT_PUBLIC_HOST_API}auth/refresh`, {
            method: "POST",
            credentials: "include",
          })
            .then(async (resp) => {
              if (resp.ok) {
                const res = await resp.json();
                document.cookie = `token=${res.data.token}; path=/`;
                connect();
                clearInterval(interval);
              }
              if (resp.status === 401) {
                document.cookie = `token=; max-age=0; path=/`;
                // window.location.reload();
              }
            })
            .catch(() => {});
        }, 3000);
      };

      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);

        type userStatus = {
          user_id: string;
          status_activity: keyof typeof USER_STATUS;
        };

        if (data.user_id) {
          const result: userStatus = data;
          setUser((v) => ({ ...v, status_activity: result.status_activity }));
        }
        if (data.friend_status) {
          const result: userStatus = data.friend_status;
          setFriend((v) => ({
            ...v,
            all: v.all.map((vv) =>
              vv.user_id == result.user_id
                ? { ...vv, status_activity: result.status_activity }
                : vv
            ),
          }));
        }
        if (data.member_status) {
          const result: userStatus = data.member_status;
          setMembers((v) =>
            v.map((vv) =>
              vv.user_id == result.user_id
                ? { ...vv, status_activity: result.status_activity }
                : vv
            )
          );
        }
        if (data.request) {
          setFriend((v) => ({ ...v, request: data.request }));
        }
        if (data.sent) {
          setFriend((v) => ({ ...v, sent: data.sent }));
        }
        if (data.all) {
          setFriend((v) => ({ ...v, all: data.all }));
        }
        if (data.server_id && data.category && data.channel) {
          setChannels((v) =>
            v.map((vv) =>
              vv.server_id == data.server_id
                ? { ...vv, category: data.category, channel: data.channel }
                : vv
            )
          );
        }
        if (data.server_id && data.data) {
          setServer((v) =>
            v.map((vv) =>
              vv.id == data.server_id
                ? {
                    ...vv,
                    name: data.data.name,
                    profile_image: data.data.profile_image,
                  }
                : vv
            )
          );
        }
        if (data.server_id && data.is_delete) {
          setServer((v) => v.filter((v) => v.id != data.server_id));
        }
        if (data.dm_list) {
          setDM(data.dm_list);
        }
      };

      ws.onerror = () => {
        console.log("ws errror");
      };
    };

    if (loadingCount == 1) {
      connect();
      setLoadingCount((p) => p - 1);
    }
  }, [loadingCount]);

  useEffect(() => {
    if (loadingCount === 0) {
      const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
      const handleActivity = () => {
        if (lastStatus.current === "idle") {
          socketRef.current?.send("online");
          console.log("is online");
          lastStatus.current = "online";
        }
        resetIdleTimer();
      };

      const resetIdleTimer = () => {
        if (idleTimeout.current) clearTimeout(idleTimeout.current);
        idleTimeout.current = setTimeout(() => {
          if (lastStatus.current === "online") {
            socketRef.current?.send("idle");
            console.log("is idle");
            lastStatus.current = "idle";
          }
        }, idleDelay);
      };

      events.forEach((e) => window.addEventListener(e, handleActivity));
      resetIdleTimer();

      return () => {
        events.forEach((e) => window.removeEventListener(e, handleActivity));
        if (idleTimeout.current) clearTimeout(idleTimeout.current);
      };
    }
  }, [loadingCount]);

  useEffect(() => {
    if (loadingCount === 0) {
      navigator.permissions
        .query({
          name: "microphone",
        })
        .then((status) => {
          if (status.state === "denied" || status.state === "prompt") {
            setMedia(() => ({
              micOn: false,
              speakerOn: true,
            }));
          }

          if (status.state === "granted") {
            setMedia(() => ({
              micOn: true,
              speakerOn: true,
            }));
          }
        })
        .catch(() => {});
    }
  }, [loadingCount]);

  if (loadingCount > 0) {
    return (
      <div className="h-screen w-screen bg-[#121214] flex items-center justify-center">
        <div className="animate-spin">
          <img
            src={"/dc-logo.png"}
            height={80}
            width={80}
          />
        </div>
      </div>
    );
  }

  return props.children;
}
