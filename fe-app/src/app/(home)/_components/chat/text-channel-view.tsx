import { ChannelList } from "../../_state/channel-list-atom";
import { cn } from "../../_helper/cn";
import { Users2Icon } from "lucide-react";
import InputChat from "./input-chat";
import { USER_STATUS, UserOther } from "../../_state/user-atom";
import ChatListSection from "./chat-list-section";
import UserAvatar from "../user-avatar";
import useTextChannelView from "./useTextChannelView";
import { useEffect } from "react";

export type ChatList = {
  id: string;
  user: UserOther;
  text: string;
  created_at: string;
};

// 🔹 Buat user dummy
const users: UserOther[] = Array.from({ length: 5 }, (_, i) => ({
  user_id: crypto.randomUUID(),
  name: ["Aiden", "Maya", "Leo", "Sakura", "Noah"][i],
  username: ["aiden_dev", "maya_ui", "leo404", "sakura.codes", "noahjs"][i],
  avatar: ``,
  avatar_bg: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
  status_activity: (Object.keys(USER_STATUS) as (keyof typeof USER_STATUS)[])[
    Math.floor(Math.random() * Object.keys(USER_STATUS).length)
  ],
  bio: [
    "Frontend enjoyer ☕️✨",
    "UI/UX designer by day, gamer by night 🎮",
    "Full-stack developer who loves chaos 🧩",
    "TypeScript is my love language 💙",
    "Building things that break (then fixing them) 💻",
  ][i],
  banner_color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
}));

// 🔹 Kumpulan kalimat acak (variasi paragraf)
const sampleLines = [
  "Hey, I just pushed a small patch to fix the avatar upload bug. Turns out it was just a MIME type mismatch 😂.",
  "So I was testing the dark theme again and honestly, it looks so much better than the light one. Might make it the default soon.",
  "The API rate limiter kicked in while I was testing — had to wait like a full minute just to send another message 😭.",
  "Added smooth scroll to the chat container. It feels more natural now when new messages appear.",
  "I was thinking maybe we should add message reactions — like emoji responses, just like Discord.",
  "The WebSocket reconnect feature works great! It auto-reconnects within 2 seconds after disconnect.",
  "Can someone check if the typing indicator overlaps the message input on mobile? It looks fine on desktop.",
  "We should probably move the constants into a separate config file, it's getting messy in utils.ts.",
  "Okay I’m gonna grab coffee first ☕, be right back.",
  "Just realized we forgot to sanitize HTML on incoming messages 😬 good thing it’s just dev mode right now.",
  "The banner color gradients turned out really nice! Especially when paired with a pastel avatar background.",
  "Fun fact: I once deployed to production without running ‘npm build’. Don’t be like me.",
  "The scroll to bottom button now fades in smoothly, thanks to a bit of opacity transition magic ✨.",
  "My cat literally just sat on my keyboard and sent 10 blank messages 💀.",
  "Alright, who broke the socket handler again? I swear it was working yesterday 😂.",
  "Quick idea: what if user bios supported markdown too? It would make profiles look cooler.",
  "Btw, props to whoever made the new message bubble style — it looks really modern and clean.",
  "Testing markdown parser... **bold**, _italic_, `inline code` — all working perfectly!",
  "Can we add a subtle sound when someone joins the voice channel? Not too loud tho 😅.",
  "Gonna take a break for a bit. Brain officially fried from debugging websockets 🧠🔥.",
];

// 🔹 Fungsi waktu acak (dalam 7 hari terakhir)
function randomDateWithin(days: number): string {
  const now = Date.now();
  const past = now - days * 24 * 60 * 60 * 1000;
  const randomTime = Math.floor(Math.random() * (now - past) + past);
  return new Date(randomTime).toISOString();
}

// 🔹 Fungsi buat paragraf acak (1–3 paragraf)
function randomText(): string {
  const paragraphCount = Math.floor(Math.random() * 3) + 1; // 1–3 paragraf
  const paragraphs = Array.from({ length: paragraphCount }, () => {
    const sentenceCount = Math.floor(Math.random() * 3) + 2; // 2–4 kalimat per paragraf
    const lines = Array.from({ length: sentenceCount }, () => {
      return sampleLines[Math.floor(Math.random() * sampleLines.length)];
    });
    return lines.join(" ");
  });
  return paragraphs.join("\n\n"); // pisah antar paragraf
}

// 🔹 Buat 40 chat acak
export const chatDummy: ChatList[] = Array.from({ length: 10 }, () => {
  const randomUser = users[Math.floor(Math.random() * users.length)];
  const text = randomText();

  return {
    id: crypto.randomUUID(),
    user: randomUser,
    text,
    created_at: randomDateWithin(7),
  };
});

export default function TextChannelView(props: { data: ChannelList }) {
  const { Icons, setShowSide, showSide, list, setList, loading } =
    useTextChannelView(props.data);

    <div className="flex flex-col min-h-0 min-w-0 bg-[#1a1a1e]">
      <div className="flex p-3.5 gap-2 border-y border-[#29292e] ">
        <div className="brightness-75">
          <Icons />
        </div>
        <span className="font-semibold grow">{props.data.name}</span>
        <button
          onClick={() => setShowSide(!showSide)}
          className={cn(
            "cursor-pointer outline-none",
            showSide ? "text-white" : "brightness-75"
          )}
        >
          <Users2Icon />
        </button>
      </div>
      <div className="grow flex flex-row min-h-0 min-w-0">
        <div className="flex flex-col min-w-0 grow">
          {!loading && (
            <>
              <ul className=" grow min-h-0 overflow-scroll  min-w-0 flex flex-col custom-scrollbar ">
                <ChatListSection data={list} />
              </ul>
              <InputChat
                data={props.data}
                list={list}
                setList={setList}
              />
            </>
          )}
        </div>
        {showSide && (
          <div className="bg-[#1a1a1e] border-l border-[#29292e] p-2 flex flex-col gap-2 min-w-[250px] ">
            {users.map((v) => (
              <div
                key={v.user_id}
                className="flex flex-row hover:bg-[#242428] rounded-lg transition-all gap-2 items-center p-2"
              >
                <div>
                  <UserAvatar
                    avatar={v.avatar}
                    avatarBg={v.avatar_bg}
                    name={v.name}
                    px={32}
                    StatusUser={v.status_activity}
                    hover="outline-[#242428]"
                    not_hover="group-hover:outline-[#1a1a1e]"
                    indicator_size={10}
                    indicator_outline={2}
                  />
                </div>
                <div className="font-semibold">
                  <h1>{v.name}</h1>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
