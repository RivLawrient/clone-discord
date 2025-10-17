import { serverAtom } from "@/app/(home)/_state/server-atom";
import { useAtom } from "jotai";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function useRightClickMenuMainSection() {
  const [openChannel, setOpenChannel] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);
  const [openInvite, setOpenInvite] = useState(false);
  const [servers] = useAtom(serverAtom);
  const { server } = useParams();
  const currentServer = servers?.find((v) => v.id === server);

  return {
    openChannel,
    setOpenChannel,
    openCategory,
    setOpenCategory,
    openInvite,
    setOpenInvite,
    currentServer,
  };
}
