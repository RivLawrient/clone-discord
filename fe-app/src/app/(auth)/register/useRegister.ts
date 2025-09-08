import { useRouter } from "next/navigation";
import { useState } from "react";

type RegisterField = {
  email: string;
  name: string;
  username: string;
  password: string;
  birthdate: string;
};

type ResponseSucces = {
  email: string;
  token: string;
};
export default function useRegister() {
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
          const data: ResponseSucces = res.data;
          document.cookie = `token=${data.token}; path=/`;
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

  return {
    register_handle,
    input,
    setInput,
    error,
    loading,
    router,
  };
}
