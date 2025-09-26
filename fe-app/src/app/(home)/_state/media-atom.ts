import { atom } from "jotai";

export type MediaStatus = {
  micOn: boolean;
  speakerOn: boolean;
};

export const mediaAtom = atom<MediaStatus>({
  micOn: false,
  speakerOn: false,
});
