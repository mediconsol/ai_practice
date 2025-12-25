// 토큰 관리 관련 타입 정의

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
  features?: string[];
}

export interface TokenCheckResult {
  allowed: boolean;
  unlimited?: boolean;
  current_usage: number;
  limit: number;
  remaining?: number;
}

export interface TokenIncrementResult {
  success: boolean;
  error?: string;
  current_usage: number;
  limit: number;
  remaining: number;
}

// 구독 티어별 제한
export const SUBSCRIPTION_LIMITS: Record<'free' | 'pro' | 'enterprise', TokenLimit> = {
  free: {
    monthly_tokens: 10000,
    name: '무료',
    price: 0,
    features: [
      '월 1만 토큰',
      '기본 AI 모델 사용',
      '프롬프트 저장',
    ],
  },
  pro: {
    monthly_tokens: 100000,
    name: 'Pro',
    price: 9900,
    features: [
      '월 10만 토큰',
      '모든 AI 모델 사용',
      '프롬프트 세트 무제한',
      '우선 지원',
    ],
  },
  enterprise: {
    monthly_tokens: -1, // 무제한
    name: 'Enterprise',
    price: 99000,
    features: [
      '무제한 토큰',
      '전용 AI 모델',
      '팀 협업 기능',
      '전담 지원',
      'API 접근',
    ],
  },
};
