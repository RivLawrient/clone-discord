import InnerSidebar from "./_components/inner-sidebar";
import Sidebar from "./_components/sidebar";
import Header from "./_components/header";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AuthProvider from "./_components/auth-provider";
import FriendProvider from "./_components/friend-provider";
import { get_auth } from "./_getdata/get_auth";

export default async function Layout(props: { children: React.ReactNode }) {
  console.log("aku layout auth");
  const cookie = await cookies();

  if (!cookie.has("token") && !cookie.has("refresh_token")) redirect("/login");

  return (
    <AuthProvider>
      {/* <FriendProvider /> */}
      <div className="bg-discord-bg fixed grid h-screen w-screen grid-rows-[auto_1fr] text-white select-none">
        <Header />
        <div className="grid min-h-0 grid-cols-[auto_auto_1fr]">
          <Sidebar />
          <InnerSidebar />
          {props.children}
        </div>
      </div>
    </AuthProvider>
  );
}
