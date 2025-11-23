"use client";
import { useAtom } from "jotai";
import { notFound, useParams, useRouter } from "next/navigation";
import { serverAtom } from "../../_state/server-atom";
import { useEffect } from "react";
import Image from "next/image";
import { channelListAtom } from "../../_state/channel-list-atom";

export default function Page() {
  const [servers] = useAtom(serverAtom);
  const { server } = useParams();
  const [channel] = useAtom(channelListAtom);
  const router = useRouter();
  const current = channel.find((v) => v.server_id == server);

  useEffect(() => {
    const exists = servers.some((s) => s.id === server);
    if (!exists) {
      notFound();
    }
  }, [servers, server]);

  const firstChannel =
    current?.channel[0] ||
    current?.category.find((v) => v.channel.length > 0)?.channel[0];

  if (firstChannel) {
    setTimeout(() => {
      router.push(`/channels/${server}/${firstChannel.id}`);
    }, 1);
  }
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <Image
        src="/not-found-server.svg"
        width={272}
        height={222}
        alt=""
        priority
      />
      <h1 className="brightness-60 font-semibold">NO TEXT CHANNELS</h1>
      <h2 className="max-w-[400px] brightness-60 mt-2 text-sm">
        You find yourself in a strange place. You don't have access to any text
        channels, or there are none in this server.
      </h2>
    </div>
  );
}
