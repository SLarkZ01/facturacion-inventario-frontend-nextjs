import AppSidebar from "@/components/AppSidebar";
import Navbar from "@/components/Navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { meWithAutoRefresh } from "@/lib/server/authServer";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // read cookie on server to determine default sidebar state
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  // Protección: si no hay access_token válido redirigir a /login
  const access = cookieStore.get("access_token")?.value;
  if (!access) {
    redirect("/login");
  }

  // Intentamos validar el token consultando el backend. Si falla con 401,
  // intentamos usar refresh token para renovar y volver a consultar.
  const refresh = cookieStore.get("refresh_token")?.value;
  let userData: unknown = null;
  try {
    const meResult = await meWithAutoRefresh(access, refresh);
    if (meResult.status !== 200) {
      redirect("/login");
    }
    // extraer datos de usuario para pasarlos al Navbar
    // Nota: si hubo renovación de tokens, `meWithAutoRefresh` devuelve los nuevos tokens
    // en `meResult.tokens`. Persistir cookies desde aquí es complicado en un layout
    // (requiere establecer headers de respuesta). Para cubrir el caso inmediato
    // usamos el resultado para permitir el render; la persistencia de cookies
    // se hace cuando el cliente llama a `/api/auth/refresh` o en el próximo login.
    userData = meResult.body;
  } catch {
    redirect("/login");
  }

  let userName: string | null = null;
  if (userData && typeof userData === "object") {
    const ud = userData as Record<string, unknown>;
    if (typeof ud["nombre"] === "string") userName = ud["nombre"] as string;
    else if (typeof ud["username"] === "string") userName = ud["username"] as string;
    else if (typeof ud["name"] === "string") userName = ud["name"] as string;
  }

  return (
    <div className="flex">
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <main className="w-full">
          <Navbar userName={userName} />
          <div className="px-4">{children}</div>
        </main>
      </SidebarProvider>
    </div>
  );
}
