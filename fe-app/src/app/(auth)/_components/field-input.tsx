import { SetStateAction } from "react";
import { twMerge } from "tailwind-merge";

export default function FieldInput(props: {
  error: string
  label: string
  required?: boolean
  type: React.HTMLInputTypeAttribute
  fieldInput: string
  valueInput: any
  setInput: React.Dispatch<SetStateAction<any>>
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
    </>
  )
}
