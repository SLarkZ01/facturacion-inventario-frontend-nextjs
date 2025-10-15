"use client"

import { LogOut, Moon, Settings, SquareMenu, Sun, User } from "lucide-react";
import { logout } from "@/lib/clientAuth"
import Link from "next/link";
import { Avatar, AvatarFallback } from "./avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "./button";
import { use } from "react";
import { useTheme } from "next-themes";
import { SidebarTrigger } from "./sidebar";

const Navbar = () => {
    const{theme, setTheme}= useTheme();
    return (
        <nav className="flex items-center justify-between">
            {/*izquierda*/}
            <SidebarTrigger/>
            {/*derecha*/}
            <div className="flex items-center space-x-4">
                <Link href="/">Panel</Link>
                {/*modo oscuro menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                            <span className="sr-only">Toggle theme</span>
                        </Button>
                    </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setTheme("light")}>
                            Claro
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("dark")}>
                            Oscuro
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("system")}>
                            Sistema
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/*menu de usuario*/ }
                <DropdownMenu>
                    <DropdownMenuTrigger>                
                        <Avatar>
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent sideOffset={10}>
                        <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <User className="h-[1.2rem] w-[1.2rem] mr-2 " />
                            perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Settings className="h-[1.2rem] w-[1.2rem] mr-2 " />
                            configuracion
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => logout()}>
                            <LogOut className="h-[1.2rem] w-[1.2rem] mr-2 "/>
                            cerrar sesion
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

        </nav>
    );
};
export default Navbar;