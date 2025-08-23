"use client";
import {
  CheckIcon,
  MessageCircleIcon,
  MoreVerticalIcon,
  SearchIcon,
  UserCheck2Icon,
  X,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { useAtom } from "jotai";
import { friendAtom, FriendList } from "../../_state/friend-atom";
import UserAvatar from "../../_components/user-avatar";
import TooltipDesc from "../../_components/tooltip-desc";
import { apiCall, GetCookie } from "../../_helper/api-client";

export default function Page() {
  const [tab, setTab] = useState<"online" | "all" | "pending" | "add">(
    "online",
  );
  const [friend, setFriend] = useAtom(friendAtom);

  return (
    <div>
      <div className="border-discord-border-2 flex h-12 items-center gap-3 border-t border-b px-4 py-2">
        <div className="flex items-center gap-2 px-1 font-semibold">
          <UserCheck2Icon />
          Friend
        </div>
        <div className="bg-btn-select-2 size-1 rounded-full" />
        <div className="flex gap-4">
          <TabBtn
            label="Online"
            variant={1}
            active={tab == "online"}
            onClick={() => setTab("online")}
          />
          <TabBtn
            label="All"
            variant={1}
            active={tab == "all"}
            onClick={() => setTab("all")}
          />
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
        <ListFriendView data={friend.all} tab={tab} />
      )}
      {tab === "pending" && (
        <PendingFriendView sent={friend.sent} request={friend.request} />
      )}
      {tab === "add" && <AddFriendView />}
    </div>
  );
}

function TabBtn(props: {
  label: string;
  variant: 1 | 2 | 3;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={props.onClick}
      className={twMerge(
        "cursor-pointer truncate rounded-lg px-3 py-1 font-semibold transition-all",
        props.variant == 1 &&
          "hover:bg-btn-hover-2 text-white/50 hover:text-white",
        props.variant == 1 &&
          props.active &&
          "bg-btn-select-2 hover:bg-btn-select-2 text-white",
        props.variant == 2 && "bg-btn-bg-1 text-white hover:brightness-80",
        props.variant == 2 &&
          props.active &&
          "bg-[#242641] text-[#7a8ef9] hover:bg-[#242641]",
      )}
    >
      {props.label}
    </button>
  );
}

function SearchInpt(props: {
  value: string;
  setValue: (search: string) => void;
  reset: () => void;
}) {
  return (
    <div className="bg-inpt-bg-1 border-inpt-border-1 focus-within:border-inpt-border-2 flex items-center rounded-lg border px-3 py-2">
      <input
        type="text"
        value={props.value}
        onChange={(e) => props.setValue(e.target.value)}
        placeholder="Search"
        className="grow outline-none"
      />
      {props.value === "" ? (
        <SearchIcon size={18} />
      ) : (
        <XIcon onClick={props.reset} size={18} className="cursor-pointer" />
      )}
    </div>
  );
}

function ListFriend() {
  return <div></div>;
}

function AddFriendView() {
  const [add_input, setAdd_input] = useState("");
  const [success, setSuccess] = useState(false);
  const [failed, setFailed] = useState(false);

  const add_friend_api = `${process.env.NEXT_PUBLIC_HOST_API}friend/add/${add_input}`;

  const action = () => {
    setSuccess(false);
    setFailed(false);

    apiCall(add_friend_api, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GetCookie("token")}`,
      },
    })
      .then(async (resp) => {
        if (resp.ok) {
          setSuccess(true);
        } else {
          setFailed(true);
        }
      })
      .catch(() => {
        setFailed(true);
      });
  };

  return (
    <div className="border-discord-border-2 border-b px-[30px] py-[20px]">
      <h1 className="text-xl font-semibold">Add Friend</h1>
      <h2 className="text-[16px]">
        You can add friends with their Discord username.
      </h2>
      <div
        className={twMerge(
          "relative mt-5 mb-2 flex rounded-lg border border-black bg-[#1e1f22] px-3 py-2.5",
          !success && !failed && "focus-within:border-inpt-border-2",
          failed && "border-red-500",
          success && "border-green-500",
        )}
      >
        <input
          type="text"
          placeholder="You can add friends with their Discord username."
          value={add_input}
          onChange={(e) => {
            success && setSuccess(false);
            failed && setFailed(false);
            setAdd_input(e.target.value);
          }}
          className="grow text-sm outline-none"
        />
        <button
          onClick={action}
          className={twMerge(
            "bg-btn-bg-1 rounded-lg p-2.5 text-xs font-semibold text-white",
            add_input === "" ? "brightness-75" : "cursor-pointer",
          )}
        >
          Send Friend Request
        </button>
        <img
          src="/add_friend.svg"
          alt=""
          className="absolute right-0 bottom-full"
        />
      </div>
      {(success || failed) && (
        <h1
          className={twMerge(
            "text-xs text-[#f57876]",
            failed && "text-red-text",
            success && "text-green-text",
          )}
        >
          {success && ` Success! Your friend request to ${add_input} was sent.`}
          {failed &&
            "Hm, didn’t work. Double check that the username is correct."}
        </h1>
      )}
    </div>
  );
}

function ListFriendView(props: { tab: string; data: FriendList[] }) {
  const [input, setInput] = useState("");

  return (
    <div className="pt-3 pr-4 pl-6">
      <>
        <SearchInpt
          value={input}
          setValue={(e) => setInput(e)}
          reset={() => setInput("")}
        />
        <div className="my-4 text-sm font-semibold">
          {props.tab === "online"
            ? "Online - " +
              props.data.filter((v) => v.status_activity != "Invisible").length
            : props.tab === "all" && "All friends - " + props.data.length}
        </div>
        {props.tab === "online" &&
          props.data.map(
            (v) =>
              v.status_activity != "Invisible" && (
                <ContentListFriend key={v.user_id} data={v} />
              ),
          )}
        {props.tab === "all" &&
          props.data.map((v) => <ContentListFriend key={v.user_id} data={v} />)}
      </>
    </div>
  );
}

function PendingFriendView(props: {
  sent: FriendList[];
  request: FriendList[];
}) {
  const [input, setInput] = useState("");
  return (
    <div className="pt-3 pr-4 pl-6">
      <>
        <SearchInpt
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

function ContentListFriend(props: {
  data: FriendList;
  is_sent?: boolean;
  is_pending?: boolean;
}) {
  return (
    <div className="border-list-border-3 group hover:bg-btn-hover-2 flex cursor-pointer border-t px-2 py-3 transition-all hover:rounded-lg hover:border-transparent">
      <UserAvatar
        StatusUser={props.data.status_activity}
        avatar={props.data.avatar}
        name={props.data.name}
        px={36}
        hover="outline-layout-bg"
        not_hover="group-hover:outline-btn-hover-2"
        whitout_status={props.is_sent || props.is_pending}
      />
      <div className="ml-2 flex grow flex-col justify-center gap-1.5">
        <h1 className="flex items-end leading-none font-semibold">
          {props.data.name}
          <span className="invisible ml-1 text-sm leading-none font-semibold group-hover:visible">
            {props.data.username}
          </span>
        </h1>
        <span className="text-sm leading-none font-semibold brightness-50">
          {!props.is_sent && !props.is_pending
            ? props.data.status_activity
            : props.data.username}
        </span>
      </div>
      {!props.is_sent && !props.is_pending && (
        <div className="flex gap-2">
          <TooltipDesc side="top" text="Message">
            <button className="group/btn group-hover:bg-discord-bg cursor-pointer rounded-full p-2">
              <MessageCircleIcon
                size={20}
                fill="white"
                className="brightness-70 group-hover/btn:brightness-100"
              />
            </button>
          </TooltipDesc>

          <TooltipDesc side="top" text="More">
            <button className="group-hover:bg-discord-bg group/btn cursor-pointer rounded-full p-2">
              <MoreVerticalIcon
                size={20}
                fill="white"
                className="brightness-70 group-hover/btn:brightness-100"
              />
            </button>
          </TooltipDesc>
        </div>
      )}
      {props.is_sent && (
        <div>
          <TooltipDesc side="top" text="Cancel">
            <button className="group/btn group-hover:bg-discord-bg cursor-pointer rounded-full p-2">
              <XIcon
                size={20}
                fill="white"
                className="brightness-70 group-hover/btn:text-red-500 group-hover/btn:brightness-100"
              />
            </button>
          </TooltipDesc>
        </div>
      )}
      {props.is_pending && (
        <div className="flex gap-2">
          <TooltipDesc side="top" text="Accept">
            <button className="group/btn group-hover:bg-discord-bg cursor-pointer rounded-full p-2">
              <CheckIcon
                size={20}
                className="brightness-70 group-hover/btn:text-green-500 group-hover/btn:brightness-100"
              />
            </button>
          </TooltipDesc>
          <TooltipDesc side="top" text="Decline">
            <button className="group/btn group-hover:bg-discord-bg cursor-pointer rounded-full p-2">
              <XIcon
                size={20}
                fill="white"
                className="brightness-70 group-hover/btn:text-red-500 group-hover/btn:brightness-100"
              />
            </button>
          </TooltipDesc>
        </div>
      )}
    </div>
  );
}
