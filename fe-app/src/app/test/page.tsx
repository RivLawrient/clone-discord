"use client";

import { useState } from "react";

export default function Page() {
  const [on, setOn] = useState(false);
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <button onClick={() => setOn(!on)} className="bg-blue-50">
        pencet
      </button>
      {on && (
        <div
          className={`size-[200px] rounded-lg bg-red-500 transition-all duration-300 ${on ? "visible translate-0 opacity-100" : "invisible -translate-y-5 opacity-0"}`}
        />
      )}
      {/* {on && (
        <div
          className={`size-[200px] bg-red-500 transition-all delay-300 duration-300 ${!on && "-translate-y-5 opacity-0"}`}
        />
      )} */}
    </div>
  );
}
