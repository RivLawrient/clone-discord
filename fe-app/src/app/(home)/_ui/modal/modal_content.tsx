import { Dialog } from "radix-ui";
import { cn } from "../../_helper/cn";

export default function ModalContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Dialog.Content>) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black/60" />
      <Dialog.Content
        className={cn(
          "fixed top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg border border-[#3b3b41] bg-[#242429] p-4 px-6 text-white transition-all outline-none data-[state=closed]:animate-[modal-hide_200ms] data-[state=open]:animate-[modal-show_200ms]",
          className
        )}
        {...props}
      >
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}
