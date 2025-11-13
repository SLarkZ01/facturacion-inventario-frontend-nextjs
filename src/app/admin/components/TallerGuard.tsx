/**
 * TallerGuard Component
 * Wrapper para páginas que requieren taller y almacén.
 * Verifica automáticamente y redirige si es necesario.
 */

import { requireTallerYAlmacen } from "@/lib/server/setupGuard";

interface TallerGuardProps {
  children: React.ReactNode;
  skipCheck?: boolean;
}

export async function TallerGuard({ children, skipCheck = false }: TallerGuardProps) {
  // Verificar que el usuario tenga taller y almacén
  await requireTallerYAlmacen(skipCheck);
  
  // Si pasa la verificación, renderizar children
  return <>{children}</>;
}
