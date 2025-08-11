export default function UserAvatar(props: {
  avatar: string;
  name: string;
  withIndicator?: boolean;
}) {
  return (
    <div className="relative size-10 min-w-10 overflow-hidden">
      <div className="outline-user-bar group-hover:outline-user-bar-hover absolute right-0 bottom-0 size-[35%] rounded-full bg-green-500 outline-4" />
      <div className="flex size-full items-center justify-center overflow-hidden rounded-full bg-white text-black">
        {props.avatar == "" ? (
          <WithoutImg name={props.name} />
        ) : (
          <WithImg avatar={props.avatar} />
        )}
      </div>
    </div>
  );
}

function WithoutImg(props: { name: string }) {
  return <span className="font-semibold">{props.name[0]?.toUpperCase()}</span>;
}

function WithImg(props: { avatar: string }) {
  return (
    <img
      //   src={process.env.NEXT_PUBLIC_API + "img/" + props.avatar}
      src="/goku.jpg"
      alt="avatar"
      className="h-full w-full object-cover"
    />
  );
}
