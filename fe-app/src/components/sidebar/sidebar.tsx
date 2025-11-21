import AddServerBtn from "./add-server/add-server-btn";
import DirectMessageBtn from "./direct-message-btn";
import ServerListSection from "./server-list-section";

export default function Sidebar() {
  return (
    <div
      style={{
        scrollbarWidth: "none",
      }}
      className="flex min-h-0 flex-col gap-y-2 overflow-y-scroll pb-20 select-none"
    >
      <DirectMessageBtn />
      <div className="border-[#222225] mx-5 border-t" />
      <ServerListSection />
      <AddServerBtn />
    </div>
  );
}
