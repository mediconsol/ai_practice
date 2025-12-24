import { PROMPT_CATEGORIES_WITH_ALL, type PromptCategory } from "@/constants/categories";

export interface Prompt {
  title: string;
  category: PromptCategory | string;
  content: string;
  isFavorite: boolean;
  usageCount: number;
}

export const prompts: Prompt[] = [
  {
    title: "당뇨병 환자 식이요법 안내",
    category: "환자 안내문",
    content: "{disease}에 대한 식이요법 안내문을 작성해주세요. 환자가 이해하기 쉬운 말로, 구체적인 식품 예시와 피해야 할 음식을 포함해주세요...",
    isFavorite: true,
    usageCount: 24,
  },
  {
    title: "진료 기록 SOAP 정리",
    category: "SOAP 정리",
    content: "다음 진료 내용을 SOAP 형식으로 정리해주세요. Subjective: {subjective}, Objective: {objective}, Assessment: {assessment}, Plan: {plan}...",
    isFavorite: true,
    usageCount: 42,
  },
  {
    title: "최신 논문 요약",
    category: "의학 문헌",
    content: "다음 논문 초록의 핵심 내용을 3줄로 요약해주세요. 연구 목적, 방법, 결론을 포함해주세요. 논문: {abstract}...",
    isFavorite: false,
    usageCount: 31,
  },
  {
    title: "타과 의뢰서 작성",
    category: "의뢰서",
    content: "환자를 {department}과로 의뢰하기 위한 의뢰서를 작성해주세요. 환자 정보: {patient_info}, 의뢰 사유: {reason}, 현재 치료: {treatment}...",
    isFavorite: true,
    usageCount: 18,
  },
  {
    title: "고혈압 복약 안내문",
    category: "처방 안내",
    content: "고혈압 약물 {medication} 복용에 대한 환자 안내문을 작성해주세요. 복용 방법, 주의사항, 부작용 설명을 포함해주세요...",
    isFavorite: false,
    usageCount: 27,
  },
  {
    title: "입원 환자 간호 기록",
    category: "간호 기록",
    content: "입원 환자의 간호 기록을 작성해주세요. 날짜/시간, 활력징후, 수행한 간호 활동, 환자 반응을 포함해주세요...",
    isFavorite: true,
    usageCount: 15,
  },
  {
    title: "레지던트 교육자료 초안",
    category: "교육자료",
    content: "{topic}에 대한 레지던트 교육자료 초안을 작성해주세요. 학습 목표, 핵심 개념, 실제 증례, 퀴즈 문항을 포함해주세요...",
    isFavorite: false,
    usageCount: 12,
  },
  {
    title: "MRI 검사 설명문",
    category: "검사 설명",
    content: "{exam} 검사에 대한 환자 설명문을 작성해주세요. 검사 목적, 방법, 소요 시간, 주의사항을 쉬운 말로 설명해주세요...",
    isFavorite: false,
    usageCount: 9,
  },
];

// 공통 카테고리 상수 사용
export const promptCategories = PROMPT_CATEGORIES_WITH_ALL;
