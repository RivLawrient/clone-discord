import { twMerge } from "tailwind-merge";
import { USER_STATUS } from "../_state/user-atom";
import { useState } from "react";

export default function UserAvatar(props: {
  avatar: string;
  name: string;
  px: number;
  StatusUser: keyof typeof USER_STATUS;
  hover?: string;
  not_hover?: string;
  indicator_size?: number;
  indicator_outline?: number;
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
      <div className="flex size-full items-center justify-center overflow-hidden rounded-full bg-white text-black">
        {props.avatar == "" ? (
          <WithoutImg name={props.name} />
        ) : (
          <WithImg avatar={props.avatar} />
        )}
      </div>
    </div>
  );
}

function WithoutImg(props: { name: string }) {
  return <span className="font-semibold">{props.name[0]?.toUpperCase()}</span>;
}

function WithImg(props: { avatar: string }) {
  return (
    <img
      //   src={process.env.NEXT_PUBLIC_API + "img/" + props.avatar}
      src="/goku.jpg"
      alt="avatar"
      className="h-full w-full object-cover"
    />
  );
}
