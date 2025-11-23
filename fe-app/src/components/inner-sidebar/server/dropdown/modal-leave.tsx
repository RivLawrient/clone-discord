import { apiCall } from "@/app/(home)/_helper/api-client";
import { cn } from "@/app/(home)/_helper/cn";
import { serverAtom, ServerList } from "@/app/(home)/_state/server-atom";
import ModalContent from "@/components/modal_content";
import { useAtom } from "jotai";
import { useParams } from "next/navigation";
import { Dialog } from "radix-ui";
import { SetStateAction } from "react";

export default function ModalLeave(props: {
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
}) {
  const [servers, setServers] = useAtom(serverAtom);
  const { server } = useParams();
  const currentServer = servers.find((v) => v.id === server);

  const leaveHandle = () => {
    apiCall(
      `${process.env.NEXT_PUBLIC_HOST_API}server/me/${currentServer?.id}`,
      {
        method: "DELETE",
      }
    )
      .then(async (resp) => {
        const res = await resp.json();
        if (resp.ok) {
          const data: ServerList = res.data;
          setServers((v) => v.filter((vv) => vv.id != data.id));
        }
      })
      .catch(() => {})
      .finally(() => {
        props.setOpen(false);
      });
  };
  return (
    <Dialog.Root
      open={props.open}
      onOpenChange={props.setOpen}
    >
      <ModalContent className="w-[400px]">
        <Dialog.Title className="text-xl font-semibold mb-4">
          Leave '{currentServer?.name}' ?
        </Dialog.Title>
        <Dialog.Description className="font-semibold mb-8">
          Are you sure you want to leave <strong>{currentServer?.name}</strong>
          ? <br />
          You won't be able to rejoin this server unless you are re-invited.
        </Dialog.Description>

        <div className="grow flex justify-end gap-3 font-semibold">
          <button
            onClick={() => props.setOpen(false)}
            className="py-2 rounded-lg bg-[#2d2d32] flex-1/2 cursor-pointer transition-all hover:brightness-125 outline-none"
          >
            Cancel
          </button>
          <button
            onClick={leaveHandle}
            className={cn(
              "py-2 rounded-lg bg-[#d12d38] hover:bg-[#d12d38]/60 flex-1/2 cursor-pointer transition-all "
            )}
          >
            Leave Server
          </button>
        </div>
      </ModalContent>
    </Dialog.Root>
  );
}
