import { Tooltip } from "radix-ui";

export default function TooltipDetail(props: {
  children: React.ReactNode;
  text: string;
  side: React.ComponentProps<typeof Tooltip.Content>["side"];
}) {
  return (
    <Tooltip.Provider>
      <Tooltip.Root
        delayDuration={0}
        disableHoverableContent
      >
        <Tooltip.Trigger asChild>{props.children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side={props.side}
            className="bg-tooltip-bg border-tooltip-border text-tooltip-text z-[50] rounded-lg border p-3 text-[14px] leading-none font-bold shadow-2xl transition-all data-[state=closed]:animate-[dropdown-hide_150ms] data-[state=open]:animate-[dropdown-show_150ms]"
            sideOffset={3}
          >
            {props.text}
            <Tooltip.Arrow className="border-tooltip-border bg-tooltip-bg fill-tooltip-bg z-50 size-1.5 translate-y-[calc(-50%)] rotate-45 border-r border-b" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
