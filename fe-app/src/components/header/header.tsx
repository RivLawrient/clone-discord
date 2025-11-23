"use client";

import { cn } from "@/app/(home)/_helper/cn";
import { serverAtom } from "@/app/(home)/_state/server-atom";
import { useAtom } from "jotai";
import { User2Icon } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const seg = pathname.split("/").filter(Boolean);

  const isDMList = seg[1] === "me" && seg.length === 2;
  const isDMChat = seg[1] === "me" && seg.length === 3;
  const isServer = (seg[1] !== "me" && seg.length === 2) || 3;

  let Current: React.FC<any> = () => null;
  let props: any = {};

  if (isDMList) {
    Current = DMListHeader;
  } else if (isDMChat) {
    Current = DMChatHeader;
    props = { userId: seg[2] };
  } else if (isServer) {
    Current = ServerHeader;
    props = { serverId: seg[1] };
  }
  return (
    <header className="mx-auto my-1.5 text-sm font-semibold ">
      <div className="flex items-center gap-2">
        <Current {...props} />
      </div>
    </header>
  );
}

function DMListHeader() {
  return (
    <>
      <div>
        <User2Icon size={16} />
      </div>
      <h1>Friends</h1>
    </>
  );
}
function DMChatHeader({ userId }: { userId: string }) {
  return (
    <>
      <div>
        <img
          src={"/dc-logo.png"}
          alt=""
          width={16}
          height={16}
        />
      </div>
      <h1>Direct Messages</h1>
    </>
  );
}

function ServerHeader({ serverId }: { serverId: string }) {
  const [servers] = useAtom(serverAtom);
  const current = servers.find((v) => v.id == serverId);

  return (
    <>
      <div
        className={cn(
          " size-5 rounded-sm flex items-center justify-center overflow-hidden",
          current && "bg-[#1d1d1e]"
        )}
      >
        {current?.profile_image ? (
          <img
            draggable={false}
            src={
              process.env.NEXT_PUBLIC_HOST_API + "img/" + current?.profile_image
            }
            alt=""
            className="object-cover select-none"
          />
        ) : (
          <label className=" font-normal text-xs select-none cursor-pointer">
            {current?.name[0].toUpperCase()}
          </label>
        )}
      </div>
      <h1>{current?.name}</h1>
    </>
  );
}
