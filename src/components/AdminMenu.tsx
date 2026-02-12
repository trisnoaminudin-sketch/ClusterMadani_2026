import { useNavigate } from "react-router-dom";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Users, Download, Settings, Database, LayoutDashboard } from "lucide-react";

interface AdminMenuProps {
    onExport?: () => void;
}

export const AdminMenu = ({ onExport }: AdminMenuProps) => {
    const navigate = useNavigate();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 h-9 rounded-full border-primary/20 hover:border-primary hover:bg-primary/5 transition-all">
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider">Menu Admin</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Administrasi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/")} className="gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/admin/users")} className="gap-2">
                    <Users className="w-4 h-4" />
                    <span>Kelola User</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExport} className="gap-2">
                    <Download className="w-4 h-4" />
                    <span>Export Data (CSV)</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled className="gap-2 opacity-50">
                    <Database className="w-4 h-4" />
                    <span>Pengaturan Sistem</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
