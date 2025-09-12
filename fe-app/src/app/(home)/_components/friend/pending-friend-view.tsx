import { useState } from "react";
import { FriendList } from "../../_state/friend-atom";
import SearchInput from "./search-input";
import ContentListFriend from "./content-list-friend";

export default function PendingFriendView(props: {
  sent: FriendList[];
  request: FriendList[];
}) {
  const [input, setInput] = useState("");
  return (
    <div className="pt-3 pr-4 pl-6">
      <>
        <SearchInput
          value={input}
          setValue={(e) => setInput(e)}
          reset={() => setInput("")}
        />
        {props.sent.length > 0 && (
          <>
            <div className="my-4 text-sm font-semibold">
              Sent - {props.sent.length}
            </div>
            {props.sent.map((v) => (
              <ContentListFriend key={v.user_id} data={v} is_sent />
            ))}
          </>
        )}
        {props.request.length > 0 && (
          <>
            <div className="my-4 text-sm font-semibold">
              Request - {props.request.length}
            </div>
            {props.request.map((v) => (
              <ContentListFriend key={v.user_id} data={v} is_pending />
            ))}
          </>
        )}
      </>
    </div>
  );
}
