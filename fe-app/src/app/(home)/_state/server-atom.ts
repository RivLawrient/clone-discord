import { atom } from "jotai";
import { CategoryChannel, ChannelList } from "./channel-list-atom";

export type ServerList = {
  id: string;
  name: string;
  profile_image: string;
  invite_code: string;
  position: number;
  is_owner: boolean;
};

export const serverAtom = atom<ServerList[]>([]);
