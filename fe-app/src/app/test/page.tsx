"use client";

import { useRef, useState } from "react";

export default function Page() {
  const [disable, setDisable] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="bg-discord-bg grid h-screen w-screen grid-rows-[auto_1fr] text-white">
      <div className="h-[50px] bg-red-500">atas</div>
      <div className="grid min-h-0 grid-cols-[auto_auto_1fr]">
        <div className="bg-green-500">side</div>
        <div className="bg-yellow-500">innerside</div>
        <div className="min-h-0 bg-white/10">
          <div className="grid h-full min-h-0 grid-rows-[auto_1fr_auto]">
            <div>atas</div>
            <div
              onDoubleClick={() => {
                setDisable(false);
                setTimeout(() => inputRef.current?.focus(), 0);
              }}
              className="overflow-y-auton m-2 flex min-h-0 rounded-lg border border-white/10 p-3 transition-all outline-none select-none focus:border-white"
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Tulis..."
                disabled={disable}
                className="outline-none"
                onBlur={() => setDisable(true)}
              />
            </div>
            <div>bawah</div>
          </div>
        </div>
      </div>
    </div>
  );
}
