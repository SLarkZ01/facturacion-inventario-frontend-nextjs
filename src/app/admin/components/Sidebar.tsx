"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, Box, Tag, Users, FileText, Settings, ArrowLeft } from "lucide-react";

type User = { nombre?: string; name?: string; username?: string; email?: string; correo?: string };

const items = [
  { id: "dashboard", label: "Administración", href: "/admin", icon: Home },
  { id: "productos", label: "Productos", href: "/admin/productos", icon: Box },
  { id: "categorias", label: "Categorías", href: "/admin/categorias", icon: Tag },
  { id: "clientes", label: "Clientes", href: "/admin/clientes", icon: Users },
  { id: "facturas", label: "Facturas", href: "/admin/facturas", icon: FileText },
  { id: "configuracion", label: "Configuración", href: "/admin/configuracion", icon: Settings },
];

type SidebarProps = {
  collapsed?: boolean;
  user?: User | null;
};

export default function Sidebar({ collapsed, user }: SidebarProps) {
  const pathname = usePathname();

  const displayName = user?.nombre || user?.name || user?.username || "Administrador";
  const displayEmail = user?.email || user?.correo || "admin@example.com";

  return (
    <nav aria-label="Admin sidebar" className="h-full flex flex-col bg-white border-r shadow-sm">
      <div className={`px-6 py-6 border-b ${collapsed ? 'px-3' : ''}`}>
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="rounded-md bg-orange-500/10 p-2 text-orange-600">
            <Grid />
          </div>
          {!collapsed && <div className="text-lg font-semibold">Admin</div>}
        </div>
      </div>

      <div className="px-3 py-5 flex-1 overflow-auto">
        <ul className="space-y-1">
          <li>
            <Link
              href="/"
              title="Volver a la Tienda"
              className={`flex items-center gap-3 ${collapsed ? 'justify-center' : 'px-4 py-3'} text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors`}
            >
              <ArrowLeft className="w-4 h-4 text-gray-600" />
              {!collapsed && <span>Volver a la Tienda</span>}
            </Link>
          </li>

          <li className="mt-4">
            <div className={`text-xs text-gray-400 uppercase tracking-wider ${collapsed ? 'text-center' : 'px-4'}`}>Secciones</div>
          </li>

          {items.map((it) => {
            const Icon = it.icon;
            const active = pathname === it.href || (it.href !== "/admin" && pathname?.startsWith(it.href || ""));
            return (
              <li key={it.id}>
                <Link
                  href={it.href}
                  title={it.label}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex items-center gap-3 ${collapsed ? 'justify-center py-3' : 'px-4 py-3'} text-sm rounded-md transition-colors ${
                    active ? "bg-orange-50 text-orange-700 font-medium" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {/* active indicator */}
                  <span
                    className={`absolute left-0 top-0 h-full w-1 rounded-r-md transition-colors ${
                      active ? "bg-orange-500" : "bg-transparent"
                    }`}
                  />
                  <Icon className={`${active ? "text-orange-600" : "text-gray-500"} w-4 h-4`} />
                  {!collapsed && <span className="ml-1">{it.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className={`px-4 py-4 border-t bg-gray-50 ${collapsed ? 'justify-center flex' : ''}`}>
        <div className={`flex items-center gap-3 ${collapsed ? 'flex-col' : ''}`}>
          <div className={`w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-semibold text-sm ${collapsed ? 'w-8 h-8 text-sm' : ''}`}>{(displayName && displayName.charAt(0)) || "A"}</div>
          {!collapsed && (
            <div>
              <div className="text-sm font-medium text-gray-800">{displayName}</div>
              <div className="text-xs text-gray-500">{displayEmail}</div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
