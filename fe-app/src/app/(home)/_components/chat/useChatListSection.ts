import { useAtom } from "jotai";
import { ChatList } from "./text-channel-view";
import { serverAtom } from "../../_state/server-atom";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { socketAtom } from "../../_state/socket-atom";

export default function useChatListSection(list: ChatList[]) {
  const date = (data: string) => {
    return new Date(data).toLocaleString("default", {
      day: "numeric",
    });
  };
  const month = (data: string) => {
    return new Date(data).toLocaleString("default", {
      month: "numeric",
    });
  };
  const year = (data: string) => {
    return new Date(data).toLocaleString("default", {
      year: "2-digit",
    });
  };

  const time = (data: string) => {
    return new Date(data).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const displayTime = (data: string) => {
    const now = new Date().getDay();
    const target = new Date(data).getDay();

    // Hitung selisih waktu dalam milidetik
    const diff = now - target;

    if (diff === 0) {
      // Hari ini
      return time(data);
    } else if (diff === 1) {
      // Kemarin
      return `Yesterday at ${time(data)}`;
    } else {
      // Lebih dari 2 hari
      return `${date(data)}/${month(data)}/${year(data)}, ${time(data)}`;
    }
  };

  const showIt = (data: ChatList, arr: ChatList[], index: number) => {
    if (index === 0) return true; // chat pertama selalu tampil

    const prev = arr[index - 1];

    // cek beda user
    const differentUser = data.user.name !== prev.user.name;

    // parsing tanggal
    const currentDate = new Date(data.created_at);
    const prevDate = new Date(prev.created_at);

    // cek apakah tanggal, bulan, atau tahun beda
    const differentDay =
      currentDate.getDate() !== prevDate.getDate() ||
      currentDate.getMonth() !== prevDate.getMonth() ||
      currentDate.getFullYear() !== prevDate.getFullYear();

    // tampil hanya kalau user berbeda DAN masih di tanggal yang sama
    return differentUser || differentDay;
  };

  const showGap = (data: ChatList, arr: ChatList[], index: number) => {
    if (index === 0) return true; // chat pertama pasti tampil gap tanggal

    const current = new Date(data.created_at);
    const prev = new Date(arr[index - 1].created_at);

    const isDifferentDay = current.getDate() !== prev.getDate();

    return isDifferentDay;
  };

  const gapTime = (data: ChatList) => {
    const month = new Date(data.created_at).toLocaleString("default", {
      month: "long",
    });
    const date = new Date(data.created_at).toLocaleString("default", {
      day: "numeric",
    });
    const year = new Date(data.created_at).toLocaleString("default", {
      year: "numeric",
    });

    return `${month} ${date}, ${year}`;
  };
  const [servers] = useAtom(serverAtom);
  const { server, channel } = useParams();
  const current = servers.find((v) => v.id == server);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // scroll ke bawah setiap kali props.data berubah
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [list]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, []);

  const lastMargin = (data: ChatList, arr: ChatList[], index: number) => {
    const notOver = index + 1 < arr.length;
    return !notOver || data.user.name !== arr[index + 1].user.name;
  };

  return {
    current,
    showGap,
    gapTime,
    showIt,
    displayTime,
    time,
    bottomRef,
    lastMargin,
  };
}
