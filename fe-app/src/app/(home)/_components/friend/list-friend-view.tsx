import { useState } from "react";
import { FriendList } from "../../_state/friend-atom";
import { twMerge } from "tailwind-merge";
import SearchInput from "./search-input";
import ContentListFriend from "./content-list-friend";

export default function ListFriendView(props: {
  tab: string;
  data: FriendList[];
}) {
  const [input, setInput] = useState("");

  // Filter data berdasarkan tab
  const tabFilteredData =
    props.tab === "online"
      ? props.data.filter((v) => v.status_activity !== "Invisible")
      : props.data;

  // Filter berdasarkan search input (username atau name)
  const filteredData = tabFilteredData.filter(
    (v) =>
      v.username?.toLowerCase().includes(input.toLowerCase()) ||
      v.name?.toLowerCase().includes(input.toLowerCase()),
  );

  // Generate label untuk header
  const getHeaderLabel = () => {
    const baseLabel = props.tab === "online" ? "Online" : "All friends";

    // Jika tidak ada input search, tampilkan jumlah normal
    if (!input.trim()) {
      return `${baseLabel} - ${filteredData.length}`;
    }

    // Jika ada input search tapi tidak ada hasil
    if (input.trim() && filteredData.length === 0) {
      return "No one with that name could be found.";
    }

    // Jika ada input search dan ada hasil
    return `${baseLabel} - ${filteredData.length}`;
  };

  const headerLabel = getHeaderLabel();

  return (
    <div className={twMerge("pt-3 pr-4 pl-6")}>
      <SearchInput
        value={input}
        setValue={setInput}
        reset={() => setInput("")}
      />

      {/* Tampilkan header label selalu, baik ada hasil atau tidak */}
      <div
        className={twMerge(
          "my-4 text-sm font-semibold transition-all",
          input.trim() && filteredData.length === 0 && "h-max",
        )}
      >
        {headerLabel}
      </div>

      {/* Render list hanya jika ada data */}
      {filteredData.map((v) => (
        <ContentListFriend key={v.user_id} data={v} />
      ))}
    </div>
  );
}
