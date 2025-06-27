import Image from "next/image";

export default function Layout(props: { children: React.ReactNode }) {
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
