import { notFound } from "next/navigation";

export default async function Page(props: {
  params: Promise<{ server: string }>;
}) {
  const { server } = await props.params;
  console.log(server);
  if (server.startsWith("%40")) {
    notFound();
  }
  return <>{server}</>;
}
