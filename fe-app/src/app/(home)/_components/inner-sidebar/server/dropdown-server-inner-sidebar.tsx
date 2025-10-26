import { cn } from "@/app/(home)/_helper/cn";
import { serverAtom } from "@/app/(home)/_state/server-atom";
import { useAtom } from "jotai";
import {
  ChevronDownIcon,
  LogOutIcon,
  SettingsIcon,
  UserRoundPlusIcon,
  XIcon,
} from "lucide-react";
import { useParams } from "next/navigation";
import { DropdownMenu } from "radix-ui";
import React, { useState } from "react";
import { ModalInviteFriend } from "./modal-invite-friend";

export function DropdownServerInnerSidebar() {
  const [servers] = useAtom(serverAtom);
  const { server } = useParams();
  const currentServer = servers.find((v) => v.id === server);
  const [open, setOpen] = useState(false);
  const Icon = open ? XIcon : ChevronDownIcon;
  const [openInvite, setOpenInvite] = useState(false);

  return (
    <>
      <ModalInviteFriend
        open={openInvite}
        setOpen={setOpenInvite}
      />
      <DropdownMenu.Root onOpenChange={setOpen}>
        <DropdownMenu.Trigger asChild>
          <button
            className={cn(
              "border-discord-border-1 grid grid-cols-[1fr_auto] cursor-pointer justify-between border-b p-4 outline-none hover:bg-[#1c1c1f] min-h-0 truncate",
              open && "bg-[#1c1c1f]"
            )}
          >
            <span className="leading-5 font-semibold min-h-0 truncate text-start">
              {currentServer?.name}
            </span>
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
            <DropdownMenu.Item
              onClick={() => setOpenInvite(!openInvite)}
              className="group flex cursor-pointer justify-between rounded-sm p-2 text-sm font-semibold transition-all outline-none hover:bg-[#313136]"
            >
              Invite People
              <UserRoundPlusIcon
                size={20}
                className="brightness-75 transition-all group-hover:brightness-100"
              />
            </DropdownMenu.Item>

            {currentServer?.is_owner && (
              <DropdownMenu.Item
                onClick={() => setOpenInvite(!openInvite)}
                className="group flex cursor-pointer justify-between rounded-sm p-2 text-sm font-semibold transition-all outline-none hover:bg-[#313136]"
              >
                Server Settings
                <SettingsIcon
                  size={20}
                  className="brightness-75 transition-all group-hover:brightness-100"
                />
              </DropdownMenu.Item>
            )}

            {!currentServer?.is_owner && (
              <>
                <hr className="my-2 border-r border-[#36363b]" />
                <DropdownMenu.Item className="group flex cursor-pointer justify-between rounded-sm p-2 text-sm font-semibold text-[#f47976] transition-all outline-none hover:bg-[#362a2e]">
                  Leave Server
                  <LogOutIcon
                    size={20}
                    className="brightness-75 transition-all group-hover:brightness-100"
                  />
                </DropdownMenu.Item>
              </>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </>
  );
}
