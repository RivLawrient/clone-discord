"use client";
import { UserCheck2Icon } from "lucide-react";
import { useState } from "react";
import { useAtom } from "jotai";
import { friendAtom } from "../../_state/friend-atom";
import TabBtn from "../../_components/friend/tab-btn";
import AddFriendView from "../../_components/friend/add-friend-view";
import ListFriendView from "../../_components/friend/list-friend-view";
import PendingFriendView from "../../_components/friend/pending-friend-view";
import { userAtom } from "@/state/user-atom";

export default function Page() {
  const [tab, setTab] = useState<"online" | "all" | "pending" | "add">(
    "online"
  );
  const [friend, setFriend] = useAtom(friendAtom);

  return (
    <div>
      <div className="border-discord-border-2 flex items-center gap-3 border-t border-b px-4 py-2">
        <div className="flex items-center gap-2 px-1 font-semibold">
          <UserCheck2Icon />
          Friend
        </div>
        <div className="bg-btn-select-2 size-1 rounded-full" />
        <div className="flex gap-4">
          {friend.all.filter((v) => v.status_activity !== "Invisible").length >
            0 && (
            <TabBtn
              label="Online"
              variant={1}
              active={tab == "online"}
              onClick={() => setTab("online")}
            />
          )}
          {friend.all.length > 0 && (
            <TabBtn
              label="All"
              variant={1}
              active={tab == "all"}
              onClick={() => setTab("all")}
            />
          )}
          {(friend.request.length > 0 || friend.sent.length > 0) && (
            <TabBtn
              label="Pending"
              variant={1}
              active={tab == "pending"}
              onClick={() => setTab("pending")}
            />
          )}
          <TabBtn
            label="Add Friend"
            variant={2}
            active={tab == "add"}
            onClick={() => setTab("add")}
          />
        </div>
      </div>
      {(tab === "all" || tab === "online") && (
        <ListFriendView
          data={friend.all}
          tab={tab}
        />
      )}
      {tab === "pending" && (
        <PendingFriendView
          sent={friend.sent}
          request={friend.request}
        />
      )}
      {tab === "add" && <AddFriendView />}
    </div>
  );
}
