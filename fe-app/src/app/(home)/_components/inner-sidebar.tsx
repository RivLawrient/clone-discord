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
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    const startResizing = () => {
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
      className="relative h-full bg-blue-500"
    >
      <p className="p-2">innerside bar</p>

      {/* Resizer */}
      <div
        id="resizer"
        className="absolute top-0 right-0 bottom-0 w-1 cursor-ew-resize hover:bg-amber-500"
      />

      {/* Bawah sidebar */}
      <div className="absolute right-0 bottom-0 left-0 -ml-[72px] p-1.5">
        <div className="h-14 bg-red-400">
          <UserAvatar avatar={user.avatar} name={user.name} />
        </div>
      </div>
    </div>
  );
}
