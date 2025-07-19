import InnerSidebar from "./_components/inner-sidebar";
import Sidebar from "./_components/sidebar";
import Header from "./_components/header";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AuthProvider from "./_components/auth-provider";

export default async function Layout(props: { children: React.ReactNode }) {
  console.log("aku layout auth");
  const cookie = await cookies();

  if (!cookie.has("token") && !cookie.has("refresh_token")) redirect("/login");
  // fetch(`${process.env.NEXT_PUBLIC_HOST_API}auth/me`, {
  //   method: "GET",
  //   headers: {
  //     Authorization: "Bearer " + cookie.get("token")?.value,
  //   },
  // }).then(async (res) => {
  //   const resp = await res.json();
  //   console.log(resp);

  //   if (res.status == 401) {
  //     fetch(`${process.env.NEXT_PUBLIC_HOST_API}auth/refresh`, {
  //       method: "GET",
  //       credentials: "include",
  //     }).then(async (ress) => {
  //       const resp = await ress.json();
  //       console.log("refresh, ", resp);
  //     });
  //   }
  // });

  return (
    <AuthProvider>
      <div className="fixed grid h-screen w-screen grid-rows-[auto_1fr] bg-neutral-950 text-white">
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
