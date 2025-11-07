export default function ListData(props: { data: number[] }) {
  const users = Array.from({ length: 5 }, (_, i) => i);
  return props.data.map((v, i) => <li key={i}>{v}</li>);
  // return <div>{props.data[0u]}</div>;
}
