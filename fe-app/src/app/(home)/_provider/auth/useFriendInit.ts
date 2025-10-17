import { SetStateAction, useEffect } from "react";
import { apiCall } from "../../_helper/api-client";
import { useAtom } from "jotai";
import { friendAtom } from "../../_state/friend-atom";

export default function useFriendInit(
  setFriendLoaded: React.Dispatch<SetStateAction<boolean>>
) {
  const [friend, setFriend] = useAtom(friendAtom);

  useEffect(() => {
    apiCall(`${process.env.NEXT_PUBLIC_HOST_API}friend/list`, {
      method: "GET",
    })
      .then(async (resp) => {
        if (resp.ok) {
          const res = await resp.json();
          setFriend(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setFriendLoaded(true));
  }, []);
}
