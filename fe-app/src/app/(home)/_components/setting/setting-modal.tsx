import { SetStateAction, useAtom } from "jotai";
import { LogOutIcon, SearchIcon, XIcon } from "lucide-react";
import { Dialog } from "radix-ui";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { userAtom } from "../../_state/user-atom";

export default function SettingModal(props: { children: React.ReactNode }) {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  let CurrentView = viewSetting[tab];

  const filtered = fieldSetting.filter((v) =>
    v
      .replace(/\s+/g, "")
      .toLowerCase()
      .includes(search.replace(/\s+/g, "").toLowerCase()),
  );

  useEffect(() => {
    CurrentView = viewSetting[tab];
  }, [tab]);
  return (
    <Dialog.Root open>
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

                {filtered.map((v, i, a) => (
                  <>
                    {search == "" && i === 0 && (
                      <h1 className="mx-3 text-[11px] font-semibold brightness-75">
                        USER SETTINGS
                      </h1>
                    )}
                    <button
                      onClick={() => setTab(i)}
                      className={twMerge(
                        "rounded-lg p-1.5 px-2 text-start font-semibold",
                        tab === i
                          ? "bg-[#2d2d30] brightness-100"
                          : "cursor-pointer brightness-75 hover:bg-[#1c1c1f] hover:brightness-100",
                      )}
                    >
                      {v}
                    </button>
                  </>
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
              <CurrentView />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const fieldSetting = ["My Account", "Profiles"];
const viewSetting = [AccountView, ProfileView];

function EscBtn() {
  return (
    <Dialog.Close className="group absolute top-[60px] right-0 cursor-pointer rounded-full border p-2 text-white brightness-75 hover:brightness-100">
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
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <button className="flex cursor-pointer justify-between rounded-lg p-1.5 px-2 text-start font-semibold text-[#f57976] hover:bg-[#221517]">
          Log Out
          <LogOutIcon size={18} className="my-auto" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content></Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
//tes
function AccountView() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">My Account</h1>
    </div>
  );
}
function ProfileView() {
  const [user, setUser] = useAtom(userAtom);
  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold text-white">Profiles</h1>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div>
            <h1 className="mb-2 font-semibold">Display Name</h1>
            <input
              type="text"
              value={user.name}
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
