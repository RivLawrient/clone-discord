import HydrateChannel from "../../_components/hydrate-channel";
import { apiCall } from "../../_helper/api-client";

export default async function Layout(props: {
  children: React.ReactNode;
  params: { server: string };
}) {
  const { server } = await props.params;

  return (
    <>
      <HydrateChannel server={server}>{props.children}</HydrateChannel>
    </>
  );
}
