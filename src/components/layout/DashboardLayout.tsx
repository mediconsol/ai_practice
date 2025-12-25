import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TokenWarningBanner } from "./TokenWarningBanner";
import { HeaderUserMenu } from "./HeaderUserMenu";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Users, Sparkles, Boxes, Archive, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const SIDEBAR_PIN_KEY = "sidebar:pinned";

function DashboardContent({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // 고정 핀 상태 관리
  const [isPinned, setIsPinned] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_PIN_KEY);
    return saved === "true";
  });

  const togglePin = () => {
    const newPinned = !isPinned;
    setIsPinned(newPinned);
    localStorage.setItem(SIDEBAR_PIN_KEY, String(newPinned));
  };

  // 헤더 숨김 상태 관리
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  const toggleHeader = () => {
    setIsHeaderVisible(!isHeaderVisible);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      {/* Top Header */}
      {isHeaderVisible ? (
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-20">
          <div className="h-full px-4 flex items-center justify-between gap-4">
            {/* Left: Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center">
                <img src="/favicon.svg" alt="메디콘솔 로고" className="w-9 h-9" />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-foreground text-base tracking-tight">
                  MediConSol
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">의료기관용 AI 업무 플랫폼</p>
              </div>
            </div>

            {/* Center: Navigation Menu */}
            <nav className="flex items-center gap-2">
              <Button
                variant={isActive("/") ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate("/")}
                className={cn(
                  "gap-2",
                  isActive("/") && "bg-primary text-primary-foreground"
                )}
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">홈</span>
              </Button>
              <Button
                variant={isActive("/ai-execute") ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate("/ai-execute")}
                className={cn(
                  "gap-2",
                  isActive("/ai-execute") && "bg-primary text-primary-foreground"
                )}
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">프롬프트</span>
              </Button>
              <Button
                variant={isActive("/programs") ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate("/programs")}
                className={cn(
                  "gap-2",
                  isActive("/programs") && "bg-primary text-primary-foreground"
                )}
              >
                <Boxes className="w-4 h-4" />
                <span className="hidden sm:inline">AI도구제작</span>
              </Button>
              <Button
                variant={isActive("/program-collections") ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate("/program-collections")}
                className={cn(
                  "gap-2",
                  isActive("/program-collections") && "bg-primary text-primary-foreground"
                )}
              >
                <Archive className="w-4 h-4" />
                <span className="hidden sm:inline">AI소스수집</span>
              </Button>
              <Button
                variant={isActive("/community") ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate("/community")}
                className={cn(
                  "gap-2",
                  isActive("/community") && "bg-primary text-primary-foreground"
                )}
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">커뮤니티</span>
              </Button>
            </nav>

            {/* Right: User Menu + Toggle Button */}
            <div className="flex items-center gap-2">
              <HeaderUserMenu />
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleHeader}
                className="h-8 w-8"
                title="헤더 숨기기"
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>
      ) : (
        <div className="sticky top-0 z-20 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleHeader}
            className="rounded-b-lg rounded-t-none border-x border-b border-border bg-card/50 backdrop-blur-sm hover:bg-card"
            title="헤더 표시"
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Token Warning Banner */}
      <TokenWarningBanner />

      {/* Sidebar + Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        <AppSidebar isPinned={isPinned} togglePin={togglePin} />

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider defaultOpen={false}>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
}
