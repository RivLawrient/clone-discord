import { SetStateAction } from "react";
import { ChannelList } from "../../_state/channel-list-atom";
import { UserOther } from "../../_state/user-atom";
import { ChatList } from "./text-channel-view";
import useInputChat from "./useInputChat";

export default function InputChat(props: {
  data: ChannelList | UserOther;
  list: ChatList[];
  setList: React.Dispatch<SetStateAction<ChatList[]>>;
}) {
  const { inputTagRef, input, row, handleKeyDown, onChange } = useInputChat(
    props.data,
    props.list,
    props.setList
  );

  return (
    <div className="bg-[#222327] border border-[#27282c] mx-4 px-3 flex flex-row rounded-lg mb-2 py-4 min-w-0">
      <textarea
        ref={inputTagRef}
        value={input}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder={
          "Message " +
          ("id" in props.data ? `#${props.data.name}` : `@${props.data.name}`)
        }
        className=" grow outline-none break-all resize-none"
        rows={row}
      />
    </div>
  );
}
