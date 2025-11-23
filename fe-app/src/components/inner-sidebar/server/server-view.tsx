import { cn } from "@/app/(home)/_helper/cn";
import { serverAtom } from "@/app/(home)/_state/server-atom";
import { useAtom } from "jotai";
import { ChevronDownIcon, XIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import DropdownMenuServer from "./dropdown/dropdown-menu-server";
import MainSectionInnerSidebar from "@/app/(home)/_components/inner-sidebar/server/main-section-inner-sidebar";

export default function ServerView() {
  const [open, setOpen] = useState(false);
  const Icon = open ? XIcon : ChevronDownIcon;
  const [servers] = useAtom(serverAtom);
  const { server } = useParams();
  const currentServer = servers.find((v) => v.id === server);

  if (currentServer)
    return (
      <div className="grid h-full min-h-0 grid-rows-[auto_1fr] overflow-hidden rounded-ss-xl pb-16">
        <DropdownMenuServer
          data={currentServer}
          open={open}
          setOpen={setOpen}
        >
          <button
            className={cn(
              "border-[#29292e] grid grid-cols-[1fr_auto] cursor-pointer justify-between border-b px-4 py-3.5 outline-none hover:bg-[#1c1c1f] min-h-0 truncate items-center",
              open && "bg-[#1c1c1f]"
            )}
          >
            <span className="leading-4.5 font-semibold min-h-0 truncate text-start">
              {currentServer?.name}
            </span>
            <div>
              <Icon
                size={20}
                className="brightness-75"
                absoluteStrokeWidth
                vectorEffect={1}
              />
            </div>
          </button>
        </DropdownMenuServer>
        {/* <div className="custom-scrollbar font-semibold min-h-0 gap-0.5 min-w-0 flex flex-col overflow-y-scroll pt-3 pr-3 relative">
          <h1 className="truncate">tsingggssssssssssssssssssssssssssssssssg</h1>
        </div> */}
        <MainSectionInnerSidebar />
      </div>
    );
}
