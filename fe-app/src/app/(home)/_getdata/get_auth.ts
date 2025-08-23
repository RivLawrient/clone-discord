import { cookies } from "next/headers";
import { UserCurrent } from "../_state/user-atom";
import { apiCallServer } from "../_helper/api-server";
export async function get_auth(): Promise<UserCurrent | null> {
  const cookie = await cookies();

  if (!cookie.get("token")) return null;
  console.log(cookie.get("refresh_token"));

  return await apiCallServer(`${process.env.NEXT_PUBLIC_HOST_API}auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${cookie.get("token")?.value}`,
    },
  })
    .then(async (resp) => {
      const res = await resp.json();

      if (resp.ok) {
        const data: UserCurrent = res.data;
        return data;
      } else {
        return null;
      }
    })

    .catch(() => {
      return null;
    });
}
