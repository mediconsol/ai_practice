# 메디콘솔 AI 프랙티스 개발 로드맵

> **최종 업데이트**: 2025-12-24
> **전체 기간**: 4주 (Phase 3-6)
> **현재 진행률**: Phase 2 완료 (60%)

---

## 📅 개발 일정 Overview

```
Phase 1-2: ████████████████████ 100% (완료)
Phase 3:   ████████░░░░░░░░░░░░  40% (진행중)
Phase 4:   ░░░░░░░░░░░░░░░░░░░░   0% (대기)
Phase 5:   ░░░░░░░░░░░░░░░░░░░░   0% (대기)
Phase 6:   ░░░░░░░░░░░░░░░░░░░░   0% (대기)
```

| Phase | 기간 | 주요 작업 | 상태 |
|-------|------|-----------|------|
| Phase 1-2 | 완료 | UI + 백엔드 인프라 | ✅ 100% |
| Phase 3 | 1주 | 인증 + DB 연동 | 🔄 40% |
| Phase 4 | 1주 | 프롬프트 마법사 | ⏳ 0% |
| Phase 5 | 1주 | 프로그램/프로젝트 고도화 | ⏳ 0% |
| Phase 6 | 1주 | 프로덕션 배포 | ⏳ 0% |

---

## 🚀 Phase 3: 인증 시스템 + DB 연동 (1주)

### 목표
사용자가 로그인하여 자신의 프롬프트를 생성/관리할 수 있도록 구현

---

### Week 3, Day 1-2: 인증 UI 구현

#### Task 3.1: 로그인 페이지 생성 (4시간)

**파일**: `src/pages/Login.tsx`

**체크리스트**:
- [ ] 페이지 레이아웃 (중앙 정렬 카드)
- [ ] 이메일 입력 필드
- [ ] 비밀번호 입력 필드
- [ ] 로그인 버튼
- [ ] "회원가입" 링크
- [ ] "비밀번호 찾기" 링크
- [ ] 로딩 상태 표시
- [ ] 에러 메시지 표시

**구현 예시**:
```typescript
// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('로그인 성공');
      navigate('/');
    } catch (error: any) {
      toast.error('로그인 실패', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        {/* 구현 내용 */}
      </div>
    </div>
  );
}
```

**검증 방법**:
```bash
# 라우트 추가 후
npm run dev
# http://localhost:8080/login 접속
```

---

#### Task 3.2: 회원가입 페이지 생성 (4시간)

**파일**: `src/pages/Signup.tsx`

**체크리스트**:
- [ ] 이메일 입력 필드
- [ ] 비밀번호 입력 필드
- [ ] 비밀번호 확인 필드
- [ ] 이름 입력 필드
- [ ] 병원/소속 입력 필드 (선택)
- [ ] 진료과 입력 필드 (선택)
- [ ] 회원가입 버튼
- [ ] 약관 동의 체크박스
- [ ] "이미 계정이 있으신가요?" 링크
- [ ] 이메일 인증 안내 메시지

**구현 예시**:
```typescript
const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          hospital: hospital,
          department: department,
        },
      },
    });

    if (error) throw error;

    toast.success('회원가입 성공', {
      description: '이메일을 확인하여 인증을 완료해주세요.',
    });
    navigate('/login');
  } catch (error: any) {
    toast.error('회원가입 실패', {
      description: error.message,
    });
  } finally {
    setLoading(false);
  }
};
```

---

#### Task 3.3: Protected Routes 설정 (2시간)

**파일**: `src/components/auth/ProtectedRoute.tsx`

**체크리스트**:
- [ ] 컴포넌트 생성
- [ ] 세션 확인 로직
- [ ] 로그인 페이지 리다이렉트
- [ ] 로딩 상태 처리
- [ ] `App.tsx`에 적용

**구현 예시**:
```typescript
// src/components/auth/ProtectedRoute.tsx
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

**App.tsx 수정**:
```typescript
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// 보호가 필요한 라우트 감싸기
<Route path="/" element={
  <ProtectedRoute>
    <DashboardLayout />
  </ProtectedRoute>
}>
  <Route index element={<Dashboard />} />
  <Route path="programs" element={<Programs />} />
  {/* ... */}
</Route>
```

---

#### Task 3.4: 사용자 프로필 컴포넌트 (3시간)

**파일**: `src/components/layout/UserProfile.tsx`

**체크리스트**:
- [ ] 사이드바에 사용자 정보 표시
- [ ] 아바타 이미지
- [ ] 이름 및 이메일
- [ ] 드롭다운 메뉴 (프로필, 설정, 로그아웃)
- [ ] 로그아웃 기능
- [ ] `AppSidebar.tsx`에 통합

**구현 예시**:
```typescript
// src/components/layout/UserProfile.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, User } from 'lucide-react';
import { toast } from 'sonner';

export function UserProfile() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('로그아웃 되었습니다');
    navigate('/login');
  };

  if (!user) return null;

  const initials = user.user_metadata?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || user.email[0].toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="text-left">
          <p className="text-sm font-medium">{user.user_metadata?.full_name || '사용자'}</p>
          <p className="text-xs text-slate-500">{user.email}</p>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <User className="mr-2 h-4 w-4" />
          프로필
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          설정
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

### Week 3, Day 3-4: DB 연동 완료

#### Task 3.5: Programs 훅 생성 (2시간)

**파일**: `src/hooks/usePrograms.ts`

**체크리스트**:
- [ ] `usePrograms()` - 목록 조회
- [ ] `useCreateProgram()` - 프로그램 생성
- [ ] `useUpdateProgram()` - 프로그램 수정
- [ ] `useDeleteProgram()` - 프로그램 삭제
- [ ] TypeScript 타입 정의

**구현 예시**:
```typescript
// src/hooks/usePrograms.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';
import { toast } from 'sonner';

type Program = Database['public']['Tables']['programs']['Row'];
type ProgramInsert = Database['public']['Tables']['programs']['Insert'];
type ProgramUpdate = Database['public']['Tables']['programs']['Update'];

export function usePrograms() {
  return useQuery({
    queryKey: ['programs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Program[];
    },
  });
}

export function useCreateProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newProgram: Omit<ProgramInsert, 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      const { data, error } = await supabase
        .from('programs')
        .insert({
          ...newProgram,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      toast.success('프로그램이 생성되었습니다.');
    },
    onError: (error: Error) => {
      toast.error('프로그램 생성 실패', { description: error.message });
    },
  });
}

// useUpdateProgram, useDeleteProgram 구현...
```

---

#### Task 3.6: Projects 훅 생성 (2시간)

**파일**: `src/hooks/useProjects.ts`

**체크리스트**:
- [ ] `useProjects()` - 목록 조회
- [ ] `useProject(id)` - 단일 조회
- [ ] `useCreateProject()` - 프로젝트 생성
- [ ] `useUpdateProject()` - 프로젝트 수정
- [ ] `useDeleteProject()` - 프로젝트 삭제
- [ ] `useAddPromptToProject()` - 프롬프트 추가
- [ ] `useRemovePromptFromProject()` - 프롬프트 제거

**구현 예시**:
```typescript
export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_prompts (
            prompt:prompts (*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}
```

---

#### Task 3.7: History 훅 생성 (2시간)

**파일**: `src/hooks/useHistory.ts`

**체크리스트**:
- [ ] `useHistory()` - 전체 히스토리 조회
- [ ] `useHistoryItem(id)` - 단일 히스토리 조회
- [ ] `useDeleteHistory()` - 히스토리 삭제
- [ ] 필터링 옵션 (날짜, AI 제공자, 상태)
- [ ] 페이지네이션

**구현 예시**:
```typescript
interface HistoryFilters {
  startDate?: string;
  endDate?: string;
  provider?: 'openai' | 'gemini' | 'claude';
  status?: 'success' | 'error';
}

export function useHistory(filters?: HistoryFilters) {
  return useQuery({
    queryKey: ['execution-history', filters],
    queryFn: async () => {
      let query = supabase
        .from('execution_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }
      if (filters?.provider) {
        query = query.eq('ai_provider', filters.provider);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
}
```

---

#### Task 3.8: 페이지 DB 연동 (4시간)

**파일**: `src/pages/Programs.tsx`, `Projects.tsx`, `History.tsx`

**Programs.tsx 수정**:
```typescript
// Before:
import { programs as allPrograms } from '@/data/programs';

// After:
import { usePrograms } from '@/hooks/usePrograms';

export default function Programs() {
  const { data: programs, isLoading } = usePrograms();

  if (isLoading) return <div>Loading...</div>;

  return (
    // 기존 UI 유지, data만 변경
  );
}
```

**Projects.tsx 수정**:
```typescript
import { useProjects } from '@/hooks/useProjects';

export default function Projects() {
  const { data: projects, isLoading } = useProjects();
  // ...
}
```

**History.tsx 수정**:
```typescript
import { useHistory } from '@/hooks/useHistory';

export default function History() {
  const { data: historyItems, isLoading } = useHistory();
  // ...
}
```

---

### Week 3, Day 5: JWT 활성화 및 테스트

#### Task 3.9: Edge Functions JWT 활성화 (1시간)

**파일**: `supabase/config.toml`

**변경 사항**:
```toml
# Before:
[functions.execute-ai]
verify_jwt = true  # 설정은 되어있으나 배포 시 --no-verify-jwt 사용

# After:
[functions.execute-ai]
verify_jwt = true  # 이제 실제로 검증함
```

**재배포**:
```bash
# --no-verify-jwt 플래그 제거
supabase functions deploy execute-ai
supabase functions deploy export-prompts
supabase functions deploy import-prompts
```

---

#### Task 3.10: 통합 테스트 (2시간)

**테스트 시나리오**:

1. **회원가입 테스트**
   - [ ] 회원가입 폼 입력
   - [ ] 이메일 인증 메일 수신
   - [ ] 인증 링크 클릭
   - [ ] `profiles` 테이블에 데이터 생성 확인

2. **로그인 테스트**
   - [ ] 로그인 폼 입력
   - [ ] 세션 생성 확인
   - [ ] Dashboard 리다이렉트
   - [ ] 사이드바에 사용자 정보 표시

3. **프롬프트 CRUD 테스트**
   - [ ] 프롬프트 생성
   - [ ] 목록에서 확인
   - [ ] 프롬프트 수정
   - [ ] 프롬프트 삭제
   - [ ] RLS 확인 (다른 사용자 데이터 조회 불가)

4. **AI 실행 테스트**
   - [ ] 프롬프트 입력 및 실행
   - [ ] 결과 확인
   - [ ] `execution_history` 테이블에 저장 확인
   - [ ] JWT 인증 확인

5. **로그아웃 테스트**
   - [ ] 로그아웃 버튼 클릭
   - [ ] 세션 삭제 확인
   - [ ] 로그인 페이지 리다이렉트

**검증 SQL**:
```sql
-- Supabase Dashboard > SQL Editor
SELECT * FROM profiles ORDER BY created_at DESC LIMIT 10;
SELECT * FROM prompts ORDER BY created_at DESC LIMIT 10;
SELECT * FROM execution_history ORDER BY created_at DESC LIMIT 10;
```

---

## 🎨 Phase 4: 프롬프트 마법사 (1주)

### 목표
사용자가 대화형 질문을 통해 업무에 맞는 프롬프트를 자동 생성

---

### Week 4, Day 1-2: 프롬프트 생성 플로우 설계

#### Task 4.1: 질문 플로우 정의 (3시간)

**파일**: `src/data/promptWizard.ts`

**질문 단계 (7단계)**:
```typescript
// src/data/promptWizard.ts
export interface WizardStep {
  id: string;
  title: string;
  description: string;
  question: string;
  type: 'select' | 'text' | 'textarea' | 'multiselect';
  options?: { value: string; label: string }[];
  placeholder?: string;
  required: boolean;
}

export const wizardSteps: WizardStep[] = [
  {
    id: 'category',
    title: '카테고리 선택',
    description: '어떤 종류의 프롬프트를 만들고 싶으신가요?',
    question: '프롬프트 카테고리를 선택하세요',
    type: 'select',
    options: [
      { value: 'patient-communication', label: '환자 안내문' },
      { value: 'document-summary', label: '문서 요약' },
      { value: 'education', label: '교육 자료' },
      { value: 'research', label: '연구 보고서' },
      { value: 'clinical-note', label: '진료 기록' },
      { value: 'custom', label: '기타' },
    ],
    required: true,
  },
  {
    id: 'purpose',
    title: '목적',
    description: '이 프롬프트로 무엇을 하고 싶으신가요?',
    question: '사용 목적을 입력하세요',
    type: 'textarea',
    placeholder: '예: 고혈압 환자에게 생활습관 개선 안내문을 작성하고 싶습니다.',
    required: true,
  },
  {
    id: 'target-audience',
    title: '대상',
    description: '누구를 위한 내용인가요?',
    question: '대상을 선택하세요',
    type: 'select',
    options: [
      { value: 'patient', label: '환자' },
      { value: 'caregiver', label: '보호자' },
      { value: 'medical-staff', label: '의료진' },
      { value: 'student', label: '학생' },
      { value: 'general', label: '일반인' },
    ],
    required: true,
  },
  {
    id: 'tone',
    title: '어조',
    description: '어떤 어조로 작성할까요?',
    question: '어조를 선택하세요',
    type: 'select',
    options: [
      { value: 'friendly', label: '친근한 (쉬운 말)' },
      { value: 'professional', label: '전문적인 (의학 용어 포함)' },
      { value: 'empathetic', label: '공감적인 (감정 배려)' },
      { value: 'concise', label: '간결한 (핵심만)' },
    ],
    required: true,
  },
  {
    id: 'length',
    title: '길이',
    description: '얼마나 길게 작성할까요?',
    question: '원하는 길이를 선택하세요',
    type: 'select',
    options: [
      { value: 'short', label: '짧게 (3-5줄)' },
      { value: 'medium', label: '보통 (10-15줄)' },
      { value: 'long', label: '길게 (1페이지 이상)' },
    ],
    required: true,
  },
  {
    id: 'variables',
    title: '변수 설정',
    description: '프롬프트에서 자주 바꿀 내용이 있나요?',
    question: '변수를 입력하세요 (쉼표로 구분)',
    type: 'text',
    placeholder: '예: 질병명, 약물명, 환자나이',
    required: false,
  },
  {
    id: 'additional',
    title: '추가 요구사항',
    description: '기타 특별히 포함하고 싶은 내용이 있나요?',
    question: '추가 요구사항을 입력하세요',
    type: 'textarea',
    placeholder: '예: 참고 문헌을 포함해주세요, 표 형식으로 작성해주세요',
    required: false,
  },
];
```

---

#### Task 4.2: 프롬프트 생성 엔진 (4시간)

**파일**: `src/lib/promptGenerator.ts`

**체크리스트**:
- [ ] 템플릿 매핑 로직
- [ ] 변수 추출 및 치환
- [ ] AI 제공자 추천 알고리즘
- [ ] 프롬프트 최적화

**구현 예시**:
```typescript
// src/lib/promptGenerator.ts
interface WizardAnswers {
  category: string;
  purpose: string;
  targetAudience: string;
  tone: string;
  length: string;
  variables?: string;
  additional?: string;
}

interface GeneratedPrompt {
  title: string;
  content: string;
  category: string;
  variables: string[];
  recommendedAI: 'openai' | 'gemini' | 'claude';
  reason: string;
}

export function generatePrompt(answers: WizardAnswers): GeneratedPrompt {
  // 1. 카테고리별 템플릿 선택
  const baseTemplate = getBaseTemplate(answers.category);

  // 2. 어조 조정
  const toneModifier = getToneModifier(answers.tone);

  // 3. 길이 조정
  const lengthInstruction = getLengthInstruction(answers.length);

  // 4. 변수 추출
  const variables = extractVariables(answers.variables || '');

  // 5. 프롬프트 조합
  const content = buildPromptContent({
    baseTemplate,
    purpose: answers.purpose,
    targetAudience: answers.targetAudience,
    toneModifier,
    lengthInstruction,
    additional: answers.additional,
    variables,
  });

  // 6. AI 제공자 추천
  const { provider, reason } = recommendAIProvider(answers);

  return {
    title: generateTitle(answers),
    content,
    category: answers.category,
    variables,
    recommendedAI: provider,
    reason,
  };
}

function getBaseTemplate(category: string): string {
  const templates = {
    'patient-communication': `당신은 환자가 쉽게 이해할 수 있도록 의료 정보를 전달하는 전문가입니다.`,
    'document-summary': `당신은 의료 문서를 핵심만 추려서 요약하는 전문가입니다.`,
    'education': `당신은 의료 교육 자료를 만드는 전문가입니다.`,
    'research': `당신은 의학 연구를 분석하고 보고서를 작성하는 전문가입니다.`,
    'clinical-note': `당신은 진료 기록을 표준 형식으로 정리하는 전문가입니다.`,
    'custom': `당신은 의료 분야 전문가입니다.`,
  };
  return templates[category] || templates['custom'];
}

function getToneModifier(tone: string): string {
  const modifiers = {
    'friendly': '환자가 이해하기 쉽게 쉬운 말로 설명하세요.',
    'professional': '의학 전문 용어를 사용하여 정확하게 작성하세요.',
    'empathetic': '환자의 감정을 배려하고 공감하는 어조로 작성하세요.',
    'concise': '핵심만 간결하게 작성하세요.',
  };
  return modifiers[tone] || '';
}

function getLengthInstruction(length: string): string {
  const instructions = {
    'short': '3-5줄 이내로 간단히 작성하세요.',
    'medium': '10-15줄 정도로 적절히 작성하세요.',
    'long': '1페이지 이상 자세히 작성하세요.',
  };
  return instructions[length] || '';
}

function extractVariables(variablesString: string): string[] {
  if (!variablesString.trim()) return [];
  return variablesString
    .split(',')
    .map(v => v.trim())
    .filter(v => v.length > 0);
}

function buildPromptContent(params: {
  baseTemplate: string;
  purpose: string;
  targetAudience: string;
  toneModifier: string;
  lengthInstruction: string;
  additional?: string;
  variables: string[];
}): string {
  const {
    baseTemplate,
    purpose,
    targetAudience,
    toneModifier,
    lengthInstruction,
    additional,
    variables,
  } = params;

  let content = baseTemplate + '\n\n';
  content += `목적: ${purpose}\n\n`;
  content += `대상: ${targetAudience}\n\n`;

  if (toneModifier) {
    content += `어조: ${toneModifier}\n\n`;
  }

  if (lengthInstruction) {
    content += `길이: ${lengthInstruction}\n\n`;
  }

  if (variables.length > 0) {
    content += `다음 변수를 사용하세요:\n`;
    variables.forEach(v => {
      content += `- {${v}}\n`;
    });
    content += '\n';
  }

  if (additional) {
    content += `추가 요구사항:\n${additional}\n\n`;
  }

  content += '위 내용을 바탕으로 작성해주세요.';

  return content;
}

function recommendAIProvider(answers: WizardAnswers): {
  provider: 'openai' | 'gemini' | 'claude';
  reason: string;
} {
  // 추천 로직
  if (answers.category === 'research' || answers.tone === 'professional') {
    return {
      provider: 'claude',
      reason: '전문적이고 깊이 있는 분석에 강점이 있습니다.',
    };
  }

  if (answers.length === 'long' || answers.category === 'education') {
    return {
      provider: 'gemini',
      reason: '긴 문서 생성과 구조화에 강점이 있습니다.',
    };
  }

  return {
    provider: 'openai',
    reason: '빠르고 정확한 응답을 제공합니다.',
  };
}

function generateTitle(answers: WizardAnswers): string {
  const categoryNames = {
    'patient-communication': '환자 안내문',
    'document-summary': '문서 요약',
    'education': '교육 자료',
    'research': '연구 보고서',
    'clinical-note': '진료 기록',
    'custom': '사용자 정의',
  };

  const categoryName = categoryNames[answers.category] || '프롬프트';
  const purposeKeyword = answers.purpose.split(' ')[0];

  return `${categoryName} - ${purposeKeyword}`;
}
```

---

### Week 4, Day 3-4: UI 구현

#### Task 4.3: 프롬프트 마법사 UI (6시간)

**파일**: `src/pages/PromptWizard.tsx`

**체크리스트**:
- [ ] 스텝 진행 표시기
- [ ] 질문 UI (단계별)
- [ ] 이전/다음 버튼
- [ ] 답변 유효성 검사
- [ ] 미리보기 패널
- [ ] 최종 확인 화면
- [ ] 저장 기능

**구현 예시**:
```typescript
// src/pages/PromptWizard.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { wizardSteps } from '@/data/promptWizard';
import { generatePrompt } from '@/lib/promptGenerator';
import { useCreatePrompt } from '@/hooks/usePrompts';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

export default function PromptWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [generatedPrompt, setGeneratedPrompt] = useState<any>(null);
  const navigate = useNavigate();
  const createPrompt = useCreatePrompt();

  const totalSteps = wizardSteps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const step = wizardSteps[currentStep];

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [step.id]: value,
    }));
  };

  const handleNext = () => {
    if (step.required && !answers[step.id]) {
      toast.error('필수 항목입니다');
      return;
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // 마지막 단계: 프롬프트 생성
      const prompt = generatePrompt(answers as any);
      setGeneratedPrompt(prompt);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSave = async () => {
    if (!generatedPrompt) return;

    try {
      await createPrompt.mutateAsync({
        title: generatedPrompt.title,
        content: generatedPrompt.content,
        category: generatedPrompt.category,
        variables: generatedPrompt.variables,
      });

      toast.success('프롬프트가 저장되었습니다');
      navigate('/prompts');
    } catch (error) {
      toast.error('저장 실패');
    }
  };

  if (generatedPrompt) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">프롬프트 생성 완료!</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-lg font-semibold mb-2">{generatedPrompt.title}</h2>
          <p className="text-sm text-slate-500 mb-4">
            카테고리: {generatedPrompt.category}
          </p>

          <div className="bg-slate-50 p-4 rounded-lg mb-4">
            <pre className="whitespace-pre-wrap text-sm">
              {generatedPrompt.content}
            </pre>
          </div>

          {generatedPrompt.variables.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">변수:</h3>
              <div className="flex flex-wrap gap-2">
                {generatedPrompt.variables.map((v: string) => (
                  <span key={v} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {`{${v}}`}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-1">추천 AI: {generatedPrompt.recommendedAI}</h3>
            <p className="text-sm text-slate-600">{generatedPrompt.reason}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setGeneratedPrompt(null)} variant="outline">
            다시 만들기
          </Button>
          <Button onClick={handleSave} className="flex-1">
            프롬프트 저장
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">프롬프트 마법사</h1>
        <p className="text-slate-600">간단한 질문에 답하면 최적의 프롬프트를 만들어드립니다.</p>
      </div>

      <Progress value={progress} className="mb-6" />

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="mb-4">
          <span className="text-sm text-slate-500">
            {currentStep + 1} / {totalSteps}
          </span>
          <h2 className="text-xl font-semibold mt-1">{step.title}</h2>
          <p className="text-slate-600 mt-1">{step.description}</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            {step.question}
            {step.required && <span className="text-red-500 ml-1">*</span>}
          </label>

          {step.type === 'select' && (
            <select
              value={answers[step.id] || ''}
              onChange={e => handleAnswer(e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">선택하세요</option>
              {step.options?.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {step.type === 'text' && (
            <input
              type="text"
              value={answers[step.id] || ''}
              onChange={e => handleAnswer(e.target.value)}
              placeholder={step.placeholder}
              className="w-full p-2 border rounded-lg"
            />
          )}

          {step.type === 'textarea' && (
            <textarea
              value={answers[step.id] || ''}
              onChange={e => handleAnswer(e.target.value)}
              placeholder={step.placeholder}
              rows={4}
              className="w-full p-2 border rounded-lg"
            />
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handlePrev}
          disabled={currentStep === 0}
          variant="outline"
        >
          이전
        </Button>
        <Button onClick={handleNext} className="flex-1">
          {currentStep === totalSteps - 1 ? '프롬프트 생성' : '다음'}
        </Button>
      </div>
    </div>
  );
}
```

---

### Week 4, Day 5: 통합 및 테스트

#### Task 4.4: Prompts 페이지에 "마법사" 버튼 추가 (1시간)

**파일**: `src/pages/Prompts.tsx`

```typescript
import { useNavigate } from 'react-router-dom';
import { Wand2 } from 'lucide-react';

// 기존 코드 상단에 버튼 추가
<Button onClick={() => navigate('/prompts/wizard')} className="gap-2">
  <Wand2 className="h-4 w-4" />
  프롬프트 마법사
</Button>
```

---

#### Task 4.5: 라우트 추가 (30분)

**파일**: `src/App.tsx`

```typescript
import PromptWizard from '@/pages/PromptWizard';

<Route path="prompts/wizard" element={<PromptWizard />} />
```

---

#### Task 4.6: 엔드-투-엔드 테스트 (2시간)

**테스트 시나리오**:
1. [ ] 프롬프트 페이지에서 "마법사" 클릭
2. [ ] 7단계 질문 순차적으로 답변
3. [ ] 각 단계 유효성 검사 확인
4. [ ] 진행 표시기 확인
5. [ ] 최종 프롬프트 생성 확인
6. [ ] AI 추천 확인
7. [ ] 프롬프트 저장
8. [ ] 목록에서 확인
9. [ ] AI 실행 페이지에서 사용

---

## 🏗️ Phase 5: 프로그램/프로젝트 고도화 (1주)

### 목표
사용자가 자신만의 AI 프로그램을 만들고 프로젝트로 관리

---

### Task 5.1-5.5: (상세 내용 생략, 필요 시 추가)

- 프로그램 생성 UI
- 프로젝트 상세 페이지
- 프롬프트-프로그램 연결
- 통계 대시보드
- 공유 기능

---

## 🚀 Phase 6: 프로덕션 배포 (1주)

### 목표
실제 사용자를 위한 안정적인 서비스 런칭

---

### Task 6.1: 성능 최적화 (2일)

**체크리스트**:
- [ ] React Query 캐시 전략 최적화
- [ ] 이미지 lazy loading
- [ ] 코드 스플리팅
- [ ] Lighthouse 점수 90+ 달성
- [ ] 번들 사이즈 분석 및 최적화

---

### Task 6.2: 보안 강화 (1일)

**체크리스트**:
- [ ] Edge Functions JWT 검증 활성화
- [ ] API Rate Limiting 설정
- [ ] CORS 정책 정교화
- [ ] 환경 변수 검증
- [ ] SQL Injection 방지 재검증

---

### Task 6.3: 모니터링 설정 (1일)

**체크리스트**:
- [ ] Sentry 에러 트래킹
- [ ] Supabase Logs 모니터링
- [ ] 사용량 대시보드
- [ ] 알림 설정 (에러, 할당량 초과)

---

### Task 6.4: 배포 (2일)

**체크리스트**:
- [ ] Vercel/Netlify 프로젝트 생성
- [ ] 환경 변수 설정
- [ ] 커스텀 도메인 연결
- [ ] SSL 인증서 확인
- [ ] CI/CD 파이프라인
- [ ] 스테이징 환경 테스트
- [ ] 프로덕션 배포

---

## 📊 마일스톤 체크리스트

### ✅ Milestone 1: MVP 완성 (Phase 1-2)
- [x] UI 구현
- [x] 백엔드 인프라
- [x] AI 통합

### 🔄 Milestone 2: 사용자 관리 (Phase 3)
- [ ] 인증 시스템
- [ ] DB 연동
- [ ] JWT 활성화

### ⏳ Milestone 3: 핵심 기능 (Phase 4)
- [ ] 프롬프트 마법사
- [ ] 변수 치환 UI
- [ ] AI 추천

### ⏳ Milestone 4: 고도화 (Phase 5)
- [ ] 프로그램 생성
- [ ] 프로젝트 관리
- [ ] 통계 대시보드

### ⏳ Milestone 5: 런칭 (Phase 6)
- [ ] 성능 최적화
- [ ] 보안 강화
- [ ] 프로덕션 배포

---

## 🎯 주간 목표 요약

### Week 3 (현재)
**목표**: 사용자 인증 + DB 연동 완료
**산출물**: 로그인/회원가입 UI, 3개 훅 (usePrograms, useProjects, useHistory)

### Week 4
**목표**: 프롬프트 마법사 구현
**산출물**: 7단계 질문 플로우, 자동 생성 엔진

### Week 5
**목표**: 프로그램/프로젝트 고도화
**산출물**: 프로그램 생성 UI, 프로젝트 상세 페이지

### Week 6
**목표**: 프로덕션 배포
**산출물**: 실제 서비스 런칭

---

## 💬 참고 사항

### 개발 원칙
1. **UI 먼저, 데이터 나중**: 사용자 경험을 먼저 설계
2. **점진적 개선**: 완벽보다는 빠른 반복
3. **문서화**: 모든 주요 기능에 가이드 작성
4. **테스트 주도**: 배포 전 반드시 시나리오 테스트

### 일일 루틴
- 오전: 새 기능 구현
- 오후: 기존 기능 테스트 및 버그 수정
- 저녁: 문서 업데이트

### 주간 체크포인트
- 금요일: 주간 진행 상황 리뷰
- 토요일: 통합 테스트 및 버그 수정
- 일요일: 다음 주 계획 수립

---

**이전 문서**: [IMPLEMENTATION_REVIEW.md](./IMPLEMENTATION_REVIEW.md) - 현재 구현 현황
**관련 문서**: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md), [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md)
