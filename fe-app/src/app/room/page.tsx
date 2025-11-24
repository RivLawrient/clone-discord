"use client";

import {
  LiveKitRoom,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";
import { useEffect, useState } from "react";

export default function Page() {
  const roomName = "voice-room-01";
  const userName = `user-${Math.floor(Math.random() * 9999)}`;
  const [token, setToken] = useState("");

  useEffect(() => {
    const fetchToken = async () => {
      const resp = await fetch(
        `/api/livekit-token?room=${roomName}&username=${userName}`
      );
      const data = await resp.json();
      setToken(data.token);
    };
    fetchToken();
  }, []);

  if (!token) return <div>Menghubungkan ke room...</div>;

  return (
    <LiveKitRoom
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      audio
      video
    >
      {/* Render participant tiles */}
      <VideoConferenceView />

      {/* Render audio output */}
      <RoomAudioRenderer />

      {/* Bottom control bar */}
      <ControlBar />
    </LiveKitRoom>
  );
}

function VideoConferenceView() {
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.Microphone, withPlaceholder: true },
  ]);

  return (
    <GridLayout tracks={tracks}>
      {/* {(track) => <ParticipantTile trackRef={track} />} */}l
    </GridLayout>
  );
}
