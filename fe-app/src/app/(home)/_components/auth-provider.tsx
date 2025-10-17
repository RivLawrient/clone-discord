"use client";

import { atom, useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { userAtom } from "../_state/user-atom";
import { friendAtom } from "../_state/friend-atom";
import { apiCall, GetCookie } from "../_helper/api-client";
import { socketAtom } from "../_state/socket-atom";
import { serverAtom } from "../_state/server-atom";
import { mediaAtom } from "../_state/media-atom";
import { usePathname, useRouter } from "next/navigation";

export default function AuthProvider() {
  const [loadingCount, setLoadingCount] = useState(3);
  const [user, setUser] = useAtom(userAtom);
  const [friend, setFriend] = useAtom(friendAtom);
  const idleDelay = 1 * 60 * 1000; // 1 menit
  const idleTimeout = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [socket, setSocket] = useAtom(socketAtom);
  const lastStatus = useRef<"online" | "idle">("online");
  const [server, setServer] = useAtom(serverAtom);
  const [media, setMedia] = useAtom(mediaAtom);

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
    if (loadingCount == 2) {
      apiCall(`${process.env.NEXT_PUBLIC_HOST_API}friend/list`, {
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
    if (loadingCount == 1) {
      apiCall(`${process.env.NEXT_PUBLIC_HOST_API}server`, {
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
    const connect = () => {
      const ws = new WebSocket(
        `${process.env.NEXT_PUBLIC_HOST_WS}?token=${GetCookie("token")}`
      );
      socketRef.current = ws;

      ws.onopen = () => {
        console.log("websocket is Connected");
        setSocket(ws);
      };

      ws.onclose = () => {
        const interval = setInterval(async () => {
          console.log("websocket Reconnect ...");

          await fetch(`${process.env.NEXT_PUBLIC_HOST_API}auth/refresh`, {
            method: "GET",
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
                window.location.reload();
              }
            })
            .catch(() => {});
        }, 3000);
      };

      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);

        if (data.request) {
          setFriend((v) => ({ ...v, request: data.request }));
        }
        if (data.sent) {
          setFriend((v) => ({ ...v, sent: data.sent }));
        }
        if (data.all) {
          setFriend((v) => ({ ...v, all: data.all }));
        }
        if (data.friend) {
          setFriend((v) => ({
            ...v,
            all: v.all.map((vv) =>
              vv.user_id === data.friend.user_id
                ? { ...vv, status_activity: data.friend.status_activity }
                : vv
            ),
          }));
        }
        if (data.user_id) {
          setUser((v) => ({ ...v, status_activity: data.status_activity }));
        }
      };

      ws.onerror = () => {
        console.log("ws errror");
      };
    };

    if (loadingCount === 0) {
      connect();
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
    return <div className="h-screen w-screen">Loading ...</div>;
  }

  return null;
}
