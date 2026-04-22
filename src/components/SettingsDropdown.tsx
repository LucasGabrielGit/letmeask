import { LogOut, Settings, Users } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

type DropdownMenuItemProps = {
  children: React.ReactNode[];
};

export const SettingsDropdown = ({ children }: DropdownMenuItemProps) => {
  const { signOut } = useAuth();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"outline"} size={"icon-lg"} className="cursor-pointer">
          <Settings />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full">
        {children && children.length > 0 && <>{children}</>}
        <DropdownMenuItem variant={"destructive"} onClick={signOut}>
          <LogOut />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
