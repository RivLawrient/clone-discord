import { tokenStore } from "./token-store";

// apiClient.ts
type APIError = { code?: string; message?: string };

let refreshPromise: Promise<void> | null = null;

async function refreshTokenOnce() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const res = await fetch("/auth/refresh", {
        method: "POST",
        credentials: "include", // penting agar cookie RT terkirim
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        // gagal refresh → bersihkan token & arahkan ke login
        tokenStore.set(null);
        refreshPromise = null;
        throw new Error("REFRESH_FAILED");
      }

      const data = await res.json();
      tokenStore.set(data.access_token);
      refreshPromise = null;
    })();
  }
  return refreshPromise;
}

export async function apiFetch(input: RequestInfo, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  const token = tokenStore.get();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const doFetch = () =>
    fetch(input, {
      ...init,
      headers,
      credentials: "include", // agar cookie lain (misal CSRF) ikut
    });

  let res = await doFetch();

  // Jika 401 karena TOKEN_EXPIRED → refresh dan ulangi sekali
  if (res.status === 401) {
    let errBody: APIError | null = null;
    try {
      errBody = await res.clone().json();
    } catch {}

    if (errBody?.code === "TOKEN_EXPIRED") {
      try {
        await refreshTokenOnce();
      } catch {
        // redirect ke login
        if (typeof window !== "undefined") window.location.href = "/login";
        throw new Error("UNAUTHENTICATED");
      }

      // set header Authorization baru dan coba ulang
      const newHeaders = new Headers(init.headers || {});
      const newToken = tokenStore.get();
      if (newToken) newHeaders.set("Authorization", `Bearer ${newToken}`);

      res = await fetch(input, {
        ...init,
        headers: newHeaders,
        credentials: "include",
      });
    }
  }

  if (!res.ok) {
    // lempar error standar
    let body: any = null;
    try {
      body = await res.clone().json();
    } catch {}
    const message = body?.message || `HTTP ${res.status}`;
    const error = new Error(message) as any;
    error.status = res.status;
    error.body = body;
    throw error;
  }

  return res;
}

export async function apiCall(url: RequestInfo, init: RequestInit = {}) {
  const do_fetch = () =>
    fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${GetCookie("token")}`,
      },
    });

  let hit = await do_fetch();

  if (hit.status === 401) {
    console.log("401 cuy");
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
