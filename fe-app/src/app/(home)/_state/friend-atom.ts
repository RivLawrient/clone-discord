import { atom } from "jotai";
import { USER_STATUS } from "./user-atom";

export type FriendList = {
  user_id: string;
  is_pending: boolean;
  name: string;
  username: string;
  avatar: string;
  status_activity: keyof typeof USER_STATUS;
};

export type GroupFriend = {
  all: FriendList[];
  sent: FriendList[];
  request: FriendList[];
};

export const friendAtom = atom<GroupFriend>({
  all: [],
  sent: [],
  request: [],
});
