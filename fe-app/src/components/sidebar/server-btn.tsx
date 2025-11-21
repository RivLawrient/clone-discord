import { apiCall } from "@/app/(home)/_helper/api-client";
import { cn } from "@/app/(home)/_helper/cn";
import { channelListAtom } from "@/app/(home)/_state/channel-list-atom";
import { serverAtom, ServerList } from "@/app/(home)/_state/server-atom";
import { useAtom } from "jotai";
import { usePathname, useRouter } from "next/navigation";
import { SetStateAction, useState } from "react";
import TooltipDetail from "../tooltip-desc";

export default function ServerBtn(props: {
  data: ServerList;
  isDrag: boolean;
  setIsDrag: React.Dispatch<SetStateAction<boolean>>;
  whoDrag: number;
  setWhoDrag: React.Dispatch<SetStateAction<number>>;
  idDrag: string;
  setIdDrag: React.Dispatch<SetStateAction<string>>;
}) {
  const [enter, setEnter] = useState(false);
  const path = usePathname().split("/")[2];
  const [, setServers] = useAtom(serverAtom);
  const [channels] = useAtom(channelListAtom);
  const router = useRouter();

  const dragStartHandle = () => {
    props.setIsDrag(true);
    props.setWhoDrag(props.data.position);
    props.setIdDrag(props.data.id);
  };
  const dragEndHandle = () => {
    props.setIsDrag(false);
    props.setWhoDrag(0);
    props.setIdDrag("");
  };

  const dragEnterHandle = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setEnter(true);
  };

  const dragLeaveHandle = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setEnter(false);
  };

  const dragOverHandler = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const dragDropHandle = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    console.log("from " + props.whoDrag, "to " + props.data.position);
    apiCall(
      `${process.env.NEXT_PUBLIC_HOST_API}server/me/${props.idDrag}/${props.data.position}`,
      {
        method: "POST",
      }
    )
      .then(async (resp) => {
        const res = await resp.json();
        if (resp.ok) {
          const data: ServerList[] = res.data;
          setServers(data);
        }
      })
      .catch(() => {});
    setEnter(false);
  };

  const clickHandle = () => {
    const current = channels.find((v) => v.server_id === props.data.id);

    if (current) {
      const check =
        current.channel[0] ||
        current.category.find((v) => v.channel.length > 0)?.channel[0];
      if (check) {
        router.push(`/channels/${props.data.id}/${check.id}`);
      } else {
        router.push(`/channels/${props.data.id}`);
      }
    }
  };

  return (
    <li className="relative px-4">
      {props.isDrag && props.whoDrag != props.data.position && (
        <div
          onDragEnter={dragEnterHandle}
          onDragLeave={dragLeaveHandle}
          onDragOver={dragOverHandler}
          onDrop={dragDropHandle}
          className={cn(
            "h-5 flex items-center absolute left-0 right-0",
            props.whoDrag < props.data.position ? "-bottom-3.5" : "-top-3.5"
          )}
        >
          {enter && (
            <div className="h-2 -z-10 bg-green-500 grow rounded-lg transition-all" />
          )}
        </div>
      )}
      <TooltipDetail
        side="right"
        text={props.data.name}
      >
        <button
          draggable
          onDragStart={dragStartHandle}
          onDragEnd={dragEndHandle}
          onClick={clickHandle}
          className={cn(
            "overflow-hidden size-10 peer bg-[#1d1d1e] cursor-pointer hover:bg-[#5865f2] rounded-xl transition-all flex",
            path == props.data.id && "bg-[#5865f2]"
          )}
        >
          {props.data.profile_image ? (
            <img
              draggable={false}
              src={
                process.env.NEXT_PUBLIC_HOST_API +
                "img/" +
                props.data.profile_image
              }
              alt=""
              width={40}
              height={40}
              className="size-10 object-cover select-none"
            />
          ) : (
            <label className="m-auto select-none cursor-pointer">
              {props.data.name[0].toUpperCase()}
            </label>
          )}
        </button>
      </TooltipDetail>
      <div
        className={cn(
          "absolute top-0 bottom-0 left-0 my-auto w-1 rounded-r-lg bg-white transition-all",
          path == props.data.id ? "h-10" : "h-0 peer-hover:h-5"
        )}
      />
    </li>
  );
}
