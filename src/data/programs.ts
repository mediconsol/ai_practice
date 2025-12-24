import {
  FileText,
  MessageSquare,
  BookOpen,
  ClipboardList,
  Stethoscope,
  Users,
  LucideIcon
} from "lucide-react";

export interface Program {
  title: string;
  description: string;
  icon: LucideIcon;
  category: string;
  promptCount: number;
  usageCount: number;
  gradient: string;
  isNew: boolean;
}

export const programs: Program[] = [
  {
    title: "문서 요약기",
    description: "논문, 가이드라인, 긴 문서를 핵심만 빠르게 요약합니다. 의료 전문 용어를 이해하고 핵심 정보를 추출합니다.",
    icon: FileText,
    category: "문서 처리",
    promptCount: 5,
    usageCount: 156,
    gradient: "from-primary to-info",
    isNew: false,
  },
  {
    title: "환자 안내문 생성기",
    description: "질환별 맞춤 환자 안내문을 자동으로 생성합니다. 쉬운 용어로 변환하고 필수 정보를 포함합니다.",
    icon: Users,
    category: "환자 커뮤니케이션",
    promptCount: 8,
    usageCount: 234,
    gradient: "from-success to-primary",
    isNew: true,
  },
  {
    title: "진료 기록 정리기",
    description: "진료 내용을 SOAP, POMR 등 표준 형식으로 정리합니다. 효율적인 차트 작성을 도와줍니다.",
    icon: ClipboardList,
    category: "문서 작성",
    promptCount: 4,
    usageCount: 189,
    gradient: "from-warning to-destructive",
    isNew: false,
  },
  {
    title: "교육자료 생성기",
    description: "의료 교육 콘텐츠와 슬라이드 초안을 생성합니다. 레지던트 교육, 환자 교육에 활용 가능합니다.",
    icon: BookOpen,
    category: "교육",
    promptCount: 6,
    usageCount: 97,
    gradient: "from-info to-primary",
    isNew: false,
  },
  {
    title: "의뢰서 작성기",
    description: "전문적인 의뢰서와 회신서를 작성합니다. 타과 협진, 외부 기관 의뢰에 최적화되어 있습니다.",
    icon: MessageSquare,
    category: "문서 작성",
    promptCount: 3,
    usageCount: 142,
    gradient: "from-primary to-success",
    isNew: false,
  },
  {
    title: "증례 분석기",
    description: "증례 발표용 분석과 구조화된 정리를 도와줍니다. 컨퍼런스, 학회 발표 준비에 유용합니다.",
    icon: Stethoscope,
    category: "연구",
    promptCount: 7,
    usageCount: 64,
    gradient: "from-destructive to-warning",
    isNew: true,
  },
  {
    title: "복약 지도문 생성기",
    description: "처방 약물에 대한 환자 복약 지도문을 생성합니다. 복용법, 주의사항, 상호작용을 포함합니다.",
    icon: FileText,
    category: "환자 커뮤니케이션",
    promptCount: 4,
    usageCount: 87,
    gradient: "from-info to-success",
    isNew: false,
  },
  {
    title: "보고서 초안 생성기",
    description: "각종 의료 보고서의 초안을 생성합니다. 월간 보고, 통계 보고, 품질 보고 등에 활용됩니다.",
    icon: ClipboardList,
    category: "문서 작성",
    promptCount: 5,
    usageCount: 45,
    gradient: "from-warning to-primary",
    isNew: true,
  },
];

export const categories = ["전체", "문서 처리", "환자 커뮤니케이션", "문서 작성", "교육", "연구"];
