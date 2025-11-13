"use client";

import { useEffect, useState } from "react";
import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { SidebarTrigger } from "./ui/sidebar";

type Props = {
  userName?: string | null;
  avatarSrc?: string | null;
  showSidebarTrigger?: boolean;
};

const Navbar = ({ userName, avatarSrc, showSidebarTrigger = true }: Props) => {
  const [me, setMe] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/api/auth/me')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!mounted || !data) return;
        const u = data?.user || data?.usuario || data || null;
        setMe(u);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  function isAdminUser(u: any) {
    if (!u) return false;
    if (u.isAdmin === true || u.admin === true) return true;
    if (Array.isArray(u.roles) && u.roles.some((r: any) => String(r).toLowerCase().includes('admin'))) return true;
    if (Array.isArray(u.roles) && u.roles.some((r: any) => typeof r === 'object' && (String(r.name || r.role || r.authority || r.code || '').toLowerCase().includes('admin')))) return true;
    if (typeof u.role === 'string' && u.role.toLowerCase().includes('admin')) return true;
    if (typeof u.rol === 'string' && u.rol.toLowerCase().includes('admin')) return true;
    return false;
  }

  const admin = isAdminUser(me);

  return (
    <nav className="p-4 flex items-center justify-between sticky top-0 bg-white border-b z-10">
      {/* LEFT */}
      {showSidebarTrigger && <SidebarTrigger />}
      {!showSidebarTrigger && <div className="text-lg font-semibold">Panel de Administración</div>}
      {/* <Button variant="outline" onClick={toggleSidebar}>
        Custom Button
      </Button> */}
      {/* RIGHT */}
      <div className="flex items-center gap-4">
        {admin ? (
          <Link href="/admin" className="text-sm text-gray-700 hover:text-orange-600">Administración</Link>
        ) : (
          <Link href="/" className="text-sm text-gray-700 hover:text-orange-600">Dashboard</Link>
        )}
        {/* theme removed: app uses light mode only */}
        {/* USER MENU */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="flex items-center gap-3">
              <Avatar>
                {avatarSrc ? <AvatarImage src={avatarSrc} /> : <AvatarImage src="https://avatars.githubusercontent.com/u/1486366" />}
                <AvatarFallback>{userName ? userName.charAt(0).toUpperCase() : "CN"}</AvatarFallback>
              </Avatar>
              {userName && <span className="hidden sm:inline-block text-sm text-gray-800">{userName}</span>}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={10}>
            <DropdownMenuLabel>{userName ? `Hola, ${userName}` : "Mi cuenta"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="h-[1.2rem] w-[1.2rem] mr-2" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="h-[1.2rem] w-[1.2rem] mr-2" />
              Configuración
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={async () => {
              // Realizar logout y recargar
              await fetch('/api/auth/logout', { method: 'POST' });
              location.href = '/';
            }}>
              <LogOut className="h-[1.2rem] w-[1.2rem] mr-2" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default Navbar;
