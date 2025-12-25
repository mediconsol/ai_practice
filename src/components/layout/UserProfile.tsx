import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { useSignOut } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, ChevronDown } from "lucide-react";

interface UserProfileProps {
  collapsed?: boolean;
}

export function UserProfile({ collapsed = false }: UserProfileProps) {
  const { user } = useAuthContext();
  const { data: profile } = useUserProfile();
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

  // 이니셜 생성 (한국 이름 3글자 또는 이메일 첫 글자)
  const getInitials = () => {
    const name = profile?.full_name;
    if (name) {
      const trimmedName = name.trim();
      // 한글 체크 (한글이 포함되어 있으면 3글자까지 표시)
      const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(trimmedName);
      if (hasKorean) {
        return trimmedName.substring(0, 3).toUpperCase();
      }
      // 영문은 공백으로 분리해서 각 단어의 첫 글자
      const parts = trimmedName.split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return trimmedName.substring(0, 2).toUpperCase();
    }
    return user.email?.[0].toUpperCase() || "U";
  };

  const initials = getInitials();
  const isLongName = initials.length >= 3;

  const displayName = profile?.full_name || "사용자";
  const displayEmail = profile?.email || user.email || "";
  const displayHospital = profile?.hospital;
  const displayDepartment = profile?.department;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={`flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors w-full ${collapsed ? 'justify-center' : ''}`}>
        <Avatar className="h-8 w-8 border-2 border-primary">
          <AvatarFallback className={`bg-gradient-to-br from-primary to-info text-white font-semibold ${isLongName ? 'text-[10px]' : 'text-xs'}`}>
            {initials}
          </AvatarFallback>
        </Avatar>
        {!collapsed && (
          <>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-sidebar-foreground">{displayName}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate max-w-[150px]">{displayEmail}</p>
              {displayHospital && (
                <p className="text-xs text-sidebar-foreground/40 truncate max-w-[150px]">
                  {displayHospital}
                  {displayDepartment && ` · ${displayDepartment}`}
                </p>
              )}
            </div>
            <ChevronDown className="h-4 w-4 text-sidebar-foreground/40" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div>
            <p className="font-semibold">{displayName}</p>
            <p className="text-xs text-slate-500 font-normal">{displayEmail}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
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
