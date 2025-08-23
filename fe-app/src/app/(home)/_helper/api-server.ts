import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function apiCallServer(url: RequestInfo, init: RequestInit = {}) {
  const do_fetch = () =>
    fetch(url, {
      ...init,
    });

  let hit = await do_fetch();
  const cookie = await cookies();
  console.log("cookie", cookie.get("refresh_token"));

  if (hit.status === 401) {
    console.log("401 cuy");
    fetch(`${process.env.NEXT_PUBLIC_HOST_API}auth/refresh`, {
      method: "GET",
      credentials: "include",
    }).then(async (resp) => {
      const res = await resp.json();
      console.log(res);

      if (resp.ok) {
        cookie.set("token", res.data.token);

        hit = await fetch(url, {
          ...init,
          headers: {
            Authorization: `Bearer ${res.data.token}`,
          },
        });
      }

      if (resp.status === 401) {
        console.log("401 lagi");
        // cookie.set("token", "");
        // redirect("/login");
      }
    });
  }

  return hit;
}
