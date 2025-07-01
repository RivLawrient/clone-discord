import { twMerge } from "tailwind-merge";
import { DropdownMenu, Popover, Select } from "radix-ui";
import { useRef, useState } from "react";
import { ArrowDownIcon } from "lucide-react";

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
        <InputBirth />
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

function InputBirth() {
  return (
    <>
      <div className="grid grid-cols-[1fr_auto_auto]">
        <ComboBox />
      </div>
    </>
  );
}

const options = ["Apple", "Banana", "Cherry", "Date"];

function ComboBox() {
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = options.filter((option) =>
    option.toLowerCase().includes(inputValue.toLowerCase()),
  );

  const selectOption = (option: string) => {
    setInputValue(option);
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
          }
        }
        setOpen(isOpen);
      }}
    >
      <Popover.Trigger disabled>
        <input
          ref={ref}
          value={inputValue}
          onChange={(e) => {
            const newValue = e.target.value;
            setInputValue(newValue);
          }}
          onFocus={() => {
            !open && setOpen(true);
            setTimeout(() => {
              ref.current?.focus();
            }, 1);
          }}
          placeholder="Type or select..."
          className="w-64 border px-2 py-1 outline-none"
        />
      </Popover.Trigger>
      <Popover.Content
        side="top"
        className="w-64 rounded border bg-white shadow"
      >
        {filtered.length > 0 ? (
          <ul>
            {filtered.map((option) => (
              <li
                key={option}
                className="cursor-pointer px-2 py-1 hover:bg-gray-100"
                onClick={() => selectOption(option)}
              >
                {option}
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-2 py-1 text-gray-400">No match</div>
        )}
      </Popover.Content>
    </Popover.Root>
  );
}
