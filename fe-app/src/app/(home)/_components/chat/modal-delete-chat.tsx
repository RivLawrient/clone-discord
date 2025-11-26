import { cn } from "@/app/(home)/_helper/cn";
import {
  CategoryChannel,
  ChannelList,
} from "@/app/(home)/_state/channel-list-atom";
import ModalContent from "@/app/(home)/_ui/modal/modal_content";
import { SetStateAction } from "jotai";
import { Dialog } from "radix-ui";
import { ChatList } from "./useTextChannelView";
import { apiCall } from "../../_helper/api-client";

export default function ModalDeleteChat(props: {
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
  data: ChatList;
  is_dm?: boolean;
}) {
  const deleteHandle = () => {
    if (props.is_dm) {
      apiCall(`${process.env.NEXT_PUBLIC_HOST_API}dm/text/${props.data.id}`, {
        method: "DELETE",
      })
        .catch(() => {})
        .finally(() => {
          props.setOpen(false);
        });
    } else {
      apiCall(
        `${process.env.NEXT_PUBLIC_HOST_API}message/chat/${props.data.id}`,
        {
          method: "DELETE",
        }
      )
        .catch(() => {})
        .finally(() => {
          props.setOpen(false);
        });
    }
  };
  return (
    <Dialog.Root
      open={props.open}
      onOpenChange={props.setOpen}
    >
      <ModalContent className="w-[400px]">
        <Dialog.Title className="text-xl font-semibold mb-4">
          Delete Message ?
        </Dialog.Title>
        <Dialog.Description className="font-semibold mb-8">
          Are you sure you want to message
          <br />
          This action cannot be undone.
        </Dialog.Description>

        <div className="grow flex justify-end gap-3 font-semibold">
          <button
            onClick={() => props.setOpen(false)}
            className="py-2 rounded-lg bg-[#2d2d32] flex-1/2 cursor-pointer transition-all hover:brightness-125 outline-none"
          >
            Cancel
          </button>
          <button
            // disabled={props.loading}
            onClick={deleteHandle}
            className={cn(
              "py-2 rounded-lg bg-[#d12d38] hover:bg-[#d12d38]/60 flex-1/2 cursor-pointer transition-all "
              // props.loading && "brightness-50 cursor-not-allowed"
            )}
          >
            Delete Message
          </button>
        </div>
      </ModalContent>
    </Dialog.Root>
  );
}
