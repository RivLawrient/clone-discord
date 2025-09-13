"use client";

import {
  ChevronDownIcon,
  LogOutIcon,
  UserRoundPlusIcon,
  XIcon,
} from "lucide-react";
import { useParams } from "next/navigation";
import { DropdownMenu, ScrollArea } from "radix-ui";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

export default function ServerInnerSidebar() {
  const { server } = useParams();

  const TAGS = Array.from({ length: 80 }).map(
    (_, i, a) => `v1.2.0-beta.${a.length - i}`,
  );
  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_1fr] overflow-hidden rounded-ss-xl pb-16">
      <DropdownServerInnerSidebar />
      <div className="custom-scrollbar min-h-0 overflow-y-scroll">
        {TAGS.map((v, i) => (
          <div key={i}>tes {i}</div>
        ))}
      </div>
    </div>
  );
}

function DropdownServerInnerSidebar() {
  const [open, setOpen] = useState(false);
  const Icon = open ? XIcon : ChevronDownIcon;
  return (
    <DropdownMenu.Root onOpenChange={(e) => setOpen(e)}>
      <DropdownMenu.Trigger asChild>
        <button
          className={twMerge(
            "border-discord-border-1 flex cursor-pointer justify-between border-b p-4 outline-none hover:bg-[#1c1c1f]",
            open && "bg-[#1c1c1f]",
          )}
        >
          <span className="leading-5 font-semibold">tes</span>
          <Icon
            size={20}
            className="brightness-75"
            absoluteStrokeWidth
            vectorEffect={1}
          />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={5}
          className="w-52 origin-top rounded-lg border border-[#36363b] bg-[#28282d] p-2 text-white outline-none data-[state=open]:animate-[dropdown-show_200ms]"
        >
          <DropdownMenu.Item className="group flex cursor-pointer justify-between rounded-sm p-2 text-sm font-semibold transition-all outline-none hover:bg-[#313136]">
            Invite People
            <UserRoundPlusIcon
              size={20}
              className="brightness-75 transition-all group-hover:brightness-100"
            />
          </DropdownMenu.Item>
          <hr className="my-2 border-r border-[#36363b]" />
          <DropdownMenu.Item className="group flex cursor-pointer justify-between rounded-sm p-2 text-sm font-semibold text-[#f47976] transition-all outline-none hover:bg-[#362a2e]">
            Leave Server
            <LogOutIcon
              size={20}
              className="brightness-75 transition-all group-hover:brightness-100"
            />
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
