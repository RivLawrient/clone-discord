"use client";
import { useEffect, useState } from "react";
import useServerInit from "./ useServerInit";
import useFriendInit from "./useFriendInit";
import useIdleDetection from "./useIdleDetection";
import useMediaPermission from "./useMediaPermission";
import useSocketConnection from "./useSocketConnection";
import useUserInit from "./useUserInit";

export default function AuthProvider() {
  const [userLoaded, setUserLoaded] = useState(false);
  const [friendsLoaded, setFriendsLoaded] = useState(false);
  const [serverLoaded, setServerLoaded] = useState(false);
  const allLoaded = userLoaded && friendsLoaded && serverLoaded;

  useUserInit(setUserLoaded);
  useFriendInit(setFriendsLoaded);
  useServerInit(setServerLoaded);
  useSocketConnection();
  useIdleDetection();
  useMediaPermission();

  if (!allLoaded) return <div className="h-screen w-screen">Loading</div>;

  return null;
}
