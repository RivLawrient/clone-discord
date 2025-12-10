import { Suspense } from "react";

export default function Layout(props: { children: React.ReactNode }) {
  return (
    <>
      <Suspense
        fallback={<div className="w-screen h-screen bg-amber-400">Loading</div>}
      >
        {props.children}
      </Suspense>
    </>
  );
}
