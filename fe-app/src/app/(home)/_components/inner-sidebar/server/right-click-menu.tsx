import ModalContent from "@/app/(home)/_ui/modal/modal_content";
import { ContextMenu, Dialog } from "radix-ui";
import { SetStateAction, useState } from "react";
import { ModalInviteFriend } from "./modal-invite-friend";
import { ModalCreateCategory } from "./modal-create-category";
import {
  useRightClickMenuCategorySection,
  useRightClickMenuChannel,
  useRightClickMenuMainSection,
} from "./useRightClickMenu";
import { ModalCreateChannel } from "./modal-create-channel";
import ModalDeleteCategory from "./modal-delete-category";
import {
  CategoryChannel,
  ChannelList,
} from "@/app/(home)/_state/channel-list-atom";
import ModalDeleteChannel from "./modal-delete-channel";

export function RightClickMenuMainSection(props: {
  children: React.ReactNode;
}) {
  const {
    openCategory,
    setOpenCategory,
    openChannel,
    setOpenChannel,
    openInvite,
    setOpenInvite,
    currentServer,
    inputCategory,
    setInputCategory,
    createCategoryHandle,
    loading,
    radioIsVoice,
    changeRadioTextHandle,
    changeRadioVoiceHandle,
    inputChannel,
    setInputChannel,
    createChannelHandle,
    createChannelinCategoryHandle,
  } = useRightClickMenuMainSection();

  return (
    <>
      <ModalCreateChannel
        open={openChannel}
        setOpen={setOpenChannel}
        onCategory={false}
        isVoice={radioIsVoice}
        changeRadioTextHandle={changeRadioTextHandle}
        changeRadioVoiceHandle={changeRadioVoiceHandle}
        input={inputChannel}
        setInput={setInputChannel}
        loading={loading}
        handle={createChannelHandle}
        handle2={createChannelinCategoryHandle}
      />
      <ModalCreateCategory
        open={openCategory}
        setOpen={setOpenCategory}
        input={inputCategory}
        setInput={setInputCategory}
        handle={createCategoryHandle}
        loading={loading}
      />
      <ModalInviteFriend
        open={openInvite}
        setOpen={setOpenInvite}
      />
      <ContextMenu.Root>
        <ContextMenu.Trigger asChild>{props.children}</ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content className="bg-[#28282d] p-2 border border-[#36363b] rounded-lg text-white text-sm font-semibold">
            {currentServer?.is_owner && (
              <>
                <ContextMenu.Item
                  onClick={() => setOpenChannel(true)}
                  className="p-2 rounded-lg hover:bg-[#313136] outline-none cursor-pointer transition-all"
                >
                  Create Channel
                </ContextMenu.Item>
                <ContextMenu.Item
                  onClick={() => setOpenCategory(true)}
                  className="p-2 rounded-lg hover:bg-[#313136] outline-none cursor-pointer transition-all"
                >
                  Create Category
                </ContextMenu.Item>
              </>
            )}
            <ContextMenu.Item
              onClick={() => setOpenInvite(true)}
              className="p-2 rounded-lg hover:bg-[#313136] outline-none cursor-pointer transition-all"
            >
              Invite People
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>
    </>
  );
}

export function RightClickMenuCategorySection(props: {
  children: React.ReactNode;
  data: CategoryChannel;
}) {
  const { openDelete, setOpenDelete, loading, deleteCategoryHandle } =
    useRightClickMenuCategorySection();
  return (
    <>
      <ModalDeleteCategory
        open={openDelete}
        setOpen={setOpenDelete}
        data={props.data}
        loading={loading}
        handle={deleteCategoryHandle}
      />
      <ContextMenu.Root>
        <ContextMenu.Trigger asChild>{props.children}</ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content className="bg-[#28282d] p-2 border border-[#36363b] rounded-lg text-white text-sm font-semibold">
            <ContextMenu.Item
              // onClick={() => setOpenDelete(true)}
              className="p-2 rounded-lg hover:bg-[#313136] outline-none cursor-pointer transition-all"
            >
              Edit Category
            </ContextMenu.Item>
            <ContextMenu.Item
              onClick={() => setOpenDelete(true)}
              className="p-2 rounded-lg hover:bg-[#36292e] text-[#ee6d6a] outline-none cursor-pointer transition-all"
            >
              Delete Category
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>
    </>
  );
}

export function RightClickMenuChannel(props: {
  children: React.ReactNode;
  data: ChannelList;
  dataCategory?: CategoryChannel;
}) {
  const { openDelete, setOpenDelete, loading, deleteCategoryHandle } =
    useRightClickMenuChannel();
  return (
    <>
      <ModalDeleteChannel
        open={openDelete}
        setOpen={setOpenDelete}
        data={props.data}
        loading={loading}
        handle={deleteCategoryHandle}
        dataCategory={props.dataCategory}
      />
      <ContextMenu.Root>
        <ContextMenu.Trigger asChild>{props.children}</ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content className="bg-[#28282d] p-2 border border-[#36363b] rounded-lg text-white text-sm font-semibold">
            <ContextMenu.Item
              // onClick={() => setOpenDelete(true)}
              className="p-2 rounded-lg hover:bg-[#313136] outline-none cursor-pointer transition-all"
            >
              Edit Channel
            </ContextMenu.Item>
            <ContextMenu.Item
              onClick={() => setOpenDelete(true)}
              className="p-2 rounded-lg hover:bg-[#36292e] text-[#ee6d6a] outline-none cursor-pointer transition-all"
            >
              Delete Channel
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>
    </>
  );
}
