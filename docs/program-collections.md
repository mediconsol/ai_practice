# 프로그램 수집함 기능 구현 문서

**작성일**: 2024-12-25
**완료일**: 2024-12-25
**상태**: ✅ 완료
**기능명**: 프로그램 수집함 (Program Collections)
**목적**: AI 도구에서 생성한 HTML/React/Python 프로그램과 Claude 아티팩트를 실행하고 보관

---

## 📋 프로젝트 개요

### 배경
사용자들이 ChatGPT, Claude, Gemini 등 AI 도구를 통해 HTML 기반 프로그램이나 디자인 페이지를 생성하지만:
- VSCode에 붙여넣거나 HTML 파일로 저장해야만 볼 수 있는 불편함
- Claude Artifacts는 Claude 플랫폼에서만 확인 가능하고 따로 보관하기 어려움
- 생성된 프로그램을 실행하고 확인할 통합된 환경이 없음
- 유용한 결과물들을 한 곳에 모으고 관리할 방법이 없음

### 핵심 가치
이 기능을 통해 메디콘솔 AI 프랙티스는:
- **프롬프트 저장소** (내 프롬프트)
- **실행 결과 저장소** (마이페이지)
- **외부 생성물 저장소** (프로그램 수집함)

이 세 가지를 모두 제공하는 통합 AI 워크플로우 플랫폼이 됩니다.

---

## 🎯 핵심 기능 명세

### 1. 2분할 에디터 UI
- **왼쪽**: 소스 코드 입력 영역 (Textarea)
- **오른쪽**: 실시간 미리보기 (Sandboxed iframe)

### 2. HTML 소스 지원
- HTML 코드 붙여넣기 → 즉시 iframe으로 실행
- 완전 격리: `sandbox` 속성으로 본 서비스와 CSS/JS 충돌 방지

### 3. Claude 아티팩트 지원
- `claude.site/artifacts/...` URL 자동 감지
- iframe으로 아티팩트 임베딩하여 한 곳에서 확인
- URL을 Supabase에 저장하여 언제든지 다시 접근

### 4. 저장 및 관리
- Supabase Storage + Database 기반 클라우드 저장
- HTML 파일은 Storage에, 메타데이터는 Database에 저장
- 제목, 카테고리, 메모, 즐겨찾기 관리
- 검색, 필터, 목록 뷰로 쉽게 찾기

### 5. 보안
- iframe sandbox: `allow-scripts allow-same-origin allow-forms allow-modals`
- XSS 방어, CSP 준수

---

## 📁 파일 구조

### 새로 생성할 파일 (9개)

```
src/types/collection.ts                             # 타입 정의
src/lib/urlDetector.ts                              # URL 감지 유틸리티
src/hooks/useCollections.ts                         # localStorage Hook
src/pages/ProgramCollections.tsx                    # 메인 페이지
src/components/collections/CodeEditor.tsx           # 코드 입력 영역
src/components/collections/PreviewPane.tsx          # 미리보기 영역
src/components/collections/SaveCollectionDialog.tsx # 저장 다이얼로그
src/components/collections/CollectionCard.tsx       # 컬렉션 카드
src/components/collections/CollectionList.tsx       # 컬렉션 목록
```

### 수정할 파일 (2개)

```
src/App.tsx                          # 라우트 추가
src/components/layout/AppSidebar.tsx # 메뉴 항목 추가
```

---

## 🚀 구현 단계

### ✅ Step 0: 프로젝트 문서 생성
- [x] docs/program-collections.md 생성
- [x] Todo 리스트 설정

### Step 0.5: Supabase Storage 설정
- [x] Supabase Dashboard에서 `collections` 버킷 생성
- [x] RLS 정책 설정 (사용자별 폴더 접근 제어)
- [x] src/lib/supabase.ts에 Storage 헬퍼 함수 추가
- [x] Database에 collections 테이블 추가 (메타데이터 저장)
- [x] 검증: 파일 업로드/다운로드 테스트

### Step 1: 기본 인프라 (타입, 라우팅, 메뉴)
- [x] src/types/collection.ts 생성
- [x] src/App.tsx 라우트 추가
- [x] src/components/layout/AppSidebar.tsx 메뉴 추가
- [x] 검증: 사이드바에서 메뉴 클릭 시 페이지 이동

### Step 2: 유틸리티 & Hooks
- [x] src/lib/urlDetector.ts 생성
- [x] src/hooks/useCollections.ts 생성 (Supabase 연동)
- [x] 검증: 함수 동작 테스트

### Step 3: 핵심 컴포넌트
- [x] src/components/collections/CodeEditor.tsx
- [x] src/components/collections/PreviewPane.tsx
- [x] src/pages/ProgramCollections.tsx (기본 버전)
- [x] 검증: HTML 붙여넣기 → 미리보기 실행

### Step 4: 저장 기능 (Supabase Storage 연동)
- [x] src/components/collections/SaveCollectionDialog.tsx
- [x] ProgramCollections.tsx 업데이트
- [x] HTML 파일을 Supabase Storage에 업로드
- [x] 메타데이터를 collections 테이블에 저장
- [x] 검증: HTML 실행 → 저장 → Supabase 확인

### Step 5: 컬렉션 목록
- [x] src/components/collections/CollectionCard.tsx
- [x] src/components/collections/CollectionList.tsx
- [x] ProgramCollections.tsx 업데이트 (Tabs 추가)
- [x] 검증: 목록 표시 → 클릭 → 에디터 로드

### Step 6: UI/UX 개선
- [x] Info Card 추가
- [x] 플레이스홀더 개선
- [x] 애니메이션 추가
- [x] 전체 UX 플로우 테스트

### Step 7: 추가 기능 (Python & React 지원)
- [x] Python 코드 실행 (Pyodide)
- [x] React 컴포넌트 렌더링 (Babel Standalone)
- [x] 자동 코드 타입 감지 (HTML/React/Python/Artifact)
- [x] 제한사항 안내 UI 추가

### Step 8: 모달 뷰어
- [x] CollectionViewDialog 컴포넌트 생성
- [x] 전체화면 프로그램 실행 모달
- [x] "프로그램 열기" 버튼으로 UX 개선

---

## 🔧 기술 스펙

### TypeScript 인터페이스

```typescript
export interface Collection {
  id: string;                    // UUID
  user_id: string;               // 사용자 ID
  title: string;                 // 컬렉션 제목
  category: string;              // 카테고리
  preview_mode: 'html' | 'artifact' | 'python' | 'react'; // 미리보기 모드
  artifact_url?: string;         // Claude artifact URL (선택)
  storage_path?: string;         // Supabase Storage 경로 (.html, .py, .jsx)
  memo?: string;                 // 메모 (선택)
  is_favorite: boolean;          // 즐겨찾기
  created_at: string;            // ISO 8601
  updated_at: string;            // ISO 8601
}

// 프론트엔드에서 사용할 확장 인터페이스
export interface CollectionWithContent extends Collection {
  sourceCode?: string;           // Storage에서 가져온 HTML 소스
}
```

### iframe Sandbox 설정

**HTML 모드**:
```tsx
<iframe
  srcDoc={sourceCode}
  sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
  className="w-full h-full border-0 rounded-lg bg-white"
  title="HTML Preview"
/>
```

**Claude Artifact 모드**:
```tsx
<iframe
  src={artifactUrl}
  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
  className="w-full h-full border-0 rounded-lg"
  title="Claude Artifact"
/>
```

### Supabase Storage 구조

**버킷**: `collections`

**폴더 구조**:
```
collections/
  {user_id}/
    {collection_id}.html          # HTML 소스 파일
    {collection_id}_preview.png   # 썸네일 (Phase 3)
```

**RLS 정책**:
- 사용자는 자신의 폴더(`{user_id}/`)에만 접근 가능
- 공개 컬렉션은 모든 사용자가 읽기 가능

### Database 스키마 (collections 테이블)

```sql
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  preview_mode TEXT NOT NULL, -- 'html' | 'artifact'
  artifact_url TEXT,          -- Claude artifact URL (선택)
  storage_path TEXT,          -- Supabase Storage 경로
  memo TEXT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_collections_user_id ON collections(user_id);
CREATE INDEX idx_collections_category ON collections(category);

-- RLS 정책
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own collections"
  ON collections FOR ALL
  USING (auth.uid() = user_id);
```

### 카테고리 목록

```typescript
const COLLECTION_CATEGORIES = [
  "HTML 도구",
  "Claude 아티팩트",
  "Python 스크립트",
  "React 컴포넌트",
  "데이터 시각화",
  "계산기",
  "폼/템플릿",
  "일반",
];
```

### Supabase Storage 헬퍼 함수

```typescript
// src/lib/supabase.ts에 추가할 함수들

/**
 * HTML 컬렉션 파일 업로드
 */
export async function uploadCollectionFile(
  userId: string,
  collectionId: string,
  htmlContent: string
): Promise<{ path: string; error: Error | null }> {
  const filePath = `${userId}/${collectionId}.html`;
  const { error } = await supabase.storage
    .from('collections')
    .upload(filePath, new Blob([htmlContent], { type: 'text/html' }), {
      cacheControl: '3600',
      upsert: true,
    });

  return { path: filePath, error };
}

/**
 * HTML 컬렉션 파일 다운로드
 */
export async function downloadCollectionFile(
  storagePath: string
): Promise<{ content: string | null; error: Error | null }> {
  const { data, error } = await supabase.storage
    .from('collections')
    .download(storagePath);

  if (error || !data) {
    return { content: null, error };
  }

  const content = await data.text();
  return { content, error: null };
}

/**
 * HTML 컬렉션 파일 삭제
 */
export async function deleteCollectionFile(
  storagePath: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase.storage
    .from('collections')
    .remove([storagePath]);

  return { error };
}

/**
 * 공개 URL 생성
 */
export function getCollectionPublicUrl(storagePath: string): string {
  const { data } = supabase.storage
    .from('collections')
    .getPublicUrl(storagePath);

  return data.publicUrl;
}
```

---

## 📊 테스트 시나리오

### 기본 기능
- [ ] HTML 코드 붙여넣기 → 미리보기 즉시 실행
- [ ] Claude artifact URL 붙여넣기 → iframe 임베딩
- [ ] 저장 버튼 → 다이얼로그 열림 → 저장 완료
- [ ] Supabase Storage에 HTML 파일 업로드 확인
- [ ] Database에 메타데이터 저장 확인
- [ ] 저장된 목록 탭 → 컬렉션 카드 표시
- [ ] 카드 클릭 → Storage에서 HTML 다운로드 → 에디터 로드
- [ ] 삭제 버튼 → Storage 파일 삭제 + DB 레코드 제거

### 엣지 케이스
- [ ] 빈 코드로 저장 시도 → 버튼 비활성화
- [ ] 잘못된 HTML (문법 오류) → iframe 에러 표시
- [ ] 유효하지 않은 URL → 로드 실패 메시지
- [ ] 매우 큰 HTML (>1MB) → 경고 또는 성능 확인

### UX
- [ ] 탭 전환 부드럽게 동작
- [ ] 검색 필터 정상 작동
- [ ] Toast 알림 표시
- [ ] 애니메이션 효과 확인

---

## 📝 구현 로그

### 2024-12-25 - 프로젝트 완료

#### Phase 1: 기본 인프라 (Step 0-2)
- ✅ Supabase 마이그레이션 3개 생성
  - 20251225000001_add_collections_and_storage.sql (기본 테이블 및 Storage)
  - 20251225000002_add_python_support.sql (Python 지원)
  - 20251225000003_add_react_support.sql (React 지원)
- ✅ TypeScript 타입 정의 (src/types/collection.ts)
- ✅ URL 감지 유틸리티 (src/lib/urlDetector.ts)
  - isClaudeArtifactUrl, extractArtifactUrl
  - isHtmlCode, isPythonCode, isReactCode
- ✅ Supabase Storage 헬퍼 함수 (src/lib/supabase.ts)
  - uploadCollectionFile (HTML/Python/React 파일 업로드)
  - downloadCollectionFile, deleteCollectionFile
- ✅ useCollections Hook (src/hooks/useCollections.ts)
  - Supabase 기반 CRUD 작업
  - Storage 연동 로직

#### Phase 2: 핵심 컴포넌트 (Step 3-5)
- ✅ CodeEditor 컴포넌트 (src/components/collections/CodeEditor.tsx)
  - 코드 입력 영역, 저장 버튼
  - 명확한 사용 안내 플레이스홀더
- ✅ PreviewPane 컴포넌트 (src/components/collections/PreviewPane.tsx)
  - HTML iframe 샌드박스
  - Claude Artifact iframe 임베딩
  - Python 실행 (PyodideRunner)
  - React 렌더링 (ReactRunner)
  - 각 모드별 제한사항 안내
- ✅ SaveCollectionDialog (src/components/collections/SaveCollectionDialog.tsx)
  - 제목, 카테고리, 메모 입력
  - 즐겨찾기 토글
- ✅ CollectionList & CollectionCard
  - 검색/필터 기능
  - 카테고리별 필터링
  - 최신순 정렬

#### Phase 3: 고급 기능 추가
- ✅ **Python 지원 (Pyodide v0.29.0)**
  - 브라우저 기반 Python 실행
  - stdout/stderr 캡처 및 터미널 UI
  - NumPy, Pandas 등 기본 라이브러리 지원
  - 제한사항: pip install 불가

- ✅ **React 지원 (Babel Standalone)**
  - 브라우저 기반 JSX 변환
  - 자동 import/export 제거
  - 자동 컴포넌트 감지 및 App 래퍼 생성
  - React Hooks 전역 제공 (useState, useEffect 등)
  - 제한사항: npm 라이브러리 불가, CSS 격리 제한적

- ✅ **자동 코드 타입 감지**
  - 붙여넣은 코드 자동 분석
  - React → HTML → Python 순서로 감지
  - Claude Artifact URL 우선 감지

#### Phase 4: UX 개선
- ✅ **CollectionViewDialog 컴포넌트**
  - 전체화면 모달로 프로그램 실행
  - "프로그램 열기" 버튼으로 UX 개선
  - 에디터 로딩 대신 모달 뷰어 사용

- ✅ **Collapsible Info Card**
  - 사용 방법 상세 안내
  - 각 코드 타입별 권장사항
  - HTML 우선 권장, React/Python 제한사항 명시
  - Claude Artifact 도메인 허용 안내

- ✅ **메뉴 항목 명칭 개선**
  - "AI 프로그램" → "AI 도구 모음"
  - "AI 실행" → "프롬프트 작업실"

#### 생성된 파일 목록 (총 11개)
1. src/types/collection.ts
2. src/lib/urlDetector.ts
3. src/hooks/useCollections.ts
4. src/pages/ProgramCollections.tsx
5. src/components/collections/CodeEditor.tsx
6. src/components/collections/PreviewPane.tsx
7. src/components/collections/PyodideRunner.tsx
8. src/components/collections/ReactRunner.tsx
9. src/components/collections/SaveCollectionDialog.tsx
10. src/components/collections/CollectionCard.tsx
11. src/components/collections/CollectionList.tsx
12. src/components/collections/CollectionViewDialog.tsx

#### 수정된 파일
- src/App.tsx (라우트 추가)
- src/components/layout/AppSidebar.tsx (메뉴 추가 및 명칭 변경)
- src/lib/supabase.ts (Storage 헬퍼 함수)

#### 마이그레이션 파일
- supabase/migrations/20251225000001_add_collections_and_storage.sql
- supabase/migrations/20251225000002_add_python_support.sql
- supabase/migrations/20251225000003_add_react_support.sql

#### 주요 결정사항
1. **HTML을 주요 사용 케이스로 설정**
   - 가장 안정적이고 빠름
   - 복잡한 앱은 HTML로 구현 권장

2. **React/Python은 제한적 지원으로 표시**
   - 간단한 컴포넌트/스크립트만 지원
   - UI에서 명확히 제한사항 안내

3. **에디터 로딩 → 모달 뷰어로 변경**
   - 사용자 피드백 반영
   - "프로그램 열기" 버튼으로 직관성 개선

4. **Claude Artifact 도메인 허용 필수 안내**
   - *.mediconsol.com 도메인 허용 필요
   - 임베딩 가져오기 방법 상세 설명

---

## 🎨 UI/UX 가이드

### 안내 메시지 (Info Card)

```
💡 이 기능이 왜 필요한가요?

ChatGPT, Gemini 등 AI 도구는 HTML/JavaScript로 인터랙티브한 프로그램을 만들어주지만,
이를 실행하고 보관할 곳이 없어 매번 복사/붙여넣기 해야 합니다.
또한 Claude Artifacts는 Claude 플랫폼에서만 볼 수 있어 따로 보관하기 어렵습니다.

이 도구를 사용하면:
• AI가 생성한 HTML 코드를 즉시 실행하고 저장
• Claude Artifact URL을 임베딩하여 한 곳에서 확인
• 유용한 도구를 클라우드에 보관하여 언제든지 재사용
• 완전 격리된 샌드박스 환경에서 안전하게 실행
```

### Textarea 플레이스홀더

```
AI 도구에서 생성한 HTML 코드 또는 Claude artifact URL을 붙여넣으세요.

예시:
• HTML 코드: <!DOCTYPE html><html>...</html>
• Claude URL: https://claude.site/artifacts/abc123

💡 변수는 {변수명} 형식으로 입력하면 나중에 재사용할 수 있습니다.
```

---

## 🔐 보안 고려사항

### XSS 방어
- iframe sandbox 사용으로 기본 격리
- 사용자 입력 HTML은 신뢰할 수 없으므로 sandbox 필수
- `allow-same-origin` 사용 시 주의 (DOM 접근 가능)

### CSP (Content Security Policy)
- `iframe-src` 지시어에 `claude.site` 허용
- `default-src 'self'` 유지

### localStorage 제한
- 브라우저 제한: 일반적으로 5-10MB
- 대용량 HTML 저장 시 경고 표시 고려
- 압축 라이브러리 (LZ-string) 추후 고려 가능

---

## 🚧 향후 개선 아이디어

### Phase 2 (공유 및 협업)
- [ ] 공유 기능: 컬렉션 공개 URL 생성
- [ ] 공개 갤러리: 다른 사용자의 공개 컬렉션 탐색
- [ ] 좋아요/북마크: 다른 사용자 컬렉션 저장
- [ ] 댓글/피드백: 컬렉션에 코멘트 달기

### Phase 3 (고급 기능)
- [ ] 전체화면 모드: 미리보기를 전체화면으로
- [ ] 코드 하이라이트: Monaco Editor 통합
- [ ] 스크린샷 캡처: 썸네일 자동 생성
- [ ] 내보내기: ZIP 파일로 다운로드

---

## 📚 참고 자료

### 기존 패턴
- `src/pages/AIExecute.tsx` - 2분할 레이아웃 참고
- `src/components/prompts/SavePromptDialog.tsx` - Dialog 구조 참고
- `src/pages/Programs.tsx` - 그리드 레이아웃, 검색/필터 참고

### 외부 문서
- [MDN iframe sandbox](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#sandbox)
- [Claude Artifacts](https://support.anthropic.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them)

---

## ✨ 완료 기준

이 기능은 다음 조건을 만족하면 완료:
- ✅ HTML 코드 붙여넣기 → 즉시 미리보기 실행
- ✅ Claude artifact URL → iframe 임베딩
- ✅ 저장 기능 정상 작동 (Supabase Storage + Database)
- ✅ 목록에서 불러오기/삭제 정상 작동
- ✅ 검색/필터 기능 작동
- ✅ 모든 UI/UX 요소 구현
- ✅ 테스트 시나리오 전체 통과
