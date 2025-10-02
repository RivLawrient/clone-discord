import { atom } from "jotai";

export type MediaStatus = {
  micOn: boolean;
  speakerOn: boolean;
};

export const mediaAtom = atom<MediaStatus>({
  micOn: false,
  speakerOn: true,
});

export const inputDevicesAtom = atom<MediaDeviceInfo[]>([]);
export const outputDevicesAtom = atom<MediaDeviceInfo[]>([]);

export const selectedInputAtom = atom<string | null>(null); // deviceId
export const selectedOutputAtom = atom<string | null>(null); // device
