import { atom } from "jotai";

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

export type Channel = {
  channel: ChannelList[];
  category: CategoryChannel[];
};

export const channelListAtom = atom<Channel>({
  channel: [],
  category: [],
});
