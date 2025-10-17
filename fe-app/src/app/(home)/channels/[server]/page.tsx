"use client";
import { useAtom } from "jotai";
import { notFound, useParams } from "next/navigation";
import { serverAtom } from "../../_state/server-atom";
import { useEffect } from "react";

export default function Page() {
  const [servers] = useAtom(serverAtom);
  const { server } = useParams();

  useEffect(() => {
    if (!servers.length) return; // tunggu data server terload

    const exists = servers.some((s) => s.id === server);

    if (!exists) {
      notFound(); // atau redirect("/somewhere")
    }
  }, [servers, server]);

  return <>{server}</>;
}
