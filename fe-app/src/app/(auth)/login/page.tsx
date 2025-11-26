"use client";
import { LoaderCircleIcon } from "lucide-react";
import FieldInput from "../_components/field-input";
import useLogin from "./useLogin";

export default function Page() {
  const hooklogin = useLogin();
  return (
    <div className="bg-canvas-auth flex animate-[dialog-show_300ms] flex-col rounded-lg p-8">
      <h1 className="mb-2 text-center text-2xl font-semibold text-white">
        Welcome back!
      </h1>
      <h2 className="mb-5 text-center text-white">
        We’re so excited to see you again!
      </h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          hooklogin.login_handle();
        }}
        className="flex flex-col"
      >
        <FieldInput
          error={hooklogin.error.email}
          label="EMAIL"
          type="text"
          required
          fieldInput="email"
          valueInput={hooklogin.input.email}
          setInput={hooklogin.setInput}
        />
        <div className="mt-5" />
        <FieldInput
          error={hooklogin.error.password}
          label="PASSWORD"
          type="password"
          required
          fieldInput="password"
          valueInput={hooklogin.input.password}
          setInput={hooklogin.setInput}
        />
        <div className="mt-1" />

        {/* <label className="text-blue-discord mr-auto cursor-pointer text-sm font-semibold hover:underline">
          Forgot your password?
        </label> */}
        <button
          disabled={hooklogin.loading}
          type="submit"
          className="bg-blue-discord-fill hover:bg-blue-discord-fill/80 mt-5 mb-2 flex cursor-pointer justify-center rounded-lg py-2 font-semibold text-white transition-all"
        >
          {hooklogin.loading ? (
            <LoaderCircleIcon className="animate-spin" />
          ) : (
            <>Log In</>
          )}
        </button>
      </form>
      <label className="text-sm text-white/60">
        Need an account?{" "}
        <span
          onClick={hooklogin.router_register}
          className="text-blue-discord cursor-pointer font-semibold opacity-100 hover:underline"
        >
          Register
        </span>
      </label>
    </div>
  );
}
