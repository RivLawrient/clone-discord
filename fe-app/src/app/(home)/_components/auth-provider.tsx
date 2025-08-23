"use client";

import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { userAtom, UserCurrent } from "../_state/user-atom";
import { apiCall, GetCookie } from "../_helper/api-client";
import { friendAtom } from "../_state/friend-atom";

export default function AuthProvider(props: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useAtom(userAtom);
  const [friend, setFriend] = useAtom(friendAtom);

  // useEffect(() => {
  //   apiCall(`${process.env.NEXT_PUBLIC_HOST_API}auth/me`, {
  //     method: "GET",
  //   }).then(async (resp) => {
  //     const res = await resp.json();
  //     if (resp.ok) {
  //       const data: UserCurrent = res.data;
  //       setUser(data);
  //       setLoading(false);
  //     }
  //   });
  // }, []);

  // useEffect(() => {
  //   apiCall(`${process.env.NEXT_PUBLIC_HOST_API}friend/list`, {
  //     method: "GET",
  //     headers: {
  //       Authorization: `Bearer ${GetCookie("token")}`,
  //     },
  //   }).then(async (resp) => {
  //     const res = await resp.json();
  //     if (resp.ok) {
  //       setFriend(res.data);
  //       setLoading(false);
  //     }
  //   });
  // }, []);
  const [loadingCount, setLoadingCount] = useState(2); // ada 2 request

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

  if (loadingCount > 0) return <p>Loading...</p>;

  return <>{props.children}</>;
}
