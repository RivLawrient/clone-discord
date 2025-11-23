"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import UserBar from "./userbar";
import ServerView from "./server/server-view";
import FriendView from "./friend/friend-view";

export default function InnerSidebar() {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(220);
  const path = usePathname().split("/")[2];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!sidebarRef.current) return;

      const newWidth =
        e.clientX - sidebarRef.current.getBoundingClientRect().left;

      if (newWidth >= 200 && newWidth <= 500) {
        setWidth(newWidth + 1);
      }
    };

    const handleMouseUp = () => {
      const resizer = document.getElementById("resizer");
      resizer?.classList.remove("bg-discord-border-1");
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    const startResizing = (e: MouseEvent) => {
      e.preventDefault();
      const resizer = document.getElementById("resizer");
      resizer?.classList.add("bg-discord-border-1");
      document.body.style.userSelect = "none";
      document.body.style.cursor = "ew-resize";
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
    <aside
      ref={sidebarRef}
      style={{
        width: width,
      }}
      className="border-[#29292e] relative h-full min-h-0 rounded-ss-xl border-t border-l"
    >
      <div
        id="resizer"
        className="absolute top-0 right-0 bottom-0 z-10 w-1 cursor-ew-resize hover:bg-discord-border-1 pointer-events-auto"
      />
      {path === "me" ? <FriendView /> : <ServerView />}
      <div className="bg-discord-bg absolute right-0 bottom-0 left-0 -ml-[72px] p-1.5 pt-0">
        <UserBar />
      </div>
    </aside>
  );
}
