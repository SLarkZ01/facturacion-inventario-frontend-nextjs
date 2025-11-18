"use client";

import { useEffect, useState } from "react";
import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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
  isAdminLayout?: boolean;
};

const Navbar = ({ userName, avatarSrc, showSidebarTrigger = true, isAdminLayout = false }: Props) => {
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

  // Si está en el layout de admin, solo mostrar el menú de usuario sin el contenedor completo
  if (isAdminLayout) {
    return (
      <div className="flex items-center gap-4">
        {/* USER MENU */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                {avatarSrc ? <AvatarImage src={avatarSrc} /> : <AvatarImage src="https://avatars.githubusercontent.com/u/1486366" />}
                <AvatarFallback className="text-xs">{userName ? userName.charAt(0).toUpperCase() : "CN"}</AvatarFallback>
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
              await fetch('/api/auth/logout', { method: 'POST' });
              location.href = '/';
            }}>
              <LogOut className="h-[1.2rem] w-[1.2rem] mr-2" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <nav className="p-4 flex items-center justify-between sticky top-0 bg-white/60 backdrop-blur-sm border-t border-b-2 border-white/20 shadow-sm z-10">
      {/* LEFT */}
      {showSidebarTrigger && <SidebarTrigger />}
      {!showSidebarTrigger && (
        <Link href="/" className="flex items-center gap-4">
          <Image src="/images/ermotoshd.webp" alt="ERMOTOS" width={72} height={72} className="rounded-md object-cover" />
          <span className="text-2xl sm:text-3xl font-extrabold text-[var(--primary)]">ERMOTOS</span>
        </Link>
      )}
      {/* <Button variant="outline" onClick={toggleSidebar}>
        Custom Button
      </Button> */}
      {/* RIGHT */}
      <div className="flex items-center gap-4">
        {admin && (
          <Link href="/admin" className="text-sm text-gray-700 hover:text-orange-600">Administración</Link>
        )}

        {/* If there is no authenticated user, show login/register buttons */}
        {!me ? (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 motion-safe:transition-all"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)] motion-safe:transition-all"
            >
              Registrarse
            </Link>
          </div>
        ) : (
          // USER MENU when authenticated
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
        )}
      </div>
    </nav>
  );
};

export default Navbar;
