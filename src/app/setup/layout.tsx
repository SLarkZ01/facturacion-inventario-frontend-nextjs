import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { meWithAutoRefresh } from "@/lib/server/authServer";

export const metadata = {
  title: "Configuración Inicial - Admin",
  description: "Configuración inicial del taller y almacén",
};

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  // Solo verificar autenticación, NO verificar talleres (esto es el onboarding)
  const cookieStore = await cookies();
  const access = cookieStore.get("access_token")?.value;
  
  if (!access) {
    redirect("/login");
  }

  const refresh = cookieStore.get("refresh_token")?.value;
  
  try {
    const meResult = await meWithAutoRefresh(access, refresh);
    if (meResult.status !== 200) {
      redirect("/login");
    }
  } catch {
    redirect("/login");
  }

  // Layout limpio sin sidebar para el proceso de onboarding
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">{children}</div>
    </div>
  );
}
