"use client";
export default function RefreshToken() {
  return fetch(`${process.env.NEXT_PUBLIC_HOST_API}auth/refresh`, {
    method: "POST",
    credentials: "include",
  }).then(async (resp) => {
    const res = await resp.json();
    console.log(res);
  });
}
