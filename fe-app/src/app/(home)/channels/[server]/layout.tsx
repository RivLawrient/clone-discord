import HydrateChannel from "../../_components/hydrate-channel";

export default function Layout(props: { children: React.ReactNode }) {
  return (
    <>
      <HydrateChannel>{props.children}</HydrateChannel>
    </>
  );
}
