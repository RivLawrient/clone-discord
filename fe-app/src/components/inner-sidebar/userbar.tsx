import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import {
  HeadphoneOffIcon,
  HeadphonesIcon,
  LucideIcon,
  MicIcon,
  MicOffIcon,
  PencilIcon,
  SettingsIcon,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { Dialog, DropdownMenu } from "radix-ui";
import { SetStateAction } from "jotai";
import { userAtom } from "@/app/(home)/_state/user-atom";
import UserAvatar from "@/app/(home)/_components/user-avatar";
import {
  deafenedAtom,
  mediaAtom,
  micOnAtom,
} from "@/app/(home)/_state/media-atom";
import TooltipDesc from "@/app/(home)/_components/tooltip-desc";
import SettingModal from "@/app/(home)/_components/setting/setting-modal";
import { TrackToggle } from "@livekit/components-react";
import { Track } from "livekit-client";

export default function UserBar() {
  const [user, setUser] = useAtom(userAtom);
  const [mic, setMic] = useState(true);
  const [speaker, setSpeaker] = useState(true);
  const [openSetting, setOpenSetting] = useState(false);
  const [defaultSetting, setDefaultSetting] = useState(false);

  return (
    <>
      <SettingModal
        open={openSetting}
        setOpen={setOpenSetting}
        default={defaultSetting}
      />
      <div className="bg-user-bar border-user-bar-border bg-blue flex h-14 rounded-lg border p-1.5">
        <PreviewUser
          setOpen={setOpenSetting}
          setDefault={setDefaultSetting}
        >
          <div
            style={{
              borderStartStartRadius: "24px",
              borderEndStartRadius: "24px",
              borderStartEndRadius: "8px",
              borderEndEndRadius: "8px",
            }}
            className="hover:bg-user-bar-hover group h-fit flex min-w-0 grow cursor-pointer gap-2"
          >
            <UserAvatar
              avatar={user.avatar}
              avatarBg={user.avatar_bg}
              name={user.name}
              px={40}
              StatusUser={user.status_activity}
              indicator_outline={4}
              indicator_size={12}
            />
            <div className="flex flex-col justify-center gap-1 truncate">
              <span className="truncate leading-none font-semibold">
                {user.name}
              </span>
              <div className="text-user-bar-text flex h-3 flex-col overflow-hidden text-xs">
                <div className="flex min-w-0 flex-col transition-transform duration-200 group-hover:-translate-y-3">
                  <span className="truncate leading-3">
                    {user.status_activity}
                  </span>
                  <span className="truncate leading-3">{user.username}</span>
                </div>
              </div>
            </div>
          </div>
        </PreviewUser>
        <div className="ml-2 flex items-center gap-1">
          {/* <TrackToggle source={Track.Source.Microphone} /> */}
          <BtnMic />
          <BtnSpeaker />
          <BtnSettings
            setOpen={setOpenSetting}
            setDefault={setDefaultSetting}
          />
        </div>
      </div>
    </>
  );
}

function PreviewUser(props: {
  children: React.ReactNode;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
  setDefault: React.Dispatch<SetStateAction<boolean>>;
}) {
  const [user, setUser] = useAtom(userAtom);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{props.children}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side="top"
          sideOffset={10}
          className="text-white w-[280px] mx-5"
        >
          <div className="flex w-full flex-col overflow-hidden rounded-lg shadow-[8px_8px_30px_rgba(0,0,0,0.05)]">
            <div
              style={{
                backgroundColor: user.banner_color,
              }}
              className="h-[105px]"
            />
            <div className="flex flex-col bg-[#242429] p-4">
              <div className="-mt-14 flex size-fit rounded-full bg-[#242429] p-2">
                <UserAvatar
                  px={80}
                  StatusUser={user.status_activity}
                  avatar={user.avatar}
                  avatarBg={user.avatar_bg}
                  name={user.name}
                  indicator_outline={6}
                  indicator_size={16}
                  not_hover="outline-[#242429]"
                />
              </div>
              <h1 className="font-semibold text-2xl truncate">{user.name}</h1>
              <h1 className=" font-semibold truncate ">{user.username}</h1>
              <h1 className="mt-2 break-all mb-2  break-words rounded-lg p-2 bg-[#2c2d32] whitespace-pre-line">
                {user.bio}
              </h1>
              <button
                onClick={() => {
                  props.setDefault(true);
                  props.setOpen(true);
                }}
                className="cursor-pointer rounded-lg bg-[#2c2d32] py-2.5  flex flex-row p-2 hover:bg-[#34353b] text-sm font-semibold gap-2 items-center"
              >
                <div>
                  <PencilIcon size={18} />
                </div>
                <h1>Edit Profile</h1>
              </button>
            </div>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function BtnAttribute(props: {
  status: boolean;
  icon_on: LucideIcon;
  icon_off: LucideIcon;
  on_click: () => void;
}) {
  const Icon = props.status ? props.icon_on : props.icon_off;

  return (
    <div
      onClick={props.on_click}
      className={twMerge(
        "cursor-pointer rounded-lg p-1.5 transition-all",
        props.status
          ? "hover:bg-user-bar-hover"
          : "bg-user-bar-red hover:bg-user-bar-redhover"
      )}
    >
      <Icon
        size={22}
        className={twMerge(
          "transition-all",
          props.status ? "text-user-bar-def" : "text-red-500"
        )}
      />
    </div>
  );
}

function BtnMic() {
  const [micOn, setMicOn] = useAtom(micOnAtom);
  const [media, setMedia] = useAtom(mediaAtom);
  const [alertModal, setAlertModal] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const micHandle = async () => {
    setMicOn(!micOn);
    if (media.micOn) {
      // 🔴 Matikan mic
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setMedia((prev) => ({ ...prev, micOn: false }));
    } else {
      // 🟢 Nyalakan mic
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        streamRef.current = stream;
        setMedia((prev) => ({ ...prev, micOn: true }));
      } catch (err) {
        console.error("Mic permission denied:", err);
        setAlertModal(true); // tampilkan alert kalau user belum izin
      }
    }
  };

  return (
    <>
      <MicAlertModal
        open={alertModal}
        setOpen={setAlertModal}
      />
      <TooltipDesc
        text={media.micOn ? "Mute" : "Unmute"}
        side="top"
        is_child
      >
        <BtnAttribute
          status={media.micOn}
          icon_on={MicIcon}
          icon_off={MicOffIcon}
          on_click={micHandle}
        />
      </TooltipDesc>
    </>
  );
}

function MicAlertModal(props: {
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
}) {
  const handleClick = () => {
    props.setOpen(false);
    window.open(
      "https://support.discord.com/hc/en-us/articles/205093487-How-do-I-enable-my-mic-in-Chrome",
      "_blank"
    );
  };

  return (
    <Dialog.Root
      open={props.open}
      onOpenChange={(v) => props.setOpen(v)}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60" />
        <Dialog.Content className="fixed top-1/2 left-1/2 flex w-[400px] -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg border border-[#3b3b41] bg-[#242429] p-6 text-white data-[state=closed]:animate-[modal-hide_200ms] data-[state=open]:animate-[modal-show_200ms]">
          <Dialog.Title className="text-xl font-semibold">
            Microphone Access is Denied
          </Dialog.Title>
          <h1 className="mt-2 mb-4 brightness-75">
            Instructions for enabling access to your microphone can be found in
            the Discord Help Center.
          </h1>

          <button
            onClick={handleClick}
            className="cursor-pointer rounded-lg bg-[#5865f2] py-2 font-semibold hover:bg-[#5865f2]/75"
          >
            Help Desk
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function BtnSpeaker() {
  const [deafened, setDeafened] = useAtom(deafenedAtom);
  const [media, setMedia] = useAtom(mediaAtom);

  return (
    <TooltipDesc
      text={media.speakerOn ? "Deafen" : "Undeafen"}
      side="top"
      is_child
    >
      <BtnAttribute
        status={media.speakerOn}
        icon_on={HeadphonesIcon}
        icon_off={HeadphoneOffIcon}
        on_click={() => {
          setDeafened(!deafened);
          setMedia((v) => ({ ...v, speakerOn: !v.speakerOn }));
        }}
      />
    </TooltipDesc>
  );
}

function BtnSettings(props: {
  setOpen: React.Dispatch<SetStateAction<boolean>>;

  setDefault: React.Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <TooltipDesc
      text="User Settings"
      side="top"
    >
      <div
        onClick={() => {
          props.setDefault(false);
          props.setOpen(true);
        }}
        className="hover:bg-user-bar-hover group cursor-pointer rounded-lg p-1.5 outline-none"
      >
        <SettingsIcon
          size={22}
          className="text-user-bar-def group-hover:animate-spin"
        />
      </div>
    </TooltipDesc>
  );
}
