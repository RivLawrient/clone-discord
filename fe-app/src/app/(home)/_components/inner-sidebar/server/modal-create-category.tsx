import { cn } from "@/app/(home)/_helper/cn";
import ModalContent from "@/app/(home)/_ui/modal/modal_content";
import { Dialog } from "radix-ui";
import { SetStateAction } from "react";

export function ModalCreateCategory(props: {
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
  input: string;
  setInput: React.Dispatch<SetStateAction<string>>;
  handle: () => void;
  loading: boolean;
}) {
  return (
    <Dialog.Root
      open={props.open}
      onOpenChange={props.setOpen}
    >
      <ModalContent className="flex flex-col w-[400px]">
        <Dialog.Title className="font-semibold text-xl ">
          Create Category
        </Dialog.Title>
        <div className="flex flex-col mt-2">
          <h1 className="font-semibold">Category Name</h1>
          <input
            type="text"
            value={props.input}
            onChange={(e) => props.setInput(e.target.value)}
            placeholder="New Category"
            className="p-2 outline-none bg-[#202024] border border-[#4c4c50] rounded-lg focus:border-[#5865f2]"
          />
        </div>
        <div className="flex gap-3 justify-end mt-10">
          <button
            onClick={() => props.setOpen(false)}
            className="py-2 px-6 font-semibold bg-[#2d2d32] cursor-pointer hover:bg-[#36363b] transition-all rounded-lg"
          >
            Cancel
          </button>
          <button
            disabled={props.input.length == 0 || props.loading}
            onClick={props.handle}
            className={cn(
              "py-2 px-6 font-semibold rounded-lg cursor-pointer bg-[#5865f2] transition-all",
              props.input.length == 0 || props.loading
                ? "brightness-50 cursor-not-allowed"
                : "hover:bg-[#5865f2]/60"
            )}
          >
            Create Category
          </button>
        </div>
      </ModalContent>
    </Dialog.Root>
  );
}
