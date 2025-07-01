import { twMerge } from "tailwind-merge";
import { DropdownMenu, Select } from "radix-ui"
import { useRef, useState } from "react";
import { ArrowDownIcon } from "lucide-react";

export default function FieldInput(props: {
  error: string
  label: string
  required?: boolean
  type: React.HTMLInputTypeAttribute
  fieldInput: string
  valueInput: any
  isBirthdate?: boolean
  setInput: React.Dispatch<React.SetStateAction<any>>
}) {
  const req_error = props.error && (props.required || props.valueInput !== "")
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
        ) : props.required && (
          <span className="pl-1 text-red-500">*</span>
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
          onChange={(e) => props.setInput((v: any) => ({ ...v, [props.fieldInput]: e.target.value }))}
          spellCheck="false"
          className={twMerge(
            "bg-input-auth border-border-input-normal-auth focus:border-border-input-select-auth mt-2 w-[400px] rounded-lg border p-2 text-white outline-none",
            req_error && "border-2 border-red-400",
          )}
        />
      )}
    </>
  )
}

function InputBirth() {
  return (<>
    <div className="grid grid-cols-[1fr_auto_auto]">
      <SelectBirth />
      <SelectBirth />
      <SelectBirth />
    </div>
  </>)
}

function SelectBirth() {
  const [value, setValue] = useState("")
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLInputElement>(null)
  return (
    <Select.Root>
      <Select.Trigger>
        <Select.Value placeholder="Anu" />
      </Select.Trigger>
      <Select.Portal>
        <Select.Content side="top" sideOffset={100}>
          <Select.Viewport>
            <Select.Item value="wadu">
              <Select.ItemText>"wadu"</Select.ItemText>
            </Select.Item>
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
