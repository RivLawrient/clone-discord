"use client";

import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { userAtom } from "../_state/user-atom";
import UserBar from "./userbar";
import { usePathname } from "next/navigation";
import ServerInnerSidebar from "./server/server-inner-sidebar";
import FriendInnerSidebar from "./friend/friend-inner-sidebar";

export default function InnerSidebar() {
  const [user, setUser] = useAtom(userAtom);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(208); // 52 * 4 = 208px (default Tailwind min-w-52)
  const path = usePathname().split("/")[2];

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
      {path === "me" ? <FriendInnerSidebar /> : <ServerInnerSidebar />}

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
