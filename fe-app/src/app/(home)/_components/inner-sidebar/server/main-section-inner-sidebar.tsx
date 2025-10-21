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
import { SetStateAction, useEffect, useState } from "react";

import { serverAtom } from "@/app/(home)/_state/server-atom";
import { useParams } from "next/navigation";
import { useAtom } from "jotai";
import {
  CategoryChannel,
  ChannelList,
  channelListAtom,
} from "@/app/(home)/_state/channel-list-atom";

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
  // const [servers, setServers] = useAtom(serverAtom);
  // const { server } = useParams();
  // const currentServer = servers.find((v) => v.id == server);

  const [channel, setChannel] = useAtom(channelListAtom);

  const [loading, setLoading] = useState(true);

  const [isDrag, setIsdrag] = useState(false);
  const [whoDrag, setWhoDrag] = useState(0);
  const [whoCategory, setWhoCategory] = useState(0);

  useEffect(() => {
    // setServers((p) =>
    //   p.map((v) => (v.id === server ? { ...v, list: list } : v))
    // );

    setChannel({
      channel: list.channel,
      category: list.category,
    });

    setLoading(false);
  }, []);

  if (loading) return <></>;
  return (
    <RightClickMenuMainSection>
      <div className="custom-scrollbar font-semibold min-h-0 gap-0.5 min-w-0 flex flex-col overflow-y-scroll pt-3 pr-3 relative">
        {channel.channel
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
            />
          ))}

        {channel.category
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
        {/* {currentServer?.list.channel
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
            />
          ))}

        {currentServer?.list.category.map((v, i, a) => (
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
        ))} */}
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

  const [servers, setServers] = useAtom(serverAtom);
  const { server } = useParams();
  const currentServer = servers.find((v) => v.id == server);
  // const channelList = currentServer ? currentServer?.list.channel : [];
  // const categoryList = currentServer ? currentServer.list.category : [];

  const [channel, setChannel] = useAtom(channelListAtom);

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
            ref = {
              position: three
                ? props.category == 1
                  ? channel.channel.length + 1
                  : channel.category[props.category - 2].channel.length + 1
                : props.position,
              category: three ? props.category - 1 : props.category,
              fromPosition: props.whoDrag,
              fromCategory: props.whoCategory,
            };
          }
          console.log(ref);

          // antar category 0
          if (ref.category == 0 && ref.fromCategory == 0) {
            console.log("antar category 0");
            setChannel((p) => ({
              ...p,
              channel: p.channel.map((vv) => {
                //keatas
                if (ref.position < ref.fromPosition) {
                  //cek antara drag dan zone keatas
                  if (
                    vv.position >= ref.position &&
                    vv.position < ref.fromPosition
                  ) {
                    return { ...vv, position: vv.position + 1 };
                  } else if (vv.position === ref.fromPosition) {
                    return { ...vv, position: ref.position };
                  }
                }
                //kebawah
                if (ref.position > ref.fromPosition) {
                  //cek antara drag dan zone kebawah
                  if (
                    vv.position <= ref.position &&
                    vv.position > ref.fromPosition
                  ) {
                    return { ...vv, position: vv.position - 1 };
                  } else if (vv.position === ref.fromPosition) {
                    return { ...vv, position: ref.position };
                  }
                }

                return vv;
              }),
            }));
            // setServers(
            //   servers.map((v) =>
            //     v.id == server
            //       ? {
            //           ...v,
            //           list: {
            //             ...v.list,
            //             channel: v.list.channel.map((vv) => {
            //               //keatas
            //               if (ref.position < ref.fromPosition) {
            //                 //cek antara drag dan zone keatas
            //                 if (
            //                   vv.position >= ref.position &&
            //                   vv.position < ref.fromPosition
            //                 ) {
            //                   return { ...vv, position: vv.position + 1 };
            //                 } else if (vv.position === ref.fromPosition) {
            //                   return { ...vv, position: ref.position };
            //                 }
            //               }
            //               //kebawah
            //               if (ref.position > ref.fromPosition) {
            //                 //cek antara drag dan zone kebawah
            //                 if (
            //                   vv.position <= ref.position &&
            //                   vv.position > ref.fromPosition
            //                 ) {
            //                   return { ...vv, position: vv.position - 1 };
            //                 } else if (vv.position === ref.fromPosition) {
            //                   return { ...vv, position: ref.position };
            //                 }
            //               }

            //               return vv;
            //             }),
            //           },
            //         }
            //       : v
            //   )
            // );
          }

          // antar category bukan 0 yang sama
          if (ref.category == ref.fromCategory && ref.category > 0) {
            console.log(" antar category bukan 0 yang sama");

            setChannel((p) => ({
              ...p,
              category: p.category.map((vv) =>
                vv.position == ref.category
                  ? {
                      ...vv,
                      channel: vv.channel.map((vvv) => {
                        if (ref.position < ref.fromPosition) {
                          if (
                            vvv.position >= ref.position &&
                            vvv.position < ref.fromPosition
                          ) {
                            return {
                              ...vvv,
                              position: vvv.position + 1,
                            };
                          } else if (vvv.position == ref.fromPosition) {
                            return { ...vvv, position: ref.position };
                          }
                        }

                        if (ref.position > ref.fromPosition) {
                          if (
                            vvv.position <= ref.position &&
                            vvv.position > ref.fromPosition
                          ) {
                            return {
                              ...vvv,
                              position: vvv.position - 1,
                            };
                          } else if (vvv.position === ref.fromPosition) {
                            return { ...vvv, position: ref.position };
                          }
                        }
                        return vvv;
                      }),
                    }
                  : vv
              ),
            }));

            // setServers(
            //   servers.map((v) =>
            //     v.id == server
            //       ? {
            //           ...v,
            //           list: {
            //             ...v.list,
            //             category: v.list.category.map((vv) =>
            //               vv.position == ref.category
            //                 ? {
            //                     ...vv,
            //                     channel: vv.channel.map((vvv) => {
            //                       if (ref.position < ref.fromPosition) {
            //                         if (
            //                           vvv.position >= ref.position &&
            //                           vvv.position < ref.fromPosition
            //                         ) {
            //                           return {
            //                             ...vvv,
            //                             position: vvv.position + 1,
            //                           };
            //                         } else if (
            //                           vvv.position == ref.fromPosition
            //                         ) {
            //                           return { ...vvv, position: ref.position };
            //                         }
            //                       }

            //                       if (ref.position > ref.fromPosition) {
            //                         if (
            //                           vvv.position <= ref.position &&
            //                           vvv.position > ref.fromPosition
            //                         ) {
            //                           return {
            //                             ...vvv,
            //                             position: vvv.position - 1,
            //                           };
            //                         } else if (
            //                           vvv.position === ref.fromPosition
            //                         ) {
            //                           return { ...vvv, position: ref.position };
            //                         }
            //                       }
            //                       return vvv;
            //                     }),
            //                   }
            //                 : vv
            //             ),
            //           },
            //         }
            //       : v
            //   )
            // );
          }

          // antar category bukan 0 yang beda
          if (
            ref.category != ref.fromCategory &&
            ref.category > 0 &&
            ref.fromCategory > 0
          ) {
            console.log("antar category bukan 0 yang beda");
            setChannel((p) => {
              const fromCat = p.category.find(
                (c) => c.position === ref.fromCategory
              );
              const newData = fromCat?.channel.find(
                (f) => f.position === ref.fromPosition
              );

              if (!newData) return p;

              return {
                ...p,
                category: p.category.map((vv) => {
                  if (vv.position === ref.fromCategory) {
                    return {
                      ...vv,
                      channel: vv.channel
                        .filter((f) => f.position !== ref.fromPosition)
                        .sort((a, b) => a.position - b.position)
                        .map((ch, i) => ({
                          ...ch,
                          position: i + 1,
                        })),
                    };
                  }

                  if (vv.position === ref.category) {
                    if (ref.fromCategory > ref.category) {
                      return {
                        ...vv,
                        channel: [
                          ...vv.channel.map((vvv) => {
                            if (vvv.position >= ref.position) {
                              return {
                                ...vvv,
                                position: vvv.position + 1,
                              };
                            }

                            return vvv;
                          }),
                          {
                            ...newData,
                            position: ref.position,
                          },
                        ],
                      };
                    } else {
                      return {
                        ...vv,
                        channel: [
                          ...vv.channel.map((vvv) => {
                            if (vvv.position > ref.position) {
                              return {
                                ...vvv,
                                position: vvv.position + 1,
                              };
                            }

                            return vvv;
                          }),
                          {
                            ...newData,
                            position: ref.position + 1,
                          },
                        ],
                      };
                    }
                  }
                  return vv;
                }),
              };
            });

            // setServers((serv) =>
            //   serv.map((v) => {
            //     if (v.id !== server) return v;

            //     const fromCat = v.list.category.find(
            //       (c) => c.position === ref.fromCategory
            //     );
            //     const newData = fromCat?.channel.find(
            //       (f) => f.position === ref.fromPosition
            //     );

            //     if (!newData) return v;

            //     return {
            //       ...v,
            //       list: {
            //         ...v.list,
            //         category: v.list.category.map((vv) => {
            //           if (vv.position === ref.fromCategory) {
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

            //           if (vv.position === ref.category) {
            //             if (ref.fromCategory > ref.category) {
            //               return {
            //                 ...vv,
            //                 channel: [
            //                   ...vv.channel.map((vvv) => {
            //                     if (vvv.position >= ref.position) {
            //                       return {
            //                         ...vvv,
            //                         position: vvv.position + 1,
            //                       };
            //                     }

            //                     return vvv;
            //                   }),
            //                   {
            //                     ...newData,
            //                     position: ref.position,
            //                   },
            //                 ],
            //               };
            //             } else {
            //               return {
            //                 ...vv,
            //                 channel: [
            //                   ...vv.channel.map((vvv) => {
            //                     if (vvv.position > ref.position) {
            //                       return {
            //                         ...vvv,
            //                         position: vvv.position + 1,
            //                       };
            //                     }

            //                     return vvv;
            //                   }),
            //                   {
            //                     ...newData,
            //                     position: ref.position + 1,
            //                   },
            //                 ],
            //               };
            //             }
            //           }
            //           return vv;
            //         }),
            //       },
            //     };
            //   })
            // );
          }

          //antar category 0 dan 1
          if (
            ref.category != ref.fromCategory &&
            ((ref.category == 0 && ref.fromCategory != 0) ||
              (ref.category != 0 && ref.fromCategory == 0))
          ) {
            console.log("antar category 0 dan 1");

            setChannel((p) => {
              let newData: ChannelList | undefined;

              if (ref.fromCategory === 0) {
                newData = p.channel.find(
                  (f) => f.position === ref.fromPosition
                );
              } else {
                newData = p.category
                  .find((f) => f.position === ref.fromCategory)
                  ?.channel.find((f) => f.position === ref.fromPosition);
              }

              if (!newData) return p;

              return {
                ...p,
                channel:
                  ref.fromCategory === 0
                    ? p.channel
                        .filter((f) => f.position !== ref.fromPosition)
                        .sort((a, b) => a.position - b.position)
                        .map((ch, i) => ({
                          ...ch,
                          position: i + 1,
                        }))
                    : [
                        ...p.channel.map((vv) => {
                          if (vv.position >= ref.position) {
                            return {
                              ...vv,
                              position: vv.position + 1,
                            };
                          }
                          return vv;
                        }),
                        { ...newData, position: ref.position },
                      ],
                category: p.category.map((vv) => {
                  // tambah
                  if (ref.fromCategory === 0) {
                    if (ref.category === vv.position) {
                      return {
                        ...vv,
                        channel: [
                          ...vv.channel.map((vvv) => {
                            if (vvv.position > ref.position) {
                              return {
                                ...vvv,
                                position: vvv.position + 1,
                              };
                            }

                            return vvv;
                          }),
                          {
                            ...newData,
                            position: ref.position + 1,
                          },
                        ],
                      };
                    }
                  }
                  // hapus
                  if (ref.fromCategory !== 0) {
                    if (ref.fromCategory == vv.position) {
                      return {
                        ...vv,
                        channel: vv.channel
                          .filter((f) => f.position !== ref.fromPosition)
                          .sort((a, b) => a.position - b.position)
                          .map((ch, i) => ({
                            ...ch,
                            position: i + 1,
                          })),
                      };
                    }
                  }
                  return vv;
                }),
              };
            });

            // setServers((serv) =>
            //   serv.map((v) => {
            //     if (v.id !== server) return v;
            //     let newData: ChannelList | undefined;

            //     if (ref.fromCategory === 0) {
            //       newData = v.list.channel.find(
            //         (f) => f.position === ref.fromPosition
            //       );
            //     } else {
            //       newData = v.list.category
            //         .find((f) => f.position === ref.fromCategory)
            //         ?.channel.find((f) => f.position === ref.fromPosition);
            //     }

            //     if (!newData) return v;

            //     return {
            //       ...v,
            //       list: {
            //         ...v.list,
            //         channel:
            //           ref.fromCategory === 0
            //             ? v.list.channel
            //                 .filter((f) => f.position !== ref.fromPosition)
            //                 .sort((a, b) => a.position - b.position)
            //                 .map((ch, i) => ({
            //                   ...ch,
            //                   position: i + 1,
            //                 }))
            //             : [
            //                 ...v.list.channel.map((vv) => {
            //                   if (vv.position >= ref.position) {
            //                     return {
            //                       ...vv,
            //                       position: vv.position + 1,
            //                     };
            //                   }
            //                   return vv;
            //                 }),
            //                 { ...newData, position: ref.position },
            //               ],
            //         category: v.list.category.map((vv) => {
            //           // tambah
            //           if (ref.fromCategory === 0) {
            //             if (ref.category === vv.position) {
            //               return {
            //                 ...vv,
            //                 channel: [
            //                   ...vv.channel.map((vvv) => {
            //                     if (vvv.position > ref.position) {
            //                       return {
            //                         ...vvv,
            //                         position: vvv.position + 1,
            //                       };
            //                     }

            //                     return vvv;
            //                   }),
            //                   {
            //                     ...newData,
            //                     position: ref.position + 1,
            //                   },
            //                 ],
            //               };
            //             }
            //           }
            //           // hapus
            //           if (ref.fromCategory !== 0) {
            //             if (ref.fromCategory == vv.position) {
            //               return {
            //                 ...vv,
            //                 channel: vv.channel
            //                   .filter((f) => f.position !== ref.fromPosition)
            //                   .sort((a, b) => a.position - b.position)
            //                   .map((ch, i) => ({
            //                     ...ch,
            //                     position: i + 1,
            //                   })),
            //               };
            //             }
            //           }
            //           return vv;
            //         }),
            //       },
            //     };
            //   })
            // );
          }
          setEnter(false);
          props.setIsDrag(false);
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
            setIsDrag={props.setIsDrag}
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
          {props.data.name} + {props.data.position}
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
            setIsDrag={props.setIsdrag}
          />
        )}
      </div>

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
            />
          ))}
    </>
  );
}
