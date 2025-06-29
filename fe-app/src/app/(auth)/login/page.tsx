"use client";
import { LoaderCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import FieldInput from "../_components/field-input";

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
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const login_handle = () => {
    setLoading(true);

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
        setLoading(false);
      })
      .catch(() => {
        setError({
          email: "error server offline",
          password: "error server offline",
        }),
          setLoading(false);
      });
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
        <FieldInput
          error={error.email}
          label="EMAIL"
          type="text"
          required
          fieldInput="email"
          valueInput={input.email}
          setInput={setInput}
        />
        <div className="mt-5" />
        <FieldInput
          error={error.password}
          label="PASSWORD"
          type="password"
          required
          fieldInput="password"
          valueInput={input.password}
          setInput={setInput}
        />
        <div className="mt-1" />

        <label className="text-blue-discord mr-auto cursor-pointer text-sm font-semibold hover:underline">
          Forgot your password?
        </label>
        <button
          disabled={loading}
          type="submit"
          className="bg-blue-discord-fill hover:bg-blue-discord-fill/80 mt-5 mb-2 cursor-pointer rounded-lg py-2 font-semibold text-white transition-all"
        >
          {loading ? (
            <LoaderCircleIcon className="animate-spin place-self-center" />
          ) : (
            <>Log In</>
          )}
        </button>
      </form>
      <label className="text-sm text-white/60">
        Need an account?{" "}
        <span
          onClick={() => router.push("/register")}
          className="text-blue-discord cursor-pointer font-semibold opacity-100 hover:underline"
        >
          Register
        </span>
      </label>
    </div>
  );
}
