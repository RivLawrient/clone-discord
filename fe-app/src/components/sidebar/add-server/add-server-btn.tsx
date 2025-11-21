"use client";
import {
  CameraIcon,
  Loader2Icon,
  PlusCircleIcon,
  PlusIcon,
} from "lucide-react";
import TooltipDetail from "../../tooltip-desc";
import { Dialog } from "radix-ui";
import ModalContent from "../../modal_content";
import { cn } from "@/app/(home)/_helper/cn";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAtom } from "jotai";
import { userAtom } from "@/app/(home)/_state/user-atom";
import { apiCall } from "@/app/(home)/_helper/api-client";
import { serverAtom } from "@/app/(home)/_state/server-atom";
import { channelListAtom } from "@/app/(home)/_state/channel-list-atom";

export default function AddServerBtn() {
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState<File>();
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [profile] = useAtom(userAtom);
  const [, setServer] = useAtom(serverAtom);
  const [, setChannels] = useAtom(channelListAtom);

  const previewUrl = useMemo(() => {
    if (!image) return null;
    return URL.createObjectURL(image);
  }, [image]);

  const imageChangeHandle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
    }
  };

  const changeTextHandle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const createHandle = () => {
    setLoading(true);
    const form = new FormData();
    form.append("name", input);
    if (image) {
      form.append("profile_image", image);
    }

    apiCall(`${process.env.NEXT_PUBLIC_HOST_API}server`, {
      method: "POST",
      body: form,
    })
      .then(async (resp) => {
        const res = await resp.json();
        if (resp.ok) {
          setServer((p) => [...p, res.data]);
          setChannels((p) => [
            ...p,
            {
              server_id: res.data.id,
              category: [],
              channel: [],
            },
          ]);
        }
      })
      .catch(() => {})
      .finally(() => {
        setOpen(false);
        setLoading(false);
      });
  };

  useEffect(() => {
    setTimeout(() => {
      if (inputRef.current) {
        setInput(profile.name.slice(0, 20) + "'s server");
        inputRef.current.focus();
      }
    }, 100);
  }, [open]);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={setOpen}
    >
      <TooltipDetail
        side="right"
        text="Add a Server"
      >
        <Dialog.Trigger asChild>
          <button className="size-10 rounded-xl bg-[#1d1d1e] mx-4 hover:bg-[#5865f2] cursor-pointer transition-all group flex">
            <div className="m-auto">
              <PlusCircleIcon className="text-[#1d1d1e] group-hover:text-[#5865f2] fill-white transition-all" />
            </div>
          </button>
        </Dialog.Trigger>
      </TooltipDetail>
      <ModalContent className="w-[400px] flex items-center">
        <Dialog.Title className="text-2xl font-semibold mb-3">
          Customize Your Server
        </Dialog.Title>
        <Dialog.Description className="text-center mb-5">
          Give your new server a personality with a name and an icon. You can
          always change it later.
        </Dialog.Description>
        <div
          className={cn(
            "relative flex size-20 flex-col items-center justify-center rounded-full border-dashed border-white/75",
            !previewUrl && "border-2"
          )}
        >
          <input
            type="file"
            accept="image/*"
            onChange={imageChangeHandle}
            className={cn(
              "absolute z-10 size-full cursor-pointer rounded-full opacity-0"
            )}
            title=""
          />
          {previewUrl ? (
            <img
              src={previewUrl}
              alt=""
              className="size-20 rounded-full object-cover"
            />
          ) : (
            <>
              <CameraIcon className="brightness-75" />
              <span className="text-xs font-semibold brightness-75">
                UPLOAD
              </span>
              <div className="absolute top-0 right-0 rounded-full bg-[#5965f2] p-1">
                <PlusIcon size={16} />
              </div>
            </>
          )}
        </div>

        <h1 className="mt-4 mr-auto mb-2 font-semibold">
          Server Name
          <span className="text-red-500 ml-1">*</span>
        </h1>

        <input
          ref={inputRef}
          type="text"
          onChange={changeTextHandle}
          className="mb-2 w-full rounded-lg border-[#39393e] bg-[#212126] p-2 transition-all outline-none focus:border-[#5865f2] border-2"
          value={input}
        />
        <h1 className="mr-auto text-[11px] brightness-75">
          By creating a server, you agree to Discord's{" "}
          <span className="font-semibold text-blue-400">
            Community Guidelines
          </span>
          .
        </h1>
        <div className="mt-8 flex w-full justify-end">
          <button
            disabled={loading || input == ""}
            onClick={createHandle}
            className="cursor-pointer rounded-lg bg-[#5965f2] px-6 py-2 font-semibold transition-all not-disabled:hover:bg-[#5965f2]/75 disabled:brightness-50 disabled:cursor-auto"
          >
            {loading ? (
              <Loader2Icon
                size={20}
                className="mx-3 animate-spin"
              />
            ) : (
              "Create"
            )}
          </button>
        </div>
      </ModalContent>
    </Dialog.Root>
  );
}
