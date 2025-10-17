import { useAtom } from "jotai";
import { SetStateAction, useEffect } from "react";
import { userAtom } from "../../_state/user-atom";
import { apiCall } from "../../_helper/api-client";

export default function useUserInit(
  setUserLoaded: React.Dispatch<SetStateAction<boolean>>
) {
  const [user, setUser] = useAtom(userAtom);

  useEffect(() => {
    apiCall(`${process.env.NEXT_PUBLIC_HOST_API}auth/me`, {
      method: "GET",
    })
      .then(async (resp) => {
        if (resp.ok) {
          const res = await resp.json();
          setUser(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setUserLoaded(true));
  }, []);
}
