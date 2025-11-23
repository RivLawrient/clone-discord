export async function apiCall(url: RequestInfo, init: RequestInit = {}) {
  // const do_fetch = () => {
  //   return fetch(url, {
  //     ...init,
  //   });
  // };

  const do_fetch = async () => {
    const token = GetCookie("token");

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

    return fetch(url, {
      ...init,
      headers,
    });
  };
  let hit = await do_fetch();

  if (hit.status === 401) {
    await fetch(`${process.env.NEXT_PUBLIC_HOST_API}auth/refresh`, {
      method: "POST",
      credentials: "include",
    }).then(async (resp) => {
      const res = await resp.json();
      if (resp.ok) {
        document.cookie = `token=${res.data.token}; path=/`;

        // hit = await fetch(url, {
        //   ...init,
        // });
        hit = await do_fetch();
      }

      if (resp.status === 401) {
        document.cookie = `token=; max-age=0; path=/`;
        window.location.reload();
      }
      if (resp.status === 400) {
        document.cookie = `token=; max-age=0; path=/`;
        window.location.reload();
      }
      if (resp.status === 500) {
        document.cookie = `token=; max-age=0; path=/`;
        window.location.reload();
      }
    });
  }

  return hit;
}

export function GetCookie(name: string) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}
