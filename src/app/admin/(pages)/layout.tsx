/**
 * Layout para todas las páginas de admin.
 * La verificación de talleres se hace en /admin (client-side) antes de llegar aquí.
 */
export default async function AdminPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ya no verificamos talleres aquí porque /admin lo hace del lado del cliente
  // Esto evita el error NEXT_REDIRECT después de crear taller/almacén
  return <>{children}</>;
}
