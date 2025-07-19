"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_HOST_API}auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getCookie("token")}`,
      },
    }).then(async (resp) => {
      const res = await resp.json();
      console.log(res);
      if (resp.status === 401) {
        RefreshToken();
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Loading...</p>;

  return <>{children}</>;
}

export function RefreshToken() {
  fetch(`${process.env.NEXT_PUBLIC_HOST_API}auth/refresh`, {
    method: "GET",
    credentials: "include", // penting! agar refresh_token terkirim
  }).then(async (resp) => {
    const res = await resp.json();
    console.log(res);
    if (resp.ok) {
      setCookie("token", res.data.token, 3600); // 1 jam, sesuaikan
    }

    if (resp.status == 401) {
      setCookie("token", "", 0);
      res.push("/login");
    }
  });
}

// Helper set/get cookie (client-side)
function setCookie(name: string, value: string, maxAgeSeconds: number) {
  document.cookie = `${name}=${value}; max-age=${maxAgeSeconds}; path=/`;
}

function getCookie(name: string) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}
