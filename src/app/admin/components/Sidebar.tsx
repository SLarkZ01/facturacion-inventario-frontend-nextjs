"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, Box, Tag, Users, FileText, Settings, ArrowLeft, Warehouse, ChevronRight } from "lucide-react";
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
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

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
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-1.5">
              <div className="rounded-md bg-orange-500/10 p-2 text-orange-600">
                <Grid className="h-4 w-4" />
              </div>
              <div className="text-lg font-semibold group-data-[collapsible=icon]:hidden">Admin</div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Volver a la Tienda">
                  <Link href="/">
                    <ArrowLeft />
                    <span>Volver a la Tienda</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Secciones</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname?.startsWith(item.href || ""));
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-1.5">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-orange-600 text-white">
                  {(displayName && displayName.charAt(0)) || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-0.5 group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-medium">{displayName}</span>
                <span className="text-xs text-muted-foreground">{displayEmail}</span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
