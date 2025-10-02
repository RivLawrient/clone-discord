import { useAtom } from "jotai";
import { LogOutIcon, SearchIcon, XIcon } from "lucide-react";
import { Dialog } from "radix-ui";
import { Fragment, SetStateAction, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { apiCall } from "../../_helper/api-client";
import { settingTabAtom } from "../../_state/setting-tab-atom";
import { AccountView } from "./view/account-view";
import { ProfileView } from "./view/profile-view";
import VoiceVideoView from "./view/voice-video-view";

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
    setTab(() => VoiceVideoView); //default view
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
                    {search == "" && i === 2 && (
                      <>
                        <hr className="mx-2 my-2.5 border-[#222225]" />
                        <h1 className="mx-3 text-[11px] font-semibold brightness-75">
                          APP SETTINGS
                        </h1>
                      </>
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
  ["Voice & Video", VoiceVideoView],
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
