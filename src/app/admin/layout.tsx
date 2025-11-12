import SidebarShell from "./components/SidebarShell";

export const metadata = {
  title: "Admin",
  description: "Panel de administración",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <SidebarShell />

      <main className="flex-1 p-6">
        <div className="max-w-7xl w-full mx-auto">{children}</div>
      </main>
    </div>
  );
}
