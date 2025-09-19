import { useAtom } from "jotai";
import { LogOutIcon, SearchIcon, XIcon } from "lucide-react";
import { Dialog } from "radix-ui";
import { Fragment, SetStateAction, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { userAtom } from "../../_state/user-atom";
import { apiCall } from "../../_helper/api-client";
import UserAvatar from "../user-avatar";
import { settingTabAtom } from "../../_state/setting-tab-atom";

export default function SettingModal(props: { children: React.ReactNode }) {
  const [tab, setTab] = useAtom(settingTabAtom);
  const [search, setSearch] = useState("");
  const filtered = listView.filter(([v, C]) =>
    v
      .replace(/\s+/g, "")
      .toLowerCase()
      .includes(search.replace(/\s+/g, "").toLowerCase()),
  );
  let CurrentTab = tab;

  useEffect(() => {
    setTab(() => AccountView);
  }, []);

  return (
    <Dialog.Root>
      <Dialog.Trigger>{props.children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Content className="fixed top-0 right-0 bottom-0 left-0 flex min-h-0">
          <Dialog.Title />
          <Dialog.Description />

          <div className="flex min-h-0 grow justify-end overflow-y-scroll bg-[#121214] text-white">
            <div className="flex min-h-0 w-[250px] shrink-0 flex-col pt-[60px] pr-4">
              <SearchInput value={search} setValue={setSearch} />
              <div className="mt-2 flex flex-col gap-0.5">
                {search != "" && (
                  <h1 className="mx-3 text-[11px] font-semibold brightness-75">
                    SEARCH RESULT
                  </h1>
                )}
                {filtered.map(([v, C], i, a) => (
                  <Fragment key={i}>
                    {search == "" && i === 0 && (
                      <h1 className="mx-3 text-[11px] font-semibold brightness-75">
                        USER SETTINGS
                      </h1>
                    )}
                    <button
                      onClick={() => setTab(() => C)}
                      className={twMerge(
                        "rounded-lg p-1.5 px-2 text-start font-semibold",
                        CurrentTab === C
                          ? "bg-[#2d2d30] brightness-100"
                          : "cursor-pointer brightness-75 hover:bg-[#1c1c1f] hover:brightness-100",
                      )}
                    >
                      {v}
                    </button>
                  </Fragment>
                ))}
                {search === "" && (
                  <>
                    <hr className="mx-2 my-2.5 border-[#222225]" />
                    <LogoutBtn />
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex min-h-0 grow justify-start overflow-y-scroll bg-[#202024]">
            <div className="relative min-h-0 w-[800px] shrink-0 px-10 pt-[60px] text-white">
              <EscBtn />
              {CurrentTab && <CurrentTab />}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const listView: [string, () => React.JSX.Element][] = [
  ["My Account", AccountView],
  ["Profiles", ProfileView],
];

function EscBtn() {
  return (
    <Dialog.Close className="group absolute top-[60px] -right-[40px] cursor-pointer rounded-full border p-2 text-white brightness-75 hover:brightness-100">
      <XIcon size={16} />
      <span className="absolute right-0 -bottom-full left-0 text-sm font-semibold">
        ESC
      </span>
    </Dialog.Close>
  );
}

function SearchInput(props: {
  value: string;
  setValue: React.Dispatch<SetStateAction<string>>;
}) {
  const changeHandle = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.setValue(e.target.value);
  };
  return (
    <div className="focus-within:border-inpt-border-2 mb-3 flex rounded-lg border border-[#2b2b2f] p-2 px-2.5">
      <div className="flex items-center">
        <SearchIcon size={16} />
      </div>
      <input
        type="text"
        value={props.value}
        onChange={changeHandle}
        placeholder="Search"
        className="ml-2 grow outline-none"
      />
    </div>
  );
}

function LogoutBtn() {
  const logoutHandle = () => {
    apiCall(`${process.env.NEXT_PUBLIC_HOST_API}auth/logout`, {
      method: "POST",
      credentials: "include",
    }).then(async (reps) => {
      if (reps.ok) {
        document.location.reload();
      }
    });
  };
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="flex cursor-pointer justify-between rounded-lg p-1.5 px-2 text-start font-semibold text-[#f57976] hover:bg-[#221517]">
          Log Out
          <LogOutIcon size={18} className="my-auto" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60" />
        <Dialog.Content className="fixed top-1/2 left-1/2 flex h-[200px] w-[400px] -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg border border-[#3b3b41] bg-[#242429] p-4 px-6 text-white data-[state=closed]:animate-[modal-hide_200ms] data-[state=open]:animate-[modal-show_200ms]">
          <Dialog.Title className="text-xl font-semibold">Log out</Dialog.Title>
          <h1 className="mt-3 grow font-semibold">
            Are you sure you want to logout?
          </h1>
          <div className="flex justify-end gap-4 font-semibold">
            <Dialog.Close className="cursor-pointer rounded-lg bg-[#323237] px-4 py-2 transition-all hover:brightness-125">
              Cancel
            </Dialog.Close>
            <button
              onClick={logoutHandle}
              className="cursor-pointer rounded-lg bg-[#d12d38] px-4 py-2 transition-all hover:bg-[#d12d38]/75"
            >
              Log out
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function AccountView() {
  const [user, setUser] = useAtom(userAtom);
  const [tab, setTab] = useAtom(settingTabAtom);

  const Field = (props: {
    title: string;
    value: string;
    onClick?: () => void;
  }) => {
    return (
      <div className="flex-rows flex items-center">
        <div className="w-full">
          <h1 className="font-semibold">{props.title}</h1>
          <h1>{props.value}</h1>
        </div>
        <button
          onClick={props.onClick}
          className={twMerge(
            "size-fit rounded-lg bg-[#242428] px-4 py-2 text-sm font-semibold hover:brightness-125",
            props.onClick ? "cursor-pointer" : "cursor-not-allowed",
          )}
        >
          Edit
        </button>
      </div>
    );
  };
  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">My Account</h1>
      <div className="mt-6 flex w-full flex-col overflow-hidden rounded-lg">
        <div className="h-[100px] bg-white" />
        <div className="grow bg-[#121214] p-4 pb-0">
          <div className="flex-rows flex">
            <div className="size-fit -translate-y-10 rounded-full bg-[#121214] p-1.5">
              <UserAvatar
                avatar="s"
                StatusUser={user.status_activity}
                name={user.name}
                px={80}
                indicator_size={18}
                indicator_outline={6}
                not_hover="outline-[#121214]"
              />
            </div>
            <div className="ml-4 flex w-full justify-between">
              <h1 className="text-xl font-semibold">{user.name}</h1>
              <button
                onClick={() => setTab(() => ProfileView)}
                className="size-fit cursor-pointer rounded-lg bg-[#5865f2] px-3 py-2 text-sm font-semibold hover:bg-[#5865f2]/75"
              >
                Edit User Profile
              </button>
            </div>
          </div>
          <div className="flex w-full -translate-y-4 flex-col gap-5 rounded-lg bg-[#1a1a1e] p-4">
            <Field
              title="Display Name"
              value={user.name}
              onClick={() => setTab(() => ProfileView)}
            />
            <ChangeUsernameModal>
              <Field
                title="Username"
                value={user.username}
                onClick={() => {}}
              />
            </ChangeUsernameModal>
            <Field title="Email" value={user.email} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ChangeUsernameModal(props: { children: React.ReactNode }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{props.children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60" />
        <Dialog.Content className="fixed top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-lg border border-[#3b3b41] bg-[#242429] p-5 pt-6 text-white outline-none data-[state=closed]:animate-[modal-hide_200ms] data-[state=open]:animate-[modal-show_200ms]">
          <Dialog.Title className="text-2xl font-semibold">
            Change Your Username
          </Dialog.Title>
          <h1 className="mx-6 mb-8">
            Enter a new username and your existing password.
          </h1>
          <div className="flex w-full flex-col gap-2 font-semibold">
            <h1>Username</h1>
            <input
              type="text"
              className="rounded-lg border border-[#39393e] bg-[#212126] p-2 outline-none focus:border-[#5098ed]"
            />
          </div>
          <div className="mt-4 flex w-full flex-col gap-2 font-semibold">
            <h1>Current Password</h1>
            <input
              type="text"
              className="rounded-lg border border-[#39393e] bg-[#212126] p-2 outline-none focus:border-[#5098ed]"
            />
          </div>

          <div className="mt-8 flex w-full flex-row justify-end gap-2 font-semibold">
            <Dialog.Close className="cursor-pointer rounded-lg bg-[#2d2d32] px-6 py-2 transition-all hover:brightness-125">
              Cancel
            </Dialog.Close>
            <button className="cursor-pointer rounded-lg bg-[#5865f2] px-6 py-2 transition-all hover:bg-[#5865f2]/75">
              Done
            </button>
          </div>
          <Dialog.Description />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
function ProfileView() {
  const [user, setUser] = useAtom(userAtom);
  return (
    <div>
      <SaveModal />
      <h1 className="mb-4 text-2xl font-semibold text-white">Profiles</h1>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div>
            <h1 className="mb-2 font-semibold">Display Name</h1>
            <input
              type="text"
              // value={user.name}
              className="rounded-lg border border-[#36363b] bg-[#1d1d21] p-2"
            />
          </div>
          <hr className="my-6 border-[#2e2e33]" />
          <div>
            <h1 className="mb-2 font-semibold">Avatar</h1>
            <div className="flex gap-2">
              <button className="rounded-lg bg-[#5865f2] px-3 py-2 text-sm font-semibold hover:bg-[#5865f2]/75">
                Change Avatar
              </button>
              <button className="rounded-lg bg-[#29292d] px-3 py-2 text-sm font-semibold hover:brightness-125">
                Remove Avatar
              </button>
            </div>
          </div>
          <hr className="my-6 border-[#2e2e33]" />
          <div>
            <h1 className="mb-2 font-semibold">Banner Color</h1>
            <div className="size-[50px] rounded-lg bg-white"></div>
          </div>
          <hr className="my-6 border-[#2e2e33]" />
          <div>
            <h1 className="mb-2 font-semibold">About Me</h1>
            <textarea className="w-full resize-none rounded-lg border border-[#36363b] bg-[#1d1d21] p-2 outline-none" />
          </div>
        </div>
        <div>
          <div>
            <h1 className="mb-2 font-semibold">Preview</h1>
            <div className="h-[302px] w-[300px] rounded-lg bg-white text-black">
              sesuatk
            </div>
          </div>
          <div className="mt-4">
            <h1 className="mb-2 font-semibold">Nameplat Preview</h1>
            <div className="w-full rounded-lg bg-white p-2 text-black brightness-50">
              {user.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SaveModal() {
  return (
    <div className="absolute right-0 bottom-0 left-0 m-4 rounded-lg border border-[#393a3f] bg-[#2c2d32] p-4 shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
      save?
    </div>
  );
}
