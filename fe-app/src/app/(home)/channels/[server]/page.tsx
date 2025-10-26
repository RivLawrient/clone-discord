"use client";
import { useAtom } from "jotai";
import { notFound, useParams, useRouter } from "next/navigation";
import { serverAtom } from "../../_state/server-atom";
import { useEffect, useState } from "react";
import Image from "next/image";
import { apiCall } from "../../_helper/api-client";
import {
  CategoryChannel,
  ChannelList,
  channelListAtom,
} from "../../_state/channel-list-atom";
import { JapaneseYen } from "lucide-react";

export default function Page() {
  const [servers] = useAtom(serverAtom);
  const { server } = useParams();
  const [channel, setChannel] = useAtom(channelListAtom);
  const [loading, setLoading] = useState(true);
  const route = useRouter();

  useEffect(() => {
    const exists = servers.some((s) => s.id === server);

    if (!exists) {
      notFound(); // atau redirect("/somewhere")
    }

    apiCall(`${process.env.NEXT_PUBLIC_HOST_API}channel/` + server, {
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
            setLoading(false);
          }
          setChannel({ category: category, channel: channel });
        }
      })
      .catch(() => {});
  }, [servers, server]);

  if (!loading)
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <Image
          src={"/not-found-server.svg"}
          width={272}
          height={222}
          alt=""
          priority
        />
        <h1 className="brightness-60 font-semibold">NO TEXT CHANNELS</h1>
        <h2 className="max-w-[400px] brightness-60 mt-2 text-sm">
          You find yourself in a strange place. You don't have access to any
          text channels, or there are none in this server.
        </h2>
      </div>
    );
}
