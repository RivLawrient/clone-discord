import { atom } from "jotai";

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

export type ChannelList = {
  id: string;
  type: "text" | "voice";
  name: string;
  position: number;
};

export type CategoryChannel = {
  id: string;
  name: string;
  position: number;
  channel: ChannelList[];
};

export const serverAtom = atom<ServerList[]>([]);
