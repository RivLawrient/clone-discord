import Input from "./input";
import ListData from "./list-data";

const users = Array.from({ length: 5 }, (_, i) => i);
export default function Page() {
  return (
    <div>
      <ul>
        <ListData data={users} />
      </ul>
      <Input />
    </div>
  );
}
