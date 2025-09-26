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
  avatar_bg: string;
  banner_color: string;
  status_activity: keyof typeof USER_STATUS;
};

export const userAtom = atom<UserCurrent>({
  email: "sandincl.d@gm.com",
  name: "muhsandisv",
  username: "lawrient",
  bio: "",
  avatar: "s",
  avatar_bg: "#dddddd",
  banner_color: "#ffffff",
  status_activity: "Do Not Disturb",
});
