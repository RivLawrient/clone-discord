import { apiCall } from "@/app/(home)/_helper/api-client";
import { cn } from "@/app/(home)/_helper/cn";
import { ChannelList } from "@/app/(home)/_state/channel-list-atom";
import ModalContent from "@/app/(home)/_ui/modal/modal_content";
import { Dialog } from "radix-ui";
import { SetStateAction, useEffect, useState } from "react";

export default function ModalRenameChannel(props: {
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
  data: ChannelList;
}) {
  const [input, setInput] = useState("");

  const inputHandle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const saveHandle = () => {
    apiCall(
      `${process.env.NEXT_PUBLIC_HOST_API}server/channel/${props.data.id}`,
      {
        method: "POST",
        body: JSON.stringify({
          name: input,
        }),
      }
    ).finally(() => {
      props.setOpen(false);
    });
  };

  useEffect(() => {
    setInput(props.data.name);
  }, [props.open]);
  return (
    <Dialog.Root
      open={props.open}
      onOpenChange={props.setOpen}
    >
      <ModalContent className="w-[400px]">
        <Dialog.Title className="text-xl font-semibold mb-4">
          Rename '{props.data.name}'
        </Dialog.Title>

        <h1 className=" mr-auto mb-2 font-semibold">
          Name Channel
          <span className="text-red-500 ml-1">*</span>
        </h1>

        <input
          // ref={inputRef}
          type="text"
          onChange={inputHandle}
          className="mb-8 w-full rounded-lg border-[#39393e] bg-[#212126] p-2 transition-all outline-none focus:border-[#5865f2] border-2 "
          value={input}
        />
        <div className="grow flex justify-end gap-3 font-semibold">
          <button
            onClick={() => props.setOpen(false)}
            className="py-2 rounded-lg bg-[#2d2d32] flex-1/2 cursor-pointer transition-all hover:brightness-125 outline-none"
          >
            Cancel
          </button>
          <button
            // disabled={props.loading}
            onClick={saveHandle}
            className={cn(
              "py-2 rounded-lg bg-[#5965f2] hover:bg-[#5965f2]/60 flex-1/2 cursor-pointer transition-all "
              // props.loading && "brightness-50 cursor-not-allowed"
            )}
          >
            Save
          </button>
        </div>
      </ModalContent>
    </Dialog.Root>
  );
}
