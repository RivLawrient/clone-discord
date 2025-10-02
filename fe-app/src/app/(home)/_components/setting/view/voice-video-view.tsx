import {
  inputDevicesAtom,
  outputDevicesAtom,
  selectedInputAtom,
  selectedOutputAtom,
} from "@/app/(home)/_state/media-atom";
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";

export default function VoiceVideoView() {
  return (
    <div>
      <h1 className="mb-10 text-2xl font-semibold">Voice & Video</h1>

      <AudioSelector />
      <CheckAudio />
    </div>
  );
}

function AudioSelector() {
  const [inputs, setInputs] = useAtom(inputDevicesAtom);
  const [outputs, setOutputs] = useAtom(outputDevicesAtom);
  const [selectedInput, setSelectedInput] = useAtom(selectedInputAtom);
  const [selectedOutput, setSelectedOutput] = useAtom(selectedOutputAtom);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      setInputs(devices.filter((d) => d.kind === "audioinput"));
      setOutputs(devices.filter((d) => d.kind === "audiooutput"));
    });
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="font-semibold">Mic Source:</label>
        <select
          value={selectedInput || ""}
          onChange={(e) => setSelectedInput(e.target.value)}
          className="ml-2 rounded border px-2 py-1"
        >
          <option value="">Default</option>
          {inputs.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label || `Mic (${d.deviceId})`}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="font-semibold">Speaker Output:</label>
        <select
          value={selectedOutput || ""}
          onChange={(e) => setSelectedOutput(e.target.value)}
          className="ml-2 rounded border px-2 py-1"
        >
          <option value="">Default</option>
          {outputs.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label || `Speaker (${d.deviceId})`}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function CheckAudio() {
  const [stream, setStream] = useState<MediaStream>();
  const [level, setLevel] = useState(0);
  const [isCheck, setIsCheck] = useState(false);

  const selectedInput = useAtomValue(selectedInputAtom);
  const selectedOutput = useAtomValue(selectedOutputAtom);

  const audioRef = useRef<HTMLAudioElement>(null);
  // Ambil mic

  useEffect(() => {
    const constraints: MediaStreamConstraints = {
      audio: {
        deviceId: selectedInput ? { exact: selectedInput } : undefined,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    };

    navigator.mediaDevices.getUserMedia(constraints).then(setStream);
  }, [selectedInput]);

  useEffect(() => {
    if (!stream || !isCheck) return;

    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    const destination = audioCtx.createMediaStreamDestination();

    // mic -> analyser -> destination
    source.connect(analyser);
    analyser.connect(destination);

    // route ke <audio>
    if (audioRef.current) {
      audioRef.current.srcObject = destination.stream;
      audioRef.current
        .play()
        .catch((err) => console.warn("Audio play blocked:", err));

      // ubah speaker output
      if (selectedOutput && "setSinkId" in audioRef.current) {
        (audioRef.current as any)
          .setSinkId(selectedOutput)
          .catch((err: any) => {
            console.warn("Gagal set sinkId:", err);
          });
      }
    }

    // visualisasi level suara
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    let rafId: number;
    const tick = () => {
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
      setLevel(Math.round((avg / 255) * 100));
      rafId = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(rafId);
      audioCtx.close();
    };
  }, [stream, isCheck, selectedOutput]);

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => setIsCheck(!isCheck)}
        className="cursor-pointer rounded-lg bg-[#5865f2] px-3 py-2 text-sm font-semibold whitespace-nowrap transition-all hover:bg-[#5865f2]/75"
      >
        {!isCheck ? "Let's Check" : "Stop Testing"}
      </button>

      <div className="relative h-[10px] w-full overflow-hidden rounded-lg bg-gradient-to-r from-orange-400 to-green-400">
        <div
          style={{
            transform: `translate(${isCheck ? level : 0}%,0)`,
          }}
          className="h-[10px] w-full border border-[#46474f] bg-[#46474f]"
        />
        <audio ref={audioRef} hidden />
      </div>
    </div>
  );
}
