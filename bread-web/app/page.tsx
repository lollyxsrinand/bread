import { Budget } from 'bread-core/src'
export default function Home() {
  const something : Budget = {
    name: 'test',
    age: 30
  }
  console.log(something)
  return (
    <div className="h-screen w-full flex flex-col gap-2.5 justify-center items-center">
      <h1 className="text-4xl font-bold">hi</h1>
      <div className="flex gap-2.5">
        <a className="button" href="/login">login</a>
        <a className="button" href="/signup">signup</a>
      </div>
    </div>
  );
}
