"use client";

import UserBar from "../userbar";
import ServerInnerSidebar from "./server-inner-sidebar";
import FriendInnerSidebar from "./friend-inner-sidebar";
import useInnerSidebar from "./useInnerSidebar";

export default function InnerSidebar() {
  const hook = useInnerSidebar();

  return (
    <div
      ref={hook.sidebarRef}
      style={{ width: hook.width }}
      className="border-discord-border-1 relative h-full rounded-ss-xl border-t border-l"
    >
      {hook.path === "me" ? <FriendInnerSidebar /> : <ServerInnerSidebar />}

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
