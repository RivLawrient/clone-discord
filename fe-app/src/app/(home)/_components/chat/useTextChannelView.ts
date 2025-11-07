import { HashIcon, Volume2Icon } from "lucide-react";
import { ChannelList } from "../../_state/channel-list-atom";
import { useEffect, useState } from "react";
import { UserOther } from "../../_state/user-atom";
import { useParams } from "next/navigation";
import { apiCall } from "../../_helper/api-client";
import { useAtom } from "jotai";
import { socketAtom } from "../../_state/socket-atom";

export type ChatList = {
  id: string;
  user: UserOther;
  text: string;
  created_at: string;
};

export default function useTextChannelView(data: ChannelList) {
  const Icons = !data.is_voice ? HashIcon : Volume2Icon;
  const [showSide, setShowSide] = useState(true);
  const [input, setInput] = useState("");
  const [list, setList] = useState<ChatList[]>([]);
  const { channel } = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiCall(`${process.env.NEXT_PUBLIC_HOST_API}msg/channel/${data.id}`, {
      method: "GET",
    }).then(async (resp) => {
      const res = await resp.json();
      if (resp.ok) {
        setList(res.data);
        setLoading(false);
      }
    });
  }, [channel]);

  const [sockets, setSockets] = useAtom(socketAtom);

  useEffect(() => {
    if (!sockets) return;

    const handleMessage = (e: MessageEvent) => {
      const data = JSON.parse(e.data);

      if (
        data.channel_id &&
        data.message_channel &&
        channel == data.channel_id
      ) {
        setList((p) => [...p, data.message_channel]);
      }
    };

    sockets.addEventListener("message", handleMessage);

    return () => {
      sockets.removeEventListener("message", handleMessage);
    };
  }, [sockets, channel]);

  return {
    Icons,
    showSide,
    setShowSide,
    input,
    setInput,
    list,
    setList,
    loading,
  };
}
