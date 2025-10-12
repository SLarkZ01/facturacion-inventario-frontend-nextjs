import { LogOut, Moon, Settings, User } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const Navbar = () => {
    return (
        <nav className="flex items-center justify-between">
            {/*izquierda*/}
            collapseButton
            {/*derecha*/}
            <div className="flex items-center space-x-4">
                <Link href="/">Dashboard</Link>
                <Moon />

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
                        <DropdownMenuItem>
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