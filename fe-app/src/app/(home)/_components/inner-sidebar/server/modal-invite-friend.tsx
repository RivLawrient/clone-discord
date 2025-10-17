import { cn } from "@/app/(home)/_helper/cn";
import { friendAtom, FriendList } from "@/app/(home)/_state/friend-atom";
import { serverAtom } from "@/app/(home)/_state/server-atom";
import ModalContent from "@/app/(home)/_ui/modal/modal_content";
import { useAtom } from "jotai";
import { SearchIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { Dialog } from "radix-ui";
import { SetStateAction, useEffect, useState } from "react";
import UserAvatar from "../../user-avatar";

export function ModalInviteFriend(props: {
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
}) {
  const { server } = useParams();
  const [servers] = useAtom(serverAtom);
  const currentServer = servers?.find((s) => s.id === server);
  const [friend] = useAtom(friendAtom);
  const [url, setUrl] = useState("");
  const [copy, setCopy] = useState(false);
  const [input, setInput] = useState("");
  const currentFriend = friend.all.filter((v) => v.name.includes(input));

  const copyHandle = () => {
    setCopy(true);
    navigator.clipboard.writeText(url);
    setTimeout(() => {
      setCopy(false);
    }, 2000);
  };

  useEffect(() => {
    const domain = window.location.origin;
    setUrl(`${domain}/invite/${currentServer?.invite_code}`);
  }, [currentServer]);

  return (
    <Dialog.Root
      open={props.open}
      onOpenChange={props.setOpen}
    >
      <ModalContent className="h-[360px] min-h-0 w-[450px]">
        <Dialog.Description />
        <Dialog.Title className="mb-2 font-semibold">
          Invite Friends to {currentServer?.name}
        </Dialog.Title>
        <SearchInput
          input={input}
          setInput={setInput}
        />
        <FriendInviteListSection data={currentFriend} />
        <div className="-mb-4 -mx-6 rounded-b-lg bg-[#1a1a1e] p-4 px-6">
          <h1 className="mb-2 text-sm font-semibold">
            Or, send a server invite link to a friend
          </h1>
          <div
            className={cn(
              "flex w-full rounded-lg border border-[#313136] bg-[#18181c] p-1 text-sm font-semibold transition-all",
              copy && "border-[#44a259]"
            )}
          >
            <input
              type="text"
              readOnly
              value={url}
              className="ml-2 grow break-words outline-none"
            />
            <button
              disabled={!url}
              onClick={copyHandle}
              className={cn(
                "cursor-pointer rounded-lg bg-[#5865f2] p-1.5 px-3 transition-all",
                copy ? "bg-[#00873b]" : "hover:bg-[#5865f2]/75"
              )}
            >
              {copy ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </ModalContent>
    </Dialog.Root>
  );
}

function SearchInput(props: {
  input: string;
  setInput: React.Dispatch<SetStateAction<string>>;
}) {
  return (
    <div
      className={cn(
        "mb-2 flex w-full flex-row gap-2 rounded-lg border border-[#38383f] bg-[#212126] p-2 transition-all focus-within:border-[#5098ed]"
      )}
    >
      <SearchIcon size={18} />
      <input
        type="text"
        value={props.input}
        onChange={(e) => props.setInput(e.target.value)}
        placeholder="Search for friends"
        className="sddf grow text-xs outline-none"
      />
    </div>
  );
}

function FriendInviteListSection(props: { data: FriendList[] | undefined }) {
  return (
    <div
      style={{
        scrollbarWidth: "none",
      }}
      className="-z-10 grow overflow-scroll"
    >
      {props.data && props.data.length != 0 ? (
        props.data.map((v, i) => (
          <FriendInviteList
            {...v}
            key={i}
          />
        ))
      ) : (
        <div className="brightness-75 font-semibold grow h-full text-center items-center justify-center flex ">
          NO RESULT FOUND
        </div>
      )}
    </div>
  );
}

function FriendInviteList(data: FriendList) {
  const [invite, setInvite] = useState(false);
  const [loading, setLoading] = useState(false);

  const inviteHandle = () => {
    setLoading(true);

    // kirim link ke chat
    setTimeout(() => {
      setInvite(true);
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="group flex flex-row items-center gap-2 p-2 font-semibold transition-all hover:bg-[#2d2d32]">
      <UserAvatar
        StatusUser="Idle"
        avatar={data.avatar}
        name={data.name}
        px={32}
        avatarBg={data.avatar_bg}
      />
      <h1 className="grow brightness-75">{data.name}</h1>
      <button
        onClick={inviteHandle}
        disabled={invite || loading}
        className={cn(
          "cursor-pointer rounded-lg border border-[#44a259] px-3 py-1.5 text-sm transition-all ",
          invite
            ? "border-transparent cursor-not-allowed"
            : "group-hover:bg-[#00873b]"
        )}
      >
        {loading ? "Loading" : invite ? "Sent" : "Invite"}
      </button>
    </div>
  );
}
