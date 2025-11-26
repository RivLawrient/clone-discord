import { userAtom, UserCurrent } from "@/app/(home)/_state/user-atom";
import { useAtom } from "jotai";
import { PencilIcon } from "lucide-react";
import { Popover } from "radix-ui";
import { useEffect, useMemo, useRef, useState } from "react";
import UserAvatar from "../../user-avatar";
import { SetStateAction } from "jotai";
import { apiCall, GetCookie } from "@/app/(home)/_helper/api-client";

export function ProfileView() {
  const [user, setUser] = useAtom(userAtom);
  const [current, setCurrent] = useState<UserCurrent>({
    email: "",
    name: "",
    username: "",
    bio: "",
    avatar: "",
    avatar_bg: "",
    banner_color: "",
    status_activity: "Do Not Disturb",
  });
  const save =
    user.avatar != current.avatar ||
    user.name != current.name ||
    user.bio.replace(/\r\n/g, "\n").trim() !=
      current.bio.replace(/\r\n/g, "\n").trim() ||
    user.banner_color != current.banner_color;

  useEffect(() => {
    setCurrent(user);
  }, [user]);

  const [file, setFile] = useState<File>();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const data = e.target.files[0];
      setFile(e.target.files[0]);
      setCurrent((v) => ({ ...v, avatar: URL.createObjectURL(data) }));
    }
    e.target.value = "";
  };

  const removeHandler = () => {
    setCurrent((v) => ({ ...v, avatar: "" }));
    setFile(undefined);
  };

  function getContrastYIQ(hex: string) {
    hex = hex.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "black" : "white";
  }

  return (
    <div>
      {save && (
        <SaveModal
          current={current}
          setCurrent={setCurrent}
          name={current.name}
          banner_color={current.banner_color}
          bio={current.bio}
          avatar={file}
          setFile={setFile}
        />
      )}
      <h1 className="mb-4 text-2xl font-semibold text-white">Profiles</h1>
      <div className="grid grid-cols-2 gap-10">
        <div>
          <div>
            <h1 className="mb-2 font-semibold">Display Name</h1>
            <input
              type="text"
              value={current.name}
              onChange={(e) =>
                setCurrent((v) => ({ ...v, name: e.target.value }))
              }
              className="rounded-lg border border-[#36363b] bg-[#1d1d21] p-2 outline-none focus:border-[#5098ed]"
            />
          </div>
          <hr className="my-6 border-[#2e2e33]" />
          <div>
            <h1 className="mb-2 font-semibold">Avatar</h1>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={handleClick}
                className="flex cursor-pointer rounded-lg bg-[#5865f2] px-3 py-2 text-sm font-semibold hover:bg-[#5865f2]/75"
              >
                Change Avatar
              </button>
              <button
                onClick={removeHandler}
                className="cursor-pointer rounded-lg bg-[#29292d] px-3 py-2 text-sm font-semibold hover:brightness-125"
              >
                Remove Avatar
              </button>
            </div>
          </div>
          <hr className="my-6 border-[#2e2e33]" />
          <div>
            <h1 className="mb-2 font-semibold">Banner Color</h1>

            <ColoPickerPopup
              color={current.banner_color}
              setColor={(prev) =>
                setCurrent((v) => ({ ...v, banner_color: prev }))
              }
            >
              <div
                style={{
                  backgroundColor: current.banner_color,
                }}
                className="relative h-[50px] w-[70px] rounded-lg"
              >
                <PencilIcon
                  size={24}
                  color={getContrastYIQ(current.banner_color)}
                  className="absolute right-0"
                />
              </div>
            </ColoPickerPopup>
          </div>
          <hr className="my-6 border-[#2e2e33]" />
          <div className="relative">
            <h1 className="mb-2 font-semibold">About Me</h1>
            <h1 className="absolute right-0 bottom-0 m-4 font-semibold">
              {50 - current.bio.length}
            </h1>
            <textarea
              value={current.bio}
              onChange={(e) =>
                setCurrent((v) => ({ ...v, bio: e.target.value }))
              }
              rows={4}
              maxLength={50}
              className="w-full resize-none rounded-lg border border-[#36363b] bg-[#1d1d21] p-2 outline-none focus:border-[#5098ed]"
            />
          </div>
        </div>
        <div>
          <div>
            <h1 className="mb-2 font-semibold">Preview</h1>
            <div className="flex w-full flex-col overflow-hidden rounded-lg shadow-[8px_8px_30px_rgba(0,0,0,0.05)]">
              <div
                style={{
                  backgroundColor: current.banner_color,
                }}
                className="h-[105px]"
              />
              <div className="flex flex-col bg-[#242429] p-4">
                <div className="-mt-14 flex size-fit rounded-full bg-[#242429] p-2">
                  <UserAvatar
                    px={80}
                    StatusUser={user.status_activity}
                    avatar={current.avatar}
                    avatarBg={current.avatar_bg}
                    name={current.name}
                    indicator_outline={6}
                    indicator_size={16}
                    not_hover="outline-[#242429]"
                    preview={!!file}
                  />
                </div>
                <h1 className="font-semibold truncate">{current.name}</h1>
                <h1 className="text-sm font-semibold truncate">
                  {current.username}
                </h1>
                <h1 className="mt-2 break-all mb-2 text-sm break-words whitespace-pre-line">
                  {current.bio}
                </h1>
                <button className="cursor-pointer rounded-lg bg-[#5865f2] py-2 text-xs font-semibold hover:bg-[#5865f2]/75">
                  Example Button
                </button>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <h1 className="mb-2 font-semibold">Nameplat Preview</h1>
            <div className="flex w-full items-center rounded-lg bg-[#333338] p-2 text-black">
              <UserAvatar
                px={32}
                StatusUser="Do Not Disturb"
                avatar={current.avatar}
                avatarBg={current.avatar_bg}
                name={current.name}
                preview={!!file}
              />
              <span className="ml-2 font-semibold truncate text-white">
                {current.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  return <></>;
}

function SaveModal(props: {
  current: UserCurrent;
  setCurrent: React.Dispatch<SetStateAction<UserCurrent>>;
  name: string;
  banner_color: string;
  bio: string;
  avatar: File | undefined;
  setFile: React.Dispatch<SetStateAction<File | undefined>>;
}) {
  const [user, setUser] = useAtom(userAtom);
  const formData = new FormData();
  formData.append("name", props.name);
  formData.append("banner_color", props.banner_color);
  formData.append("bio", props.bio);

  if (props.avatar) {
    formData.append("avatar", props.avatar, props.avatar.name);
  }
  if (user.avatar != "" && props.current.avatar == "") {
    //dihapus
    formData.append("avatar", new Blob());
  }

  const saveHandle = () => {
    apiCall(`${process.env.NEXT_PUBLIC_HOST_API}user/me/profile`, {
      method: "PATCH",
      body: formData,
    }).then(async (resp) => {
      const res = await resp.json();
      if (resp.ok) {
        const updated = {
          ...user,
          avatar: res.data.avatar,
          name: res.data.name,
          banner_color: res.data.banner_color,
          bio: res.data.bio,
        };

        setUser(updated);
        props.setFile(undefined);
      }
    });
  };

  return (
    <div className="absolute z-10 right-0 bottom-0 left-0 m-4 flex animate-[from-bottom_300ms] items-center rounded-lg border border-[#393a3f] bg-[#2c2d32] p-4 font-semibold shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
      <h1 className="grow">Careful — you have unsaved changes!</h1>

      <button
        onClick={() => props.setCurrent(user)}
        className="cursor-pointer text-sm text-[#8da1fc] transition-all hover:underline"
      >
        Reset
      </button>
      <button
        onClick={saveHandle}
        className="ml-4 cursor-pointer rounded-lg bg-[#00863a] px-2 py-2 text-sm transition-all hover:brightness-90"
      >
        Save Changes
      </button>
    </div>
  );
}

function ColoPickerPopup(props: {
  children: React.ReactNode;
  color: string;
  setColor: (c: string) => void;
}) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>{props.children}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="right"
          align="start"
          sideOffset={10}
          className="flex flex-col rounded-lg border border-[#303034] bg-[#202024] p-4"
        >
          <ColorPicker
            color={props.color}
            setColor={props.setColor}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function ColorPicker(props: { color: string; setColor: (c: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hue, setHue] = useState(0);
  const [color, setColor] = useState(props.color);
  const [hexInput, setHexInput] = useState(props.color);
  const [isDragging, setIsDragging] = useState(false);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  const width = 200;
  const height = 150;

  const hueImageData = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let y = 0; y < height; y++) {
      const v = 1 - y / height;
      for (let x = 0; x < width; x++) {
        const s = x / width;
        const [r, g, b] = hsvToRgb(hue, s, v).map((v) => Math.round(v * 255));
        const i = (y * width + x) * 4;
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
        data[i + 3] = 255;
      }
    }
    return imageData;
  }, [hue]);

  // render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hueImageData) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.putImageData(hueImageData, 0, 0);

    if (cursor) {
      const data = ctx.getImageData(cursor.x, cursor.y, 1, 1).data;
      const hex = rgbToHex(data[0], data[1], data[2]);
      setColor(hex);
      setHexInput(hex);

      // Draw cursor
      ctx.beginPath();
      ctx.arc(cursor.x, cursor.y, 6, 0, Math.PI * 2);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cursor.x, cursor.y, 4, 0, Math.PI * 2);
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }, [hueImageData, cursor]);

  // Update canvas and slider when hex input changes
  const handleHexInputChange = (value: string) => {
    setHexInput(value);
    props.setColor(value);
    // Validate hex format
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      const rgb = hexToRgb(value);
      if (rgb) {
        const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
        setHue(hsv.h);
        setColor(value);
        props.setColor(value);

        // Update cursor position based on saturation and value
        const x = Math.round(hsv.s * (width - 1));
        const y = Math.round((1 - hsv.v) * (height - 1));
        setCursor({ x, y });
      }
    }
  };

  const pickColor = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(width - 1, e.clientX - rect.left));
    const y = Math.max(0, Math.min(height - 1, e.clientY - rect.top));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const data = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(data[0], data[1], data[2]);
    setColor(hex);
    setHexInput(hex);
    props.setColor(hex);
    setCursor({ x, y });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    pickColor(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      pickColor(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleHueChange = (newHue: number) => {
    setHue(newHue);
    // Keep the same saturation and value, but update color with new hue
    if (cursor) {
      const s = cursor.x / width;
      const v = 1 - cursor.y / height;
      const [r, g, b] = hsvToRgb(newHue, s, v).map((v) => Math.round(v * 255));
      const hex = rgbToHex(r, g, b);
      setColor(hex);
      setHexInput(hex);
      props.setColor(hex);
    }
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: "crosshair" }}
      />

      <input
        type="range"
        min="0"
        max="360"
        value={hue}
        onChange={(e) => handleHueChange(Number(e.target.value))}
        style={{
          marginTop: "1rem",
          WebkitAppearance: "none",
          height: "12px",
          borderRadius: "6px",
          background:
            "linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)",
        }}
      />

      <input
        id="hex-input"
        type="text"
        value={hexInput}
        onChange={(e) => handleHexInputChange(e.target.value.toUpperCase())}
        placeholder={props.color}
        maxLength={7}
        className="mt-4 rounded-lg border border-[#303034] bg-[#1d1d21] p-2 text-white"
      />
    </>
  );
}

function hsvToRgb(h: number, s: number, v: number) {
  let f = (n: number, k = (n + h / 60) % 6) =>
    v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
  return [f(5), f(3), f(1)];
}

function rgbToHex(r: number, g: number, b: number) {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHsv(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  let s = max === 0 ? 0 : diff / max;
  let v = max;

  if (diff !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / diff + 2) / 6;
        break;
      case b:
        h = ((r - g) / diff + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s, v };
}
