"use client";
import { LoaderCircleIcon } from "lucide-react";
import FieldInput from "../_components/field-input";
import useRegister from "./useRegister";

export default function Page() {
  const hookregister = useRegister();

  return (
    <div className="bg-canvas-auth flex animate-[dialog-show_300ms] flex-col rounded-lg p-8">
      <h1 className="mb-5 text-center text-2xl font-semibold text-white">
        Create an account
      </h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          hookregister.register_handle();
        }}
        className="flex flex-col"
      >
        <FieldInput
          error={hookregister.error.email}
          label="EMAIL"
          type="text"
          required
          fieldInput="email"
          valueInput={hookregister.input.email}
          setInput={hookregister.setInput}
        />
        <div className="mt-5" />
        <FieldInput
          error={hookregister.error.name}
          label="DISPLAY NAME"
          type="text"
          fieldInput="name"
          valueInput={hookregister.input.name}
          setInput={hookregister.setInput}
        />
        <div className="mt-5" />
        <FieldInput
          error={hookregister.error.username}
          label="USERNAME"
          type="text"
          required
          fieldInput="username"
          valueInput={hookregister.input.username}
          setInput={hookregister.setInput}
        />
        <div className="mt-5" />
        <FieldInput
          error={hookregister.error.password}
          label="PASSWORD"
          type="password"
          required
          fieldInput="password"
          valueInput={hookregister.input.password}
          setInput={hookregister.setInput}
        />
        <div className="mt-5" />

        <FieldInput
          error={hookregister.error.birthdate}
          label="DATE OF BIRTH"
          type="text"
          required
          fieldInput="birthdate"
          valueInput={hookregister.input.birthdate}
          setInput={hookregister.setInput}
          isBirthdate
        />
        <div className="mt-5" />

        <button
          disabled={hookregister.loading}
          type="submit"
          className="bg-blue-discord-fill hover:bg-blue-discord-fill/80 mt-5 mb-2 flex cursor-pointer justify-center rounded-lg py-2 font-semibold text-white transition-all"
        >
          {hookregister.loading ? (
            <LoaderCircleIcon className="animate-spin" />
          ) : (
            <>Create Account</>
          )}
        </button>
      </form>
      <label
        onClick={hookregister.router_login}
        className="text-blue-discord cursor-pointer text-sm font-semibold hover:underline"
      >
        Already have an account? Log in
      </label>
    </div>
  );
}

function birthdate() {
  return <div></div>;
}
