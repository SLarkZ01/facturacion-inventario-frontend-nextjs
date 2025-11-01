"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
      <div className="flex items-center gap-4">
        <div className="text-sm">Hola{userName ? `, ${userName}` : ""}</div>
        <div className="flex gap-3">
          <Button onClick={() => router.push("/dashboard")} className="px-6">
            Ir al dashboard
          </Button>
          <Button variant="outline" onClick={handleLogout} className="px-6">
            Cerrar sesión
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <Link href="/login">
        <Button className="px-6">Iniciar sesión</Button>
      </Link>
      <Link href="/register">
        <Button variant="outline" className="px-6">
          Registrarse
        </Button>
      </Link>
    </div>
  );
}
