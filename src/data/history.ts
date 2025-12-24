export interface HistoryItem {
  id: string;
  promptTitle: string;
  promptPreview: string;
  resultPreview: string;
  aiProvider: string;
  timestamp: string;
  duration: string;
  status: "success" | "error";
}

export const historyItems: HistoryItem[] = [
  {
    id: "1",
    promptTitle: "당뇨병 식이요법 안내문",
    promptPreview: "당뇨병 환자를 위한 식이요법 안내문을 작성해주세요. 환자가 이해하기 쉬운 말로...",
    resultPreview: "당뇨병 환자를 위한 건강한 식이요법 안내입니다. 1. 탄수화물 섭취량 조절하기: 밥은 한 공기의 2/3 정도로...",
    aiProvider: "내부 AI",
    timestamp: "10분 전",
    duration: "1.2초",
    status: "success",
  },
  {
    id: "2",
    promptTitle: "진료 기록 SOAP 정리",
    promptPreview: "다음 진료 내용을 SOAP 형식으로 정리해주세요. Subjective: 환자가 3일 전부터...",
    resultPreview: "## SOAP 형식 진료 기록\n\n**S (Subjective)**: 환자는 3일 전부터 시작된 두통을 호소함...",
    aiProvider: "ChatGPT",
    timestamp: "1시간 전",
    duration: "2.1초",
    status: "success",
  },
  {
    id: "3",
    promptTitle: "논문 초록 요약",
    promptPreview: "다음 논문 초록의 핵심 내용을 3줄로 요약해주세요...",
    resultPreview: "1. 이 연구는 제2형 당뇨병 환자에서 SGLT2 억제제의 심혈관 보호 효과를 분석했습니다...",
    aiProvider: "내부 AI",
    timestamp: "3시간 전",
    duration: "0.8초",
    status: "success",
  },
  {
    id: "4",
    promptTitle: "타과 의뢰서 작성",
    promptPreview: "환자를 심장내과로 의뢰하기 위한 의뢰서를 작성해주세요...",
    resultPreview: "의뢰서\n\n수신: 심장내과\n발신: 가정의학과\n\n상기 환자는 55세 남성으로...",
    aiProvider: "내부 AI",
    timestamp: "어제",
    duration: "1.5초",
    status: "success",
  },
  {
    id: "5",
    promptTitle: "복약 안내문 생성",
    promptPreview: "메트포르민 복용에 대한 환자 안내문을 작성해주세요...",
    resultPreview: "연결 오류로 인해 응답을 생성하지 못했습니다. 다시 시도해주세요.",
    aiProvider: "ChatGPT",
    timestamp: "어제",
    duration: "-",
    status: "error",
  },
  {
    id: "6",
    promptTitle: "교육자료 슬라이드 초안",
    promptPreview: "고혈압 관리에 대한 레지던트 교육자료 초안을 작성해주세요...",
    resultPreview: "# 고혈압 관리 교육자료\n\n## 슬라이드 1: 학습 목표\n- 고혈압의 정의와 분류...",
    aiProvider: "내부 AI",
    timestamp: "2일 전",
    duration: "3.2초",
    status: "success",
  },
];
