"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, Box, Tag, Users, FileText, Settings, ArrowLeft, Warehouse } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type User = { nombre?: string; name?: string; username?: string; email?: string; correo?: string };

const items = [
  { id: "dashboard", label: "Administración", href: "/admin/dashboard", icon: Home },
  { id: "productos", label: "Productos", href: "/admin/productos", icon: Box },
  { id: "categorias", label: "Categorías", href: "/admin/categorias", icon: Tag },
  { id: "talleres", label: "Talleres", href: "/admin/talleres", icon: Warehouse },
  { id: "clientes", label: "Clientes", href: "/admin/clientes", icon: Users },
  { id: "facturas", label: "Facturas", href: "/admin/facturas", icon: FileText },
  { id: "configuracion", label: "Configuración", href: "/admin/configuracion", icon: Settings },
];

type AppSidebarProps = {
  user?: User | null;
};

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();

  const displayName = user?.nombre || user?.name || user?.username || "Administrador";
  const displayEmail = user?.email || user?.correo || "admin@example.com";

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="border-r bg-white shadow-sm">
      <SidebarHeader className="border-b px-6 py-6 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
              <div className="rounded-md bg-orange-500/10 p-2 text-orange-600 group-data-[collapsible=icon]:p-2">
                <Grid className="h-5 w-5 group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5" />
              </div>
              <div className="text-lg font-semibold group-data-[collapsible=icon]:hidden">Admin</div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-3 py-5 group-data-[collapsible=icon]:px-0">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  tooltip="Volver a la Tienda" 
                  className="text-gray-700 hover:bg-gray-50 hover:text-gray-700 data-[active=true]:bg-gray-50 data-[active=true]:text-gray-700"
                >
                  <Link href="/" className="flex items-center gap-3 px-4 py-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-3">
                    <ArrowLeft className="h-4 w-4 text-gray-600" />
                    <span className="group-data-[collapsible=icon]:hidden">Volver a la Tienda</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="px-4 text-xs text-gray-400 uppercase tracking-wider group-data-[collapsible=icon]:hidden">
            Secciones
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname?.startsWith(item.href || ""));
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive} 
                      tooltip={item.label}
                      className={`relative transition-colors ${
                        isActive 
                          ? "bg-orange-50 text-orange-700 font-medium hover:bg-orange-50 hover:text-orange-700 data-[active=true]:bg-orange-50 data-[active=true]:text-orange-700" 
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-700 data-[active=true]:bg-gray-50 data-[active=true]:text-gray-700"
                      }`}
                    >
                      <Link href={item.href} className="flex items-center gap-3 px-4 py-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-3">
                        <span
                          className={`absolute left-0 top-0 h-full w-1 rounded-r-md transition-colors group-data-[collapsible=icon]:hidden ${
                            isActive ? "bg-orange-500" : "bg-transparent"
                          }`}
                        />
                        <Icon className={`h-4 w-4 ${isActive ? "text-orange-600" : "text-gray-500"}`} />
                        <span className="ml-1 group-data-[collapsible=icon]:hidden">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t bg-white px-4 py-3 group-data-[collapsible=icon]:px-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50 transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-600 text-white text-xs font-semibold">
                {(displayName && displayName.charAt(0).toUpperCase()) || "A"}
              </div>
              <div className="group-data-[collapsible=icon]:hidden">
                <div className="text-sm font-medium text-gray-800">{displayName}</div>
                <div className="text-xs text-gray-500">{displayEmail}</div>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
