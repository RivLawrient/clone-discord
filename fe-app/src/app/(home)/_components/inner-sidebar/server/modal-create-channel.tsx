import { cn } from "@/app/(home)/_helper/cn";
import { CategoryChannel } from "@/app/(home)/_state/channel-list-atom";
import ModalContent from "@/app/(home)/_ui/modal/modal_content";
import { HashIcon, LucideIcon, Volume2Icon } from "lucide-react";
import { Dialog } from "radix-ui";
import { SetStateAction } from "react";

export function ModalCreateChannel(props: {
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
  onCategory: boolean;
  isVoice: boolean;
  changeRadioTextHandle: () => void;
  changeRadioVoiceHandle: () => void;
  input: string;
  setInput: React.Dispatch<SetStateAction<string>>;
  handle: () => void;
  handle2: (categoryId: string) => void;
  loading: boolean;
  categoryData?: CategoryChannel;
}) {
  return (
    <Dialog.Root
      open={props.open}
      onOpenChange={props.setOpen}
    >
      <ModalContent className="flex flex-col ">
        <Dialog.Title className="font-semibold text-xl">
          Create Channel
        </Dialog.Title>
        {props.onCategory && <span>in category</span>}
        <div className="flex flex-col gap-2">
          <h1 className="font-semibold">Channel Type</h1>
          {/* radio */}
          <RadioBtnType
            isSelected={!props.isVoice}
            handle={props.changeRadioTextHandle}
            Icon={HashIcon}
            label="Text"
            desc="Send messages, images, GIFs, emoji, opinions, and puns"
          />
          <RadioBtnType
            isSelected={props.isVoice}
            handle={props.changeRadioVoiceHandle}
            Icon={Volume2Icon}
            label="Voice"
            desc="Hang out together with voice, video, and screen share"
          />
        </div>
        <div className="flex flex-col">
          <h1 className="font-semibold mb-1">Channel Name</h1>
          <div className="flex flex-row p-2 rounded-lg border focus-within::border-[#5865f2] border-[#4c4c50] bg-[#202024] gap-2 items-center ">
            <div>
              {props.isVoice ? (
                <Volume2Icon size={16} />
              ) : (
                <HashIcon size={16} />
              )}
            </div>
            <input
              type="text"
              value={props.input}
              onChange={(e) => props.setInput(e.target.value)}
              placeholder="New Category"
              className="outline-none grow"
            />
          </div>
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
            onClick={() => {
              props.categoryData
                ? props.handle2(props.categoryData.id)
                : props.handle();
            }}
            className={cn(
              "py-2 px-6 font-semibold rounded-lg cursor-pointer bg-[#5865f2] transition-all",
              props.input.length == 0 || props.loading
                ? "brightness-50 cursor-not-allowed"
                : "hover:bg-[#5865f2]/60"
            )}
          >
            Create Channel
          </button>
        </div>
      </ModalContent>
    </Dialog.Root>
  );
}

function RadioBtnType(props: {
  isSelected: boolean;
  handle: () => void;
  Icon: LucideIcon;
  label: string;
  desc: string;
}) {
  return (
    <button
      onClick={props.handle}
      className={cn(
        "transition-all rounded-lg flex flex-row p-4 outline-none gap-2 items-center",
        props.isSelected ? "bg-[#2d2d32]" : "hover:bg-[#2d2d32]"
      )}
    >
      <div>
        <div
          className={cn(
            "rounded-full size-5",
            props.isSelected ? "bg-[#5865f2]" : "border border-white"
          )}
        />
      </div>
      <div>
        <props.Icon
          size={24}
          className="brightness-75"
        />
      </div>
      <div className="text-start">
        <h1 className="font-semibold">{props.label}</h1>
        <h2 className="text-sm whitespace-nowrap">{props.desc} </h2>
      </div>
    </button>
  );
}
