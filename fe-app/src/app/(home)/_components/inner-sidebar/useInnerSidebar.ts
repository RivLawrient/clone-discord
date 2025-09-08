import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function useInnerSidebar() {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(208);
  const path = usePathname().split("/")[2];

  const hello = () => {
    console.log("Hello");
  };

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

  return {
    sidebarRef,
    path,
    width,
    hello
  };
}
