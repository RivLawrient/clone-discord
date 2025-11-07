import { Fragment } from "react";
import { cn } from "../../_helper/cn";
import UserAvatar from "../user-avatar";
import { ChatList } from "./text-channel-view";
import useChatListSection from "./useChatListSection";

export default function ChatListSection(props: { data: ChatList[] }) {
  const {
    current,
    displayTime,
    gapTime,
    showGap,
    showIt,
    time,
    bottomRef,
    lastMargin,
  } = useChatListSection(props.data);

  return (
    <>
      <div className="grow items-center justify-end flex flex-col font-semibold mt-2 mb-4">
        <h1 className="text-[32px] leading-none">Welcome to</h1>
        <h1 className="text-[32px]">{current?.name}</h1>
        <span>This is the beginning of this server.</span>
      </div>
      {props.data
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
        .map((v, i, a) => (
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
                "mr-4  whitespace-pre-line hover:bg-[#242428]  rounded-r-lg flex flex-row pl-3 group relative",
                lastMargin(v, a, i) && "mb-5"
              )}
            >
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
                <div className=""> {v.text} </div>
              </div>
            </li>
          </Fragment>
        ))}
      <div ref={bottomRef} />
    </>
  );
}
