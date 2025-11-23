import { cn } from "@/app/(home)/_helper/cn";
import { ServerList } from "@/app/(home)/_state/server-atom";
import {
  ImageUpIcon,
  LogOutIcon,
  LucideIcon,
  SettingsIcon,
  TextCursorIcon,
  Trash2Icon,
  UserPlus2Icon,
} from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { SetStateAction, useState } from "react";
import ModalDelete from "./modal-delete";
import ModalLeave from "./modal-leave";
import { ModalInviteFriend } from "@/app/(home)/_components/inner-sidebar/server/modal-invite-friend";
import ModalSetting from "./modal-setting";

export default function DropdownMenuServer(props: {
  children: React.ReactNode;
  data: ServerList;
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
}) {
  const [openSetting, setOpenSetting] = useState(false);
  const [openInvite, setOpenInvite] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openLeave, setOpenLeave] = useState(false);

  return (
    <>
      <ModalInviteFriend
        open={openInvite}
        setOpen={setOpenInvite}
      />
      {/* <ModalInvite
        open={openInvite}
        setOpen={setOpenInvite}
      /> */}
      <ModalSetting
        open={openSetting}
        setOpen={setOpenSetting}
      />
      <ModalDelete
        open={openDelete}
        setOpen={setOpenDelete}
      />
      <ModalLeave
        open={openLeave}
        setOpen={setOpenLeave}
      />
      <DropdownMenu.Root
        open={props.open}
        onOpenChange={props.setOpen}
      >
        <DropdownMenu.Trigger asChild>{props.children}</DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            sideOffset={5}
            className="w-52 origin-top rounded-lg border border-[#36363b] bg-[#28282d] p-2 text-white outline-none data-[state=open]:animate-[dropdown-show_200ms]"
          >
            <Item
              icon={UserPlus2Icon}
              label="Invite People"
              setOpen={setOpenInvite}
              varian="primary"
            />
            {props.data.is_owner ? (
              <>
                <Separator />
                <Item
                  icon={SettingsIcon}
                  label="Setting Server"
                  setOpen={setOpenSetting}
                  varian="primary"
                />
                <Item
                  icon={Trash2Icon}
                  label="Delete Server"
                  setOpen={setOpenDelete}
                  varian="secondary"
                />
              </>
            ) : (
              <>
                <Separator />
                <Item
                  icon={LogOutIcon}
                  label="Leave Server"
                  setOpen={setOpenLeave}
                  varian="secondary"
                />
              </>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </>
  );
}

function Item(props: {
  label: string;
  icon: LucideIcon;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
  varian: "primary" | "secondary";
}) {
  return (
    <DropdownMenu.Item
      onClick={() => props.setOpen(true)}
      className={cn(
        "group flex cursor-pointer justify-between rounded-sm p-2 text-sm font-semibold transition-all outline-none ",
        props.varian == "primary" && "hover:bg-[#313136] text-white",
        props.varian == "secondary" && "hover:bg-[#362a2e] text-[#f47976]"
      )}
    >
      <span>{props.label}</span>
      <props.icon
        size={20}
        strokeWidth={2.5}
        className="brightness-75 transition-all group-hover:brightness-100"
      />
    </DropdownMenu.Item>
  );
}

function Separator() {
  return <hr className="my-2 border-r border-[#36363b]" />;
}
