import Sidebar from "../components/Sidebar";

export default function Layout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <div className="flex h-screen w-full">
        <Sidebar />
        {children}
    </div>
  )
}
