/**
 * 의료 전문 프롬프트 카테고리
 * AI 실행 화면과 프롬프트 자산 페이지에서 공통으로 사용
 */

export const PROMPT_CATEGORIES = [
  "환자 안내문",
  "SOAP 정리",
  "처방 안내",
  "간호 기록",
  "의학 문헌",
  "교육자료",
  "의뢰서",
  "검사 설명",
  "퇴원 안내",
  "일반",
] as const;

export type PromptCategory = typeof PROMPT_CATEGORIES[number];

/**
 * 프롬프트 자산 페이지용 카테고리 (전체 옵션 포함)
 */
export const PROMPT_CATEGORIES_WITH_ALL = ["전체", ...PROMPT_CATEGORIES] as const;

/**
 * 카테고리별 설명
 */
export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "환자 안내문": "환자가 이해하기 쉬운 질병 설명, 치료 안내",
  "SOAP 정리": "진료 기록을 S/O/A/P 형식으로 구조화",
  "처방 안내": "약물 복용 방법, 주의사항 안내",
  "간호 기록": "입원 환자 간호 활동 기록",
  "의학 문헌": "논문, 가이드라인 요약",
  "교육자료": "의료진 및 환자 교육 자료",
  "의뢰서": "타과 의뢰서 및 검사 의뢰",
  "검사 설명": "검사 목적, 방법, 주의사항 안내",
  "퇴원 안내": "퇴원 후 주의사항, 약물, 추적 관찰",
  "일반": "기타 의료 관련 문서",
};

/**
 * 카테고리별 아이콘 (lucide-react)
 */
export const CATEGORY_ICONS: Record<string, string> = {
  "환자 안내문": "FileText",
  "SOAP 정리": "ClipboardList",
  "처방 안내": "Pill",
  "간호 기록": "Heart",
  "의학 문헌": "BookOpen",
  "교육자료": "GraduationCap",
  "의뢰서": "Send",
  "검사 설명": "TestTube",
  "퇴원 안내": "Home",
  "일반": "Folder",
};
