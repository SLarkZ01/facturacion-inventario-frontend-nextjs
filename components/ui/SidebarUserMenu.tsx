"use client"

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@radix-ui/react-dropdown-menu"
import { DropdownMenuItem } from "./dropdown-menu"
import { SidebarMenuButton } from "./sidebar"
import { User2, ChevronUp } from "lucide-react"
import { logout } from "@/lib/clientAuth"

export default function SidebarUserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton>
          <User2 /> john doe <ChevronUp className="ml-auto" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem>Perfil</DropdownMenuItem>
        <DropdownMenuItem>Configuración</DropdownMenuItem>
        <DropdownMenuItem onClick={() => logout()}>cerrar sesion</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
