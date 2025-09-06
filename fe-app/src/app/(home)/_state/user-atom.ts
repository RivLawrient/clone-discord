import { atom } from "jotai";

export const USER_STATUS = {
  Online: "bg-[#42a25a]",
  Invisible: "bg-[#81828a]",
  Idle: "bg-[#ca9654]",
  "Do Not Disturb": "bg-[#d83a42]",
} as const;

export type UserCurrent = {
  email: string;
  name: string;
  username: string;
  bio: string;
  avatar: string;
  status_activity: keyof typeof USER_STATUS;
};

export const userAtom = atom<UserCurrent>({
  email: "",
  name: "",
  username: "",
  bio: "",
  avatar: "",
  status_activity: "Invisible",
});
