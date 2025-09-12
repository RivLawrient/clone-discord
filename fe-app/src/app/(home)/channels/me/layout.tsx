export default function Layout(props: { children: React.ReactNode }) {
  return <div className="bg-layout-bg min-h-0 min-w-0">{props.children}</div>;
}
