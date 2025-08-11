import { Tooltip } from "radix-ui";
import { Popper } from "radix-ui/internal";

export default function TooltipDesc(props: {
  children: React.ReactNode;
  text: string;
  side: React.ComponentProps<typeof Tooltip.Content>["side"];
  is_child?: boolean;
}) {
  return (
    <Tooltip.Provider>
      <Tooltip.Root delayDuration={0} disableHoverableContent>
        <Tooltip.Trigger asChild={!props.is_child}>
          {props.children}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side={props.side}
            className="bg-tooltip-bg border-tooltip-border text-tooltip-text z-[50] rounded-lg border p-3 text-[14px] leading-none font-bold shadow-2xl"
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
