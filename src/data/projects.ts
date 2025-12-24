export interface Project {
  title: string;
  description: string;
  promptCount: number;
  lastModified: string;
  status: "active" | "completed" | "archived";
}

export const projects: Project[] = [
  {
    title: "당뇨병 환자 관리 프로젝트",
    description: "당뇨병 환자를 위한 안내문, 식이요법, 복약 지도 프롬프트 모음",
    promptCount: 12,
    lastModified: "2시간 전",
    status: "active",
  },
  {
    title: "진료 기록 자동화",
    description: "SOAP 형식 진료 기록 정리 및 의뢰서 작성 자동화",
    promptCount: 8,
    lastModified: "어제",
    status: "active",
  },
  {
    title: "레지던트 교육자료",
    description: "신규 레지던트를 위한 교육 슬라이드 및 퀴즈 생성",
    promptCount: 15,
    lastModified: "3일 전",
    status: "completed",
  },
  {
    title: "고혈압 가이드라인 요약",
    description: "최신 고혈압 가이드라인 핵심 내용 정리 프로젝트",
    promptCount: 6,
    lastModified: "1주 전",
    status: "completed",
  },
  {
    title: "논문 리뷰 도우미",
    description: "학술 논문 요약 및 비평적 분석을 위한 프롬프트",
    promptCount: 4,
    lastModified: "2주 전",
    status: "archived",
  },
];
