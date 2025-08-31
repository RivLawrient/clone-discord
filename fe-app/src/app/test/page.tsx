export default function Page() {
  return (
    <div className="bg-discord-bg grid h-screen w-screen grid-rows-[auto_1fr] text-white">
      <div className="h-[50px] bg-red-500">atas</div>
      <div className="grid min-h-0 grid-cols-[auto_auto_1fr]">
        <div className="bg-green-500">side</div>
        <div className="bg-yellow-500">innerside</div>
        <div className="min-h-0 bg-white/10">
          <div className="grid h-full min-h-0 grid-rows-[auto_1fr_auto]">
            <div>atas</div>
            <div className="min-h-0 overflow-y-auto">
              {Array.from({ length: 1 }, (_, i) => (
                <div key={i}>
                  http://127.0.0.1:3000/channels/me/sannhttp://127.0.0.1:3000/channels/me/sannhttp://127.0.0.1:3000/channels/me/sannhttp://127.0.0.1:3000/channels/me/sannhttp://127.0.0.1:3000/channels/me/sannhttp://127.0.0.1:3000/channels/me/sannhttp://127.0.0.1:3000/channels/me/sannhttp://127.0.0.1:3000/channels/me/sannhttp://127.0.0.1:3000/channels/me/sannhttp://127.0.0.1:3000/channels/me/sannhttp://127.0.0.1:3000/channels/me/sannhttp://127.0.0.1:3000/channels/me/sann
                </div>
              ))}
            </div>
            <div>bawah</div>
          </div>
        </div>
      </div>
    </div>
  );
}
