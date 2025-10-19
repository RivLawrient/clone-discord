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

interface Listes {
  channel: ChannelList[];
  category: CategoryChannel[];
}

export default function MainSectionInnerSidebar() {
  const [servers, setServers] = useAtom(serverAtom);
  const { server } = useParams();
  const [loaded, setLoaded] = useState(false);
  const [currentServer, setCurrentServer] = useState<ServerList | undefined>();
  const [isDrag, setIsdrag] = useState(false);
  const [whoDrag, setWhoDrag] = useState(0);
  const [whoCategory, setWhoCategory] = useState(0);

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
      <div className="custom-scrollbar font-semibold min-h-0 gap-0.5 min-w-0 flex flex-col overflow-y-scroll pt-3 pr-3 relative">
        {currentServer.list.channel.map((v, i, a) => (
          <ChannelBtnList
            key={v.id}
            data={v}
            position={i + 1}
            isDrag={isDrag}
            setIsDrag={setIsdrag}
            whoDrag={whoDrag}
            setWhoDrag={setWhoDrag}
            category={0}
            whoCategory={whoCategory}
            setWhoCategory={setWhoCategory}
            channelList={currentServer.list.channel}
            categoryList={currentServer.list.category}
          />
        ))}

        {currentServer.list.category.map((v, i, a) => (
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
            channelList={currentServer.list.channel}
            categoryList={currentServer.list.category}
          />
        ))}
      </div>
    </RightClickMenuMainSection>
  );
}

function DragZone(props: {
  position: number;
  category: number;
  whoDrag: number;
  isDrag: boolean;
  whoCategory: number;
  channelList: ChannelList[];
  categoryList: CategoryChannel[];
}) {
  const [enter, setEnter] = useState(false);

  //kalau zone dibawah drag kebawah
  const one =
    props.position > props.whoDrag && props.category == props.whoCategory;
  const two = props.category > props.whoCategory;

  const three = props.position == 0 && props.category != 0;

  const [servers, setServers] = useAtom(serverAtom);
  const { server } = useParams();
  const currentServer = servers.find((v) => v.id == server);

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
          setEnter(false);
          let ref = {
            position: 0,
            category: 0,
          };
          if (one || two) {
            ref = {
              position: props.position + 1,
              category: props.category,
            };
            const hasil = {
              position: props.position + 1,
              category: props.category,
            };
          } else {
            ref = {
              position: three
                ? props.category == 1
                  ? props.channelList.length + 1
                  : props.categoryList[props.category - 1].channel.length + 1
                : props.position,
              category: three ? props.category - 1 : props.category,
            };
            const hasil = {
              position: three
                ? props.category == 1
                  ? props.channelList.length + 1
                  : props.categoryList[props.category - 1].channel.length + 1
                : props.position,
              category: three ? props.category - 1 : props.category,
            };
          }
          console.log("zone", ref);
        }}
        className={cn(
          "h-full absolute  w-full bg-red-500/20 ",
          props.isDrag && "z-10"
        )}
      />

      <div
        className={cn(
          "w-full min-h-1.5 absolute rounded-lg ",
          enter && "bg-green-500/50",
          one || two ? "-bottom-1" : "-top-1"
        )}
      />
    </>
  );
}

// perlu right klik
function ChannelBtnList(props: {
  data: ChannelList;
  position: number;
  isDrag: boolean;
  setIsDrag: React.Dispatch<SetStateAction<boolean>>;
  whoDrag: number;
  setWhoDrag: React.Dispatch<SetStateAction<number>>;
  category: number;
  whoCategory: number;
  setWhoCategory: React.Dispatch<SetStateAction<number>>;
  channelList: ChannelList[];
  categoryList: CategoryChannel[];
}) {
  const Icons = props.data.type === "text" ? HashIcon : Volume2Icon;
  return (
    <div className="relative flex flex-col ml-2">
      {/* perbaiki jika beda category */}
      {props.isDrag &&
        (props.position != props.whoDrag ||
          props.category != props.whoCategory) && (
          <DragZone
            category={props.category}
            position={props.position}
            isDrag={props.isDrag}
            whoDrag={props.whoDrag}
            whoCategory={props.whoCategory}
            channelList={props.channelList}
            categoryList={props.categoryList}
          />
        )}
      <button
        draggable
        onDragStart={(e) => {
          props.setIsDrag(true);
          props.setWhoDrag(props.position);
          props.setWhoCategory(props.category);
          console.log("drag", {
            position: props.position,
            category: props.category,
          });
          e.dataTransfer.effectAllowed = "move";
        }}
        onDragEnd={() => {
          props.setIsDrag(false);
        }}
        onClick={() => console.log("channel")}
        className={cn(
          "hover:bg-[#1c1c1f] cursor-pointer hover:text-white group outline-none gap-2 min-w-0 items-center transition-all rounded-lg flex flex-row py-1 px-2 w-full"
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
  whoCategory: number;
  setWhoCategory: React.Dispatch<SetStateAction<number>>;
  channelList: ChannelList[];
  categoryList: CategoryChannel[];
}) {
  const [open, setOpen] = useState(true);

  return (
    <>
      <div
        draggable
        className="relative group ml-2 transition-all flex flex-row gap-1 items-center pr-2  z-10"
      >
        <button
          onClick={() => setOpen(!open)}
          className="flex flex-row items-center pl-2 mt-4 grow gap-1 group-hover:brightness-100 brightness-60 cursor-pointer min-w-0 transition-all"
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
          <button className="outline-none cursor-pointer mt-4">
            <PlusIcon
              size={20}
              strokeWidth={3}
              className="not-hover:brightness-60"
            />
          </button>
        </TooltipDesc>
        {props.isDrag && (
          <DragZone
            category={props.data.position}
            isDrag={props.isDrag}
            position={0}
            whoCategory={props.whoCategory}
            whoDrag={props.whoDrag}
            channelList={props.channelList}
            categoryList={props.categoryList}
          />
        )}
      </div>

      {open &&
        props.data.channel.map((v, i, a) => (
          <ChannelBtnList
            key={v.id}
            data={v}
            isDrag={props.isDrag}
            setIsDrag={props.setIsdrag}
            position={i + 1}
            setWhoDrag={props.setWhodrag}
            whoDrag={props.whoDrag}
            category={props.data.position}
            whoCategory={props.whoCategory}
            setWhoCategory={props.setWhoCategory}
            channelList={props.channelList}
            categoryList={props.categoryList}
          />
        ))}
    </>
  );
}
