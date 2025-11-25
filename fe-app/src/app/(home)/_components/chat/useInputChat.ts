import { SetStateAction, useEffect, useRef, useState } from "react";
import { apiCall } from "../../_helper/api-client";
import { ChannelList } from "../../_state/channel-list-atom";
import { UserOther } from "../../_state/user-atom";
import { ChatList } from "./useTextChannelView";

export default function useInputChat(
  data: ChannelList | UserOther,
  list: ChatList[],
  setList: React.Dispatch<SetStateAction<ChatList[]>>
) {
  const [input, setInput] = useState("");
  const [row, setRow] = useState(1);
  const inputTagRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const textarea = inputTagRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // reset dulu
      const scrollHeight = textarea.scrollHeight;
      const lineHeight = 24; // tinggi 1 baris (px), sesuaikan sama CSS
      const maxHeight = lineHeight * 20; // maksimal 20 baris
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      setInput((v) => {
        const newValue = v.slice(0, start) + "\n" + v.slice(end);
        setTimeout(() => {
          textarea.selectionStart = start + 1;
          textarea.selectionEnd = start + 1;
        }, 0);

        return newValue;
      });

      if (inputTagRef.current) {
        inputTagRef.current.scrollTop = inputTagRef.current.scrollHeight;
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() != "") {
        console.log(input);
        if ("is_voice" in data) {
          apiCall(
            `${process.env.NEXT_PUBLIC_HOST_API}message/channel/${data.id}`,
            {
              method: "POST",
              body: JSON.stringify({
                text: input,
              }),
            }
          ).then(async (resp) => {
            const res = await resp.json();
            // setList((p) => [...p, res.data]);
          });
        } else {
          apiCall(
            `${process.env.NEXT_PUBLIC_HOST_API}dm/text/${data.user_id}`,
            {
              method: "POST",
              body: JSON.stringify({
                text: input,
              }),
            }
          );
        }
        setInput("");
      }
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  return {
    inputTagRef,
    row,
    input,

    handleKeyDown,
    onChange,
  };
}
