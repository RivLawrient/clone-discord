import {
  Dispatch,
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "../../_helper/cn";
import UserAvatar from "../user-avatar";
import { ChatList } from "./text-channel-view";
import useChatListSection from "./useChatListSection";
import { PencilIcon, Trash2Icon } from "lucide-react";
import TooltipDesc from "../tooltip-desc";
import { SetStateAction, useAtom } from "jotai";
import { apiCall } from "../../_helper/api-client";
import { userAtom } from "../../_state/user-atom";
import ModalDeleteChat from "./modal-delete-chat";

export default function hatListSection(props: {
  data: ChatList[];
  isLast: boolean;
  loading: boolean;
  onLoadMore: () => void; // Function untuk fetch API
}) {
  const {
    current,
    displayTime,
    gapTime,
    showGap,
    showIt,
    time,
    bottomRef,
    lastMargin,
  } = useChatListSection(props.data, props.loading);

  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!topRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];

      // INILAH CEKNYA
      if (entry.isIntersecting) {
        console.log("User lagi melihat div topRef");
        setTimeout(() => {
          loadMore();
        }, 1000);
      } else {
        console.log("User tidak melihat div topRef");
      }
    });

    observer.observe(topRef.current);

    return () => observer.disconnect();
  }, [props.loading, props.isLast, props.data]);

  const scrollRef = useRef<HTMLUListElement>(null);
  const prevHeightRef = useRef(0);
  const prevScrollRef = useRef(0);
  const loadingMoreRef = useRef(false);

  const loadMore = () => {
    const box = scrollRef.current;
    if (!box) return;

    loadingMoreRef.current = true;

    prevHeightRef.current = box.scrollHeight;
    prevScrollRef.current = box.scrollTop;

    props.onLoadMore();
  };

  useEffect(() => {
    if (!scrollRef.current) return;

    const box = scrollRef.current;

    if (loadingMoreRef.current) {
      const newHeight = box.scrollHeight;

      box.scrollTop = newHeight - prevHeightRef.current + prevScrollRef.current;

      loadingMoreRef.current = false;
    }
  }, [props.data]);

  const [edit, setEdit] = useState(false);
  const [editChat, setEditChat] = useState<ChatList>();
  const [input, setInput] = useState("");
  const [row, setRow] = useState(1);
  const inputTagRef = useRef<HTMLTextAreaElement | null>(null);

  const editHandle = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const hitNewChat = () => {
    if (editChat) {
      apiCall(
        `${process.env.NEXT_PUBLIC_HOST_API}message/chat/${editChat.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            text: input,
          }),
        }
      )
        .catch(() => {})
        .finally(() => {
          setEdit(false);
          // setLoading(false);
        });
    }
  };

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
    if (e.key === "Escape") {
      e.preventDefault();
      setEdit(false);
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() != "") {
        hitNewChat();
      }
    }
  };
  useEffect(() => {
    const textarea = inputTagRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // reset dulu
      const scrollHeight = textarea.scrollHeight;
      const lineHeight = 24; // tinggi 1 baris (px), sesuaikan sama CSS
      const maxHeight = lineHeight * 20; // maksimal 20 baris
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [input]);

  useEffect(() => {
    setTimeout(() => {
      if (editChat) {
        setInput(editChat.text);
      }
    }, 1);
    if (edit && inputTagRef.current) {
      const el = inputTagRef.current;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  }, [edit, inputTagRef]);

  const [user, setUser] = useAtom(userAtom);
  const [openDelete, setOpenDelete] = useState(false);

  return (
    <>
      {editChat && (
        <ModalDeleteChat
          open={openDelete}
          setOpen={setOpenDelete}
          data={editChat}
        />
      )}
      <ul
        ref={scrollRef}
        className=" grow min-h-0 overflow-scroll  min-w-0 flex flex-col custom-scrollbar "
      >
        {props.isLast ? (
          <div className="grow items-center justify-end flex flex-col font-semibold mt-2 mb-4">
            <h1 className="text-[32px] leading-none">Welcome to</h1>
            <h1 className="text-[32px]">{current?.name}</h1>
            <span>This is the beginning of this server.</span>
          </div>
        ) : (
          <DiscordChatSkeleton />
        )}
        {!props.loading && !props.isLast && (
          <div
            ref={topRef}
            className="w-full p-2 invisible bg-red-500"
          ></div>
        )}
        {[...props.data].reverse().map((v, i, a) => (
          <Fragment key={i}>
            {showGap(v, a, i) && (
              <div className="flex flex-row items-center my-2 mx-4 gap-2">
                <hr className="grow border-[#323237]" />
                <span className="text-xs font-semibold text-[#94959c]">
                  {gapTime(v)}
                </span>
                <hr className="grow border-[#323237]" />
              </div>
            )}
            <li
              key={v.id}
              className={cn(
                "mr-4  whitespace-pre-line hover:bg-[#242428]  rounded-r-lg flex flex-row pl-3 group peer relative",
                lastMargin(v, a, i) && "mb-5",
                edit && editChat == v && "bg-[#242428]"
              )}
            >
              {!edit && v.user.username == user.username && (
                <EditChatBar
                  edit={edit}
                  setEdit={setEdit}
                  editState={v}
                  setEditState={setEditChat}
                  setOpenDelete={setOpenDelete}
                />
              )}
              {showIt(v, a, i) ? (
                <div className="mt-1 absolute">
                  <UserAvatar
                    avatar={v.user.avatar}
                    avatarBg={v.user.avatar_bg}
                    name={v.user.name}
                    px={40}
                    StatusUser={v.user.status_activity}
                  />
                </div>
              ) : (
                <div className="mt-1 absolute group-hover:visible invisible text-[10px] text-[#82838a] font-semibold">
                  {time(v.created_at)}
                </div>
              )}

              <div className="flex flex-col grow pl-13">
                {showIt(v, a, i) && (
                  <div className="flex flex-row items-end gap-2">
                    <h1 className="font-semibold hover:underline">
                      {v.user.name}
                    </h1>
                    <span className="text-xs text-[#82838a] font-semibold leading-5 ">
                      {displayTime(v.created_at)}
                    </span>
                  </div>
                )}

                {edit && editChat == v ? (
                  <>
                    <div className="bg-[#222327] border focus-within:border-[#323237] border-[#27282c] mt-2 mr-2 px-3 flex flex-row rounded-lg mb-1 py-4 min-w-0">
                      <textarea
                        ref={inputTagRef}
                        value={input}
                        rows={Math.max(1, v.text.split("\n").length)}
                        className="w-full   grow outline-none break-all resize-none"
                        onChange={editHandle}
                        onKeyDown={handleKeyDown}
                      />
                    </div>
                    <h1 className="font-semibold text-xs mx-1 mb-1">
                      escape to{" "}
                      <span
                        onClick={() => setEdit(false)}
                        className="cursor-pointer text-blue-500 hover:underline"
                      >
                        cancel
                      </span>
                      . enter to{" "}
                      <span
                        onClick={hitNewChat}
                        className="cursor-pointer text-blue-500 hover:underline"
                      >
                        save
                      </span>
                    </h1>
                  </>
                ) : (
                  <div className="break-all">{v.text}</div>
                )}
              </div>
            </li>
          </Fragment>
        ))}
        <div ref={bottomRef} />
      </ul>
    </>
  );
}

function EditChatBar(props: {
  edit: boolean;
  setEdit: React.Dispatch<SetStateAction<boolean>>;
  editState: ChatList;
  setEditState: React.Dispatch<SetStateAction<ChatList | undefined>>;
  setOpenDelete: Dispatch<SetStateAction<boolean>>;
}) {
  const editHandle = () => {
    props.setEditState(props.editState);
    props.setEdit(true);
  };

  const openHandle = () => {
    props.setEditState(props.editState);
    props.setOpenDelete(true);
  };
  return (
    <div className="absolute z-10 invisible  group-hover:visible peer-hover:visible right-0 mx-5 -top-6 bg-[#242429] border-[#323237] flex rounded-lg p-1 border gap-1 shadow-2xl">
      <TooltipDesc
        side="top"
        text="Edit"
      >
        <button
          onClick={editHandle}
          className="rounded-md hover:bg-white/5  not-hover:brightness-75 cursor-pointer p-1"
        >
          <div>
            <PencilIcon size={18} />
          </div>
        </button>
      </TooltipDesc>
      <TooltipDesc
        side="top"
        text="Delete Message"
      >
        <button
          onClick={openHandle}
          className="rounded-md hover:bg-white/5  not-hover:brightness-75 cursor-pointer p-1 text-red-500"
        >
          <div>
            <Trash2Icon size={18} />
          </div>
        </button>
      </TooltipDesc>
    </div>
  );
}

const DiscordChatSkeleton = () => {
  // Kita definisikan pola "palsu" agar terlihat acak tapi tetap terkontrol
  // type: 'short' (chat pendek), 'long' (chat panjang/paragraf), 'media' (gambar)
  const skeletonRows = [
    { type: "short", width: "w-1/3" },
    { type: "long", width: "w-3/4" }, // Simulasi chat panjang
    { type: "media", width: "w-1/2" }, // Simulasi kirim gambar
    { type: "short", width: "w-1/4" },
    { type: "long", width: "w-5/6" },
    { type: "short", width: "w-1/3" },
    { type: "long", width: "w-3/4" }, // Simulasi chat panjang
    { type: "media", width: "w-1/2" }, // Simulasi kirim gambar
    { type: "short", width: "w-1/4" },
    { type: "long", width: "w-5/6" },
    { type: "short", width: "w-1/3" },
    { type: "long", width: "w-3/4" }, // Simulasi chat panjang
    { type: "media", width: "w-1/2" }, // Simulasi kirim gambar
    { type: "short", width: "w-1/4" },
    { type: "long", width: "w-5/6" },
    { type: "short", width: "w-1/3" },
    { type: "long", width: "w-3/4" }, // Simulasi chat panjang
    { type: "media", width: "w-1/2" }, // Simulasi kirim gambar
    { type: "short", width: "w-1/4" },
    { type: "long", width: "w-5/6" },
    { type: "short", width: "w-1/3" },
    { type: "long", width: "w-3/4" }, // Simulasi chat panjang
    { type: "media", width: "w-1/2" }, // Simulasi kirim gambar
    { type: "short", width: "w-1/4" },
    { type: "long", width: "w-5/6" },
  ];

  return (
    <ul className="flex flex-col gap-6 mx-3 py-4 max-w-full">
      {skeletonRows.map((row, index) => (
        <li
          key={index}
          className="flex flex-row gap-4 animate-pulse group"
        >
          {/* Avatar Section */}
          <div className="shrink-0 mt-0.5">
            <div className="size-10 bg-[#2b2b2f] rounded-full" />
          </div>

          {/* Content Section */}
          <div className="flex flex-col w-full gap-1">
            {/* Username & Timestamp Header */}
            <div className="flex items-center gap-3 mb-1">
              {/* Username placeholder */}
              <div className="h-4 w-24 bg-[#3a3a3d] rounded-full" />
              {/* Timestamp placeholder */}
              <div className="h-3 w-12 bg-[#2b2b2f] rounded-full" />
            </div>

            {/* --- LOGIKA VARIASI KONTEN --- */}

            {/* VARIASI 1: MEDIA / GAMBAR */}
            {row.type === "media" ? (
              <div className="mt-1">
                {/* Placeholder Image: Kotak besar dengan rounded corners */}
                <div className="h-48 w-64 bg-[#2b2b2f] rounded-lg" />
              </div>
            ) : (
              /* VARIASI 2: TEXT (Short & Long) */
              <div className="flex flex-col gap-1.5">
                {/* Baris 1: Utama */}
                <div className={`h-4 bg-[#2b2b2f] rounded-full ${row.width}`} />

                {/* Jika tipe 'long', tambah baris ekstra untuk efek paragraf/word wrap */}
                {row.type === "long" && (
                  <>
                    <div className="h-4 w-1/2 bg-[#2b2b2f] rounded-full opacity-90" />
                    <div className="h-4 w-1/3 bg-[#2b2b2f] rounded-full opacity-80" />
                  </>
                )}
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};
