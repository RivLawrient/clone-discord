"use client";

import { channelListAtom } from "@/app/(home)/_state/channel-list-atom";
import { useAtom } from "jotai";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const [channels, setChannels] = useAtom(channelListAtom);
  const { server, channel } = useParams(); // pastikan route-mu pakai [server]/[channel]

  const router = useRouter();

  useEffect(() => {
    if (!channels) return;

    // Gabungin semua channel jadi 1 list datar (root + kategori)
    const allChannels = [
      ...channels.channel,
      ...channels.category.flatMap((c) => c.channel),
    ];

    // Cek apakah channel yang lagi dibuka masih ada
    const currentExists = allChannels.some((ch) => ch.id === channel);

    // Kalau udah nggak ada (misal channel dihapus)
    if (!currentExists) {
      // Cari channel lain yang masih ada
      const fallbackChannel = allChannels.length > 0 ? allChannels[0].id : null;

      if (fallbackChannel) {
        router.replace(`/channels/${server}/${fallbackChannel}`);
      } else {
        // kalau semua channel kosong, bisa redirect ke halaman kosong atau tampilan “no text channel”
        router.replace(`/channels/${server}`);
        // notFound();
      }
    }
  }, [channels, channel]);
  return (
    <div className="flex flex-col">
      <div className="bg-red-500">{channel} </div>
      <div className="bg-white grow flex flex-row">
        <div className="bg-green-500 grow">mmain</div>
        <div className="bg-amber-500">right</div>
      </div>
    </div>
  );
}
