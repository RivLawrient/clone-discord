import { twMerge } from "tailwind-merge";
import { DropdownMenu, Popover, Select } from "radix-ui";
import { useRef, useState } from "react";
import { ArrowDownIcon, ChevronDownIcon } from "lucide-react";

export default function FieldInput(props: {
  error: string;
  label: string;
  required?: boolean;
  type: React.HTMLInputTypeAttribute;
  fieldInput: string;
  valueInput: any;
  isBirthdate?: boolean;
  setInput: React.Dispatch<React.SetStateAction<any>>;
}) {
  const req_error = props.error && (props.required || props.valueInput !== "");
  return (
    <>
      <label
        className={twMerge(
          "text-xs font-bold text-white",
          req_error && "text-red-400",
        )}
      >
        {props.label}
        {req_error ? (
          <span className="font-normal text-red-400 italic">
            {" "}
            - {props.error}
          </span>
        ) : (
          props.required && <span className="pl-1 text-red-500">*</span>
        )}
      </label>
      {props.isBirthdate ? (
        <InputBirth
          error={req_error}
          fieldInput={props.fieldInput}
          setInput={props.setInput}
        />
      ) : (
        <input
          type={props.type != "password" ? "text" : "password"}
          required={props.required}
          max={255}
          value={props.valueInput}
          onChange={(e) =>
            props.setInput((v: any) => ({
              ...v,
              [props.fieldInput]: e.target.value,
            }))
          }
          spellCheck="false"
          className={twMerge(
            "bg-input-auth border-border-input-normal-auth focus:border-border-input-select-auth mt-2 w-[400px] rounded-lg border p-2 text-white outline-none",
            req_error && "border-2 border-red-400",
          )}
        />
      )}
    </>
  );
}

function InputBirth(props: {
  error: boolean | string;
  fieldInput: string;
  setInput: React.Dispatch<React.SetStateAction<any>>;
}) {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  // Update format whenever ada perubahan
  const updateFormattedDate = (d: string, m: string, y: string) => {
    if (d && m && y) {
      const monthNumber = (OPTIONS_MAP.month.indexOf(m) + 1)
        .toString()
        .padStart(2, "0");
      const dayFormatted = d.padStart(2, "0");
      // const formatted = `${dayFormatted}-${monthNumber}-${y}`;
      const formatted = `${y}-${monthNumber}-${dayFormatted}`;
      // console.log(formatted);
      props.setInput((v: any) => ({
        ...v,
        [props.fieldInput]: formatted,
      }));
    }
  };

  return (
    <>
      <div className="relative grid w-[400px] grid-cols-[35%_auto_auto] gap-2">
        <ComboBox
          type="month"
          error={props.error}
          onSelect={(value) => {
            setMonth(value);
            updateFormattedDate(day, value, year);
          }}
        />
        <ComboBox
          type="day"
          error={props.error}
          onSelect={(value) => {
            setDay(value);
            updateFormattedDate(value, month, year);
          }}
        />
        <ComboBox
          type="year"
          error={props.error}
          onSelect={(value) => {
            setYear(value);
            updateFormattedDate(day, month, value);
          }}
        />
      </div>
    </>
  );
}

const OPTIONS_MAP = {
  day: Array.from({ length: 31 }, (_, i) => `${i + 1}`),
  month: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  year: Array.from({ length: 100 }, (_, i) => `${2025 - i}`),
};
function ComboBox(props: {
  type: "day" | "month" | "year";
  error: boolean | string;
  onSelect: (value: string) => void;
}) {
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);

  const options = OPTIONS_MAP[props.type];

  const filtered = options.filter((option) =>
    option.toLowerCase().includes(inputValue.toLowerCase()),
  );

  const selectOption = (option: string) => {
    setInputValue(option);
    props.onSelect(option); // Notify parent
    setOpen(false);
  };
  const ref = useRef<HTMLInputElement>(null);

  return (
    <Popover.Root
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          const isValid = options.some(
            (opt) => opt.toLowerCase() === inputValue.toLowerCase(),
          );
          if (!isValid) {
            setInputValue("");
            props.onSelect("");
          }
        }
        setOpen(isOpen);
      }}
    >
      <Popover.Trigger disabled className="max-w-max">
        <input
          ref={ref}
          value={inputValue}
          onChange={(e) => {
            const newValue = e.target.value;
            setInputValue(newValue);
            props.onSelect(newValue); // Update on type
          }}
          onFocus={() => {
            !open && setOpen(true);
            setTimeout(() => {
              ref.current?.focus();
            }, 1);
          }}
          placeholder={props.type[0].toUpperCase() + props.type.slice(1)}
          className={twMerge(
            "bg-input-auth border-border-input-normal-auth focus:border-border-input-select-auth mt-2 w-full rounded-lg border p-2 text-white outline-none placeholder:font-semibold",
            props.error && "border-2 border-red-400",
          )}
        />
      </Popover.Trigger>
      <Popover.Content side="top" sideOffset={0}>
        <div className="bg-canvas-auth max-h-[200px] w-[150px] overflow-y-scroll rounded border border-neutral-700 font-semibold text-white/70 shadow">
          {filtered.length > 0 ? (
            <ul>
              {filtered.map((option) => (
                <li
                  key={option}
                  className="cursor-pointer px-2 py-1 hover:bg-white/5 hover:text-white"
                  onClick={() => selectOption(option)}
                >
                  {option}
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-2 py-1 text-gray-400">No match</div>
          )}
        </div>
      </Popover.Content>
    </Popover.Root>
  );
}
