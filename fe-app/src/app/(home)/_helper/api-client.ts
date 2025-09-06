export async function apiCall(url: RequestInfo, init: RequestInit = {}) {
  const do_fetch = () =>
    fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${GetCookie("token")}`,
        "Content-Type": "application/json",
      },
    });

  let hit = await do_fetch();

  if (hit.status === 401) {
    await fetch(`${process.env.NEXT_PUBLIC_HOST_API}auth/refresh`, {
      method: "GET",
      credentials: "include",
    }).then(async (resp) => {
      const res = await resp.json();
      if (resp.ok) {
        hit = await fetch(url, {
          ...init,
          headers: {
            Authorization: `Bearer ${res.data.token}`,
            "Content-Type": "application/json",
          },
        });
        document.cookie = `token=${res.data.token}; path=/`;
      }

      if (resp.status === 401) {
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
