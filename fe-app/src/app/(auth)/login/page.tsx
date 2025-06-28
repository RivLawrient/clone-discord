"use client";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

type LoginField = {
  email: string;
  password: string;
};

export default function Page() {
  const [input, setInput] = useState<LoginField>({
    email: "",
    password: "",
  });

  const [error, setError] = useState<LoginField>({
    email: "",
    password: "",
  });

  const login_handle = () => {
    setError({
      email: "",
      password: "",
    });

    fetch(`${process.env.NEXT_PUBLIC_HOST_API}auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    })
      .then(async (resp) => {
        const res = await resp.json();
        if (resp.status === 400) {
          const data: LoginField = res.data;
          setError(data);
        }
        if (resp.status === 401) {
          const data: string = res.data;
          setError(() => ({
            email: data,
            password: data,
          }));
        }
        if (resp.status === 500) {
          const data: string = res.message;
          setError(() => ({
            email: data,
            password: data,
          }));
        }
      })
      .catch(() =>
        setError({
          email: "error server offline",
          password: "error server offline",
        }),
      );
  };
  return (
    <div className="bg-canvas-auth flex flex-col rounded-lg p-8">
      <h1 className="mb-2 text-center text-2xl font-semibold text-white">
        Welcome back!
      </h1>
      <h2 className="mb-5 text-center text-white">
        We’re so excited to see you again!
      </h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          login_handle();
        }}
        className="flex flex-col"
      >
        <label
          className={twMerge(
            "text-xs font-bold text-white",
            error.email && "text-red-400",
          )}
        >
          EMAIL
          {error.email ? (
            <span className="font-normal text-red-400 italic">
              {" "}
              - {error.email}
            </span>
          ) : (
            <span className="pl-1 text-red-500">*</span>
          )}
        </label>
        <input
          type="text"
          required
          max={255}
          value={input.email}
          onChange={(e) => setInput((v) => ({ ...v, email: e.target.value }))}
          spellCheck="false"
          className={twMerge(
            "bg-input-auth border-border-input-normal-auth focus:border-border-input-select-auth mt-2 mb-5 w-[400px] rounded-lg border p-2 text-white outline-none",
            error.email && "border-2 border-red-400",
          )}
        />
        <label
          className={twMerge(
            "text-xs font-bold text-white",
            error.password && "text-red-400",
          )}
        >
          PASSWORD
          {error.password ? (
            <span className="font-normal text-red-400 italic">
              {" "}
              - {error.password}
            </span>
          ) : (
            <span className="pl-1 text-red-500">*</span>
          )}
        </label>
        <input
          type="password"
          required
          max={255}
          value={input.password}
          onChange={(e) =>
            setInput((v) => ({ ...v, password: e.target.value }))
          }
          spellCheck="false"
          className={twMerge(
            "bg-input-auth border-border-input-normal-auth focus:border-border-input-select-auth mt-2 mb-1 w-[400px] rounded-lg border p-2 text-white outline-none",
            error.password && "border-2 border-red-400",
          )}
        />
        <label className="text-blue-discord mr-auto cursor-pointer text-sm font-semibold hover:underline">
          Forgot your password?
        </label>
        <button
          type="submit"
          className="bg-blue-discord-fill hover:bg-blue-discord-fill/80 mt-5 mb-2 cursor-pointer rounded-lg py-2 font-semibold text-white transition-all"
        >
          Log In
        </button>
      </form>
      <label className="text-sm text-white/60">
        Need an account?{" "}
        <span className="text-blue-discord cursor-pointer font-semibold opacity-100 hover:underline">
          Register
        </span>
      </label>
    </div>
  );
}
