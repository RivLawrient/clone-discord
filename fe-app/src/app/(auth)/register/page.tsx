"use client";
import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";
import FieldInput from "../_components/field-input";
import { useState } from "react";
import { LoaderCircleIcon } from "lucide-react";
import Cookies from "js-cookie";

type RegisterField = {
  email: string;
  name: string;
  username: string;
  password: string;
  birthdate: string;
};

type responseSucces = {
  email: string;
  token: string;
};

export default function Page() {
  const [input, setInput] = useState<RegisterField>({
    email: "",
    name: "",
    username: "",
    password: "",
    birthdate: "",
  });
  const [error, setError] = useState<RegisterField>({
    email: "",
    name: "",
    username: "",
    password: "",
    birthdate: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const register_handle = () => {
    if (!input.birthdate || isNaN(Date.parse(input.birthdate))) {
      setError((prev) => ({
        ...prev,
        birthdate: "invalid birthdate",
      }));
      return; // Jangan lanjut submit
    }

    setLoading(true);
    // console.log("b", input.birthdate);
    fetch(`${process.env.NEXT_PUBLIC_HOST_API}auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      credentials: "include",
    })
      .then(async (resp) => {
        const res = await resp.json();
        if (resp.ok) {
          setError(() => ({
            email: "",
            name: "",
            username: "",
            password: "",
            birthdate: "",
          }));
          const data: responseSucces = res.data;
          Cookies.set("token", data.token, {
            // expires: 7, // dalam hari, artinya token disimpan selama 7 hari
            secure: true, // aktifkan ini kalau pakai HTTPS
            sameSite: "strict", // tambahkan ini untuk menghindari CSRF
          });
          router.refresh();
        }

        if (resp.status === 400) {
          const data: RegisterField = res.data;
          setError(data);
        }
        if (resp.status === 401) {
          const data: string = res.data;
          setError(() => ({
            email: data,
            name: data,
            username: data,
            password: data,
            birthdate: data,
          }));
        }
        if (resp.status === 500) {
          const data: string = res.message;
          setError(() => ({
            email: data,
            name: data,
            username: data,
            password: data,
            birthdate: data,
          }));
        }
        setLoading(false);
      })
      .catch(() => {
        const data = "error server offline";
        setError(() => ({
          email: data,
          name: data,
          username: data,
          password: data,
          birthdate: data,
        }));

        setLoading(false);
      });
  };
  return (
    <div className="bg-canvas-auth flex flex-col rounded-lg p-8">
      <h1 className="mb-5 text-center text-2xl font-semibold text-white">
        Create an account
      </h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          register_handle();
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
          error={error.name}
          label="DISPLAY NAME"
          type="text"
          fieldInput="name"
          valueInput={input.name}
          setInput={setInput}
        />
        <div className="mt-5" />
        <FieldInput
          error={error.username}
          label="USERNAME"
          type="text"
          required
          fieldInput="username"
          valueInput={input.username}
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
        <div className="mt-5" />

        <FieldInput
          error={error.birthdate}
          label="DATE OF BIRTH"
          type="text"
          required
          fieldInput="birthdate"
          valueInput={input.birthdate}
          setInput={setInput}
          isBirthdate
        />
        <div className="mt-5" />

        <button
          disabled={loading}
          type="submit"
          className="bg-blue-discord-fill hover:bg-blue-discord-fill/80 mt-5 mb-2 cursor-pointer rounded-lg py-2 font-semibold text-white transition-all"
        >
          {loading ? (
            <LoaderCircleIcon className="animate-spin place-self-center" />
          ) : (
            <>Create Account</>
          )}
        </button>
      </form>
      <label
        onClick={() => router.push("/login")}
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
