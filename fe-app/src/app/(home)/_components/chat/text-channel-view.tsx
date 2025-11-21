import { ChannelList } from "../../_state/channel-list-atom";
import { cn } from "../../_helper/cn";
import { Users2Icon } from "lucide-react";
import InputChat from "./input-chat";
import { USER_STATUS, UserOther } from "../../_state/user-atom";
import ChatListSection from "./chat-list-section";
import UserAvatar from "../user-avatar";
import useTextChannelView from "./useTextChannelView";
import { useEffect } from "react";
import { useAtom } from "jotai";
import { memberListServerAtom } from "../../_state/membet-list-server-atom";

export type ChatList = {
  id: string;
  user: UserOther;
  text: string;
  created_at: string;
};

export default function TextChannelView(props: { data: ChannelList }) {
  const {
    Icons,
    setShowSide,
    showSide,
    list,
    setList,
    loading,
    isLast,
    FetchChat,
  } = useTextChannelView(props.data);

  return (
    <div className="flex flex-col min-h-0 min-w-0 bg-[#1a1a1e]">
      <div className="flex p-3.5 gap-2 border-y border-[#29292e] ">
        <div className="brightness-75">
          <Icons />
        </div>
        <span className="font-semibold grow">{props.data.name}</span>
        <button
          onClick={() => setShowSide(!showSide)}
          className={cn(
            "cursor-pointer outline-none",
            showSide ? "text-white" : "brightness-75"
          )}
        >
          <Users2Icon />
        </button>
      </div>
      <div className="grow flex flex-row min-h-0 min-w-0">
        <div className="flex flex-col min-w-0 grow">
          <ChatListSection
            data={list}
            isLast={isLast}
            loading={loading}
            onLoadMore={FetchChat}
          />
          <InputChat
            data={props.data}
            list={list}
            setList={setList}
          />
        </div>
        {showSide && (
          <div className="bg-[#1a1a1e] border-l border-[#29292e] p-2 flex flex-col gap-2 min-w-[250px] ">
            <ListMemberView />
          </div>
        )}
      </div>
    </div>
  );
}

function ListMemberView() {
  const [list, setList] = useAtom(memberListServerAtom);

  return list.map((v) => (
    <div
      key={v.user_id}
      className="flex flex-row hover:bg-[#242428] rounded-lg transition-all gap-2 items-center p-2"
    >
      <div>
        <UserAvatar
          avatar={v.avatar}
          avatarBg={v.avatar_bg}
          name={v.name}
          px={32}
          StatusUser={v.status_activity}
          hover="outline-[#242428]"
          not_hover="group-hover:outline-[#1a1a1e]"
          indicator_size={10}
          indicator_outline={2}
        />
      </div>
      <div className="font-semibold">
        <h1>{v.name}</h1>
      </div>
    </div>
  ));
}
