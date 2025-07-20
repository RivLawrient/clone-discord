"use client";

import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { userAtom, UserCurrent } from "../_state/user-atom";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [user, setUser] = useAtom(userAtom);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_HOST_API}auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getCookie("token")}`,
      },
    }).then(async (resp) => {
      const res = await resp.json();
      const data: UserCurrent = res.data;
      console.log(data);
      setUser(data);

      if (resp.status === 401) {
        fetch(`${process.env.NEXT_PUBLIC_HOST_API}auth/refresh`, {
          method: "GET",
          credentials: "include", // penting! agar refresh_token terkirim
        }).then(async (resp) => {
          const res = await resp.json();
          console.log(res);
          if (resp.ok) {
            setCookie("token", res.data.token, 3600); // 1 jam, sesuaikan
            router.refresh();
          } else {
            setCookie("token", "", 0);
            router.refresh();
          }
        });
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Loading...</p>;

  return <>{children}</>;
}

// export function RefreshToken() {}

// Helper set/get cookie (client-side)
function setCookie(name: string, value: string, maxAgeSeconds: number) {
  document.cookie = `${name}=${value}; max-age=${maxAgeSeconds}; path=/`;
}

function getCookie(name: string) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}
