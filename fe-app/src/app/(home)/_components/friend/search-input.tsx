import { SearchIcon, XIcon } from "lucide-react";

export default function SearchInput(props: {
  value: string;
  setValue: (search: string) => void;
  reset: () => void;
}) {
  return (
    <div className="bg-inpt-bg-1 border-inpt-border-1 focus-within:border-inpt-border-2 flex items-center rounded-lg border px-3 py-2">
      <input
        type="text"
        value={props.value}
        onChange={(e) => props.setValue(e.target.value)}
        placeholder="Search"
        className="grow outline-none"
      />
      {props.value === "" ? (
        <SearchIcon size={18} />
      ) : (
        <XIcon onClick={props.reset} size={18} className="cursor-pointer" />
      )}
    </div>
  );
}
