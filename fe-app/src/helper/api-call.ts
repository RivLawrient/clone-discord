import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import RefreshToken from "./refresh_token";

export default async function ApiCall(
  url: RequestInfo,
  init: RequestInit = {}
) {
  const cookie = await cookies();

  const do_fetch = async () => {
    const token = cookie.get("token")?.value;

    // ambil headers dari init (jika ada)
    const headers = new Headers(init.headers || {});

    // tambahkan Authorization jika belum ada
    if (!headers.has("Authorization") && token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    // jika body bukan FormData dan belum ada Content-Type → set JSON
    if (!(init.body instanceof FormData) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    return fetch(`${process.env.NEXT_PUBLIC_HOST_API}${url}`, {
      ...init,
      headers,
    });
  };

  let hit = await do_fetch();

  if (hit.status === 401) {
    console.log(cookie);
    const refreshCookie = cookie.get("refresh_token")?.value;
    console.log(refreshCookie);
    // RefreshToken();

    await fetch(`${process.env.NEXT_PUBLIC_HOST_API}auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        Cookie: `refresh_token=${refreshCookie}`,
      },
    }).then(async (resp) => {
      const res = await resp.json();
      console.log(res);

      if (resp.ok) {
        // cookie.set("token", res.data.token, { path: "/" });
        hit = await do_fetch();
      }

      if (resp.status === 401) {
        // cookie.set("token", "", { path: "/" });
        // redirect("/login");
      }

      if (resp.status === 400) {
        // cookie.set("token", res.data.token, { path: "/" });
        // redirect("/login");
      }

      if (resp.status === 500) {
        // cookie.set("token", res.data.token, { path: "/" });
        // redirect("/login");
      }
    });
  }

  return hit;
}
