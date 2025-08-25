// "use client";

// import { useAtom } from "jotai";
// import { useEffect, useState } from "react";
// import { userAtom } from "../_state/user-atom";
// import { apiCall, GetCookie } from "../_helper/api-client";
// import { friendAtom } from "../_state/friend-atom";

// export default function AuthProvider(props: { children: React.ReactNode }) {
//   const [u, setUser] = useAtom(userAtom);
//   const [friend, setFriend] = useAtom(friendAtom);
//   const [loadingCount, setLoadingCount] = useState(3); // ada 2 request

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
//   }, []);

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
//   }, []);

//   useEffect(() => {
//     if (loadingCount == 1) {
//       const socket = new WebSocket(
//         `${process.env.NEXT_PUBLIC_HOST_WS}?token=${GetCookie("token")}`,
//       );

//       socket.onopen = () => {
//         setLoadingCount((p) => p - 1);
//         console.log("Connected to ws");
//       };
//       socket.onmessage = (e) => {
//         const data = JSON.parse(e.data);

//         if (data.request) {
//           console.log("dapat request", data.request);
//           setFriend((v) => ({
//             ...v,
//             request: data.request,
//           }));
//         }
//         if (data.sent) {
//           console.log("dapat data sent", data.sent);
//           setFriend((v) => ({
//             ...v,
//             sent: data.sent,
//           }));
//         }
//         if (data.friend) {
//           console.log("dapat data friend", data.friend);
//           setFriend((v) => ({
//             ...v,
//             all: v.all.map((vv) =>
//               vv.user_id === data.friend.user_id
//                 ? { ...vv, status_activity: data.friend.status_activity }
//                 : vv,
//             ),
//           }));
//         }
//         if (data.user_id) {
//           setUser((v) => ({
//             ...v,
//             status_activity: data.status_activity,
//           }));
//         }
//       };
//     }
//   }, [loadingCount]);

//   if (loadingCount > 0) return <p>Loading...</p>;

//   return <>{props.children}</>;
// }
"use client";

import { useAtom } from "jotai";
import { useEffect, useState, useRef } from "react";
import { userAtom } from "../_state/user-atom";
import { apiCall, GetCookie } from "../_helper/api-client";
import { friendAtom } from "../_state/friend-atom";

export default function AuthProvider(props: { children: React.ReactNode }) {
  const [u, setUser] = useAtom(userAtom);
  const [friend, setFriend] = useAtom(friendAtom);
  const [loadingCount, setLoadingCount] = useState(3);
  const socketRef = useRef<WebSocket | null>(null);

  // idle detection timer
  const idleTimeout = useRef<NodeJS.Timeout | null>(null);
  const idleDelay = 1 * 60 * 1000; // 5 menit

  const lastStatus = useRef<"online" | "idle">("online");

  const sendStatus = (status: "online" | "idle") => {
    if (lastStatus.current === status) return; // ⛔ skip kalau status sama

    lastStatus.current = status;

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(status);
    }
  };
  const resetIdleTimer = () => {
    if (idleTimeout.current) clearTimeout(idleTimeout.current);

    idleTimeout.current = setTimeout(() => {
      // === saat idle, update status ===
      sendStatus("idle");
    }, idleDelay);
  };

  useEffect(() => {
    if (loadingCount == 0) {
      // aktivitas yang dihitung (mouse, keyboard, touch)
      const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

      const handleActivity = () => {
        resetIdleTimer();
        // saat aktif lagi, update ke "online"
        sendStatus("online");
      };

      events.forEach((e) => window.addEventListener(e, handleActivity));

      resetIdleTimer(); // start timer pertama kali

      return () => {
        events.forEach((e) => window.removeEventListener(e, handleActivity));
        if (idleTimeout.current) clearTimeout(idleTimeout.current);
      };
    }
  }, [loadingCount]);

  // === fetch auth & friend list ===
  useEffect(() => {
    apiCall(`${process.env.NEXT_PUBLIC_HOST_API}auth/me`, {
      method: "GET",
    }).then(async (resp) => {
      if (resp.ok) {
        const res = await resp.json();
        setUser(res.data);
        setLoadingCount((p) => p - 1);
      }
    });
  }, []);

  useEffect(() => {
    apiCall(`${process.env.NEXT_PUBLIC_HOST_API}friend/list`, {
      method: "GET",
    }).then(async (resp) => {
      if (resp.ok) {
        const res = await resp.json();
        setFriend(res.data);
        setLoadingCount((p) => p - 1);
      }
    });
  }, []);

  // === websocket connect ===
  useEffect(() => {
    if (loadingCount == 1) {
      const socket = new WebSocket(
        `${process.env.NEXT_PUBLIC_HOST_WS}?token=${GetCookie("token")}`,
      );
      socketRef.current = socket;

      socket.onopen = () => {
        setLoadingCount((p) => p - 1);
        console.log("Connected to ws");
      };
      socket.onmessage = (e) => {
        const data = JSON.parse(e.data);

        if (data.request) {
          setFriend((v) => ({ ...v, request: data.request }));
        }
        if (data.sent) {
          setFriend((v) => ({ ...v, sent: data.sent }));
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

      // return () => {
      //   socket.close();
      // };
    }
  }, [loadingCount]);

  if (loadingCount > 0) return <p>Loading...</p>;

  return <>{props.children}</>;
}
