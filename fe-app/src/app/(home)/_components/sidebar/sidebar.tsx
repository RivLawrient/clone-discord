"use client";
import { usePathname, useRouter } from "next/navigation";
import { SetStateAction, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import TooltipDesc from "../tooltip-desc";
import { useAtom } from "jotai";
import { serverAtom, ServerList } from "../../_state/server-atom";
import { apiCall, GetCookie } from "../../_helper/api-client";
import AddServerBtn from "./add-server-btn";
import { channelListAtom } from "../../_state/channel-list-atom";

export default function Sidebar() {
  const [list, setList] = useAtom(serverAtom);
  const [drag, setDrag] = useState<number>(0);
  const [isdrag, setIsdrag] = useState(false);

  return (
    <div
      style={{
        scrollbarWidth: "none",
      }}
      className="flex min-h-0 flex-col gap-y-2 overflow-y-scroll pb-20 select-none"
    >
      <DMBtn />

      <div className="border-discord-border-1 mx-5 border-t" />
      {list
        .sort((a, b) => a.position - b.position)
        .map((v, i, a) => (
          <ServerBtn
            key={i}
            id={v.id}
            position={v.position}
            label={v.name}
            picture={v.profile_image}
            is_last={i === a.length - 1}
            drag={drag}
            setDrag={setDrag}
            setList={setList}
            isdrag={isdrag}
            setIsdrag={setIsdrag}
          />
        ))}
      <AddServerBtn />
    </div>
  );
}

function DMBtn() {
  const path = usePathname().split("/")[2];
  const router = useRouter();
  return (
    <div className="relative flex">
      <TooltipDesc
        text="Direct Messages"
        side={"right"}
      >
        <div
          onClick={() => router.push("/channels/me")}
          className={twMerge(
            "bg-server-btn-bg hover:bg-server-btn-hover peer mx-4 size-10 cursor-pointer rounded-xl p-2 font-semibold",
            path === "me" && "bg-server-btn-hover"
          )}
        >
          <img
            src="/dc-logo.png"
            alt=""
            className="size-6 object-contain"
          />
        </div>
      </TooltipDesc>
      <div
        className={twMerge(
          "absolute top-0 bottom-0 left-0 my-auto w-1 rounded-r-lg bg-white transition-all",
          path === "me" ? "h-10" : "h-0 peer-hover:h-5"
        )}
      />
    </div>
  );
}

function ServerBtn(props: {
  label: string;
  picture: string;
  is_last?: boolean;
  id: string;
  position: number;
  drag: number;
  isdrag: boolean;
  setDrag: React.Dispatch<SetStateAction<number>>;
  setList: React.Dispatch<SetStateAction<ServerList[]>>;
  setIsdrag: React.Dispatch<SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const path_start = usePathname().split("/")[1];
  const path_channel = usePathname().split("/")[2];
  const is_current_path = path_start === "channels" && path_channel == props.id;
  const [channels, setChannels] = useAtom(channelListAtom);
  const current = channels.find((v) => v.server_id == props.id);

  return (
    <div className="relative">
      {props.isdrag && (
        <DragZone
          id={props.id}
          posisiton={props.position}
          drag={props.drag}
          setList={props.setList}
        />
      )}
      <TooltipDesc
        side="right"
        text={props.label}
      >
        <div
          draggable
          onDragStart={() => {
            props.setDrag(props.position);
            props.setIsdrag(true);
          }}
          onDragEnd={() => props.setIsdrag(false)}
          onClick={() => {
            console.log("server apa", current);
            if (current) {
              const check =
                current.channel[0] ||
                current.category.find((v) => v.channel.length > 0)?.channel[0];
              if (check) {
                router.push(`/channels/${props.id}/${check.id}`);
              } else {
                router.push("/channels/" + props.id);
              }
            }
          }}
          className={twMerge(
            "peer bg-server-btn-bg hover:bg-server-btn-hover mx-4 flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-xl font-semibold",
            is_current_path && "bg-server-btn-hover"
          )}
        >
          {props.picture ? (
            <img
              draggable={false}
              src={process.env.NEXT_PUBLIC_HOST_API + "img/" + props.picture}
              className="size-10 object-cover select-none"
            />
          ) : (
            props.label[0].toUpperCase()
          )}
        </div>
      </TooltipDesc>

      <div
        className={twMerge(
          "absolute top-0 bottom-0 left-0 my-auto w-1 rounded-r-lg bg-white transition-all",
          is_current_path ? "h-10" : "h-0 peer-hover:h-5"
        )}
      />
      {props.is_last && props.isdrag && (
        <DragZone
          id={props.id}
          on_last={props.is_last}
          posisiton={props.position}
          drag={props.drag}
          setList={props.setList}
        />
      )}
    </div>
  );
}

function DragZone(props: {
  id: string;
  on_last?: boolean;
  posisiton: number;
  drag: number;
  setList: React.Dispatch<SetStateAction<ServerList[]>>;
}) {
  const [enter, setEnter] = useState(false);

  const [list, setList] = useAtom(serverAtom);
  return (
    <>
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          if (props.posisiton != props.drag) setEnter(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setEnter(false);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        }}
        onDrop={(e) => {
          e.preventDefault();
          let zone =
            props.posisiton > props.drag
              ? props.posisiton - 1
              : props.posisiton;

          zone = props.on_last ? zone + 1 : zone;

          if (props.posisiton != props.drag) {
            setEnter(false);

            // drag ke atas
            zone < props.drag &&
              props.setList((v) =>
                v.map((vv) =>
                  vv.position >= zone && vv.position < props.drag
                    ? { ...vv, position: vv.position + 1 }
                    : vv.position === props.drag
                      ? { ...vv, position: zone }
                      : vv
                )
              );

            // drag ke bawah
            zone > props.drag &&
              props.setList((v) =>
                v.map((vv) =>
                  vv.position <= zone && vv.position > props.drag
                    ? { ...vv, position: vv.position - 1 }
                    : vv.position === props.drag
                      ? { ...vv, position: zone }
                      : vv
                )
              );

            const data = list.find((v) => v.position === props.drag);
            const current = list;

            if (data) {
              console.log(zone, data.id, data.position);

              apiCall(
                `${process.env.NEXT_PUBLIC_HOST_API}server/me/${data.id}/${zone}`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${GetCookie("token")}`,
                  },
                }
              )
                .then(async (resp) => {
                  if (resp.ok) {
                    const res = await resp.json();
                    // setList(res.data);
                  } else {
                    setTimeout(() => {
                      setList(current);
                    }, 2000);
                  }
                })
                .catch(() => {
                  setTimeout(() => {
                    setList(current);
                  }, 2000);
                });
            }
          }
        }}
        className={twMerge(
          "absolute z-10 h-5 w-full",
          props.on_last ? "-bottom-3.5" : "-top-3.5"
        )}
      />
      <div
        className={twMerge(
          "absolute h-2 w-full rounded-lg",
          enter && "bg-green-500",
          props.on_last ? "-bottom-2" : "-top-2"
        )}
      />
    </>
  );
}
