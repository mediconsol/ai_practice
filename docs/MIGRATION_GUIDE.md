# Migration 실행 가이드

## AI 설정 활성화를 위한 데이터베이스 마이그레이션

### 개요
설정 화면의 AI 환경설정 기능을 활성화하려면 `profiles` 테이블에 `preferences` 컬럼을 추가해야 합니다.

### Migration 파일
- **파일 위치**: `supabase/migrations/20251225000001_add_user_preferences.sql`
- **생성일**: 2025-12-25
- **목적**: AI 및 인터페이스 환경설정 저장

### Migration 실행 방법

#### 방법 1: Supabase Dashboard에서 SQL 직접 실행 (권장)

1. **Supabase Dashboard 접속**
   - https://app.supabase.com 접속
   - 프로젝트 선택

2. **SQL Editor 열기**
   - 왼쪽 메뉴에서 `SQL Editor` 클릭
   - `New query` 버튼 클릭

3. **Migration SQL 복사 & 실행**
   - `supabase/migrations/20251225000001_add_user_preferences.sql` 파일 내용 복사
   - SQL Editor에 붙여넣기
   - `Run` 버튼 클릭

4. **실행 결과 확인**
   - 성공 메시지 확인
   - `Table Editor` > `profiles` 테이블에서 `preferences` 컬럼 추가 확인

#### 방법 2: Supabase CLI 사용 (로컬 개발 중인 경우)

```bash
# Docker Desktop이 실행 중인지 확인
docker ps

# 로컬 Supabase DB 리셋 (migration 자동 적용)
npx supabase db reset --local

# 또는 특정 migration만 실행
npx supabase migration up --local
```

#### 방법 3: 프로덕션에 Push (신중히 사용)

```bash
# migration을 원격 프로덕션 DB에 적용
npx supabase db push

# 또는 Supabase CLI로 연결 후 실행
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

### Migration 내용 요약

```sql
-- preferences 컬럼 추가
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{...}'::jsonb;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_profiles_preferences
ON profiles USING gin(preferences);

-- 기존 사용자 데이터 업데이트
UPDATE profiles SET preferences = '{...}'::jsonb
WHERE preferences IS NULL OR preferences = '{}'::jsonb;
```

### 기본 Preferences 구조

```json
{
  "ai": {
    "default_provider": "openai",
    "default_models": {
      "openai": "gpt-4o",
      "claude": "claude-3-5-sonnet-20241022",
      "gemini": "gemini-pro"
    },
    "default_temperature": 0.7,
    "default_max_tokens": 2000
  },
  "interface": {
    "default_view_mode": "grid",
    "theme": "system"
  }
}
```

### Migration 검증

실행 후 다음 쿼리로 확인:

```sql
-- preferences 컬럼 존재 확인
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'preferences';

-- 인덱스 확인
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'profiles' AND indexname = 'idx_profiles_preferences';

-- 샘플 데이터 확인
SELECT id, email, preferences
FROM profiles
LIMIT 3;
```

### 롤백 (필요시)

문제가 발생한 경우 롤백:

```sql
-- preferences 컬럼 제거
ALTER TABLE profiles DROP COLUMN IF EXISTS preferences;

-- 인덱스 제거
DROP INDEX IF EXISTS idx_profiles_preferences;
```

### Migration 후 확인사항

1. ✅ `profiles` 테이블에 `preferences` 컬럼 추가됨
2. ✅ 기존 사용자에게 기본값 설정됨
3. ✅ 설정 화면 > AI 설정 탭에서 비활성화 메시지가 사라짐
4. ✅ AI 환경설정을 변경하고 저장할 수 있음
5. ✅ 저장된 설정이 다시 로드 시 유지됨

### 문제 해결

#### "relation does not exist" 에러
- profiles 테이블이 없는 경우: 초기 migration부터 실행 필요

#### "permission denied" 에러
- Supabase Dashboard의 SQL Editor를 사용하세요 (자동으로 올바른 권한 사용)

#### Migration이 적용되지 않는 경우
1. SQL Editor에서 직접 실행 확인
2. 브라우저 캐시 삭제 및 새로고침
3. React Query 캐시 무효화

### 다음 단계

Migration 완료 후:
1. 애플리케이션 새로고침
2. `/settings` 페이지 > `AI 설정` 탭 이동
3. 기본 AI 프로바이더, 모델, Temperature 등 설정
4. 저장 후 AI 실행 화면에서 기본값 적용 확인

---

**작성일**: 2025-12-25
**작성자**: Claude Code
**버전**: 1.0
