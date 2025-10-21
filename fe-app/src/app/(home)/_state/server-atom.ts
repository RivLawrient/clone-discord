import { atom } from "jotai";
import { CategoryChannel, ChannelList } from "./channel-list-atom";

export type ServerList = {
  id: string;
  name: string;
  profile_image: string;
  invite_code: string;
  position: number;
  is_owner: boolean;
  list: {
    channel: ChannelList[];
    category: CategoryChannel[];
  };
};

export const serverAtom = atom<ServerList[]>([]);
