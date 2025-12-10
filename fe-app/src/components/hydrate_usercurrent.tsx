"use client";
import { addHydrationProgress } from "@/state/hydration-atom";
import { userAtom, UserCurrent } from "@/state/user-atom";
import { useAtom } from "jotai";
import { useEffect } from "react";

export default function HydrateUserCurrent(props: { data: UserCurrent }) {
  const [, setUser] = useAtom(userAtom);
  const [, addProgress] = useAtom(addHydrationProgress);

  useEffect(() => {
    setUser(props.data);
    addProgress();
  }, [props.data]);

  return null;
}
