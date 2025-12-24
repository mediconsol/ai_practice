import {
  LayoutDashboard,
  Boxes,
  MessageSquareText,
  Sparkles,
  Settings,
  FolderOpen,
  History,
  Zap
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { UserProfile } from "@/components/layout/UserProfile";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainMenuItems = [
  { title: "홈", url: "/", icon: LayoutDashboard },
  { title: "AI 프로그램", url: "/programs", icon: Boxes },
  { title: "프롬프트 자산", url: "/prompts", icon: MessageSquareText },
  { title: "AI 실행", url: "/ai-execute", icon: Sparkles },
];

const workMenuItems = [
  { title: "내 프로젝트", url: "/projects", icon: FolderOpen },
  { title: "실행 히스토리", url: "/history", icon: History },
];

const systemMenuItems = [
  { title: "빠른 실행", url: "/quick", icon: Zap },
  { title: "설정", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const renderMenuItems = (items: typeof mainMenuItems) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild isActive={isActive(item.url)}>
            <NavLink 
              to={item.url} 
              end 
              className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-sidebar-accent"
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
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-info flex items-center justify-center shadow-glow">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="animate-slide-in">
              <h1 className="font-bold text-sidebar-foreground text-lg tracking-tight">
                메디콘솔
              </h1>
              <p className="text-xs text-sidebar-foreground/60">AI 업무 플랫폼</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2">
            메인
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(mainMenuItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2">
            작업
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(workMenuItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2">
            시스템
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(systemMenuItems)}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-sidebar-border">
        <UserProfile />
      </SidebarFooter>
    </Sidebar>
  );
}
