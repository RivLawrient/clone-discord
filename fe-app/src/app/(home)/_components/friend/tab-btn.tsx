import { twMerge } from "tailwind-merge";

export default function TabBtn(props: {
  label: string;
  variant: 1 | 2 | 3;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={props.onClick}
      className={twMerge(
        "cursor-pointer truncate rounded-lg px-3 py-1 font-semibold transition-all",
        props.variant == 1 &&
          "hover:bg-btn-hover-2 text-white/50 hover:text-white",
        props.variant == 1 &&
          props.active &&
          "bg-btn-select-2 hover:bg-btn-select-2 text-white",
        props.variant == 2 && "bg-btn-bg-1 text-white hover:brightness-80",
        props.variant == 2 &&
          props.active &&
          "bg-[#242641] text-[#7a8ef9] hover:bg-[#242641]",
      )}
    >
      {props.label}
    </button>
  );
}