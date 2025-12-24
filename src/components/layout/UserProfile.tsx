import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { useSignOut } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User, ChevronDown } from "lucide-react";

export function UserProfile() {
  const { user } = useAuthContext();
  const signOutMutation = useSignOut();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate("/login");
      },
    });
  };

  if (!user) return null;

  // 이니셜 생성 (이름 또는 이메일 첫 글자)
  const getInitials = () => {
    const name = user.user_metadata?.full_name;
    if (name) {
      const parts = name.split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    return user.email?.[0].toUpperCase() || "U";
  };

  const displayName = user.user_metadata?.full_name || "사용자";
  const displayEmail = user.email || "";
  const displayHospital = user.user_metadata?.hospital;
  const displayDepartment = user.user_metadata?.department;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors w-full">
        <Avatar className="h-10 w-10 border-2 border-teal-500">
          <AvatarFallback className="bg-gradient-to-br from-teal-500 to-blue-600 text-white font-semibold">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-slate-900">{displayName}</p>
          <p className="text-xs text-slate-500 truncate max-w-[150px]">{displayEmail}</p>
          {displayHospital && (
            <p className="text-xs text-slate-400 truncate max-w-[150px]">
              {displayHospital}
              {displayDepartment && ` · ${displayDepartment}`}
            </p>
          )}
        </div>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div>
            <p className="font-semibold">{displayName}</p>
            <p className="text-xs text-slate-500 font-normal">{displayEmail}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/profile")}>
          <User className="mr-2 h-4 w-4" />
          프로필
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          설정
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
