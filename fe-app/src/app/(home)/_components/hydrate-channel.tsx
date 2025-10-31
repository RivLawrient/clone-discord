"use client";
import { useAtom } from "jotai";
import {
  CategoryChannel,
  ChannelList,
  channelListAtom,
} from "../_state/channel-list-atom";
import { useEffect, useState } from "react";
import { apiCall } from "../_helper/api-client";
import { socketAtom } from "../_state/socket-atom";

export default function HydrateChannel(props: {
  server: string;
  children: React.ReactNode;
}) {
  const [channel, setChannel] = useAtom(channelListAtom);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiCall(`${process.env.NEXT_PUBLIC_HOST_API}channel/` + props.server, {
      method: "GET",
    })
      .then(async (resp) => {
        const res = await resp.json();
        if (resp.ok) {
          const channel: ChannelList[] = res.data.channel;
          const category: CategoryChannel[] = res.data.category;
          if (channel.length > 0) {
            // route.push("/channels/" + server + "/" + channel[0].id);
          } else {
          }
          setChannel({ category: category, channel: channel });
        }
      })
      .finally(() => {
        setLoading(false);
      })
      .catch(() => {});
  }, [props, setChannel]);

  const [sockets, setSockets] = useAtom(socketAtom);

  useEffect(() => {
    if (sockets) {
      sockets.onmessage = (e) => {
        const data = JSON.parse(e.data);

        if (data.server_id && data.list) {
          if (data.server_id == props.server) {
            setChannel({
              channel: data.list.channel,
              category: data.list.category,
            });
          }
        }
      };
    }
  }, [sockets, props.server]);

  if (!loading) return props.children;
  else return <div className="bg-[#1a1a1e]"></div>;
}
