"use client";
import TooltipDesc from "@/app/(home)/_components/tooltip-desc";
import UserAvatar from "@/app/(home)/_components/user-avatar";
import { apiCall } from "@/app/(home)/_helper/api-client";
import { socketAtom } from "@/app/(home)/_state/socket-atom";
import { USER_STATUS, userAtom } from "@/app/(home)/_state/user-atom";
import { useAtom } from "jotai";
import {
  PhoneCallIcon,
  PinIcon,
  PlusCircleIcon,
  SearchIcon,
  UserCircleIcon,
  UserPlusIcon,
  VideoIcon,
  XIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";

export type OtherUser = {
  user_id: string;
  name: string;
  username: string;
  avatar: string;
  status_activity: keyof typeof USER_STATUS;
};

export type TextChat = {
  id: string;
  receiver_id: string;
  sender_id: string;
  text: string;
  created_at: string;
};

export default function Page() {
  const path = usePathname().split("/")[3];
  const [other, setOther] = useState<OtherUser>();
  const [search, setSearch] = useState("");
  const [socket, setSocket] = useAtom(socketAtom);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState<TextChat[]>([]);
  const [user, setUser] = useAtom(userAtom);

  useEffect(() => {
    if (socket) {
      if (!other) {
        fetch(`${process.env.NEXT_PUBLIC_HOST_API}user/${path}`)
          .then(async (resp) => {
            const res = await resp.json();
            if (resp.ok) {
              const result: OtherUser = res.data;
              setOther(res.data);

              apiCall(
                `${process.env.NEXT_PUBLIC_HOST_API}dm-text/list/${result.user_id}`,
              )
                .then(async (respp) => {
                  const ress = await respp.json();
                  if (respp.ok) {
                    setText(ress.data);
                  }
                  setLoading(false);
                })
                .catch(() => {});
            }
          })
          .catch(() => {});
      }

      if (other) {
        socket.onmessage = (e) => {
          const data = JSON.parse(e.data);
          if (data.dm) {
            if (data.dm.sender_id && other.user_id) {
              setText((v) => [...v, data.dm]);
              console.log("baru");
            }
          }
        };
      }
    }
    return () => {
      console.log("User leaving page");
    };
  }, [socket, other]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">loading</div>
    );
  } else if (other === undefined) {
    return (
      <div className="flex h-full items-center justify-center">
        user not found
      </div>
    );
  } else {
    return (
      // <div className="grid h-full min-h-0 grid-rows-[auto_1fr_auto]">
      <div className="flex h-full min-h-0 min-w-0 flex-col">
        <div className="border-discord-border-2 flex h-12 items-center gap-3 border-t border-b px-4 py-2">
          <div className="flex grow items-center gap-2">
            <UserAvatar
              StatusUser={other.status_activity}
              avatar={other.avatar}
              name={other.name}
              px={20}
              withIndicator
            />
            <h1 className="font-semibold">{other.name}</h1>
          </div>
          <div className="flex">
            <div className="mr-5 flex items-center gap-5 brightness-75">
              <TooltipDesc side="bottom" text="Start Voice Call">
                <PhoneCallIcon
                  size={20}
                  fill="white"
                  className="cursor-pointer"
                />
              </TooltipDesc>
              <TooltipDesc side="bottom" text="Start Video Call">
                <VideoIcon size={20} fill="white" className="cursor-pointer" />
              </TooltipDesc>
              <TooltipDesc side="bottom" text="Pinned Messages">
                <PinIcon size={20} fill="white" className="cursor-pointer" />
              </TooltipDesc>
              <TooltipDesc side="bottom" text="Add Friends to DM">
                <UserPlusIcon
                  size={20}
                  fill="white"
                  className="cursor-pointer"
                />
              </TooltipDesc>
              <TooltipDesc side="bottom" text="Show User Profile">
                <UserCircleIcon size={20} className="cursor-pointer" />
              </TooltipDesc>
            </div>
            <div className="bg-inpt-bg-1 border-inpt-border-1 flex items-center rounded-lg border p-1.5 text-sm">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="w-[200px] grow outline-none"
              />
              {search === "" ? (
                <SearchIcon size={16} className="brightness-75" />
              ) : (
                <XIcon
                  onClick={() => setSearch("")}
                  size={18}
                  className="cursor-pointer"
                />
              )}
            </div>
          </div>
        </div>

        {/* chat list */}
        <div className="flex min-h-0 min-w-0 grow flex-col overflow-y-scroll break-words whitespace-break-spaces">
          <div className="flex-1" />
          <div className="m-4">
            <UserAvatar
              StatusUser="Idle"
              whitout_status
              withIndicator={false}
              avatar={other.avatar}
              name={other.name}
              px={80}
            />
            <h1 className="my-2 text-4xl font-semibold">{other.name}</h1>
            <h2 className="text-2xl font-semibold">{other.username}</h2>
          </div>
          <div className="mb-2 min-w-0">
            {text?.map((v, i, a) => {
              const current = v.sender_id === other.user_id ? other : user;
              const before = i > 0 ? a[i - 1] : v;

              const current_date = new Date(v.created_at);
              const before_date = new Date(before.created_at);

              const month = current_date.toLocaleString("default", {
                month: "long",
              });

              const time = current_date.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              });

              const now = new Date();
              return (
                <Fragment key={v.id}>
                  {(i === 0 ||
                    current_date.getDate() != before_date.getDate()) && (
                    <div className="m-4 flex flex-row items-center">
                      <hr className="grow border border-[#29292d]" />
                      <span className="mx-2 text-[10px] font-semibold brightness-75">
                        {month} {current_date.getDate()},{" "}
                        {current_date.getFullYear()}
                      </span>
                      <hr className="grow border border-[#29292d]" />
                    </div>
                  )}
                  <div className="group flex items-start px-4 hover:bg-[#242428]">
                    {i === 0 ||
                    before.sender_id != v.sender_id ||
                    current_date.getDate() != before_date.getDate() ? (
                      <>
                        <UserAvatar
                          StatusUser={current.status_activity}
                          avatar={current.avatar}
                          name={current.name}
                          px={40}
                          whitout_status
                          withIndicator={false}
                        />

                        <div className="ml-3 flex min-w-0 flex-col">
                          <h1 className="font-semibold">
                            {current.name}{" "}
                            <span className="ml-1 text-xs font-normal brightness-50">
                              {now.getDate() === current_date.getDate() &&
                              now.getMonth() === current_date.getMonth()
                                ? time
                                : current_date.getMonth() +
                                  "/" +
                                  current_date.getDate() +
                                  "/" +
                                  current_date.toLocaleString("en-US", {
                                    year: "2-digit",
                                  }) +
                                  ", " +
                                  time}
                            </span>
                          </h1>
                          <h1 className="brightness-95">{v.text}</h1>
                        </div>
                      </>
                    ) : (
                      <div className="relative flex min-w-0 flex-col pl-[52px]">
                        <h1 className="">{v.text}</h1>
                        <span className="absolute left-0 mt-1 hidden items-center text-[10px] font-normal brightness-75 group-hover:flex">
                          {time}
                        </span>
                      </div>
                    )}
                  </div>
                </Fragment>
              );
            })}
          </div>
        </div>

        {/* input chat */}
        <InputChat
          data_user={other}
          text_url={`dm-text/send/${other.user_id}`}
        />
      </div>
    );
  }
}

function InputChat(props: { data_user: OtherUser; text_url: string }) {
  const [input, setInput] = useState("");
  const [row, setRow] = useState(1);
  const inputTagRef = useRef<HTMLTextAreaElement | null>(null);
  const [user, setUser] = useAtom(userAtom);

  useEffect(() => {
    let enter_detect = input.split("\n").length - 1;
    setRow(enter_detect < 20 ? enter_detect + 1 : 20);
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      setInput((v) => {
        const newValue = v.slice(0, start) + "\n" + v.slice(end);
        setTimeout(() => {
          textarea.selectionStart = start + 1;
          textarea.selectionEnd = start + 1;
        }, 0);

        return newValue;
      });

      if (inputTagRef.current) {
        inputTagRef.current.scrollTop = inputTagRef.current.scrollHeight;
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() != "") {
        console.log(input);
        apiCall(`${process.env.NEXT_PUBLIC_HOST_API}${props.text_url}`, {
          method: "POST",
          body: JSON.stringify({
            text: input.trim(),
          }),
        })
          .then(async (resp) => {
            if (resp.ok) {
              setInput("");
            }
          })
          .catch(() => {});
      }
    }
  };
  return (
    <div className="bg-layout-bg mx-2 flex pb-6">
      <div className="flex grow rounded-lg border border-[#27282c] bg-[#222327] focus-within:border-[#303136]">
        <div className="group cursor-not-allowed p-4">
          <PlusCircleIcon
            size={20}
            className="brightness-75 group-hover:brightness-100"
          />
        </div>
        <textarea
          ref={inputTagRef}
          onKeyDown={handleKeyDown}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message @${props.data_user.name}`}
          className="group grow resize-none py-3.5 outline-none"
          rows={row}
        />
      </div>
    </div>
  );
}
