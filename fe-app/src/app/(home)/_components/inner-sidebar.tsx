// export default function InnerSidebar() {
//   return (
//     <div className="relative min-w-52 bg-blue-500">
//       innerside bar
//       <div className="absolute top-0 right-0 bottom-0 w-1 cursor-ew-resize hover:bg-amber-500" />
//       <div className="absolute right-0 bottom-0 left-0 -ml-[72px] p-1.5">
//         <div className="h-14 bg-red-400"></div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { userAtom } from "../_state/user-atom";
import UserAvatar from "./user-avatar";
import {
  HeadphoneOffIcon,
  HeadphonesIcon,
  LucideIcon,
  MicIcon,
  MicOffIcon,
  SettingsIcon,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import TooltipDesc from "./tooltip-desc";

export default function InnerSidebar() {
  const [user, setUser] = useAtom(userAtom);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(208); // 52 * 4 = 208px (default Tailwind min-w-52)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!sidebarRef.current) return;

      // Hitung posisi mouse terhadap layar kiri
      const newWidth =
        e.clientX - sidebarRef.current.getBoundingClientRect().left;

      // Batasi antara 200px sampai 500px
      if (newWidth >= 200 && newWidth <= 500) {
        setWidth(newWidth + 1);
      }
    };

    const handleMouseUp = () => {
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    const startResizing = (e: MouseEvent) => {
      e.preventDefault();
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    const resizer = document.getElementById("resizer");
    resizer?.addEventListener("mousedown", startResizing);

    return () => {
      resizer?.removeEventListener("mousedown", startResizing);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div
      ref={sidebarRef}
      style={{ width }}
      className="border-discord-border-1 relative h-full rounded-ss-xl border-t border-l"
    >
      <p className="p-2">innerside bar</p>

      {/* Resizer */}
      <div
        id="resizer"
        className="hover:bg-discord-border-1 absolute top-0 right-0 bottom-0 z-10 w-1 cursor-ew-resize"
      />

      {/* Bawah sidebar */}
      <div className="bg-discord-bg absolute right-0 bottom-0 left-0 -ml-[72px] p-1.5 pt-0">
        <UserBar />
      </div>
    </div>
  );
}

function UserBar() {
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
        className="hover:bg-user-bar-hover group flex min-w-0 grow gap-2"
      >
        <UserAvatar avatar={user.avatar} name={user.name} />
        <div className="flex flex-col justify-center gap-1 truncate">
          <span className="truncate text-[14px] leading-none font-semibold">
            {user.name}
          </span>
          <span className="text-user-bar-text truncate text-[12px] leading-none">
            {user.username}
          </span>
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
