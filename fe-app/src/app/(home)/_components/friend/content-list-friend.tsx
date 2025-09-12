import { useRouter } from "next/navigation";
import { FriendList } from "../../_state/friend-atom";
import { apiCall } from "../../_helper/api-client";
import UserAvatar from "../user-avatar";
import TooltipDesc from "../tooltip-desc";
import {
  CheckIcon,
  MessageCircleIcon,
  MoreVerticalIcon,
  XIcon,
} from "lucide-react";
import DropDownMoreFriendList from "./dropdown-more-friend-list";

export default function ContentListFriend(props: {
  data: FriendList;
  is_sent?: boolean;
  is_pending?: boolean;
}) {
  const router = useRouter();
  const cancel_handle = () => {
    apiCall(
      `${process.env.NEXT_PUBLIC_HOST_API}friend/cancel/${props.data.user_id}`,
      {
        method: "DELETE",
      },
    ).catch(() => {});
  };

  const decline_handle = () => {
    apiCall(
      `${process.env.NEXT_PUBLIC_HOST_API}friend/decline/${props.data.user_id}`,
      {
        method: "DELETE",
      },
    ).catch(() => {});
  };

  const accept_handle = () => {
    apiCall(
      `${process.env.NEXT_PUBLIC_HOST_API}friend/accept/${props.data.user_id}`,
      {
        method: "POST",
      },
    ).catch(() => {});
  };

  return (
    <div className="border-list-border-3 group hover:bg-btn-hover-2 flex cursor-pointer border-t px-2 py-3 transition-all hover:rounded-lg hover:border-transparent">
      <UserAvatar
        StatusUser={props.data.status_activity}
        avatar={props.data.avatar}
        name={props.data.name}
        px={36}
        hover="outline-layout-bg"
        not_hover="group-hover:outline-btn-hover-2"
        whitout_status={props.is_sent || props.is_pending}
      />
      <div className="ml-2 flex grow flex-col justify-center gap-1.5">
        <h1 className="flex items-end leading-none font-semibold">
          {props.data.name}
          <span className="invisible ml-1 text-sm leading-none font-semibold group-hover:visible">
            {props.data.username}
          </span>
        </h1>
        <span className="text-sm leading-none font-semibold brightness-50">
          {!props.is_sent && !props.is_pending
            ? props.data.status_activity
            : props.data.username}
        </span>
      </div>
      {!props.is_sent && !props.is_pending && (
        <div className="flex gap-2">
          <TooltipDesc side="top" text="Message">
            <button
              onClick={() => router.push("/channels/me/" + props.data.username)}
              className="group/btn group-hover:bg-discord-bg cursor-pointer rounded-full p-2"
            >
              <MessageCircleIcon
                size={20}
                fill="white"
                className="brightness-70 group-hover/btn:brightness-100"
              />
            </button>
          </TooltipDesc>

          <DropDownMoreFriendList
            user_id={props.data.user_id}
            name={props.data.name}
          >
            <button className="group-hover:bg-discord-bg group/btn cursor-pointer rounded-full p-2">
              <MoreVerticalIcon
                size={20}
                fill="white"
                className="brightness-70 group-hover/btn:brightness-100"
              />
            </button>
          </DropDownMoreFriendList>
        </div>
      )}
      {props.is_sent && (
        <div>
          <TooltipDesc side="top" text="Cancel">
            <button
              onClick={cancel_handle}
              className="group/btn group-hover:bg-discord-bg cursor-pointer rounded-full p-2"
            >
              <XIcon
                size={20}
                fill="white"
                className="brightness-70 group-hover/btn:text-red-500 group-hover/btn:brightness-100"
              />
            </button>
          </TooltipDesc>
        </div>
      )}
      {props.is_pending && (
        <div className="flex gap-2">
          <TooltipDesc side="top" text="Accept">
            <button
              onClick={accept_handle}
              className="group/btn group-hover:bg-discord-bg cursor-pointer rounded-full p-2"
            >
              <CheckIcon
                size={20}
                className="brightness-70 group-hover/btn:text-green-500 group-hover/btn:brightness-100"
              />
            </button>
          </TooltipDesc>
          <TooltipDesc side="top" text="Decline">
            <button
              onClick={decline_handle}
              className="group/btn group-hover:bg-discord-bg cursor-pointer rounded-full p-2"
            >
              <XIcon
                size={20}
                fill="white"
                className="brightness-70 group-hover/btn:text-red-500 group-hover/btn:brightness-100"
              />
            </button>
          </TooltipDesc>
        </div>
      )}
    </div>
  );
}
