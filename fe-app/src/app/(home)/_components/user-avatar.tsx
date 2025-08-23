import { twMerge } from "tailwind-merge";
import { USER_STATUS } from "../_state/user-atom";

export default function UserAvatar(props: {
  avatar: string;
  name: string;
  withIndicator?: boolean;
  px: number;
  StatusUser: keyof typeof USER_STATUS;
  hover?: string;
  not_hover?: string;
  whitout_status?: boolean;
}) {
  return (
    <div
      style={{ width: props.px, height: props.px, minWidth: props.px }}
      className="relative overflow-hidden"
    >
      {!props.whitout_status && (
        <div
          className={twMerge(
            "absolute right-0 bottom-0 size-[35%] rounded-full outline-4",
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
