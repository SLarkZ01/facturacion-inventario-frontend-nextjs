import AppSidebar from "@/components/AppSidebar";
import Navbar from "@/components/Navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // read cookie on server to determine default sidebar state
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <div className="flex">
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <main className="w-full">
          <Navbar />
          <div className="px-4">{children}</div>
        </main>
      </SidebarProvider>
    </div>
  );
}
