import ModalContent from "@/components/modal_content";
import { Dialog } from "radix-ui";
import { SetStateAction } from "react";

export default function ModalInvite(props: {
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <Dialog.Root
      open={props.open}
      onOpenChange={props.setOpen}
    >
      <ModalContent>
        <Dialog.Title>invite friend</Dialog.Title>
      </ModalContent>
    </Dialog.Root>
  );
}
