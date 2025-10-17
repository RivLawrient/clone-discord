import {
  ChevronDownIcon,
  ChevronRightIcon,
  HashIcon,
  PlusIcon,
  SettingsIcon,
  Volume2Icon,
} from "lucide-react";
import { RightClickMenuMainSection } from "./right-click-menu-main-section";
import { cn } from "@/app/(home)/_helper/cn";
import TooltipDesc from "../../tooltip-desc";
import { Fragment, SetStateAction, useEffect, useState } from "react";

import {
  CategoryChannel,
  ChannelList,
  serverAtom,
  ServerList,
} from "@/app/(home)/_state/server-atom";
import { useParams } from "next/navigation";
import { useAtom } from "jotai";

const channels: ChannelList[] = Array.from({ length: 10 }, (_, i) => ({
  id: crypto.randomUUID(), // generate id unik
  type: i % 2 === 0 ? "text" : "voice", // selang-seling text/voice
  name: `channel ${i + 1}`,
  position: i + 1,
}));

const categories: CategoryChannel[] = Array.from({ length: 3 }, (_, i) => ({
  id: crypto.randomUUID(),
  name: `category ${i + 1}`,
  position: i + 1,
  channel: Array.from({ length: 5 }, (_, j) => ({
    id: crypto.randomUUID(),
    type: j % 2 === 0 ? "text" : "voice",
    name: `channel ${j + 1}`,
    position: j + 1,
  })),
}));

const list = {
  channel: channels,
  category: categories,
};

export default function MainSectionInnerSidebar() {
  const [servers, setServers] = useAtom(serverAtom);
  const { server } = useParams();
  const [loaded, setLoaded] = useState(false);
  const [currentServer, setCurrentServer] = useState<ServerList | undefined>();
  const [isDrag, setIsdrag] = useState(false);
  const [whoDrag, setWhoDrag] = useState(0);
  const [whoCategory, setWhoCategory] = useState("");

  useEffect(() => {
    if (!loaded && servers.length > 0) {
      console.log("Servers loaded:", servers);
      setServers((p) =>
        p.map((v) => (v.id === server ? { ...v, list: list } : v))
      );
      setLoaded(true);
    }
  }, [servers]);

  useEffect(() => {
    const found = servers.find((v) => v.id === server);
    setCurrentServer(found);
  }, [loaded]);

  if (!currentServer) return <></>;
  return (
    <RightClickMenuMainSection>
      <div className="custom-scrollbar font-semibold min-h-0 gap-0.5 min-w-0 flex flex-col overflow-y-scroll pt-3 pr-2 relative">
        {currentServer.list.channel.map((v, i, a) => (
          <ChannelBtnList
            key={v.id}
            data={v}
            isDrag={isDrag}
            position={i + 1}
            whoDrag={whoDrag}
            setWhoDrag={setWhoDrag}
            setIsDrag={setIsdrag}
            category=""
            whoCategory={whoCategory}
            setWhoCategory={setWhoCategory}
            // isLast={i === a.length - 1}
          />
        ))}
        {currentServer.list.category.map((v, i) => (
          <CategoryBtnSection
            key={v.id}
            data={v}
            isDrag={isDrag}
            whoDrag={whoDrag}
            position={i + 1}
            setWhodrag={setWhoDrag}
            setIsdrag={setIsdrag}
            whoCategory={whoCategory}
            setWhoCategory={setWhoCategory}
          />
        ))}
      </div>
    </RightClickMenuMainSection>
  );
}
function DragZone(props: {
  position: number;
  dragPosition: number;
  fromCategory: string;
  toCategory: string;
}) {
  const [enter, setEnter] = useState(false);

  return (
    <>
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          setEnter(true);
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
          console.log({
            from: props.dragPosition,
            from_category: props.fromCategory,
            to: props.position,
            to_category: props.toCategory,
          });
        }}
        className={cn("min-h-8 absolute w-full z-10")}
      />
      <div
        className={cn(
          "absolute w-full min-h-1.5 rounded-lg ",
          enter && "bg-green-500",
          props.toCategory == props.fromCategory
            ? props.dragPosition < props.position
              ? "-bottom-1"
              : "-top-1"
            : "-top-1"
        )}
      />
    </>
  );
}

// perlu right klik
function ChannelBtnList(props: {
  data: ChannelList;
  isDrag: boolean;
  position: number;
  whoDrag: number;
  setIsDrag: React.Dispatch<SetStateAction<boolean>>;
  setWhoDrag: React.Dispatch<SetStateAction<number>>;
  category: string;
  whoCategory: string;
  setWhoCategory: React.Dispatch<SetStateAction<string>>;
  isLast?: boolean;
}) {
  const Icons = props.data.type === "text" ? HashIcon : Volume2Icon;
  return (
    <div
      draggable
      onDragStart={() => {
        props.setIsDrag(true);
        props.setWhoDrag(props.data.position);
        props.setWhoCategory(props.category);
        console.log("start drag", {
          from: props.data.position,
          category: props.category,
          props,
        });
      }}
      onDragEnd={() => {
        props.setIsDrag(false);
      }}
      className="relative flex ml-2 "
    >
      {props.isDrag && (
        <DragZone
          position={props.position}
          dragPosition={props.whoDrag}
          fromCategory={props.whoCategory}
          toCategory={props.category}
        />
      )}
      <button
        onClick={() => console.log("channel")}
        className={cn(
          "hover:bg-[#1c1c1f] cursor-pointer hover:text-white group outline-none gap-2 min-w-0 items-center transition-all rounded-lg flex flex-row py-1 px-2  grow ",
          props.isDrag && props.position == props.whoDrag && "brightness-50"
        )}
      >
        <div>
          <Icons
            size={20}
            className={cn("brightness-60")}
          />
        </div>
        <span className="grow text-start min-w-0 truncate group-hover:brightness-100 brightness-60">
          {props.data.name}
        </span>

        <TooltipDesc
          side="top"
          text="Edit Channel"
        >
          <div className="group-hover:visible invisible">
            <SettingsIcon
              size={20}
              className={cn("not-hover:brightness-60")}
            />
          </div>
        </TooltipDesc>
      </button>
    </div>
  );
}

function CategoryBtnSection(props: {
  data: CategoryChannel;
  position: number;
  isDrag: boolean;
  whoDrag: number;
  setIsdrag: React.Dispatch<SetStateAction<boolean>>;
  setWhodrag: React.Dispatch<SetStateAction<number>>;
  whoCategory: string;
  setWhoCategory: React.Dispatch<SetStateAction<string>>;
}) {
  const [open, setOpen] = useState(true);

  return (
    <>
      <div
        draggable
        className=" group pl-4 pr-2 transition-all flex flex-row gap-1 items-center mt-4 bg-[#121214] z-10"
      >
        <button
          onClick={() => setOpen(!open)}
          className="flex flex-row items-center grow gap-1 group-hover:brightness-100 brightness-60 cursor-pointer min-w-0 transition-all"
        >
          <span className="truncate min-w-0 text-sm">{props.data.name}</span>
          <div>
            <ChevronRightIcon
              size={16}
              className={cn("transition-all", open && "rotate-90")}
            />
          </div>
        </button>

        <TooltipDesc
          side="top"
          text="Create Channel"
        >
          <button className="outline-none cursor-pointer">
            <PlusIcon
              size={16}
              strokeWidth={3}
              className="not-hover:brightness-60"
            />
          </button>
        </TooltipDesc>
      </div>

      {open && (
        <div className="animate-[from-top_100ms] min-w-0 flex flex-col">
          {props.data.channel.map((v, i, a) => (
            <ChannelBtnList
              key={v.id}
              data={v}
              isDrag={props.isDrag}
              setIsDrag={props.setIsdrag}
              position={i + 1}
              setWhoDrag={props.setWhodrag}
              whoDrag={props.whoDrag}
              category={props.data.name}
              whoCategory={props.whoCategory}
              setWhoCategory={props.setWhoCategory}
              isLast={i === a.length - 1}
            />
          ))}
        </div>
      )}
    </>
  );
}
