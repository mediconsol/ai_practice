# 토큰 사용량 관리 구현 가이드

## 구현 완료 사항

### ✅ Phase 1: 기본 추적 시스템 (완료)

#### 1. 데이터베이스 마이그레이션
- **파일**: `supabase/migrations/20251225000002_add_token_management.sql`
- **내용**:
  - `profiles` 테이블에 토큰 관련 컬럼 추가
    - `tokens_used_this_month`: 이번 달 사용 토큰
    - `token_limit`: 월간 제한 (구독 티어별)
    - `tokens_reset_at`: 다음 리셋 날짜
  - `increment_token_usage()` 함수: 토큰 사용량 증가
  - `check_token_limit()` 함수: 토큰 제한 체크

#### 2. 타입 정의
- **파일**: `src/types/token.ts`
- **내용**:
  - `TokenUsage`: AI 응답 토큰 구조
  - `UserTokenInfo`: 사용자 토큰 정보
  - `SUBSCRIPTION_LIMITS`: 티어별 제한 설정

#### 3. Hook 구현
- **파일**: `src/hooks/useTokenUsage.ts`
- **Hooks**:
  - `useTokenUsage()`: 토큰 사용량 조회
  - `useCheckTokenLimit()`: 제한 체크
  - `useIncrementTokenUsage()`: 사용량 증가
  - `useTokenUsagePercentage()`: 사용률 계산
  - `useRemainingTokens()`: 남은 토큰 계산

#### 4. UI 컴포넌트
- **파일**: `src/components/settings/TokenUsageSection.tsx`
  - 설정 화면의 토큰 사용량 섹션
  - 프로그레스 바, 업그레이드 카드 포함

- **파일**: `src/components/dashboard/TokenUsageWidget.tsx`
  - 대시보드의 토큰 사용량 위젯
  - 요약 정보 표시

#### 5. 페이지 업데이트
- **Settings 페이지**: "사용량" 탭 추가
- **Dashboard 페이지**: TokenUsageWidget 추가

---

## 🚀 마이그레이션 실행

### Supabase Dashboard에서 실행

1. **접속**: https://app.supabase.com > 프로젝트 선택
2. **SQL Editor** > New query
3. **아래 SQL 복사 & 실행**:

```sql
-- Add token tracking columns
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS tokens_used_this_month INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS token_limit INTEGER DEFAULT 10000,
ADD COLUMN IF NOT EXISTS tokens_reset_at TIMESTAMP WITH TIME ZONE DEFAULT DATE_TRUNC('month', NOW() + INTERVAL '1 month');

-- Add index
CREATE INDEX IF NOT EXISTS idx_profiles_token_usage ON profiles(id, tokens_used_this_month);

-- Set limits by tier
UPDATE profiles
SET token_limit = CASE subscription_tier
  WHEN 'free' THEN 10000
  WHEN 'pro' THEN 100000
  WHEN 'enterprise' THEN -1
  ELSE 10000
END;

-- Function: increment_token_usage
CREATE OR REPLACE FUNCTION increment_token_usage(
  p_user_id UUID,
  p_tokens_used INTEGER
) RETURNS JSONB AS $$
DECLARE
  v_current_usage INTEGER;
  v_limit INTEGER;
  v_reset_at TIMESTAMP WITH TIME ZONE;
  v_result JSONB;
BEGIN
  -- Lock row
  SELECT tokens_used_this_month, token_limit, tokens_reset_at
  INTO v_current_usage, v_limit, v_reset_at
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  -- Check reset
  IF v_reset_at <= NOW() THEN
    UPDATE profiles
    SET
      tokens_used_this_month = 0,
      tokens_reset_at = DATE_TRUNC('month', NOW() + INTERVAL '1 month'),
      updated_at = NOW()
    WHERE id = p_user_id;
    v_current_usage := 0;
  END IF;

  -- Check limit
  IF v_limit > 0 AND (v_current_usage + p_tokens_used) > v_limit THEN
    v_result := jsonb_build_object(
      'success', false,
      'error', 'TOKEN_LIMIT_EXCEEDED',
      'current_usage', v_current_usage,
      'limit', v_limit
    );
    RETURN v_result;
  END IF;

  -- Increment
  UPDATE profiles
  SET tokens_used_this_month = tokens_used_this_month + p_tokens_used
  WHERE id = p_user_id;

  v_result := jsonb_build_object(
    'success', true,
    'current_usage', v_current_usage + p_tokens_used,
    'limit', v_limit
  );
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: check_token_limit
CREATE OR REPLACE FUNCTION check_token_limit(
  p_user_id UUID,
  p_required_tokens INTEGER
) RETURNS JSONB AS $$
DECLARE
  v_current_usage INTEGER;
  v_limit INTEGER;
  v_reset_at TIMESTAMP WITH TIME ZONE;
  v_result JSONB;
BEGIN
  SELECT tokens_used_this_month, token_limit, tokens_reset_at
  INTO v_current_usage, v_limit, v_reset_at
  FROM profiles
  WHERE id = p_user_id;

  -- Check reset
  IF v_reset_at <= NOW() THEN
    v_current_usage := 0;
  END IF;

  -- Check limit
  IF v_limit = -1 THEN
    v_result := jsonb_build_object('allowed', true, 'unlimited', true);
  ELSIF (v_current_usage + p_required_tokens) <= v_limit THEN
    v_result := jsonb_build_object(
      'allowed', true,
      'current_usage', v_current_usage,
      'limit', v_limit,
      'remaining', v_limit - v_current_usage
    );
  ELSE
    v_result := jsonb_build_object(
      'allowed', false,
      'current_usage', v_current_usage,
      'limit', v_limit,
      'remaining', v_limit - v_current_usage
    );
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION increment_token_usage(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION check_token_limit(UUID, INTEGER) TO authenticated;
```

4. **검증**:

```sql
-- 컬럼 확인
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('tokens_used_this_month', 'token_limit', 'tokens_reset_at');

-- 샘플 데이터 확인
SELECT
  email,
  subscription_tier,
  tokens_used_this_month,
  token_limit,
  tokens_reset_at
FROM profiles
LIMIT 3;
```

---

## 📊 구현된 기능

### 1. 대시보드 토큰 위젯

**위치**: http://localhost:7803/ (대시보드)

**기능**:
- 이번 달 사용 토큰 표시
- 프로그레스 바 (사용률)
- 남은 토큰 수
- 경고 메시지 (80% 이상 사용 시)
- "상세 보기" 버튼 (설정 > 사용량으로 이동)

**구독 티어별 표시**:
- **무료**: 프로그레스 바 + 경고
- **Pro**: 프로그레스 바
- **Enterprise**: "무제한" 배지

### 2. 설정 > 사용량 탭

**위치**: http://localhost:7803/settings > "사용량" 탭

**기능**:
- 상세 사용량 정보
- 다음 리셋 날짜
- 업그레이드 카드 (무료 사용자만)
  - Pro 플랜: 월 10만 토큰, 9,900원
  - Enterprise 플랜: 무제한, 99,000원
- 토큰 절약 팁

---

## 🔄 AI 실행 시 토큰 기록 (다음 단계)

### useExecuteAI hook 수정 필요

```typescript
// src/hooks/useExecuteAI.ts 또는 유사 파일

import { useIncrementTokenUsage } from "@/hooks/useTokenUsage";
import { useCheckTokenLimit } from "@/hooks/useTokenUsage";

export function useExecuteAI() {
  const checkLimit = useCheckTokenLimit();
  const incrementUsage = useIncrementTokenUsage();

  return useMutation({
    mutationFn: async ({ prompt, provider, model }) => {
      // 1. 예상 토큰 수 계산 (대략적)
      const estimatedTokens = Math.ceil(prompt.length / 4) + 500;

      // 2. 토큰 제한 체크
      const limitCheck = await checkLimit.mutateAsync(estimatedTokens);

      if (!limitCheck.allowed) {
        throw new Error('TOKEN_LIMIT_EXCEEDED');
      }

      // 3. AI 실행
      const { data, error } = await supabase.functions.invoke('execute-ai', {
        body: { prompt, provider, model }
      });

      if (error) throw error;

      // 4. 실제 사용 토큰 기록
      if (data?.token_usage?.total_tokens) {
        await incrementUsage.mutateAsync(data.token_usage.total_tokens);
      }

      return data;
    },
    onError: (error) => {
      if (error.message === 'TOKEN_LIMIT_EXCEEDED') {
        toast({
          title: "토큰 제한 초과",
          description: "이번 달 토큰을 모두 사용했습니다.",
          variant: "destructive",
        });
      }
    }
  });
}
```

### Edge Function 수정 (Supabase)

```typescript
// supabase/functions/execute-ai/index.ts

// AI 실행 후 응답에 token_usage 포함
const response = await openai.chat.completions.create({
  // ...
});

return new Response(JSON.stringify({
  result: response.choices[0].message.content,
  token_usage: {
    prompt_tokens: response.usage.prompt_tokens,
    completion_tokens: response.usage.completion_tokens,
    total_tokens: response.usage.total_tokens
  }
}));
```

---

## 📈 구독 티어별 제한

| 티어 | 월간 토큰 | 가격 | 특징 |
|------|-----------|------|------|
| **Free** | 10,000 | 무료 | 기본 AI 모델, 프롬프트 저장 |
| **Pro** | 100,000 | 9,900원/월 | 모든 AI 모델, 우선 지원 |
| **Enterprise** | 무제한 | 99,000원/월 | 전용 모델, 팀 협업, API |

### 티어 변경 방법 (현재 수동)

```sql
-- Supabase Dashboard > SQL Editor
UPDATE profiles
SET
  subscription_tier = 'pro',
  token_limit = 100000
WHERE email = 'user@example.com';
```

---

## ✅ 테스트 체크리스트

### 대시보드
- [ ] 토큰 위젯이 표시됨
- [ ] 현재 사용량이 올바르게 표시됨
- [ ] 프로그레스 바가 정확함
- [ ] 80% 이상 시 경고 배지 표시
- [ ] "상세 보기" 버튼 클릭 시 설정 페이지로 이동

### 설정 > 사용량
- [ ] 상세 사용량 표시
- [ ] 프로그레스 바 동작
- [ ] 다음 리셋 날짜 표시
- [ ] 무료 사용자: 업그레이드 카드 표시
- [ ] Enterprise 사용자: "무제한" 배지 표시

### 토큰 기록 (구현 후)
- [ ] AI 실행 후 사용량 증가
- [ ] 제한 초과 시 실행 차단
- [ ] 차단 시 업그레이드 다이얼로그 표시

---

## 🎯 다음 단계

### 우선순위 1: AI 실행 연동
1. `useExecuteAI` hook에 토큰 체크 로직 추가
2. Edge Function에서 실제 토큰 사용량 반환
3. 실행 후 `increment_token_usage()` 호출

### 우선순위 2: 업그레이드 플로우
1. 업그레이드 다이얼로그 컴포넌트
2. 결제 시스템 연동 (포트원, Stripe 등)
3. 구독 변경 로직

### 우선순위 3: 자동화
1. 월간 토큰 리셋 (Supabase Cron 또는 Edge Function)
2. 이메일 알림 (80%, 100% 도달 시)
3. 관리자 대시보드 (사용량 모니터링)

---

## 💡 추가 개선 아이디어

### 1. 토큰 사용 통계
- 월별/주별 사용량 차트
- AI 모델별 사용량 분석
- 가장 많이 사용한 프롬프트 TOP 10

### 2. 토큰 최적화 도구
- 프롬프트 압축 제안
- 불필요한 컨텍스트 감지
- 최적 모델 추천

### 3. 유연한 결제
- 추가 토큰 구매 (Pay-as-you-go)
- 연간 구독 할인
- 팀 플랜

---

**작성일**: 2025-12-25
**버전**: 1.0
**상태**: Phase 1 완료, AI 실행 연동 대기
