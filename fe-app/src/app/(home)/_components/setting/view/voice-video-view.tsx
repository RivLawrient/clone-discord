import { useEffect, useState } from "react";

export default function VoiceVideoView() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    // minta izin mic dulu biar label perangkat muncul
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => navigator.mediaDevices.enumerateDevices())
      .then((list) => setDevices(list))
      .catch((err) => console.error("Error:", err));
  }, []);

  const inputs = devices.filter((d) => d.kind === "audioinput");
  const outputs = devices.filter((d) => d.kind === "audiooutput");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">My Account</h1>
      <div style={{ padding: 20 }}>
        <h1>Deteksi Mic & Speaker</h1>

        <h2>Input (Microphone)</h2>
        <ul>
          {inputs.map((d) => (
            <li key={d.deviceId}>{d.label || `Mic: ${d.deviceId}`}</li>
          ))}
        </ul>
        <hr />
        <h2>Output (Speaker)</h2>
        <ul>
          {outputs.map((d) => (
            <li key={d.deviceId}>{d.label || `Speaker: ${d.deviceId}`}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
