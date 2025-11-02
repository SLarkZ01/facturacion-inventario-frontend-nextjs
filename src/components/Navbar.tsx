"use client";

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
};

const Navbar = ({ userName, avatarSrc }: Props) => {
  return (
    <nav className="p-4 flex items-center justify-between sticky top-0 bg-background z-10">
      {/* LEFT */}
      <SidebarTrigger />
      {/* <Button variant="outline" onClick={toggleSidebar}>
        Custom Button
      </Button> */}
      {/* RIGHT */}
      <div className="flex items-center gap-4">
        <Link href="/">Dashboard</Link>
        {/* theme removed: app uses light mode only */}
        {/* USER MENU */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="flex items-center gap-3">
              <Avatar>
                {avatarSrc ? <AvatarImage src={avatarSrc} /> : <AvatarImage src="https://avatars.githubusercontent.com/u/1486366" />}
                <AvatarFallback>{userName ? userName.charAt(0).toUpperCase() : "CN"}</AvatarFallback>
              </Avatar>
              {userName && <span className="hidden sm:inline-block">{userName}</span>}
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
