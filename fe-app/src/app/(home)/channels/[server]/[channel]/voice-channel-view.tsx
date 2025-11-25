"use client";
import { apiCall } from "@/app/(home)/_helper/api-client";
import {
  LiveKitRoom,
  VideoConference,
  // ... imports lainnya
} from "@livekit/components-react";
import { Room } from "livekit-client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import "@livekit/components-styles";
// Import icon untuk tombol replay/join (opsional)
import { ChannelList } from "@/app/(home)/_state/channel-list-atom";
import { useAtom } from "jotai";
import { deafenedAtom, micOnAtom } from "@/app/(home)/_state/media-atom";

export default function VoiceChannelView(props: { data: ChannelList }) {
  const { server, channel } = useParams();
  const [token, setToken] = useState("");
  const [shouldConnect, setShouldConnect] = useState(false);
  const [room] = useState(() => new Room({}));
  const [micOn] = useAtom(micOnAtom);
  const [deafened] = useAtom(deafenedAtom);

  useEffect(() => {
    setToken("");
    setShouldConnect(false);

    apiCall(`${process.env.NEXT_PUBLIC_HOST_API}channel/${channel}`, {
      method: "GET",
    }).then(async (resp) => {
      const res = await resp.json();
      if (resp.ok) {
        setToken(res.data.token);
        setShouldConnect(true);
      }
    });
  }, [channel]);

  useEffect(() => {
    if (!room) return;
    room.localParticipant.setMicrophoneEnabled(micOn);
  }, [micOn, room]);

  if (token === "") {
    return (
      <div className="flex h-full items-center justify-center">LOADING...</div>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      connect={shouldConnect}
      video={true}
      audio={true}
      room={room}
      data-lk-theme="default"
      className="min-h-0 min-w-0 overflow-hidden"
      onDisconnected={() => {
        console.log("User disconnected");
        setShouldConnect(false);
      }}
    >
      {shouldConnect ? (
        <VideoConference />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-4 bg-gray-900 text-white">
          <h3 className="text-xl font-semibold">{props.data.name}</h3>
          <button
            onClick={() => setShouldConnect(true)}
            className="flex items-center gap-2  bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 transition rounded-lg"
          >
            Join Voice
          </button>
        </div>
      )}
    </LiveKitRoom>
  );
}
