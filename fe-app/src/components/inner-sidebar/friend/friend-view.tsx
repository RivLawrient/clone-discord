import TooltipDesc from "@/app/(home)/_components/tooltip-desc";
import { cn } from "@/app/(home)/_helper/cn";
import {
  LucideIcon,
  PlusIcon,
  RabbitIcon,
  StoreIcon,
  UserRoundCheckIcon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function FriendView() {
  return (
    <div className="flex flex-col">
      <div className="border-discord-border-1 border-b p-2">
        <button className="bg-discord-border-1 w-full min-w-0 cursor-pointer truncate rounded-lg border border-[#262629] p-2 text-center text-xs leading-3.5 font-semibold hover:brightness-120">
          Find or start a convertation
        </button>
      </div>
      <div className="flex flex-col p-2">
        <div className="border-discord-border-1 flex flex-col gap-0.5 border-b pb-2">
          <OptionBtn
            label="Friends"
            icon={UserRoundCheckIcon}
            paths="me"
          />
          <OptionBtn
            label="Get Nitro"
            icon={RabbitIcon}
            paths="getnitro"
          />
          <OptionBtn
            label="Shop"
            icon={StoreIcon}
            paths="store"
          />
        </div>
        <div>
          <div className="mt-2 flex items-center p-2">
            <h1 className="grow text-xs font-semibold brightness-50 hover:brightness-100">
              Direct Messages
            </h1>
            <TooltipDesc
              side="top"
              text="Create DM"
            >
              <PlusIcon
                size={15}
                strokeWidth={3}
                className="cursor-pointer brightness-50 hover:brightness-100"
              />
            </TooltipDesc>
          </div>
        </div>
      </div>
    </div>
  );
}

function OptionBtn(props: { label: string; icon: LucideIcon; paths: string }) {
  const Icons = props.icon;
  const path = usePathname().split("/");
  const router = useRouter();
  return (
    <button
      onClick={() =>
        props.paths === "me" && router.push("/channels/" + props.paths)
      }
      className={cn(
        "hover:bg-btn-hover-1 flex cursor-pointer items-center gap-2 rounded-lg p-1.5 px-2 font-semibold brightness-50 hover:brightness-100",
        path[2] == props.paths && path[3] == null
          ? "bg-btn-select-1 brightness-100"
          : "",
        props.paths != "me" && "cursor-not-allowed"
      )}
    >
      <Icons size={18} />
      {props.label}
    </button>
  );
}
