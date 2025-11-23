import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AuthProvider from "./_components/auth-provider";
import Sidebar from "@/components/sidebar/sidebar";
import Header from "@/components/header/header";
import InnerSidebar from "@/components/inner-sidebar/inner-sidebar";

export default async function Layout(props: { children: React.ReactNode }) {
  const cookie = await cookies();

  if (!cookie.has("token") && !cookie.has("refresh_token")) redirect("/login");

  return (
    <>
      <AuthProvider>
        <div className="bg-discord-bg fixed grid h-screen w-screen grid-rows-[auto_1fr] text-white select-none">
          <Header />
          <div className="grid min-h-0 grid-cols-[auto_auto_1fr]">
            {/* <Sidebar /> */}
            <Sidebar />
            <InnerSidebar />
            {props.children}
          </div>
        </div>
      </AuthProvider>
    </>
  );
}
