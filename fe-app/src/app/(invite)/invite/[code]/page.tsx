"use client";
import { apiCall } from "@/app/(home)/_helper/api-client";
import { channelListAtom } from "@/app/(home)/_state/channel-list-atom";
import { serverAtom, ServerList } from "@/app/(home)/_state/server-atom";
import { useAtom } from "jotai";
import { Loader2Icon } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ServerInvite {
  id: string;
  name: string;
  profile_image: string;
  total_online: number;
  total_member: number;
}

export default function page() {
  const [data, setData] = useState<ServerInvite>();
  const [loading, setLoading] = useState(true);
  const { code } = useParams();
  const router = useRouter();

  useEffect(() => {
    apiCall(`${process.env.NEXT_PUBLIC_HOST_API}server/code/${code}`, {
      method: "GET",
    }).then(async (resp) => {
      const res = await resp.json();
      if (resp.ok) {
        setData(res.data);
        setLoading(false);
      }
      if (resp.status == 409) {
        router.push(res.data.redirect);
        return;
      }
    });
  }, []);

  return (
    <div
      style={{ backgroundImage: "url('/bg.svg')", backgroundSize: "cover" }}
      className="h-screen w-screen"
    >
      <Image
        className="absolute top-0 left-0 m-11"
        src="/discord.svg"
        width={124}
        height={24}
        alt="logo discord name"
        priority
      />
      <div className="fixed top-1/2 left-1/2 p-8 min-h-[300px] justify-center w-[450px] items-center text-white flex flex-col bg-[#393a41] rounded-lg -translate-x-1/2 -translate-y-1/2">
        {loading ? (
          <Loader2Icon className="animate-spin" />
        ) : data ? (
          <Found data={data} />
        ) : (
          <NotFound />
        )}
      </div>
    </div>
  );
}

function Found(props: { data: ServerInvite }) {
  const [loading, setLoading] = useState(false);
  const [server, setServer] = useAtom(serverAtom);
  const [channels, setChannels] = useAtom(channelListAtom);
  const router = useRouter();

  const acceptHandle = () => {
    setLoading(true);
    apiCall(`${process.env.NEXT_PUBLIC_HOST_API}server/join/${props.data.id}`, {
      method: "POST",
    })
      .then(async (resp) => {
        const res = await resp.json();
        if (resp.ok) {
          setServer((p) => [...p, res.data]);
          setChannels((p) => [
            ...p,
            {
              server_id: res.data.id,
              category: [],
              channel: [],
            },
          ]);
          router.replace("/channels/" + res.data.id);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <div className="size-[64px] mb-4 flex items-center justify-center rounded-xl overflow-hidden bg-server-btn-bg">
        {props.data.profile_image ? (
          <img
            draggable={false}
            src={
              process.env.NEXT_PUBLIC_HOST_API +
              "img/" +
              props.data.profile_image
            }
            className="size-full object-cover select-none"
          />
        ) : (
          props.data.name[0].toUpperCase()
        )}
      </div>
      <h1 className="text-[#dfe0e2]">You've been invited to join</h1>
      <h1 className="text-2xl font-semibold text-[#ffffff]">
        {props.data.name}
      </h1>

      <div className="text-sm flex items-center gap-4 mt-2">
        <div className="flex items-center gap-0.5">
          <div className="size-[10px] bg-green-500 rounded-full" />
          <span>{props.data.total_online} Online</span>
        </div>
        <div className="flex items-center gap-0.5">
          <div className="size-[10px] bg-[#dfe0e2] rounded-full" />
          <span>{props.data.total_member} Members</span>
        </div>
      </div>

      <button
        disabled={loading}
        onClick={acceptHandle}
        className="bg-[#5865f2] cursor-pointer hover:bg-[#5865f2]/75 transition-all rounded-lg grow p-2 font-semibold mt-10 w-full"
      >
        {!loading ? "Accept Invite" : "Loading"}
      </button>
    </>
  );
}

function NotFound() {
  const router = useRouter();
  return (
    <>
      <Image
        src={"/invite_notfound.svg"}
        alt="poop"
        width={186}
        height={100}
        priority
      />
      <h1 className="text-2xl font-semibold my-2">Invite Invalid</h1>
      <h1 className="text-center text-sm">
        This invite may be expired, or you might not have permission to join.
      </h1>
      <button
        onClick={() => router.push("/")}
        className="bg-[#5865f2] cursor-pointer hover:bg-[#5865f2]/75 transition-all rounded-lg grow p-2 font-semibold mt-10 w-full"
      >
        Continue to Discord
      </button>
    </>
  );
}
