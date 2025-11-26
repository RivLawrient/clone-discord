import { Dialog } from "radix-ui";
import UserAvatar from "../../user-avatar";
import { twMerge } from "tailwind-merge";
import { Loader2Icon } from "lucide-react";
import { apiCall, GetCookie } from "@/app/(home)/_helper/api-client";
import { useState } from "react";
import { useAtom } from "jotai";
import { userAtom } from "@/app/(home)/_state/user-atom";
import { settingTabAtom } from "@/app/(home)/_state/setting-tab-atom";
import { ProfileView } from "./profile-view";

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
            props.onClick ? "cursor-pointer" : "cursor-not-allowed"
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
      <div className="mt-6 flex w-full min-w-0 flex-col overflow-hidden rounded-lg">
        <div
          style={{
            backgroundColor: user.banner_color,
          }}
          className="h-[100px] "
        />
        <div className="grow bg-[#121214] p-4 pb-0">
          <div className="flex-rows flex min-w-0">
            <div className="size-fit -translate-y-10 rounded-full bg-[#121214] p-1.5">
              <UserAvatar
                avatar={user.avatar}
                avatarBg={user.avatar_bg}
                StatusUser={user.status_activity}
                name={user.name}
                px={80}
                indicator_size={18}
                indicator_outline={6}
                not_hover="outline-[#121214]"
              />
            </div>
            <div className="ml-4 flex w-full justify-between min-w-0">
              <h1 className="text-xl font-semibold truncate">{user.name}</h1>
              <button
                onClick={() => setTab(() => ProfileView)}
                className="size-fit cursor-pointer rounded-lg bg-[#5865f2] px-3 py-2 text-sm  font-semibold whitespace-nowrap hover:bg-[#5865f2]/75"
              >
                Edit User Profile
              </button>
            </div>
          </div>
          <div className="flex w-full min-w-0 -translate-y-4 flex-col gap-5 rounded-lg bg-[#1a1a1e] p-4">
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
            <Field
              title="Email"
              value={user.email}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ChangeUsernameModal(props: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useAtom(userAtom);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({
    username: "",
    password: "",
  });

  const UpdateHandle = () => {
    setLoading(true);
    setError({
      username: "",
      password: "",
    });
    apiCall(`${process.env.NEXT_PUBLIC_HOST_API}user/me/username`, {
      method: "PATCH",
      body: JSON.stringify({
        username: username,
        password: password,
      }),
      // headers: {
      //   Authorization: `Bearer ${GetCookie("token")}`,
      //   "Content-Type": "application/json",
      // },
    })
      .then(async (resp) => {
        const res = await resp.json();
        if (resp.status === 400) {
          setError(res.data);
        }
        if (resp.ok) {
          setUser((v) => ({
            ...v,
            username: username,
          }));
          setUsername("");
          setPassword("");
          setOpen(false);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const usernameHandle = (e: React.ChangeEvent<HTMLInputElement>) => {
    error.username &&
      setError((v) => ({
        ...v,
        username: "",
      }));

    setUsername(e.target.value);
  };
  const passwordHandle = (e: React.ChangeEvent<HTMLInputElement>) => {
    error.password &&
      setError((v) => ({
        ...v,
        password: "",
      }));

    setPassword(e.target.value);
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => setOpen(e)}
    >
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
            <h1 className={twMerge("", error.username && "text-[#f57976]")}>
              Username{" "}
              <span className="text-xs">
                {error.username && "- " + error.username}
              </span>
            </h1>
            <input
              type="text"
              value={username}
              onChange={usernameHandle}
              className="rounded-lg border border-[#39393e] bg-[#212126] p-2 outline-none focus:border-[#5098ed]"
            />
          </div>
          <div className="mt-4 flex w-full flex-col gap-2 font-semibold">
            <h1 className={twMerge("", error.password && "text-[#f57976]")}>
              Current Password{" "}
              <span className="text-xs">
                {error.password && "- " + error.password}
              </span>
            </h1>
            <input
              type="password"
              value={password}
              onChange={passwordHandle}
              className="rounded-lg border border-[#39393e] bg-[#212126] p-2 outline-none focus:border-[#5098ed]"
            />
          </div>

          <div className="mt-8 flex w-full flex-row justify-end gap-2 font-semibold">
            <Dialog.Close className="cursor-pointer rounded-lg bg-[#2d2d32] px-6 py-2 transition-all hover:brightness-125">
              Cancel
            </Dialog.Close>
            <button
              disabled={loading}
              onClick={UpdateHandle}
              className="cursor-pointer rounded-lg bg-[#5865f2] px-6 py-2 transition-all hover:bg-[#5865f2]/75"
            >
              {loading ? (
                <Loader2Icon
                  size={16}
                  className="mx-2 animate-spin"
                />
              ) : (
                "Done"
              )}
            </button>
          </div>
          <Dialog.Description />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
