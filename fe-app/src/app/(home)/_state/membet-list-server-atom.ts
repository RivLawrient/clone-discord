import { atom } from "jotai";
import { USER_STATUS } from "./user-atom";

export type MemberList = {
  user_id: string;
  name: string;
  username: string;
  avatar: string;
  avatar_bg: string;
  status_activity: keyof typeof USER_STATUS;
  bio: string;
  banner_color: string;
};

export const memberListServerAtom = atom<MemberList[]>([]);

