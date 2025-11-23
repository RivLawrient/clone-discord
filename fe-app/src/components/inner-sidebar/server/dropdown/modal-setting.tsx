import { apiCall } from "@/app/(home)/_helper/api-client";
import { cn } from "@/app/(home)/_helper/cn";
import { channelListAtom } from "@/app/(home)/_state/channel-list-atom";
import { serverAtom } from "@/app/(home)/_state/server-atom";
import { userAtom } from "@/app/(home)/_state/user-atom";
import ModalContent from "@/components/modal_content";
import { useAtom } from "jotai";
import { CameraIcon, Loader2Icon, PlusIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { Dialog } from "radix-ui";
import { SetStateAction, useEffect, useMemo, useRef, useState } from "react";

export default function ModalSetting(props: {
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
}) {
  const [image, setImage] = useState<File>();
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [profile] = useAtom(userAtom);

  const [, setChannels] = useAtom(channelListAtom);
  const [servers, setServers] = useAtom(serverAtom);
  const { server } = useParams();
  const currentServer = servers.find((v) => v.id === server);

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

    apiCall(
      `${process.env.NEXT_PUBLIC_HOST_API}server/profile/${currentServer?.id}`,
      {
        method: "POST",
        body: form,
      }
    )
      .then(() => {
        setInput("");
        setImage(undefined);
      })
      .catch(() => {})
      .finally(() => {
        props.setOpen(false);
        setLoading(false);
      });
  };
  useEffect(() => {
    setImage(undefined);
  }, [server]);

  useEffect(() => {
    setTimeout(() => {
      if (inputRef.current && currentServer) {
        setInput(currentServer?.name);
        inputRef.current.focus();
      }
    }, 100);
  }, [props.open]);

  const resetHandle = () => {
    if (currentServer) {
      setInput(currentServer?.name);
      setImage(undefined);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  return (
    <Dialog.Root
      open={props.open}
      onOpenChange={props.setOpen}
    >
      <ModalContent className="w-[400px] flex items-center">
        <Dialog.Title className="text-2xl font-semibold mb-5">
          Setting Server
        </Dialog.Title>

        <div
          className={cn(
            "relative flex size-20 flex-col items-center justify-center rounded-full border-dashed border-white/75",
            !(previewUrl || currentServer?.profile_image) && "border-2"
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
          {previewUrl || currentServer?.profile_image ? (
            <img
              src={
                previewUrl ||
                process.env.NEXT_PUBLIC_HOST_API +
                  "img/" +
                  currentServer?.profile_image
              }
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
          Name
          <span className="text-red-500 ml-1">*</span>
        </h1>

        <input
          ref={inputRef}
          type="text"
          onChange={changeTextHandle}
          className="mb-2 w-full rounded-lg border-[#39393e] bg-[#212126] p-2 transition-all outline-none focus:border-[#5865f2] border-2"
          value={input}
        />

        <div className="mt-8 flex w-full justify-between">
          <button
            onClick={resetHandle}
            className="font-semibold cursor-pointer outline-none hover:underline px-2 py-2 text-[#5965f2]"
          >
            Reset
          </button>
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
              <span>Save</span>
            )}
          </button>
        </div>
      </ModalContent>
    </Dialog.Root>
  );
}
