import { useRouter } from "next/navigation";
import { useState } from "react";

type LoginField = {
  email: string;
  password: string;
};

type ResponseSucces = {
  email: string;
  token: string;
};

export default function useLogin() {
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
      credentials: "include",
    })
      .then(async (resp) => {
        const res = await resp.json();
        if (resp.ok) {
          setError(() => ({
            email: "",
            password: "",
          }));
          const data: ResponseSucces = res.data;
          document.cookie = `token=${data.token}; path=/`;
          router.refresh();
        }
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

  return {
    login_handle,
    input,
    setInput,
    error,
    loading,
    router
  };
}
