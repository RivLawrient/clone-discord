"use client";
import { serverAtom } from "@/app/(home)/_state/server-atom";
import { useAtom } from "jotai";
import ServerBtn from "./server-btn";
import { useState } from "react";

export default function ServerListSection() {
  const [servers] = useAtom(serverAtom);
  const [isDrag, setIsDrag] = useState(false);
  const [whoDrag, setWhoDrag] = useState(0);
  const [idDrag, setIdDrag] = useState("");

  if (servers.length > 0)
    return (
      <ul className="flex flex-col gap-2">
        {servers
          .sort((a, b) => a.position - b.position)
          .map((v, i) => (
            <ServerBtn
              key={i}
              data={v}
              isDrag={isDrag}
              setIsDrag={setIsDrag}
              whoDrag={whoDrag}
              setWhoDrag={setWhoDrag}
              idDrag={idDrag}
              setIdDrag={setIdDrag}
            />
          ))}
      </ul>
    );
}
