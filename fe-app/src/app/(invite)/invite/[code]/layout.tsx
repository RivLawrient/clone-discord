import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const cookie = await cookies();

  if (!cookie.has("token") && !cookie.has("refresh_token")) {
    redirect(`/login?returnTo=/invite/${code}`);
  }

  return <>{children}</>;
}
