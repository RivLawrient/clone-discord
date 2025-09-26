import { twMerge } from "tailwind-merge";
import { USER_STATUS } from "../_state/user-atom";
import { useState } from "react";

export default function UserAvatar(props: {
  avatar: string;
  name: string;
  px: number;
  StatusUser: keyof typeof USER_STATUS;
  avatarBg: string;
  hover?: string;
  not_hover?: string;
  indicator_size?: number;
  indicator_outline?: number;
  preview?: boolean;
}) {
  const [hover, setHover] = useState(false);

  return (
    <div
      style={{ width: props.px, height: props.px, minWidth: props.px }}
      className="relative overflow-hidden"
    >
      {props.indicator_outline && props.indicator_outline && (
        <div
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            width: props.indicator_size + "px",
            height: props.indicator_size + "px",
            outlineWidth: `${props.indicator_outline}px`,
            outlineStyle: "solid",
          }}
          className={twMerge(
            "absolute right-0 bottom-0 rounded-full",
            USER_STATUS[props.StatusUser],

            props.not_hover ? props.not_hover : "outline-user-bar",
            props.hover ? props.hover : "group-hover:outline-user-bar-hover",
          )}
        />
      )}
      <div
        style={{
          backgroundColor: !props.avatar ? props.avatarBg : "transparent",
        }}
        className="flex size-full items-center justify-center overflow-hidden rounded-full text-black"
      >
        {props.avatar == "" ? (
          <WithoutImg />
        ) : (
          <WithImg avatar={props.avatar} preview={props.preview} />
        )}
      </div>
    </div>
  );
}

function WithoutImg() {
  return (
    <img
      src="/dc-logo.png"
      alt="avatar"
      className="size-[60%] object-contain"
    />
  );
  // return <span className="font-semibold">{props.name[0]?.toUpperCase()}</span>;
}

function WithImg(props: { avatar: string; preview: boolean | undefined }) {
  return (
    <img
      // src={process.env.NEXT_PUBLIC_HOST_API + "img/" + props.avatar}
      src={
        props.preview
          ? props.avatar
          : process.env.NEXT_PUBLIC_HOST_API + "img/" + props.avatar
      }
      // src="/goku.jpg"
      alt={props.avatar}
      className="h-full w-full object-cover"
    />
  );
}

function randomHexColor(): string {
  // Generate angka random dari 0 sampai 16777215 (0xFFFFFF)
  const randomNum = Math.floor(Math.random() * 0xffffff);
  // Convert ke hex dan pad agar selalu 6 digit
  const hex = `#${randomNum.toString(16).padStart(6, "0")}`;
  return hex;
}
