import { atom } from "jotai";

export type UserCurrent = {
  email: string;
  name: string;
  username: string;
  bio: string;
  avatar: string;
};

export const userAtom = atom<UserCurrent>({
  email: "",
  name: "",
  username: "",
  bio: "",
  avatar: "",
});
