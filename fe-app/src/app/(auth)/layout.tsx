import { cookies } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function Layout(props: { children: React.ReactNode }) {
  const cookie = await cookies();

  console.log(cookie.get("token"));
  if (cookie.get("token")) redirect("/");
  return (
    <div
      style={{ backgroundImage: "url('/bg.svg')", backgroundSize: "cover" }}
      className="fixed flex h-screen w-screen items-center justify-center"
    >
      <Image
        className="absolute top-0 left-0 m-11"
        src="/discord.svg"
        width={124}
        height={24}
        alt="logo discord name"
        priority
      />
      {props.children}
    </div>
  );
}
