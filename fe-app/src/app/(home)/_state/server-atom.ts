import { randomUUID } from "crypto";
import { atom } from "jotai";

export type ServerList = {
  id: string;
  name: string;
  position: number;
};

// const server: ServerList[] = Array.from({ length: 30 }, (_, i) => ({
//   id: i.toString(),
//   name: i + "_sserver-" + i,
//   position: i,
// }));

export const serverAtom = atom<ServerList[]>([]);
