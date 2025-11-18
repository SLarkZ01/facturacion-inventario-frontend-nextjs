import AppSidebar from "./components/Sidebar";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { meWithAutoRefresh } from "@/lib/server/authServer";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

export const metadata = {
  title: "Admin Dashboard",
  description: "Panel de administración",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // 1. Verificar autenticación
  const cookieStore = await cookies();
  const access = cookieStore.get("access_token")?.value;
  
  if (!access) {
    redirect("/login");
  }

  // 2. Validar token con el backend
  const refresh = cookieStore.get("refresh_token")?.value;
  let userData: unknown = null;
  
  try {
    const meResult = await meWithAutoRefresh(access, refresh);
    if (meResult.status !== 200) {
      redirect("/login");
    }
    userData = meResult.body;
  } catch {
    redirect("/login");
  }

  // Extraer nombre de usuario para el Navbar
  let userName: string | null = null;
  if (userData && typeof userData === "object") {
    const ud = userData as Record<string, unknown>;
    if (typeof ud["nombre"] === "string") userName = ud["nombre"] as string;
    else if (typeof ud["username"] === "string") userName = ud["username"] as string;
    else if (typeof ud["name"] === "string") userName = ud["name"] as string;
  }

  return (
    <SidebarProvider>
      <AppSidebar user={userData as any} />
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 px-4 bg-white/60 backdrop-blur-sm border-t border-b-2 border-white/20 shadow-sm">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold">
                  <Link href="/" className="flex items-center gap-3">
                    <Image src="/images/ermotoshd.webp" alt="ERMOTOS" width={56} height={56} className="rounded-md object-cover" />
                    <span className="text-lg sm:text-xl font-extrabold text-[var(--primary)]">ERMOTOS</span>
                  </Link>
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto">
            <Navbar userName={userName} showSidebarTrigger={false} isAdminLayout={true} />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
