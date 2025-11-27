"use client";
import { useAtom } from "jotai";
import {
  CategoryChannel,
  ChannelList,
  channelListAtom,
} from "../_state/channel-list-atom";
import { useEffect, useState } from "react";
import { apiCall } from "../_helper/api-client";
import { socketAtom } from "../_state/socket-atom";
import { Dialog } from "radix-ui";
import { useParams } from "next/navigation";
import {
  MemberList,
  memberListServerAtom,
} from "../_state/membet-list-server-atom";
import { USER_STATUS } from "../_state/user-atom";

export default function HydrateChannel(props: { children: React.ReactNode }) {
  const [channels, setChannels] = useAtom(channelListAtom);
  const [loading, setLoading] = useState(false);
  const { server } = useParams();
  const [sockets, setSockets] = useAtom(socketAtom);
  const [list, setList] = useAtom(memberListServerAtom);

  useEffect(() => {
    apiCall(`${process.env.NEXT_PUBLIC_HOST_API}server/members/${server}`, {
      method: "GET",
    }).then(async (resp) => {
      const res = await resp.json();
      if (resp.ok) {
        const data = res.data;
        setList(data);
      }
    });
  }, [server]);

  useEffect(() => {
    if (!sockets) return;

    const handleMessage = (e: MessageEvent) => {
      const data = JSON.parse(e.data);

      if (data.server_id && data.list && data.server_id === server) {
        setChannels((p) =>
          p.map((v) =>
            v.server_id == data.server_id
              ? {
                  ...v,
                  category: data.list.category,
                  channel: data.list.channel,
                }
              : v
          )
        );
      }

      if (data.server_id && data.new_member) {
        if (data.server_id == server) {
          const result: MemberList = data.new_member;
          setList((v) => [...v, result]);
        }
      }

      if (data.server_id && data.leave_member) {
        if (data.server_id == server) {
          const result: MemberList = data.leave_member;
          setList((v) => v.filter((vv) => vv.user_id != result.user_id));
        }
      }
    };

    sockets.addEventListener("message", handleMessage);

    return () => {
      sockets.removeEventListener("message", handleMessage);
    };
  }, [sockets, server]);

  return (
    <>
      <Dialog.Root open={false}>
        <Dialog.Content className="fixed top-0 left-0 right-0 bottom-0 bg-white z-999">
          <Dialog.Title></Dialog.Title>
        </Dialog.Content>
      </Dialog.Root>
      {!loading && props.children}
    </>
  );
}
