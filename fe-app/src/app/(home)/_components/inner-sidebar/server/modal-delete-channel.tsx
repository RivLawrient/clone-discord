import { cn } from "@/app/(home)/_helper/cn";
import {
  CategoryChannel,
  ChannelList,
} from "@/app/(home)/_state/channel-list-atom";
import ModalContent from "@/app/(home)/_ui/modal/modal_content";
import { SetStateAction } from "jotai";
import { Dialog } from "radix-ui";

export default function ModalDeleteChannel(props: {
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
  data: ChannelList;
  dataCategory?: CategoryChannel;
  loading: boolean;
  handle: (id: string, categoryId?: string) => void;
}) {
  return (
    <Dialog.Root
      open={props.open}
      onOpenChange={props.setOpen}
    >
      <ModalContent className="w-[400px] flex flex-col">
        <Dialog.Title className="text-xl font-semibold">
          Delete Channel
        </Dialog.Title>
        <div className="brightness-75 text-[15px]">
          <h1>
            Are you sure you want to delete{" "}
            <span className="font-semibold">{props.data.name}?</span>
          </h1>
          <h1>This cannot be undone.</h1>
        </div>
        <div className="font-semibold flex flex-row gap-2 mt-5">
          <button
            onClick={() => props.setOpen(false)}
            className="py-2 rounded-lg bg-[#2d2d32] flex-1/2 cursor-pointer transition-all hover:brightness-125"
          >
            Cancel
          </button>
          <button
            disabled={props.loading}
            onClick={() => props.handle(props.data.id, props.dataCategory?.id)}
            className={cn(
              "py-2 rounded-lg bg-[#d12d38] hover:bg-[#d12d38]/60 flex-1/2 cursor-pointer transition-all ",
              props.loading && "brightness-50 cursor-not-allowed"
            )}
          >
            Delete Category
          </button>
        </div>
      </ModalContent>
    </Dialog.Root>
  );
}
