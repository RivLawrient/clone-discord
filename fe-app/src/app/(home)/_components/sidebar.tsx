"use client";
import { usePathname, useRouter } from "next/navigation";
import { SetStateAction, useState } from "react";
import { twMerge } from "tailwind-merge";

interface Server {
  id: string;
  name: string;
  picture: string;
  position: number;
}

// const server: Server[] = Array.from({ length: 28 }, (_, i) => ({
//   id: crypto.randomUUID(),
//   name: `Server ${i + 1}`,
//   picture: `https://via.placeholder.com/40x40.png?text=${i + 1}`,
//   position: i + 1,
// }));
const server: Server[] = Array.from({ length: 28 }, (_, i) => ({
  id: `server-${i + 1}`, // ID stabil dan konsisten di SSR & CSR
  name: `Server ${i + 1}`,
  picture: `https://via.placeholder.com/40x40.png?text=${i + 1}`,
  position: i + 1,
}));

export default function Sidebar() {
  const [list, setList] = useState(server);
  const [drag, setDrag] = useState<number>(0);

  return (
    <div className="flex min-h-0 flex-col gap-y-2 overflow-y-scroll select-none">
      <div className="" />
      {list
        .sort((a, b) => a.position - b.position)
        .map((v, i, a) => (
          <ServerBtn
            key={i}
            id={v.id}
            position={v.position}
            label={v.name}
            is_last={i === a.length - 1}
            drag={drag}
            setDrag={setDrag}
            setList={setList}
          />
        ))}
    </div>
  );
}

function ServerBtn(props: {
  label: string;
  is_last?: boolean;
  id: string;
  position: number;
  drag: number;
  setDrag: React.Dispatch<SetStateAction<number>>;
  setList: React.Dispatch<SetStateAction<Server[]>>;
}) {
  const router = useRouter();
  const path_channel = usePathname().split("/")[2];

  const img = props.id === server[0].id && "/goku.jpg";
  return (
    <div className="relative bg-black">
      <DragZone
        id={props.id}
        posisiton={props.position}
        drag={props.drag}
        setList={props.setList}
      />
      <div
        draggable
        onDragStart={() => props.setDrag(props.position)}
        onClick={() => router.push("/channels/" + props.id)}
        className={twMerge(
          "peer mx-4 flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-white font-semibold text-black",
        )}
      >
        {img ? (
          <img
            draggable={false}
            src={img}
            className="size-10 object-cover select-none"
          />
        ) : (
          props.label[0].toUpperCase()
        )}
      </div>
      <div
        className={twMerge(
          "absolute top-0 bottom-0 left-0 w-1 self-center rounded-r-lg bg-white transition-all",
          path_channel === props.id ? "h-10" : "h-0 peer-hover:h-5",
        )}
      />
      {props.is_last && (
        <DragZone
          id={props.id}
          on_last={props.is_last}
          posisiton={props.position}
          drag={props.drag}
          setList={props.setList}
        />
      )}
    </div>
  );
}

function DragZone(props: {
  id: string;
  on_last?: boolean;
  posisiton: number;
  drag: number;
  setList: React.Dispatch<SetStateAction<Server[]>>;
}) {
  const [enter, setEnter] = useState(false);

  return (
    <>
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          if (props.posisiton != props.drag) setEnter(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setEnter(false);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        }}
        onDrop={(e) => {
          e.preventDefault();
          let zone =
            props.posisiton > props.drag
              ? props.posisiton - 1
              : props.posisiton;

          zone = props.on_last ? zone + 1 : zone;

          if (props.posisiton != props.drag) {
            setEnter(false);
            // console.log(zone, props.drag);

            // drag ke atas
            zone < props.drag &&
              props.setList((v) =>
                v.map((vv) =>
                  vv.position >= zone && vv.position < props.drag
                    ? { ...vv, position: vv.position + 1 }
                    : vv.position === props.drag
                      ? { ...vv, position: zone }
                      : vv,
                ),
              );

            // drag ke bawah
            zone > props.drag &&
              props.setList((v) =>
                v.map((vv) =>
                  vv.position <= zone && vv.position > props.drag
                    ? { ...vv, position: vv.position - 1 }
                    : vv.position === props.drag
                      ? { ...vv, position: zone }
                      : vv,
                ),
              );
          }
        }}
        className={twMerge(
          "absolute z-10 h-5 w-full",
          props.on_last ? "-bottom-3.5" : "-top-3.5",
        )}
      />
      <div
        className={twMerge(
          "absolute h-2 w-full rounded-lg",
          enter && "bg-green-500",
          props.on_last ? "-bottom-2" : "-top-2",
        )}
      />
    </>
  );
}
