import {
  FileText,
  MessageSquare,
  BookOpen,
  ClipboardList,
  Stethoscope,
  Users,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

// 아이콘 이름을 실제 아이콘 컴포넌트로 매핑
export const iconMap: Record<string, LucideIcon> = {
  FileText,
  MessageSquare,
  BookOpen,
  ClipboardList,
  Stethoscope,
  Users,
  Sparkles,
};

// 아이콘 이름으로 아이콘 컴포넌트 가져오기
export function getIcon(iconName: string): LucideIcon {
  return iconMap[iconName] || Sparkles; // 기본값: Sparkles
}
