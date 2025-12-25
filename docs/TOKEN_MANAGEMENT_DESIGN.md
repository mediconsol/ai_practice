# 토큰 사용량 관리 시스템 설계

## 개요
SaaS 서비스를 위한 토큰 기반 사용량 관리 시스템을 구현합니다. 구독 티어별로 월간 토큰 할당량을 설정하고, 사용량을 추적하여 제한합니다.

## 비즈니스 요구사항

### 구독 티어별 토큰 제한
```typescript
const SUBSCRIPTION_LIMITS = {
  free: {
    monthly_tokens: 10000,        // 월 1만 토큰
    name: '무료',
    price: 0
  },
  pro: {
    monthly_tokens: 100000,       // 월 10만 토큰
    name: 'Pro',
    price: 9900                   // 월 9,900원
  },
  enterprise: {
    monthly_tokens: -1,           // 무제한 (-1)
    name: 'Enterprise',
    price: 99000                  // 월 99,000원
  }
};
```

### 토큰 카운팅 규칙
1. **AI 요청 시**: 입력 토큰 + 출력 토큰 합산
2. **매월 1일 자동 리셋**: tokens_used_this_month를 0으로 초기화
3. **소진 시**: AI 실행 차단, 업그레이드 유도

## 데이터베이스 설계

### 1. profiles 테이블 확장

```sql
ALTER TABLE profiles
ADD COLUMN tokens_used_this_month INTEGER DEFAULT 0,
ADD COLUMN token_limit INTEGER DEFAULT 10000,
ADD COLUMN tokens_reset_at TIMESTAMP WITH TIME ZONE DEFAULT DATE_TRUNC('month', NOW() + INTERVAL '1 month');

-- 인덱스 추가 (사용량 조회 최적화)
CREATE INDEX idx_profiles_token_usage ON profiles(user_id, tokens_used_this_month);

-- 구독 티어별 기본 제한 설정
UPDATE profiles SET token_limit = 10000 WHERE subscription_tier = 'free';
UPDATE profiles SET token_limit = 100000 WHERE subscription_tier = 'pro';
UPDATE profiles SET token_limit = -1 WHERE subscription_tier = 'enterprise';
```

### 2. 토큰 사용 내역 테이블 (선택사항)

월별 사용량 통계를 위한 별도 테이블:

```sql
CREATE TABLE token_usage_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  month DATE NOT NULL,                      -- 2025-01-01 형식
  tokens_used INTEGER DEFAULT 0,
  execution_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, month)
);

-- RLS 정책
ALTER TABLE token_usage_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own token history"
ON token_usage_history FOR SELECT
USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX idx_token_history_user_month ON token_usage_history(user_id, month DESC);
```

### 3. execution_history 테이블 활용

이미 `token_usage` 필드가 있으므로 활용:

```typescript
// token_usage 구조
{
  prompt_tokens: 150,
  completion_tokens: 300,
  total_tokens: 450
}
```

## 백엔드 로직

### 1. 토큰 사용량 업데이트 함수

```sql
-- Supabase Edge Function 또는 Database Function
CREATE OR REPLACE FUNCTION increment_token_usage(
  p_user_id UUID,
  p_tokens_used INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_usage INTEGER;
  v_limit INTEGER;
  v_reset_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- 현재 사용량과 제한 조회
  SELECT tokens_used_this_month, token_limit, tokens_reset_at
  INTO v_current_usage, v_limit, v_reset_at
  FROM profiles
  WHERE id = p_user_id;

  -- 리셋 시간이 지났으면 초기화
  IF v_reset_at <= NOW() THEN
    UPDATE profiles
    SET
      tokens_used_this_month = 0,
      tokens_reset_at = DATE_TRUNC('month', NOW() + INTERVAL '1 month')
    WHERE id = p_user_id;
    v_current_usage := 0;
  END IF;

  -- 제한 체크 (무제한이 아닌 경우)
  IF v_limit > 0 AND (v_current_usage + p_tokens_used) > v_limit THEN
    RETURN FALSE;  -- 제한 초과
  END IF;

  -- 사용량 증가
  UPDATE profiles
  SET tokens_used_this_month = tokens_used_this_month + p_tokens_used
  WHERE id = p_user_id;

  RETURN TRUE;  -- 성공
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. 월간 토큰 리셋 (Cron Job)

```sql
-- Supabase의 pg_cron 또는 Edge Function Cron
-- 매월 1일 00:00 실행
SELECT cron.schedule(
  'monthly-token-reset',
  '0 0 1 * *',
  $$
    UPDATE profiles
    SET
      tokens_used_this_month = 0,
      tokens_reset_at = DATE_TRUNC('month', NOW() + INTERVAL '1 month')
    WHERE tokens_reset_at <= NOW();
  $$
);
```

또는 애플리케이션 레벨에서 체크:

```typescript
// AI 실행 전 체크
async function checkAndResetTokens(userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('tokens_used_this_month, tokens_reset_at')
    .eq('id', userId)
    .single();

  if (new Date(profile.tokens_reset_at) <= new Date()) {
    // 리셋 필요
    await supabase
      .from('profiles')
      .update({
        tokens_used_this_month: 0,
        tokens_reset_at: getNextMonthStart()
      })
      .eq('id', userId);
  }
}
```

## 프론트엔드 구현

### 1. 타입 정의

```typescript
// src/types/token.ts
export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface UserTokenInfo {
  tokens_used_this_month: number;
  token_limit: number;
  tokens_reset_at: string;
  subscription_tier: 'free' | 'pro' | 'enterprise';
}

export interface TokenLimit {
  monthly_tokens: number;
  name: string;
  price: number;
}
```

### 2. Hook 구현

```typescript
// src/hooks/useTokenUsage.ts
export function useTokenUsage() {
  return useQuery({
    queryKey: ['tokenUsage'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('tokens_used_this_month, token_limit, tokens_reset_at, subscription_tier')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data as UserTokenInfo;
    },
  });
}

// 토큰 제한 체크
export function useCheckTokenLimit() {
  return useMutation({
    mutationFn: async (requiredTokens: number) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인 필요');

      const { data: profile } = await supabase
        .from('profiles')
        .select('tokens_used_this_month, token_limit')
        .eq('id', user.id)
        .single();

      if (!profile) throw new Error('프로필 없음');

      // 무제한 체크
      if (profile.token_limit === -1) return { allowed: true };

      // 제한 체크
      const allowed = (profile.tokens_used_this_month + requiredTokens) <= profile.token_limit;
      return {
        allowed,
        current: profile.tokens_used_this_month,
        limit: profile.token_limit,
        remaining: profile.token_limit - profile.tokens_used_this_month
      };
    },
  });
}
```

### 3. UI 컴포넌트

#### 설정 화면 - 토큰 사용량 섹션

```tsx
// src/components/settings/TokenUsageSection.tsx
export function TokenUsageSection() {
  const { data: tokenInfo, isLoading } = useTokenUsage();

  const usagePercentage = tokenInfo?.token_limit === -1
    ? 0
    : (tokenInfo?.tokens_used_this_month / tokenInfo?.token_limit) * 100;

  const resetDate = new Date(tokenInfo?.tokens_reset_at);

  return (
    <div className="space-y-6">
      {/* 사용량 프로그레스 바 */}
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">이번 달 토큰 사용량</span>
          <span className="text-sm text-muted-foreground">
            {tokenInfo?.tokens_used_this_month.toLocaleString()} /
            {tokenInfo?.token_limit === -1 ? '무제한' : tokenInfo?.token_limit.toLocaleString()}
          </span>
        </div>
        <Progress value={usagePercentage} className="h-2" />
      </div>

      {/* 리셋 일자 */}
      <p className="text-sm text-muted-foreground">
        다음 리셋: {resetDate.toLocaleDateString('ko-KR')}
      </p>

      {/* 업그레이드 버튼 */}
      {tokenInfo?.subscription_tier === 'free' && (
        <Button variant="default" onClick={() => navigate('/upgrade')}>
          Pro로 업그레이드 (월 10만 토큰)
        </Button>
      )}
    </div>
  );
}
```

#### 대시보드 - 토큰 위젯

```tsx
// src/components/dashboard/TokenUsageWidget.tsx
export function TokenUsageWidget() {
  const { data: tokenInfo } = useTokenUsage();

  return (
    <Card>
      <CardHeader>
        <CardTitle>토큰 사용량</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {tokenInfo?.tokens_used_this_month.toLocaleString()}
        </div>
        <p className="text-sm text-muted-foreground">
          / {tokenInfo?.token_limit === -1 ? '무제한' : tokenInfo?.token_limit.toLocaleString()} 토큰
        </p>
        <Progress
          value={(tokenInfo?.tokens_used_this_month / tokenInfo?.token_limit) * 100}
          className="mt-2"
        />
      </CardContent>
    </Card>
  );
}
```

#### AI 실행 전 체크

```tsx
// src/pages/AIExecute.tsx
const checkTokenLimit = useCheckTokenLimit();

const handleExecute = async () => {
  // 예상 토큰 수 (프롬프트 길이 기반)
  const estimatedTokens = Math.ceil(prompt.length / 4) + 500;

  const result = await checkTokenLimit.mutateAsync(estimatedTokens);

  if (!result.allowed) {
    toast({
      title: "토큰 제한 초과",
      description: `이번 달 토큰을 모두 사용했습니다. (${result.remaining} 토큰 남음)`,
      variant: "destructive",
    });

    // 업그레이드 다이얼로그 표시
    setUpgradeDialogOpen(true);
    return;
  }

  // AI 실행
  await executeAI();
};
```

## AI 실행 후 토큰 기록

```typescript
// src/hooks/useExecuteAI.ts (수정)
const { data, error } = await supabase.functions.invoke('execute-ai', {
  body: { prompt, provider, model }
});

if (data?.token_usage) {
  // profiles 테이블의 tokens_used_this_month 업데이트
  await supabase.rpc('increment_token_usage', {
    p_user_id: user.id,
    p_tokens_used: data.token_usage.total_tokens
  });

  // React Query 캐시 무효화
  queryClient.invalidateQueries(['tokenUsage']);
}
```

## 추가 기능

### 1. 토큰 사용 통계

```tsx
// 월별 사용량 차트
export function TokenUsageChart() {
  const { data: history } = useQuery({
    queryKey: ['tokenHistory'],
    queryFn: async () => {
      const { data } = await supabase
        .from('token_usage_history')
        .select('*')
        .order('month', { ascending: false })
        .limit(6);
      return data;
    }
  });

  return <LineChart data={history} />;
}
```

### 2. 업그레이드 다이얼로그

```tsx
export function UpgradeDialog({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>토큰을 모두 사용했습니다</DialogTitle>
          <DialogDescription>
            더 많은 토큰이 필요하신가요? Pro 플랜으로 업그레이드하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>무료</CardTitle>
              <CardDescription>현재 플랜</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0원</p>
              <p className="text-sm text-muted-foreground">월 1만 토큰</p>
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <CardDescription>추천</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">9,900원</p>
              <p className="text-sm text-muted-foreground">월 10만 토큰</p>
              <Button className="w-full mt-4">업그레이드</Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### 3. 토큰 절약 팁

```tsx
// 설정 화면에 표시
<Alert>
  <Lightbulb className="h-4 w-4" />
  <AlertTitle>토큰 절약 팁</AlertTitle>
  <AlertDescription>
    - 간결한 프롬프트 작성<br/>
    - 불필요한 컨텍스트 제거<br/>
    - 적절한 max_tokens 설정
  </AlertDescription>
</Alert>
```

## 구현 우선순위

### Phase 1: 기본 추적 (필수)
1. ✅ DB migration: profiles에 토큰 컬럼 추가
2. ✅ useTokenUsage hook 구현
3. ✅ 설정 화면에 사용량 표시
4. ✅ AI 실행 후 토큰 기록

### Phase 2: 제한 적용
1. ✅ 토큰 제한 체크 로직
2. ✅ AI 실행 전 제한 검증
3. ✅ 소진 시 경고 메시지

### Phase 3: UX 개선
1. ✅ 대시보드 위젯
2. ✅ 업그레이드 다이얼로그
3. ✅ 월별 통계 차트

### Phase 4: 자동화
1. ⬜ 월간 자동 리셋 (Cron)
2. ⬜ 이메일 알림 (80%, 100% 도달 시)
3. ⬜ 관리자 대시보드

## 예상 비용 절감 효과

**무료 티어 (월 1만 토큰)**
- GPT-4o 기준: 약 $0.15 (입력) + $0.60 (출력) = $0.75
- 환율 1,300원 기준: 약 975원

**Pro 티어 (월 10만 토큰)**
- GPT-4o 기준: 약 $7.5
- 환율 1,300원 기준: 약 9,750원
- 판매가 9,900원 → 적정 마진

## 보안 고려사항

1. **RLS (Row Level Security)**: 사용자는 본인 토큰 정보만 조회
2. **Rate Limiting**: API 남용 방지
3. **토큰 조작 방지**: DB Function으로 서버 사이드 검증
4. **감사 로그**: 의심스러운 사용 패턴 모니터링

---

**작성일**: 2025-12-25
**버전**: 1.0
**상태**: 설계 완료, 구현 대기
