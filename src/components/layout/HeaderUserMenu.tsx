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
import {
  LogOut,
  Settings,
  User,
  MessageSquareText,
  FolderOpen,
  History,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeaderUserMenu() {
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 h-auto px-2 py-1.5">
          <Avatar className="h-8 w-8 border-2 border-primary">
            <AvatarFallback className={`bg-gradient-to-br from-primary to-info text-white font-semibold ${isLongName ? 'text-[10px]' : 'text-xs'}`}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-sm font-medium">{displayName}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div>
            <p className="font-semibold">{displayName}</p>
            <p className="text-xs text-muted-foreground font-normal">{displayEmail}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* 내 콘텐츠 섹션 */}
        <DropdownMenuItem onClick={() => navigate("/my-page")}>
          <User className="mr-2 h-4 w-4" />
          마이페이지
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/prompts")}>
          <MessageSquareText className="mr-2 h-4 w-4" />
          내 프롬프트
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/projects")}>
          <FolderOpen className="mr-2 h-4 w-4" />
          프롬프트 세트
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/history")}>
          <History className="mr-2 h-4 w-4" />
          실행 히스토리
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* 설정 & 로그아웃 */}
        <DropdownMenuItem onClick={() => navigate("/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          설정
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
