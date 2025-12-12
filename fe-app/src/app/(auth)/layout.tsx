import { cookies } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function Layout(props: { children: React.ReactNode }) {
  const cookie = await cookies();

  if (cookie.get("token")) redirect("/");
  return (
    <div
      style={{ backgroundImage: "url('/bg.svg')", backgroundSize: "cover" }}
      className="fixed flex h-screen w-screen items-center justify-center"
    >
      {props.children}
    </div>
  );
}
