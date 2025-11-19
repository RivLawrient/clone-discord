import { AlertDialog, DropdownMenu } from "radix-ui";
import TooltipDesc from "../tooltip-desc";
import { apiCall } from "../../_helper/api-client";
import { XIcon } from "lucide-react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

export default function DropDownMoreFriendList(props: {
  children: React.ReactNode;
  user_id: string;
  name: string;
}) {
  return (
    <DropdownMenu.Root>
      <TooltipDesc
        side="top"
        text="More"
      >
        <DropdownMenu.Trigger asChild>{props.children}</DropdownMenu.Trigger>
      </TooltipDesc>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          asChild
          side="bottom"
          sideOffset={-20}
        >
          <div className="bg-list-border-3 mr-4 flex min-w-[180px] flex-col rounded-lg border border-[#35353c] p-2 text-white">
            <RemoveFriendAlert
              user_id={props.user_id}
              name={props.name}
            >
              <button className="cursor-pointer rounded-lg p-2 text-start text-xs font-semibold text-[#f57976] hover:bg-[#362a2e]">
                Remove Friend
              </button>
            </RemoveFriendAlert>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function RemoveFriendAlert(props: {
  children: React.ReactNode;
  user_id: string;
  name: string;
}) {
  const [open, setOpen] = useState(false);
  const accept_handle = () => {
    apiCall(`${process.env.NEXT_PUBLIC_HOST_API}friends/${props.user_id}`, {
      method: "DELETE",
    }).catch(() => {});
  };
  return (
    <AlertDialog.Root onOpenChange={(e) => setOpen(e)}>
      <AlertDialog.Trigger asChild>{props.children}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Description />
        <AlertDialog.Overlay className="fixed inset-0 bg-black/60" />
        <AlertDialog.Content
          className={twMerge(
            "bg-tooltip-bg border-btn-select-2 fixed top-1/2 left-1/2 w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-lg border p-6 text-white data-[state=closed]:animate-[dialog-hide_200ms] data-[state=open]:animate-[dialog-show_200ms]"
          )}
        >
          <AlertDialog.Cancel className="absolute top-2 right-2 cursor-pointer rounded-lg p-2 hover:bg-[#36363b]">
            <XIcon
              size={30}
              strokeWidth={1}
            />
          </AlertDialog.Cancel>

          <AlertDialog.Title className="mb-2 text-xl font-semibold">
            Remove '{props.name}'
          </AlertDialog.Title>
          <h1 className="mb-6 leading-4.5 brightness-60">
            Are you sure you want to remove adimas from your friends?
          </h1>

          <div className="flex flex-row gap-2">
            <AlertDialog.Cancel className="flex-1/2 cursor-pointer rounded-lg bg-[#2d2d32] p-2 font-semibold transition-all hover:bg-white/10">
              Cancel
            </AlertDialog.Cancel>
            <AlertDialog.Action
              onClick={accept_handle}
              className="flex-1/2 cursor-pointer rounded-lg bg-[#d22d39] p-2 font-semibold transition-all hover:bg-[#d22d39]/80"
            >
              Remove Friend
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
