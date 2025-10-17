import { DropdownServerInnerSidebar } from "./dropdown-server-inner-sidebar";
import MainSectionInnerSidebar from "./main-section-inner-sidebar";
import { RightClickMenuMainSection } from "./right-click-menu-main-section";

export default function ServerInnerSidebar() {
  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_1fr] overflow-hidden rounded-ss-xl pb-16">
      <DropdownServerInnerSidebar />
      <MainSectionInnerSidebar />
    </div>
  );
}
