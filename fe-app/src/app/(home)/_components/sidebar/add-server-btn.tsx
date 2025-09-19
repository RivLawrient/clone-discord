import { twMerge } from "tailwind-merge";
import TooltipDesc from "../tooltip-desc";
import {
  CameraIcon,
  ChevronRightIcon,
  PenSquareIcon,
  PlusCircleIcon,
  PlusIcon,
} from "lucide-react";
import { Dialog } from "radix-ui";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { SetStateAction, useAtom } from "jotai";
import { userAtom } from "../../_state/user-atom";

export default function AddServerBtn() {
  return (
    <div className="relative flex">
      <ModalCreateServer>
        <div
          className={twMerge(
            "bg-server-btn-bg hover:bg-server-btn-hover group mx-4 size-10 cursor-pointer rounded-xl font-semibold",
          )}
        >
          <TooltipDesc text="Add a Server" side={"right"} is_child>
            <div className="size-full cursor-pointer">
              <PlusCircleIcon className="text-server-btn-bg group-hover:text-server-btn-hover m-2 cursor-pointer fill-white" />
            </div>
          </TooltipDesc>
        </div>
      </ModalCreateServer>
    </div>
  );
}

function ModalCreateServer(props: { children: React.ReactNode }) {
  const [animate, setAnimate] = useState(false);

  const [current, setCurrent] = useState(0);
  const [next, setNext] = useState(0);
  const [create, setCreate] = useState(false);
  return (
    <Dialog.Root
      onOpenChange={(e) => {
        setTimeout(() => {
          setCurrent(0);
          setNext(0);
          setCreate(false);
        }, 300);
      }}
    >
      <Dialog.Trigger asChild className="outline-none">
        {props.children}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60" />
        <Dialog.Content className="bg-tooltip-bg border-btn-select-2 fixed top-1/2 left-1/2 flex w-[420px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border text-white transition-all data-[state=closed]:animate-[modal-hide_200ms] data-[state=open]:animate-[modal-show_200ms]">
          {current === 0 && (
            <Step
              current={current}
              next={next}
              setCurrent={setCurrent}
              setNext={setNext}
              setCreate={setCreate}
            />
          )}

          {current === 1 && create && (
            <StepCreate
              current={current}
              next={next}
              setCurrent={setCurrent}
              setNext={setNext}
            />
          )}
          {current === 1 && !create && (
            <StepJoin
              current={current}
              next={next}
              setCurrent={setCurrent}
              setNext={setNext}
            />
          )}
          <Dialog.Description />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Step(props: {
  current: number;
  next: number;
  setCurrent: React.Dispatch<SetStateAction<number>>;
  setNext: React.Dispatch<SetStateAction<number>>;
  setCreate: React.Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div
      className={twMerge(
        "flex flex-col items-center p-6",
        // props.next === 1 && props.current === 0 && "animate-[to-left_300ms]",
        // props.next === 0 && props.current === 1 && "animate-[from-left_300ms]",
        // props.prev === 1 && props.create && "animate-[to-left_300ms]",
        // props.prev === 1 && !props.create && "animate-[to-left_300ms]",
        // props.prev === 1 && "animate-[to-left_300ms]",
        // !props.create && props.prev === 1 && "animate-[from-left_300ms]",
      )}
    >
      <Dialog.Title className="text-2xl font-semibold">
        Create Your Server
      </Dialog.Title>
      <span className="mt-2 mb-6 text-center leading-5">
        Your server is where you and your friends hang out. Make yours and start
        talking.
      </span>
      <button
        onClick={() => {
          props.setCreate(true);
          props.setNext(1);
          setTimeout(() => {
            props.setCurrent(1);
          }, 200);
        }}
        className="flex w-full cursor-pointer items-center rounded-lg border border-[#36363d] bg-[#29292d] transition-all outline-none hover:brightness-110"
      >
        <PenSquareIcon className="m-4" size={20} />
        <span className="grow text-start font-semibold">Create My Own</span>
        <ChevronRightIcon size={20} className="m-2 brightness-75" />
      </button>
      <h1 className="mt-4 mb-2 text-lg font-semibold">
        Have an invite already ?
      </h1>
      <button
        onClick={() => {
          props.setCreate(false);
          props.setNext(1);
          setTimeout(() => {
            props.setCurrent(1);
          }, 200);
        }}
        className="w-full rounded-lg bg-[#2d2d32] p-2 font-semibold transition-all outline-none hover:brightness-110"
      >
        Join a Server
      </button>
    </div>
  );
}

function StepCreate(props: {
  current: number;
  next: number;
  setCurrent: React.Dispatch<SetStateAction<number>>;
  setNext: React.Dispatch<SetStateAction<number>>;
}) {
  const [image, setImage] = useState<File>();
  const [user, setUser] = useAtom(userAtom);
  const [text, setText] = useState("");
  const refInput = useRef<HTMLInputElement>(null);

  const imageChangeHandle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
    }
  };

  const previewUrl = useMemo(() => {
    if (!image) return null;
    return URL.createObjectURL(image);
  }, [image]);

  useEffect(() => {
    setTimeout(() => {
      if (refInput.current) {
        setText(user.name.slice(0, 20) + "'s server");
        refInput.current.focus();
      }
    }, 100);
  }, [props.current]);

  const changeTextHandle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };
  return (
    <div className={twMerge("flex flex-col items-center justify-center p-6")}>
      <Dialog.Title className="text-2xl font-semibold">
        Create Your Server
      </Dialog.Title>
      <span className="mt-2 mb-4 text-center text-[15px] leading-5">
        Give your new server a personality with a name and an icon. You can
        always change it later.
      </span>
      <button
        className={twMerge(
          "relative flex size-20 cursor-pointer flex-col items-center justify-center rounded-full border-dashed border-white/75",
          !previewUrl && "border-2",
        )}
      >
        <input
          type="file"
          accept="image/*"
          onChange={imageChangeHandle}
          className={twMerge(
            "absolute size-full cursor-pointer rounded-full opacity-0",
          )}
          title=""
        />
        {previewUrl ? (
          <img
            src={previewUrl}
            alt=""
            className="size-20 rounded-full object-cover"
          />
        ) : (
          <>
            <CameraIcon className="brightness-75" />
            <span className="text-xs font-semibold brightness-75">UPLOAD</span>
            <div className="absolute top-0 right-0 rounded-full bg-[#5965f2] p-1">
              <PlusIcon size={16} />
            </div>
          </>
        )}
      </button>
      <h1 className="mt-4 mr-auto mb-2 font-semibold">Server Name</h1>
      <input
        ref={refInput}
        type="text"
        onChange={changeTextHandle}
        className="mb-2 w-full rounded-lg border border-[#39393e] bg-[#212126] p-2 transition-all outline-none focus:border-[#5098ec]"
        value={text}
      />
      <h1 className="mr-auto text-[11px] brightness-75">
        By creating a server, you agree to Discord's{" "}
        <span className="font-semibold text-blue-400">
          Community Guidelines
        </span>
        .
      </h1>
      <div className="mt-12 flex w-full justify-between">
        <button
          onClick={() => {
            props.setNext(0);
            setTimeout(() => {
              props.setCurrent(0);
            }, 200);
          }}
          className="cursor-pointer font-semibold"
        >
          Back
        </button>
        <button className="cursor-pointer rounded-lg bg-[#5965f2] px-6 py-2 font-semibold transition-all hover:bg-[#5965f2]/75">
          Create
        </button>
      </div>
    </div>
  );
}

function StepJoin(props: {
  current: number;
  next: number;
  setCurrent: React.Dispatch<SetStateAction<number>>;
  setNext: React.Dispatch<SetStateAction<number>>;
}) {
  return (
    <div className={twMerge("flex flex-col p-6")}>
      join
      <button
        onClick={() => {
          props.setNext(0);
          setTimeout(() => {
            props.setCurrent(0);
          }, 200);
        }}
      >
        back
      </button>
    </div>
  );
}
