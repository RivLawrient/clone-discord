import { useAtom } from "jotai";
import { useState } from "react";
import { userAtom } from "../_state/user-atom";
import UserAvatar from "./user-avatar";
import TooltipDesc from "./tooltip-desc";
import {
  HeadphoneOffIcon,
  HeadphonesIcon,
  LucideIcon,
  MicIcon,
  MicOffIcon,
  SettingsIcon,
} from "lucide-react";
import { twMerge } from "tailwind-merge";

export default function UserBar() {
  const [user, setUser] = useAtom(userAtom);
  const [mic, setMic] = useState(true);
  const [speaker, setSpeaker] = useState(true);

  return (
    <div className="bg-user-bar border-user-bar-border bg-blue flex h-14 rounded-lg border p-1.5">
      <div
        style={{
          borderStartStartRadius: "24px",
          borderEndStartRadius: "24px",
          borderStartEndRadius: "8px",
          borderEndEndRadius: "8px",
        }}
        className="hover:bg-user-bar-hover group flex min-w-0 grow cursor-pointer gap-2"
      >
        <UserAvatar
          avatar={user.avatar}
          name={user.name}
          px={40}
          StatusUser={user.status_activity}
        />
        <div className="flex flex-col justify-center gap-1 truncate">
          <span className="truncate text-[14px] leading-none font-semibold">
            {user.name}
          </span>
          <div className="text-user-bar-text flex h-3 flex-col overflow-hidden text-xs">
            <div className="flex min-w-0 flex-col transition-transform duration-200 group-hover:-translate-y-3">
              <span className="truncate leading-3">{user.status_activity}</span>
              <span className="truncate leading-3">{user.username}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="ml-2 flex items-center gap-1">
        <TooltipDesc text={mic ? "Mute" : "Unmute"} side="top" is_child>
          <BtnAttribute
            status={mic}
            icon_on={MicIcon}
            icon_off={MicOffIcon}
            on_click={() => setMic(!mic)}
          />
        </TooltipDesc>

        <TooltipDesc text={speaker ? "Deafen" : "Undeafen"} side="top" is_child>
          <BtnAttribute
            status={speaker}
            icon_on={HeadphonesIcon}
            icon_off={HeadphoneOffIcon}
            on_click={() => setSpeaker(!speaker)}
          />
        </TooltipDesc>
        <BtnSettings />
      </div>
    </div>
  );
}

function BtnAttribute(props: {
  status: boolean;
  icon_on: LucideIcon;
  icon_off: LucideIcon;
  on_click: () => void;
}) {
  const Icon = props.status ? props.icon_on : props.icon_off;

  return (
    <div
      onClick={props.on_click}
      className={twMerge(
        "cursor-pointer rounded-lg p-1.5",
        props.status
          ? "hover:bg-user-bar-hover"
          : "bg-user-bar-red hover:bg-user-bar-redhover",
      )}
    >
      <Icon
        size={22}
        className={twMerge(
          "",
          props.status ? "text-user-bar-def" : "text-red-500",
        )}
      />
    </div>
  );
}

function BtnSettings() {
  return (
    <TooltipDesc text="User Settings" side="top">
      <div className="hover:bg-user-bar-hover group cursor-pointer rounded-lg p-1.5">
        <SettingsIcon
          size={22}
          className="text-user-bar-def group-hover:animate-spin"
        />
      </div>
    </TooltipDesc>
  );
}
