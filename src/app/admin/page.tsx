"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Página de redirección inteligente después del login.
 * Verifica si el usuario tiene talleres y redirige apropiadamente.
 */
export default function AdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    async function verificarYRedirigir() {
      try {
        const res = await fetch("/api/talleres");
        
        if (!res.ok) {
          // Si no está autenticado, redirigir a login
          router.replace("/login");
          return;
        }

        const talleres = await res.json();
        
        if (!Array.isArray(talleres) || talleres.length === 0) {
          // No tiene talleres, redirigir a crear taller
          router.replace("/setup/taller");
          return;
        }

        // Verificar si tiene almacenes
        const tieneAlmacenes = talleres.some((taller: any) => {
          const almacenes = taller.almacenes || taller.warehouses || [];
          return Array.isArray(almacenes) && almacenes.length > 0;
        });

        if (!tieneAlmacenes) {
          // Tiene talleres pero no almacenes
          const primerTaller = talleres[0];
          const tallerId = primerTaller.id || primerTaller.tallerId;
          router.replace(`/setup/almacen?tallerId=${tallerId}`);
          return;
        }

        // Tiene todo, redirigir al dashboard real
        router.replace("/admin/dashboard");
      } catch (error) {
        console.error("Error verificando talleres:", error);
        router.replace("/login");
      }
    }

    verificarYRedirigir();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-2 text-gray-600">Cargando...</p>
      </div>
    </div>
  );
}
