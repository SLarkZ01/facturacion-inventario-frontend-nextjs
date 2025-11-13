import SidebarShell from "./components/SidebarShell";
import Navbar from "@/components/Navbar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { meWithAutoRefresh } from "@/lib/server/authServer";

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
    <div className="min-h-screen flex bg-gray-50">
      <SidebarShell user={userData as any} />

      <main className="flex-1 flex flex-col">
        <Navbar userName={userName} showSidebarTrigger={false} />
        <div className="flex-1 p-6">
          <div className="max-w-7xl w-full mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}
