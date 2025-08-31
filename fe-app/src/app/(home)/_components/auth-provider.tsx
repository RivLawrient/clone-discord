// "use client";
// import { useAtom } from "jotai";
// import { useEffect, useState, useRef, useCallback } from "react";
// import { userAtom } from "../_state/user-atom";
// import { apiCall, GetCookie } from "../_helper/api-client";
// import { friendAtom } from "../_state/friend-atom";

// export default function AuthProvider(props: { children: React.ReactNode }) {
//   const [u, setUser] = useAtom(userAtom);
//   const [friend, setFriend] = useAtom(friendAtom);
//   const [loadingCount, setLoadingCount] = useState(3);

//   // WebSocket state
//   const socketRef = useRef<WebSocket | null>(null);
//   const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
//   const shouldReconnect = useRef(true);

//   // Idle detection
//   const idleTimeout = useRef<NodeJS.Timeout | null>(null);
//   const idleDelay = 1 * 60 * 1000; // 1 menit
//   const lastStatus = useRef<"online" | "idle">("online");

//   const sendStatus = (status: "online" | "idle") => {
//     if (lastStatus.current === status) return;
//     lastStatus.current = status;
//     if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
//       socketRef.current.send(status);
//     }
//   };

//   const resetIdleTimer = () => {
//     if (idleTimeout.current) clearTimeout(idleTimeout.current);
//     idleTimeout.current = setTimeout(() => {
//       sendStatus("idle");
//     }, idleDelay);
//   };

//   // Token refresh function
//   const refreshToken = async (): Promise<boolean> => {
//     try {
//       const resp = await fetch(
//         `${process.env.NEXT_PUBLIC_HOST_API}auth/refresh`,
//         {
//           method: "GET",
//           credentials: "include",
//         },
//       );

//       const res = await resp.json();

//       if (resp.ok) {
//         document.cookie = `token=${res.data.token}; path=/`;
//         return true;
//       }

//       if (resp.status === 401) {
//         document.cookie = `token=; max-age=0; path=/`;
//         window.location.reload();
//         return false;
//       }

//       return false;
//     } catch (error) {
//       console.error("Token refresh failed:", error);
//       return false;
//     }
//   };

//   // WebSocket connection function with token refresh
//   const connectWebSocket = useCallback(
//     async (isReconnect = false) => {
//       // Refresh token sebelum reconnect
//       if (isReconnect) {
//         console.log("Refreshing token before reconnect...");
//         const refreshSuccess = await refreshToken();
//         if (!refreshSuccess) {
//           console.log("Token refresh failed, aborting reconnect");
//           return;
//         }
//       }

//       const token = GetCookie("token");
//       if (!token || !shouldReconnect.current) return;

//       try {
//         const socket = new WebSocket(
//           `${process.env.NEXT_PUBLIC_HOST_WS}?token=${token}`,
//         );

//         socketRef.current = socket;

//         socket.onopen = () => {
//           console.log("Connected to WebSocket");
//           setLoadingCount((p) => Math.max(0, p - 1));
//           sendStatus("online");
//         };

//         socket.onmessage = (e) => {
//           const data = JSON.parse(e.data);

//           if (data.request) {
//             setFriend((v) => ({ ...v, request: data.request }));
//           }
//           if (data.sent) {
//             setFriend((v) => ({ ...v, sent: data.sent }));
//           }
//           if (data.all) {
//             setFriend((v) => ({ ...v, all: data.all }));
//           }
//           if (data.friend) {
//             setFriend((v) => ({
//               ...v,
//               all: v.all.map((vv) =>
//                 vv.user_id === data.friend.user_id
//                   ? { ...vv, status_activity: data.friend.status_activity }
//                   : vv,
//               ),
//             }));
//           }
//           if (data.user_id) {
//             setUser((v) => ({ ...v, status_activity: data.status_activity }));
//           }
//         };

//         socket.onclose = (e) => {
//           console.log("WebSocket closed:", e.code);

//           // Reconnect otomatis kecuali intentional close (code 1000) atau disabled
//           if (e.code !== 1000 && shouldReconnect.current) {
//             console.log("Reconnecting in 3 seconds...");
//             reconnectTimeout.current = setTimeout(
//               () => connectWebSocket(true),
//               3000,
//             );
//           }
//         };

//         socket.onerror = (error) => {
//           console.error("WebSocket error:", error);
//         };
//       } catch (error) {
//         console.error("Failed to create WebSocket:", error);
//         if (shouldReconnect.current) {
//           reconnectTimeout.current = setTimeout(
//             () => connectWebSocket(true),
//             3000,
//           );
//         }
//       }
//     },
//     [setUser, setFriend],
//   );

//   // Idle detection setup
//   useEffect(() => {
//     if (loadingCount === 0) {
//       const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
//       const handleActivity = () => {
//         resetIdleTimer();
//         sendStatus("online");
//       };

//       events.forEach((e) => window.addEventListener(e, handleActivity));
//       resetIdleTimer();

//       return () => {
//         events.forEach((e) => window.removeEventListener(e, handleActivity));
//         if (idleTimeout.current) clearTimeout(idleTimeout.current);
//       };
//     }
//   }, [loadingCount]);

//   // Fetch auth data
//   useEffect(() => {
//     apiCall(`${process.env.NEXT_PUBLIC_HOST_API}auth/me`, {
//       method: "GET",
//     }).then(async (resp) => {
//       if (resp.ok) {
//         const res = await resp.json();
//         setUser(res.data);
//         setLoadingCount((p) => p - 1);
//       }
//     });
//   }, [setUser]);

//   // Fetch friend list
//   useEffect(() => {
//     apiCall(`${process.env.NEXT_PUBLIC_HOST_API}friend/list`, {
//       method: "GET",
//     }).then(async (resp) => {
//       if (resp.ok) {
//         const res = await resp.json();
//         setFriend(res.data);
//         setLoadingCount((p) => p - 1);
//       }
//     });
//   }, [setFriend]);

//   // WebSocket connection (hanya setelah auth & friend data loaded)
//   useEffect(() => {
//     if (loadingCount === 1) {
//       connectWebSocket(false); // false karena ini bukan reconnect
//     }
//   }, [loadingCount, connectWebSocket]);

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       shouldReconnect.current = false; // disable reconnect

//       if (reconnectTimeout.current) {
//         clearTimeout(reconnectTimeout.current);
//       }
//       if (idleTimeout.current) {
//         clearTimeout(idleTimeout.current);
//       }
//       if (socketRef.current) {
//         socketRef.current.close(1000, "Component unmounting");
//       }
//     };
//   }, []);

//   if (loadingCount > 0) return <p>Loading...</p>;

//   return <>{props.children}</>;
// }

"use client";

import { atom, useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { userAtom } from "../_state/user-atom";
import { friendAtom } from "../_state/friend-atom";
import { apiCall, GetCookie } from "../_helper/api-client";
import { usePathname } from "next/navigation";
import { socketAtom } from "../_state/socket-atom";

export default function AuthProvider(props: { children: React.ReactNode }) {
  const [loadingCount, setLoadingCount] = useState(2);
  const [user, setUser] = useAtom(userAtom);
  const [friend, setFriend] = useAtom(friendAtom);
  const idleDelay = 1 * 60 * 1000; // 1 menit
  const idleTimeout = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [socket, setSocket] = useAtom(socketAtom);
  const lastStatus = useRef<"online" | "idle">("online");
  const route = usePathname().split("/");
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

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
  }, []);

  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket(
        `${process.env.NEXT_PUBLIC_HOST_WS}?token=${GetCookie("token")}`,
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
                : vv,
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
  return <>{props.children}</>;
}
