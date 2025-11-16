/**
 * setupGuard.ts
 * Helper para verificar si el usuario tiene taller y almacén configurados.
 * Redirige automáticamente si falta alguno.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { listarMisTalleresService } from "./talleresServer";

/**
 * Verifica que el usuario tenga al menos un taller y un almacén configurados.
 * Si no los tiene, redirige a las páginas de setup correspondientes.
 * Úsalo en páginas que requieran taller/almacén para funcionar.
 * 
 * @param skipCheck - Si es true, saltará la verificación (útil después de completar onboarding)
 */
export async function requireTallerYAlmacen(skipCheck: boolean = false) {
  // Si se indica que se salte la verificación, retornar inmediatamente
  if (skipCheck) {
    return { talleres: [] };
  }

  const cookieStore = await cookies();
  const access = cookieStore.get("access_token")?.value;

  if (!access) {
    redirect("/login");
  }

  try {
    const talleresResult = await listarMisTalleresService(access);

    if (talleresResult.status === 200) {
      const talleres = Array.isArray(talleresResult.body) ? talleresResult.body : [];

      // Si no tiene talleres, redirigir a crear taller
      if (talleres.length === 0) {
        redirect("/setup/taller");
      }

      // Verificar si al menos un taller tiene almacenes
      const tieneAlmacenes = talleres.some((taller: any) => {
        const almacenes = taller.almacenes || taller.warehouses || [];
        return Array.isArray(almacenes) && almacenes.length > 0;
      });

      // Si no tiene almacenes, redirigir a crear almacén
      if (!tieneAlmacenes && talleres.length > 0) {
        const primerTaller = talleres[0];
        const tallerId = primerTaller.id || primerTaller.tallerId;
        redirect(`/setup/almacen?tallerId=${tallerId}`);
      }

      return { talleres };
    }
  } catch (error) {
    console.error("Error verificando talleres:", error);
    // Si falla, redirigir a crear taller por seguridad
    redirect("/setup/taller");
  }

  return { talleres: [] };
}
