import { ServerList } from "@/app/(home)/_state/server-atom";
import { Trash2Icon } from "lucide-react";
import { Dialog } from "radix-ui";
import { SetStateAction } from "react";

export default function ModalSetting(props: {
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
  data: ServerList;
}) {
  return (
    <Dialog.Root
      open={props.open}
      onOpenChange={props.setOpen}
    >
      <Dialog.Portal>
        <Dialog.Content className="fixed top-0 right-0 bottom-0 left-0 flex min-h-0 outline-none">
          <Dialog.Title />
          <div className="flex min-h-0 grow justify-end overflow-y-scroll bg-[#121214] text-white">
            <div className="flex min-h-0 w-[250px] shrink-0 flex-col pt-[60px] pr-4">
              {/* <h1 className="text-xs font-semibold">{props.data.name}</h1> */}

              <button className="flex cursor-pointer justify-between rounded-lg p-1.5 px-2 text-start font-semibold text-[#f57976] hover:bg-[#221517] outline-none">
                Delete Server
                <Trash2Icon
                  size={18}
                  className="my-auto"
                />
              </button>
            </div>
          </div>
          <div className="flex min-h-0 grow justify-start overflow-y-scroll bg-[#202024]">
            <div className="relative min-h-0 w-[800px] shrink-0 px-10 pt-[60px] text-white">
              {/* <EscBtn /> */}
              {/* {CurrentTab && <CurrentTab />} */}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
