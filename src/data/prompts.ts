export interface Prompt {
  title: string;
  category: string;
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
    category: "진료 기록",
    content: "다음 진료 내용을 SOAP 형식으로 정리해주세요. Subjective: {subjective}, Objective: {objective}, Assessment: {assessment}, Plan: {plan}...",
    isFavorite: true,
    usageCount: 42,
  },
  {
    title: "논문 초록 요약",
    category: "문서 요약",
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
    category: "환자 안내문",
    content: "고혈압 약물 {medication} 복용에 대한 환자 안내문을 작성해주세요. 복용 방법, 주의사항, 부작용 설명을 포함해주세요...",
    isFavorite: false,
    usageCount: 27,
  },
  {
    title: "가이드라인 핵심 정리",
    category: "문서 요약",
    content: "다음 의료 가이드라인의 핵심 권고사항을 표 형식으로 정리해주세요. 권고 등급과 근거 수준을 포함해주세요. 가이드라인: {guideline}...",
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
    title: "수술 동의서 설명문",
    category: "환자 안내문",
    content: "{surgery} 수술에 대한 환자 설명문을 작성해주세요. 수술 방법, 예상 결과, 합병증, 대안 치료를 쉬운 말로 설명해주세요...",
    isFavorite: false,
    usageCount: 9,
  },
];

export const promptCategories = ["전체", "환자 안내문", "진료 기록", "문서 요약", "의뢰서", "교육자료", "일반"];
