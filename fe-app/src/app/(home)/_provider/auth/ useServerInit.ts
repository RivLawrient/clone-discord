import { useAtom } from "jotai";
import { SetStateAction, useEffect } from "react";
import { serverAtom } from "../../_state/server-atom";
import { apiCall } from "../../_helper/api-client";

export default function useServerInit(
  setServerLoaded: React.Dispatch<SetStateAction<boolean>>
) {
  const [server, setServer] = useAtom(serverAtom);

  useEffect(() => {
    apiCall(`${process.env.NEXT_PUBLIC_HOST_API}server`, {
      method: "GET",
    })
      .then(async (resp) => {
        if (resp.ok) {
          const res = await resp.json();
          setServer(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setServerLoaded(true));
  }, []);
}
