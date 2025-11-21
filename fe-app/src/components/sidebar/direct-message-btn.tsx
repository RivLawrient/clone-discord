"use client";
import { usePathname, useRouter } from "next/navigation";
import TooltipDetail from "../tooltip-desc";
import Image from "next/image";
import { cn } from "@/app/(home)/_helper/cn";

export default function DirectMessageBtn() {
  const path = usePathname().split("/")[2];
  const router = useRouter();

  return (
    <div className=" relative px-4">
      <TooltipDetail
        side="right"
        text="Direct Messages"
      >
        <button
          onClick={() => router.push("/channels/me")}
          className={cn(
            "peer size-10 bg-[#1d1d1e] hover:bg-[#5865f2] cursor-pointer rounded-xl transition-all flex ",
            path === "me" && "bg-[#5865f2]"
          )}
        >
          <div className="m-auto">
            <Image
              src={"/dc-logo.png"}
              alt=""
              width={24}
              height={24}
              quality={100}
            />
          </div>
        </button>
      </TooltipDetail>
      <div
        className={cn(
          "absolute top-0 bottom-0 left-0 my-auto w-1 rounded-r-lg bg-white transition-all",
          path == "me" ? "h-10" : "h-0 peer-hover:h-5"
        )}
      />
    </div>
  );
}
