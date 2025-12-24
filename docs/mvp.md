메디콘솔 AI 프랙티스 플랫폼 개발 요약
플랫폼 포지션
"AI를 배우는 플랫폼이 아니라, 의료인이 자기 업무에 맞는 AI 활용 방식을 직접 만들고 실행하는 플랫폼"

구현된 페이지 (총 6개)
페이지	경로	핵심 기능
홈 (대시보드)	/	빠른 실행 버튼, 통계 카드, AI 프로그램 목록, 최근 프롬프트
AI 프로그램	/programs	문서 요약기, 안내문 생성기 등 8개 프로그램, 카테고리 필터
프롬프트 자산	/prompts	프롬프트 라이브러리, 검색/필터, 가져오기/내보내기
AI 실행	/ai-execute	프롬프트 입력 → 실행, AI 제공자 선택(내부/ChatGPT/Claude)
내 프로젝트	/projects	프롬프트 묶음 관리, 상태별 필터(진행중/완료/보관)
실행 히스토리	/history	실행 기록 목록, 성공/실패 상태, 다시 실행 기능
디자인 시스템
컬러: 틸-블루 계열 (의료/전문 신뢰감)
폰트: Pretendard (한글 최적화)
레이아웃: 다크 사이드바 + 밝은 콘텐츠 영역
애니메이션: fade-in, slide-in 효과
컴포넌트 구조
src/
├── components/
│   ├── layout/
│   │   ├── AppSidebar.tsx      # 사이드바 네비게이션
│   │   └── DashboardLayout.tsx # 전체 레이아웃
│   └── dashboard/
│       ├── StatsCard.tsx       # 통계 카드
│       ├── ProgramCard.tsx     # AI 프로그램 카드
│       ├── PromptCard.tsx      # 프롬프트 카드
│       └── QuickActions.tsx    # 빠른 실행 버튼
└── pages/
    ├── Dashboard.tsx
    ├── Programs.tsx
    ├── Prompts.tsx
    ├── AIExecute.tsx
    ├── Projects.tsx
    └── History.tsx
