"use client";

// Este archivo ya no es necesario con el nuevo sidebar de shadcn/ui
// Se mantiene para evitar errores de importación pero ya no se usa

import AppSidebar from "./Sidebar";

type User = { nombre?: string; name?: string; username?: string; email?: string; correo?: string };

type SidebarShellProps = {
  user?: User | null;
};

export default function SidebarShell({ user }: SidebarShellProps) {
  return <AppSidebar user={user} />;
}
