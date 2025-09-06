"use client";
import { useAtom } from "jotai";
import { friendAtom } from "../_state/friend-atom";
import { useEffect } from "react";
import { apiCall, GetCookie } from "../_helper/api-client";

export default function FriendProvider() {
  const [friend, setFriend] = useAtom(friendAtom);

  useEffect(() => {
    apiCall(`${process.env.NEXT_PUBLIC_HOST_API}friend/list`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${GetCookie("token")}`,
      },
    }).then(async (resp) => {
      const res = await resp.json();
      if (resp.ok) {
        setFriend(res.data);
      }
    });
  }, []);
  return <></>;
}
