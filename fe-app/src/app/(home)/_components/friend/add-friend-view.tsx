import { useState } from "react";
import { apiCall, GetCookie } from "../../_helper/api-client";
import { twMerge } from "tailwind-merge";

export default function AddFriendView() {
  const [add_input, setAdd_input] = useState("");
  const [success, setSuccess] = useState(false);
  const [failed, setFailed] = useState(false);

  const add_friend_api = `${process.env.NEXT_PUBLIC_HOST_API}friend/add/${add_input}`;

  const action = () => {
    if (add_input != "") {
      setSuccess(false);
      setFailed(false);

      apiCall(add_friend_api, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GetCookie("token")}`,
        },
      })
        .then(async (resp) => {
          if (resp.ok) {
            setSuccess(true);
          } else {
            setFailed(true);
          }
        })
        .catch(() => {
          setFailed(true);
        });
    }
  };

  return (
    <div className="border-discord-border-2 border-b px-[30px] py-[20px]">
      <h1 className="text-xl font-semibold">Add Friend</h1>
      <h2 className="text-[16px]">
        You can add friends with their Discord username.
      </h2>
      <div
        className={twMerge(
          "relative mt-5 mb-2 flex rounded-lg border border-black bg-[#1e1f22] px-3 py-2.5",
          !success && !failed && "focus-within:border-inpt-border-2",
          failed && "border-red-500",
          success && "border-green-500",
        )}
      >
        <input
          type="text"
          placeholder="You can add friends with their Discord username."
          value={add_input}
          onChange={(e) => {
            success && setSuccess(false);
            failed && setFailed(false);
            setAdd_input(e.target.value);
          }}
          className="grow text-sm outline-none"
        />
        <button
          onClick={action}
          className={twMerge(
            "bg-btn-bg-1 rounded-lg p-2.5 text-xs font-semibold text-white",
            add_input === "" ? "brightness-75" : "cursor-pointer",
          )}
        >
          Send Friend Request
        </button>
        <img
          src="/add_friend.svg"
          alt=""
          className="absolute right-0 bottom-full"
        />
      </div>
      {(success || failed) && (
        <h1
          className={twMerge(
            "text-xs text-[#f57876]",
            failed && "text-red-text",
            success && "text-green-text",
          )}
        >
          {success && ` Success! Your friend request to ${add_input} was sent.`}
          {failed &&
            "Hm, didn’t work. Double check that the username is correct."}
        </h1>
      )}
    </div>
  );
}
