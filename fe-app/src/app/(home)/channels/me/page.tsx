"use client";
import {
  CheckIcon,
  MessageCircleIcon,
  MoreVerticalIcon,
  SearchIcon,
  UserCheck2Icon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { useAtom } from "jotai";
import { friendAtom, FriendList } from "../../_state/friend-atom";
import UserAvatar from "../../_components/user-avatar";
import TooltipDesc from "../../_components/tooltip-desc";
import { apiCall, GetCookie } from "../../_helper/api-client";
import { AlertDialog, DropdownMenu } from "radix-ui";
import { useRouter } from "next/navigation";

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
    if (add_input != "") {
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
    }
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

  // Filter data berdasarkan tab
  const tabFilteredData =
    props.tab === "online"
      ? props.data.filter((v) => v.status_activity !== "Invisible")
      : props.data;

  // Filter berdasarkan search input (username atau name)
  const filteredData = tabFilteredData.filter(
    (v) =>
      v.username?.toLowerCase().includes(input.toLowerCase()) ||
      v.name?.toLowerCase().includes(input.toLowerCase()),
  );

  // Generate label untuk header
  const getHeaderLabel = () => {
    const baseLabel = props.tab === "online" ? "Online" : "All friends";

    // Jika tidak ada input search, tampilkan jumlah normal
    if (!input.trim()) {
      return `${baseLabel} - ${filteredData.length}`;
    }

    // Jika ada input search tapi tidak ada hasil
    if (input.trim() && filteredData.length === 0) {
      return "No one with that name could be found.";
    }

    // Jika ada input search dan ada hasil
    return `${baseLabel} - ${filteredData.length}`;
  };

  const headerLabel = getHeaderLabel();

  return (
    <div className={twMerge("pt-3 pr-4 pl-6")}>
      <SearchInpt
        value={input}
        setValue={setInput}
        reset={() => setInput("")}
      />

      {/* Tampilkan header label selalu, baik ada hasil atau tidak */}
      <div
        className={twMerge(
          "my-4 text-sm font-semibold transition-all",
          input.trim() && filteredData.length === 0 && "h-max",
        )}
      >
        {headerLabel}
      </div>

      {/* Render list hanya jika ada data */}
      {filteredData.map((v) => (
        <ContentListFriend key={v.user_id} data={v} />
      ))}
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
  const router = useRouter();
  const cancel_handle = () => {
    apiCall(
      `${process.env.NEXT_PUBLIC_HOST_API}friend/cancel/${props.data.user_id}`,
      {
        method: "DELETE",
      },
    ).catch(() => {});
  };

  const decline_handle = () => {
    apiCall(
      `${process.env.NEXT_PUBLIC_HOST_API}friend/decline/${props.data.user_id}`,
      {
        method: "DELETE",
      },
    ).catch(() => {});
  };

  const accept_handle = () => {
    apiCall(
      `${process.env.NEXT_PUBLIC_HOST_API}friend/accept/${props.data.user_id}`,
      {
        method: "POST",
      },
    ).catch(() => {});
  };
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
            <button
              onClick={() => router.push("/channels/me/" + props.data.username)}
              className="group/btn group-hover:bg-discord-bg cursor-pointer rounded-full p-2"
            >
              <MessageCircleIcon
                size={20}
                fill="white"
                className="brightness-70 group-hover/btn:brightness-100"
              />
            </button>
          </TooltipDesc>

          <DropDownMoreFriendList
            user_id={props.data.user_id}
            name={props.data.name}
          >
            <button className="group-hover:bg-discord-bg group/btn cursor-pointer rounded-full p-2">
              <MoreVerticalIcon
                size={20}
                fill="white"
                className="brightness-70 group-hover/btn:brightness-100"
              />
            </button>
          </DropDownMoreFriendList>
        </div>
      )}
      {props.is_sent && (
        <div>
          <TooltipDesc side="top" text="Cancel">
            <button
              onClick={cancel_handle}
              className="group/btn group-hover:bg-discord-bg cursor-pointer rounded-full p-2"
            >
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
            <button
              onClick={accept_handle}
              className="group/btn group-hover:bg-discord-bg cursor-pointer rounded-full p-2"
            >
              <CheckIcon
                size={20}
                className="brightness-70 group-hover/btn:text-green-500 group-hover/btn:brightness-100"
              />
            </button>
          </TooltipDesc>
          <TooltipDesc side="top" text="Decline">
            <button
              onClick={decline_handle}
              className="group/btn group-hover:bg-discord-bg cursor-pointer rounded-full p-2"
            >
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

function DropDownMoreFriendList(props: {
  children: React.ReactNode;
  user_id: string;
  name: string;
}) {
  return (
    <DropdownMenu.Root>
      <TooltipDesc side="top" text="More">
        <DropdownMenu.Trigger asChild>{props.children}</DropdownMenu.Trigger>
      </TooltipDesc>
      <DropdownMenu.Portal>
        <DropdownMenu.Content asChild side="bottom" sideOffset={-20}>
          <div className="bg-list-border-3 mr-4 flex min-w-[180px] flex-col rounded-lg border border-[#35353c] p-2 text-white">
            <RemoveFriendAlert user_id={props.user_id} name={props.name}>
              <button className="cursor-pointer rounded-lg p-2 text-start text-xs font-semibold text-[#f57976] hover:bg-[#362a2e]">
                Remove Friend
              </button>
            </RemoveFriendAlert>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function RemoveFriendAlert(props: {
  children: React.ReactNode;
  user_id: string;
  name: string;
}) {
  const accept_handle = () => {
    apiCall(
      `${process.env.NEXT_PUBLIC_HOST_API}friend/remove/${props.user_id}`,
      {
        method: "DELETE",
      },
    ).catch(() => {});
  };
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>{props.children}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Description />
        <AlertDialog.Overlay className="fixed inset-0 bg-black/60" />
        <AlertDialog.Content className="bg-tooltip-bg border-btn-select-2 fixed top-1/2 left-1/2 w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-lg border p-6 text-white">
          {/* <AlertDialog.Description /> */}
          <AlertDialog.Cancel className="absolute top-2 right-2 cursor-pointer rounded-lg p-2 hover:bg-[#36363b]">
            <XIcon size={30} strokeWidth={1} />
          </AlertDialog.Cancel>

          <AlertDialog.Title className="mb-2 text-xl font-semibold">
            Remove '{props.name}'
          </AlertDialog.Title>
          <h1 className="mb-6 leading-4.5 brightness-60">
            Are you sure you want to remove adimas from your friends?
          </h1>

          <div className="flex flex-row gap-2">
            <AlertDialog.Cancel className="flex-1/2 cursor-pointer rounded-lg bg-[#2d2d32] p-2 font-semibold transition-all hover:bg-white/10">
              Cancel
            </AlertDialog.Cancel>
            <AlertDialog.Action
              onClick={accept_handle}
              className="flex-1/2 cursor-pointer rounded-lg bg-[#d22d39] p-2 font-semibold transition-all hover:bg-[#d22d39]/80"
            >
              Remove Friend
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
