"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ui/toast/ToastProvider";

type Props = {
  isLoggedIn: boolean;
  userName?: string | null;
};

export default function AuthActions({ isLoggedIn, userName }: Props) {
  const router = useRouter();
  const { push } = useToast();

  async function handleLogout() {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        push({ title: "Sesión cerrada", description: "Has cerrado sesión", variant: "success" });
      } else {
        push({ title: "Error", description: "No se pudo cerrar sesión", variant: "error" });
      }
      // refresca la página para actualizar estado de sesión
      router.replace("/");
    } catch {
      push({ title: "Error", description: "Error en el servidor", variant: "error" });
      router.replace("/");
    }
  }

  if (isLoggedIn) {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
        <div className="text-sm sm:text-base text-[var(--foreground)]">Hola{userName ? `, ${userName}` : ""}</div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center justify-center px-6 sm:px-8 py-3 text-sm sm:text-base font-medium rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 motion-safe:transition-all motion-safe:duration-200 motion-safe:hover:scale-103 shadow-md w-full sm:w-auto"
          >
            Ir al dashboard
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center px-6 sm:px-8 py-3 text-sm sm:text-base font-medium rounded-lg border-2 border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)] motion-safe:transition-all motion-safe:duration-200 w-full sm:w-auto"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
      <Link
        href="/login"
        className="inline-flex items-center justify-center px-6 sm:px-8 py-3 text-sm sm:text-base font-medium rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 motion-safe:transition-all motion-safe:duration-200 motion-safe:hover:scale-103 shadow-md w-full sm:w-auto"
      >
        Iniciar sesión
      </Link>
      <Link
        href="/register"
        className="inline-flex items-center justify-center px-6 sm:px-8 py-3 text-sm sm:text-base font-medium rounded-lg border-2 border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)] motion-safe:transition-all motion-safe:duration-200 w-full sm:w-auto"
      >
        Registrarse
      </Link>
    </div>
  );
}
