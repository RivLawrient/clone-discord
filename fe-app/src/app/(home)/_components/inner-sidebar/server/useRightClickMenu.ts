import { apiCall } from "@/app/(home)/_helper/api-client";
import {
  CategoryChannel,
  ChannelList,
  channelListAtom,
} from "@/app/(home)/_state/channel-list-atom";
import { serverAtom } from "@/app/(home)/_state/server-atom";
import { useAtom } from "jotai";
import { useParams } from "next/navigation";
import { useState } from "react";

export function useRightClickMenuMainSection() {
  const [openChannel, setOpenChannel] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);
  const [openInvite, setOpenInvite] = useState(false);
  const [servers] = useAtom(serverAtom);
  const { server } = useParams();
  const currentServer = servers?.find((v) => v.id === server);
  const [inputCategory, setInputCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [channel, setChannel] = useAtom(channelListAtom);
  const [radioIsVoice, setRadioIsVoice] = useState(false);
  const [inputChannel, setInputChannel] = useState("");

  const createCategoryHandle = () => {
    setLoading(true);
    apiCall(`${process.env.NEXT_PUBLIC_HOST_API}channel/category`, {
      method: "POST",
      body: JSON.stringify({
        name: inputCategory,
        server_id: server,
      }),
    })
      .then(async (resp) => {
        const res = await resp.json();
        if (resp.ok) {
          const data: CategoryChannel = res.data;
          setChannel((p) => ({ ...p, category: [...p.category, data] }));
          setInputCategory("");
          setOpenCategory(false);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });

    console.log("create category");
  };

  const changeRadioTextHandle = () => {
    setRadioIsVoice(false);
  };
  const changeRadioVoiceHandle = () => {
    setRadioIsVoice(true);
  };

  const createChannelHandle = () => {
    setLoading(true);
    apiCall(`${process.env.NEXT_PUBLIC_HOST_API}channel`, {
      method: "POST",
      body: JSON.stringify({
        server_id: currentServer?.id,
        name: inputChannel,
        is_voice: radioIsVoice,
        // category_id: null,
      }),
    })
      .then(async (resp) => {
        const res = await resp.json();
        if (resp.ok) {
          const data: ChannelList = res.data;
          setChannel((p) => ({ ...p, channel: [...p.channel, data] }));
          setInputChannel("");
          setOpenChannel(false);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  };

  const createChannelinCategoryHandle = (categoryId: string) => {
    setLoading(true);
    apiCall(`${process.env.NEXT_PUBLIC_HOST_API}channel`, {
      method: "POST",
      body: JSON.stringify({
        server_id: currentServer?.id,
        name: inputChannel,
        is_voice: radioIsVoice,
        category_id: categoryId,
      }),
    })
      .then(async (resp) => {
        const res = await resp.json();
        if (resp.ok) {
          const data: ChannelList = res.data;
          setChannel((p) => ({
            ...p,
            category: p.category.map((v) =>
              v.id === categoryId ? { ...v, channel: [...v.channel, data] } : v
            ),
          }));
          setInputChannel("");
          setOpenChannel(false);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  };

  return {
    openChannel,
    setOpenChannel,
    openCategory,
    setOpenCategory,
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
  };
}

export function useRightClickMenuCategorySection() {
  const [openDelete, setOpenDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [channel, setChannel] = useAtom(channelListAtom);

  const deleteCategoryHandle = (id: string) => {
    setLoading(true);
    apiCall(`${process.env.NEXT_PUBLIC_HOST_API}channel/category/` + id, {
      method: "DELETE",
    })
      .then(async (resp) => {
        const res = await resp.json();
        if (resp.ok) {
          const data: CategoryChannel = res.data;
          setChannel((p) => ({
            ...p,
            category: p.category.filter((v) => v.id != data.id),
          }));
          setOpenDelete(false);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  };

  return {
    openDelete,
    setOpenDelete,
    loading,
    deleteCategoryHandle,
  };
}

export function useRightClickMenuChannel() {
  const [openDelete, setOpenDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [channel, setChannel] = useAtom(channelListAtom);

  const deleteCategoryHandle = (id: string, categoryId?: string) => {
    setLoading(true);
    apiCall(`${process.env.NEXT_PUBLIC_HOST_API}channel/` + id, {
      method: "DELETE",
      body: JSON.stringify({
        category_id: categoryId,
      }),
    })
      .then(async (resp) => {
        const res = await resp.json();
        if (resp.ok) {
          const data: ChannelList = res.data;
          if (categoryId) {
            setChannel((p) => ({
              ...p,
              category: p.category.map((v) =>
                v.id == categoryId
                  ? {
                      ...v,
                      channel: v.channel.filter((vv) => vv.id != data.id),
                    }
                  : v
              ),
            }));
          } else {
            setChannel((p) => ({
              ...p,
              channel: p.channel.filter((v) => v.id != data.id),
            }));
          }
          setOpenDelete(false);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  };

  return {
    openDelete,
    setOpenDelete,
    loading,
    deleteCategoryHandle,
  };
}
