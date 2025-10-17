import ModalContent from "@/app/(home)/_ui/modal/modal_content";
import { ContextMenu, Dialog } from "radix-ui";
import { SetStateAction, useState } from "react";
import { ModalInviteFriend } from "./modal-invite-friend";
import useRightClickMenuMainSection from "./useRightClickMenuMainSection";

export function RightClickMenuMainSection(props: {
  children: React.ReactNode;
}) {
  const {
    openCategory,
    setOpenCategory,
    openChannel,
    setOpenChannel,
    openInvite,
    setOpenInvite,
    currentServer,
  } = useRightClickMenuMainSection();

  return (
    <>
      <ModalCreateChannel
        open={openChannel}
        setOpen={setOpenChannel}
      />
      <ModalCreateCategory
        open={openCategory}
        setOpen={setOpenCategory}
      />
      <ModalInviteFriend
        open={openInvite}
        setOpen={setOpenInvite}
      />
      <ContextMenu.Root>
        <ContextMenu.Trigger asChild>{props.children}</ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content className="bg-[#28282d] p-2 border border-[#36363b] rounded-lg text-white text-sm font-semibold">
            {currentServer?.is_owner && (
              <>
                <ContextMenu.Item
                  onClick={() => setOpenChannel(true)}
                  className="p-2 rounded-lg hover:bg-[#313136] outline-none cursor-pointer transition-all"
                >
                  Create Channel
                </ContextMenu.Item>
                <ContextMenu.Item
                  onClick={() => setOpenCategory(true)}
                  className="p-2 rounded-lg hover:bg-[#313136] outline-none cursor-pointer transition-all"
                >
                  Create Category
                </ContextMenu.Item>
              </>
            )}
            <ContextMenu.Item
              onClick={() => setOpenInvite(true)}
              className="p-2 rounded-lg hover:bg-[#313136] outline-none cursor-pointer transition-all"
            >
              Invite People
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>
    </>
  );
}

function ModalCreateChannel(props: {
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <Dialog.Root
      open={props.open}
      onOpenChange={props.setOpen}
    >
      <ModalContent>
        <Dialog.Title>create channel</Dialog.Title>
      </ModalContent>
    </Dialog.Root>
  );
}

function ModalCreateCategory(props: {
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <Dialog.Root
      open={props.open}
      onOpenChange={props.setOpen}
    >
      <ModalContent>
        <Dialog.Title>create category</Dialog.Title>
      </ModalContent>
    </Dialog.Root>
  );
}
