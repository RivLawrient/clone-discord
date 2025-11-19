"use client";
import TextChannelView from "@/app/(home)/_components/chat/text-channel-view";
import {
  ChannelList,
  channelListAtom,
} from "@/app/(home)/_state/channel-list-atom";
import { useAtom } from "jotai";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const [channels, setChannels] = useAtom(channelListAtom);
  const { server, channel } = useParams();
  const [curretChannel, setCurrentChannel] = useState<ChannelList>();
  const router = useRouter();
  const channelCurrent = channels.find((v) => v.server_id == server);

  useEffect(() => {
    if (!channels) return;

    if (channelCurrent) {
      // Gabungin semua channel jadi 1 list datar (root + kategori)
      const allChannels = [
        ...channelCurrent.channel,
        ...channelCurrent.category.flatMap((c) => c.channel),
      ];

      // Cek apakah channel yang lagi dibuka masih ada
      const currentExists = allChannels.some((ch) => ch.id === channel);

      setCurrentChannel(allChannels.find((v) => v.id == channel));
      // Kalau udah nggak ada (misal channel dihapus)
      if (!currentExists) {
        // Cari channel lain yang masih ada
        const fallbackChannel =
          allChannels.length > 0 ? allChannels[0].id : null;

        if (fallbackChannel) {
          router.replace(`/channels/${server}/${fallbackChannel}`);
        } else {
          // kalau semua channel kosong, bisa redirect ke halaman kosong atau tampilan “no text channel”
          router.replace(`/channels/${server}`);
        }
      }
    }
  }, [channels, channel]);

  if (curretChannel)
    return (
      <>
        {/* {!curretChannel.is_voice ? (
          <TextChannelView data={curretChannel} />
        ) : (
          <>voice channel</>
        )} */}
      </>
    );
}
