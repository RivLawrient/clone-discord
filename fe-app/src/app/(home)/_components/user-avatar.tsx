export default function UserAvatar(props: { avatar: string; name: string }) {
  return (
    <div className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-white text-black">
      {props.avatar != "" ? (
        <span>{props.name[0]?.toUpperCase()}</span>
      ) : (
        <img
          //   src={process.env.NEXT_PUBLIC_API + "img/" + props.avatar}
          src="/goku.jpg"
          alt={props.name}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}
