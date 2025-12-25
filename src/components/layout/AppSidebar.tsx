import {
  LayoutDashboard,
  Boxes,
  MessageSquareText,
  Settings,
  FolderOpen,
  History,
  User,
  BookOpen,
  Play,
  Archive,
  Pin,
  PinOff,
  Users,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

// 🚀 프로그램 실행
const programMenuItems = [
  { title: "홈", url: "/", icon: LayoutDashboard },
  { title: "프롬프트 작업실", url: "/ai-execute", icon: Play },
  { title: "AI도구 제작실", url: "/programs", icon: Boxes },
  { title: "AI소스 수집함", url: "/program-collections", icon: Archive },
  { title: "커뮤니티", url: "/community", icon: Users },
];

// 📝 프롬프트 관리
const promptMenuItems = [
  { title: "내 프롬프트", url: "/prompts", icon: MessageSquareText },
  { title: "프롬프트 세트", url: "/projects", icon: FolderOpen },
  { title: "실행 히스토리", url: "/history", icon: History },
];

// ⚙️ 도움말
const settingsMenuItems = [
  { title: "사용자 매뉴얼", url: "/user-guide", icon: BookOpen },
  { title: "마이페이지", url: "/my-page", icon: User },
];

interface AppSidebarProps {
  isPinned: boolean;
  togglePin: () => void;
}

export function AppSidebar({ isPinned, togglePin }: AppSidebarProps) {
  const { state, setOpen } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();

  // 초기 로드 시 핀 상태에 따라 사이드바 열기
  useEffect(() => {
    if (isPinned) {
      setOpen(true);
    }
  }, [isPinned, setOpen]);

  const isActive = (path: string) => location.pathname === path;

  const handleMouseEnter = () => {
    setOpen(true);
  };

  const handleMouseLeave = () => {
    // 핀 고정 시에는 닫히지 않음
    if (!isPinned) {
      setOpen(false);
    }
  };

  const renderMenuItems = (items: typeof mainMenuItems) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild isActive={isActive(item.url)}>
            <NavLink
              to={item.url}
              end
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-sidebar-accent ${collapsed ? 'justify-center' : ''}`}
              activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border top-16 h-[calc(100vh-4rem)] z-10"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 핀 버튼 - 항상 표시 */}
      <SidebarHeader className="flex-row items-center justify-end px-2 py-2 border-b border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePin}
          className={`h-6 w-6 p-0 hover:bg-sidebar-accent ${collapsed ? 'mx-auto' : ''}`}
          title={isPinned ? "고정 해제" : "사이드바 고정"}
        >
          {isPinned ? (
            <Pin className="h-3 w-3 text-primary" />
          ) : (
            <PinOff className="h-3 w-3 text-muted-foreground" />
          )}
        </Button>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupContent>
            {renderMenuItems(programMenuItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-4 opacity-30" />

        <SidebarGroup>
          <SidebarGroupContent>
            {renderMenuItems(promptMenuItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-4 opacity-30" />

        <SidebarGroup>
          <SidebarGroupContent>
            {renderMenuItems(settingsMenuItems)}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-sidebar-border">
        <Button
          variant="ghost"
          onClick={() => navigate("/settings")}
          className={`w-full justify-start gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent ${
            isActive("/settings") ? "bg-sidebar-accent text-sidebar-primary font-medium" : ""
          } ${collapsed ? 'justify-center px-0' : ''}`}
          title="설정"
        >
          <Settings className="h-5 w-5 shrink-0" />
          {!collapsed && <span>설정</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
