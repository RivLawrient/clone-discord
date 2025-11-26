"use client";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  HashIcon,
  PlusIcon,
  SettingsIcon,
  Volume2Icon,
} from "lucide-react";
import {
  RightClickMenuCategorySection,
  RightClickMenuChannel,
  RightClickMenuMainSection,
} from "./right-click-menu";
import { cn } from "@/app/(home)/_helper/cn";
import TooltipDesc from "../../tooltip-desc";
import { SetStateAction, useEffect, useState } from "react";
import { useAtom } from "jotai";
import {
  CategoryChannel,
  ChannelList,
  channelListAtom,
} from "@/app/(home)/_state/channel-list-atom";
import { useParams, useRouter } from "next/navigation";
import { ModalCreateChannel } from "./modal-create-channel";
import { useRightClickMenuMainSection } from "./useRightClickMenu";
import { apiCall } from "@/app/(home)/_helper/api-client";
import { serverAtom } from "@/app/(home)/_state/server-atom";
import ModalRenameChannel from "./modal-rename-channel";

export default function MainSectionInnerSidebar() {
  const [channels, setChannels] = useAtom(channelListAtom);
  const [isDrag, setIsdrag] = useState(false);
  const [whoDrag, setWhoDrag] = useState(0);
  const [whoCategory, setWhoCategory] = useState(0);
  const { channel } = useParams();
  const { server } = useParams();
  const current = channels.find((v) => v.server_id == server);

  return (
    <RightClickMenuMainSection>
      <div className="custom-scrollbar font-semibold min-h-0 gap-0.5 min-w-0 flex flex-col overflow-y-scroll pt-3 pr-3 relative">
        <>
          {current?.channel
            .sort((a, b) => a.position - b.position)
            .map((v, i, a) => (
              <ChannelBtnList
                key={v.id}
                data={v}
                position={v.position}
                isDrag={isDrag}
                setIsDrag={setIsdrag}
                whoDrag={whoDrag}
                setWhoDrag={setWhoDrag}
                category={0}
                whoCategory={whoCategory}
                setWhoCategory={setWhoCategory}
                isSelect={channel == v.id}
              />
            ))}

          {current?.category
            .sort((a, b) => a.position - b.position)
            .map((v, i, a) => (
              <CategoryBtnSection
                key={v.id}
                data={v}
                isDrag={isDrag}
                whoDrag={whoDrag}
                position={v.position}
                setWhodrag={setWhoDrag}
                setIsdrag={setIsdrag}
                whoCategory={whoCategory}
                setWhoCategory={setWhoCategory}
              />
            ))}
        </>
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
  setIsDrag: React.Dispatch<SetStateAction<boolean>>;
}) {
  const [enter, setEnter] = useState(false);

  //kalau zone dibawah drag kebawah
  const one =
    props.position > props.whoDrag && props.category == props.whoCategory;
  const two = props.category > props.whoCategory;
  const three = props.position == 0 && props.category != 0;

  const [channel, setChannel] = useAtom(channelListAtom);
  const { server } = useParams();
  const current = channel.find((v) => v.server_id == server);
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

          let ref = {
            position: 0,
            category: 0,
            fromPosition: props.whoDrag,
            fromCategory: props.whoCategory,
          };
          if (one || two) {
            ref = {
              position: props.position,
              category: props.category,
              fromPosition: props.whoDrag,
              fromCategory: props.whoCategory,
            };
          } else {
            if (current) {
              ref = {
                position: three
                  ? props.category == 1
                    ? current.channel.length + 1
                    : current.category[props.category - 2].channel.length + 1
                  : props.position,
                category: three ? props.category - 1 : props.category,
                fromPosition: props.whoDrag,
                fromCategory: props.whoCategory,
              };
            }
          }
          // console.log(ref);

          // antar category 0
          // if (ref.category == 0 && ref.fromCategory == 0) {
          //   console.log("antar category 0");
          //   setChannel((p) => ({
          //     ...p,
          //     channel: p.channel.map((vv) => {
          //       //keatas
          //       if (ref.position < ref.fromPosition) {
          //         //cek antara drag dan zone keatas
          //         if (
          //           vv.position >= ref.position &&
          //           vv.position < ref.fromPosition
          //         ) {
          //           return { ...vv, position: vv.position + 1 };
          //         } else if (vv.position === ref.fromPosition) {
          //           return { ...vv, position: ref.position };
          //         }
          //       }
          //       //kebawah
          //       if (ref.position > ref.fromPosition) {
          //         //cek antara drag dan zone kebawah
          //         if (
          //           vv.position <= ref.position &&
          //           vv.position > ref.fromPosition
          //         ) {
          //           return { ...vv, position: vv.position - 1 };
          //         } else if (vv.position === ref.fromPosition) {
          //           return { ...vv, position: ref.position };
          //         }
          //       }

          //       return vv;
          //     }),
          //   }));
          // }

          // // antar category bukan 0 yang sama
          // if (ref.category == ref.fromCategory && ref.category > 0) {
          //   console.log(" antar category bukan 0 yang sama");

          //   setChannel((p) => ({
          //     ...p,
          //     category: p.category.map((vv) =>
          //       vv.position == ref.category
          //         ? {
          //             ...vv,
          //             channel: vv.channel.map((vvv) => {
          //               if (ref.position < ref.fromPosition) {
          //                 if (
          //                   vvv.position >= ref.position &&
          //                   vvv.position < ref.fromPosition
          //                 ) {
          //                   return {
          //                     ...vvv,
          //                     position: vvv.position + 1,
          //                   };
          //                 } else if (vvv.position == ref.fromPosition) {
          //                   return { ...vvv, position: ref.position };
          //                 }
          //               }

          //               if (ref.position > ref.fromPosition) {
          //                 if (
          //                   vvv.position <= ref.position &&
          //                   vvv.position > ref.fromPosition
          //                 ) {
          //                   return {
          //                     ...vvv,
          //                     position: vvv.position - 1,
          //                   };
          //                 } else if (vvv.position === ref.fromPosition) {
          //                   return { ...vvv, position: ref.position };
          //                 }
          //               }
          //               return vvv;
          //             }),
          //           }
          //         : vv
          //     ),
          //   }));
          // }

          // // antar category bukan 0 yang beda
          // if (
          //   ref.category != ref.fromCategory &&
          //   ref.category > 0 &&
          //   ref.fromCategory > 0
          // ) {
          //   console.log("antar category bukan 0 yang beda");
          //   setChannel((p) => {
          //     const fromCat = p.category.find(
          //       (c) => c.position === ref.fromCategory
          //     );
          //     const newData = fromCat?.channel.find(
          //       (f) => f.position === ref.fromPosition
          //     );

          //     if (!newData) return p;

          //     return {
          //       ...p,
          //       category: p.category.map((vv) => {
          //         if (vv.position === ref.fromCategory) {
          //           return {
          //             ...vv,
          //             channel: vv.channel
          //               .filter((f) => f.position !== ref.fromPosition)
          //               .sort((a, b) => a.position - b.position)
          //               .map((ch, i) => ({
          //                 ...ch,
          //                 position: i + 1,
          //               })),
          //           };
          //         }

          //         if (vv.position === ref.category) {
          //           if (ref.fromCategory > ref.category) {
          //             return {
          //               ...vv,
          //               channel: [
          //                 ...vv.channel.map((vvv) => {
          //                   if (vvv.position >= ref.position) {
          //                     return {
          //                       ...vvv,
          //                       position: vvv.position + 1,
          //                     };
          //                   }

          //                   return vvv;
          //                 }),
          //                 {
          //                   ...newData,
          //                   position: ref.position,
          //                 },
          //               ],
          //             };
          //           } else {
          //             return {
          //               ...vv,
          //               channel: [
          //                 ...vv.channel.map((vvv) => {
          //                   if (vvv.position > ref.position) {
          //                     return {
          //                       ...vvv,
          //                       position: vvv.position + 1,
          //                     };
          //                   }

          //                   return vvv;
          //                 }),
          //                 {
          //                   ...newData,
          //                   position: ref.position + 1,
          //                 },
          //               ],
          //             };
          //           }
          //         }
          //         return vv;
          //       }),
          //     };
          //   });
          // }

          // //antar category 0 dan 1
          // if (
          //   ref.category != ref.fromCategory &&
          //   ((ref.category == 0 && ref.fromCategory != 0) ||
          //     (ref.category != 0 && ref.fromCategory == 0))
          // ) {
          //   console.log("antar category 0 dan 1");

          //   setChannel((p) => {
          //     let newData: ChannelList | undefined;

          //     if (ref.fromCategory === 0) {
          //       newData = p.channel.find(
          //         (f) => f.position === ref.fromPosition
          //       );
          //     } else {
          //       newData = p.category
          //         .find((f) => f.position === ref.fromCategory)
          //         ?.channel.find((f) => f.position === ref.fromPosition);
          //     }

          //     if (!newData) return p;

          //     return {
          //       ...p,
          //       channel:
          //         ref.fromCategory === 0
          //           ? p.channel
          //               .filter((f) => f.position !== ref.fromPosition)
          //               .sort((a, b) => a.position - b.position)
          //               .map((ch, i) => ({
          //                 ...ch,
          //                 position: i + 1,
          //               }))
          //           : [
          //               ...p.channel.map((vv) => {
          //                 if (vv.position >= ref.position) {
          //                   return {
          //                     ...vv,
          //                     position: vv.position + 1,
          //                   };
          //                 }
          //                 return vv;
          //               }),
          //               { ...newData, position: ref.position },
          //             ],
          //       category: p.category.map((vv) => {
          //         // tambah
          //         if (ref.fromCategory === 0) {
          //           if (ref.category === vv.position) {
          //             return {
          //               ...vv,
          //               channel: [
          //                 ...vv.channel.map((vvv) => {
          //                   if (vvv.position > ref.position) {
          //                     return {
          //                       ...vvv,
          //                       position: vvv.position + 1,
          //                     };
          //                   }

          //                   return vvv;
          //                 }),
          //                 {
          //                   ...newData,
          //                   position: ref.position + 1,
          //                 },
          //               ],
          //             };
          //           }
          //         }
          //         // hapus
          //         if (ref.fromCategory !== 0) {
          //           if (ref.fromCategory == vv.position) {
          //             return {
          //               ...vv,
          //               channel: vv.channel
          //                 .filter((f) => f.position !== ref.fromPosition)
          //                 .sort((a, b) => a.position - b.position)
          //                 .map((ch, i) => ({
          //                   ...ch,
          //                   position: i + 1,
          //                 })),
          //             };
          //           }
          //         }
          //         return vv;
          //       }),
          //     };
          //   });
          // }

          apiCall(
            `${process.env.NEXT_PUBLIC_HOST_API}server/channels/reorder/` +
              server,
            {
              method: "POST",
              body: JSON.stringify({
                from_category: ref.fromCategory, // number
                from_position: ref.fromPosition, // number (1-based)
                to_category: ref.category, // number
                to_position: ref.position,
              }),
            }
          )
            .then(async (resp) => {
              const res = await resp.json();
              if (resp.ok) {
                // setChannel(res.data);
              } else {
                setTimeout(() => {
                  setChannel(channel);
                }, 1000);
              }
            })
            .catch(() => {
              setTimeout(() => {
                setChannel(channel);
              }, 1000);
            });
          setEnter(false);
          props.setIsDrag(false);
        }}
        className={cn("h-full absolute  w-full ", props.isDrag && "z-10")}
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
  dataCategory?: CategoryChannel;
  isSelect?: boolean;
}) {
  const Icons = !props.data.is_voice ? HashIcon : Volume2Icon;
  const [servers] = useAtom(serverAtom);
  const { server } = useParams();
  const currentServer = servers?.find((v) => v.id === server);
  const route = useRouter();
  const [openEdit, setOpenEdit] = useState(false);

  return (
    <RightClickMenuChannel
      data={props.data}
      dataCategory={props.dataCategory}
    >
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
              setIsDrag={props.setIsDrag}
            />
          )}
        <button
          draggable={currentServer?.is_owner}
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
          onClick={() => {
            route.replace(`/channels/${server}/${props.data.id}`);
          }}
          className={cn(
            " cursor-pointer  group outline-none gap-2 min-w-0 items-center transition-all rounded-lg flex flex-row py-1 px-2 w-full",
            props.isSelect
              ? "bg-[#2d2d30] text-white"
              : "hover:bg-[#1c1c1f] hover:text-white"
          )}
        >
          <div>
            <Icons
              size={20}
              className={cn(!props.isSelect && "brightness-60")}
            />
          </div>
          <span
            className={cn(
              "grow text-start min-w-0 truncate ",
              props.isSelect ? "" : "group-hover:brightness-100 brightness-60"
            )}
          >
            {props.data.name}
          </span>

          {currentServer?.is_owner && (
            <>
              <ModalRenameChannel
                open={openEdit}
                setOpen={setOpenEdit}
                data={props.data}
              />
              <TooltipDesc
                side="top"
                text="Edit Channel"
              >
                <div
                  onClick={() => setOpenEdit(true)}
                  className={cn(
                    " ",
                    props.isSelect ? "" : "group-hover:visible invisible"
                  )}
                >
                  <SettingsIcon
                    size={20}
                    className={cn(!props.isSelect && "not-hover:brightness-60")}
                  />
                </div>
              </TooltipDesc>
            </>
          )}
        </button>
      </div>
    </RightClickMenuChannel>
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
}) {
  const [open, setOpen] = useState(true);
  const { channel } = useParams();

  //perlu diubah
  const {
    openChannel,
    setOpenChannel,
    loading,
    radioIsVoice,
    changeRadioTextHandle,
    changeRadioVoiceHandle,
    inputChannel,
    setInputChannel,
    createChannelHandle,
    createChannelinCategoryHandle,
    currentServer,
  } = useRightClickMenuMainSection();

  return (
    <>
      <ModalCreateChannel
        open={openChannel}
        setOpen={setOpenChannel}
        onCategory
        isVoice={radioIsVoice}
        changeRadioTextHandle={changeRadioTextHandle}
        changeRadioVoiceHandle={changeRadioVoiceHandle}
        input={inputChannel}
        setInput={setInputChannel}
        loading={loading}
        handle={createChannelHandle}
        handle2={createChannelinCategoryHandle}
        categoryData={props.data}
      />
      <RightClickMenuCategorySection data={props.data}>
        <div
          draggable
          className="relative group ml-2 transition-all flex flex-row gap-1 items-center pr-2  z-10"
        >
          <button
            onClick={() => setOpen(!open)}
            className="flex flex-row items-center pl-2 mt-4 grow gap-1 group-hover:brightness-100 brightness-60 cursor-pointer min-w-0 transition-all outline-none"
          >
            <span className="truncate min-w-0 text-sm">{props.data.name}</span>
            <div>
              <ChevronRightIcon
                size={16}
                className={cn("transition-all", open && "rotate-90")}
              />
            </div>
          </button>

          {currentServer?.is_owner && (
            <TooltipDesc
              side="top"
              text="Create Channel"
            >
              <button
                onClick={() => setOpenChannel(true)}
                className="outline-none cursor-pointer mt-4"
              >
                <PlusIcon
                  size={20}
                  strokeWidth={3}
                  className="not-hover:brightness-60"
                />
              </button>
            </TooltipDesc>
          )}
          {props.isDrag && (
            <DragZone
              category={props.data.position}
              isDrag={props.isDrag}
              position={0}
              whoCategory={props.whoCategory}
              whoDrag={props.whoDrag}
              setIsDrag={props.setIsdrag}
            />
          )}
        </div>
      </RightClickMenuCategorySection>

      {open &&
        props.data.channel
          .sort((a, b) => a.position - b.position)
          .map((v, i, a) => (
            <ChannelBtnList
              key={v.id}
              data={v}
              isDrag={props.isDrag}
              setIsDrag={props.setIsdrag}
              position={v.position}
              setWhoDrag={props.setWhodrag}
              whoDrag={props.whoDrag}
              category={props.data.position}
              whoCategory={props.whoCategory}
              setWhoCategory={props.setWhoCategory}
              dataCategory={props.data}
              isSelect={channel == v.id}
            />
          ))}
    </>
  );
}
