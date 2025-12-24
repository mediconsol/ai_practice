# CRUD 기능 구현 계획

## 📋 개요

메디콘솔 AI 프랙티스의 주요 페이지들에 대한 CRUD (생성, 읽기, 수정, 삭제) 기능 점검 및 개선 계획

**작성일**: 2025-12-25
**상태**: 진행 중

---

## 🎯 현재 상태 분석

### Programs 페이지
- ✅ Create: 새 프로그램 만들기 (`CreateProgramDialog`)
- ✅ Read: 프로그램 목록 조회, 필터링
- ❌ Update: **미구현**
- ❌ Delete: **미구현**

### Prompts 페이지
- ✅ Create: 새 프롬프트 생성
- ✅ Read: 프롬프트 목록 조회, 필터링
- ❌ Update: **미구현**
- ✅ Delete: 삭제 기능 있음

### Projects 페이지
- ⚠️ Create: UI 있으나 구현 보류
- ✅ Read: 프로젝트 목록 조회
- ⚠️ Update: UI 있으나 구현 보류
- ✅ Delete: 삭제 기능 있음

### History 페이지
- ✅ Read: 실행 히스토리 조회
- ❌ Delete: **훅은 있으나 UI 없음**

### MyPage
- ✅ Read: 실행 결과/프롬프트 조회
- ❌ Update: **실행 결과 수정 불가**
- ✅ Delete: 실행 결과/프롬프트 삭제

---

## 🚀 구현 계획

### Phase 1: 핵심 기능 (필수) 🔴

#### 1.1 Programs - 수정/삭제 기능 추가
**우선순위**: 최우선
**예상 소요**: 2-3시간

**작업 내역**:
- [ ] `useUpdateProgram` 훅 생성 (`src/hooks/usePrograms.ts`)
- [ ] `useDeleteProgram` 훅 생성 (`src/hooks/usePrograms.ts`)
- [ ] `EditProgramDialog` 컴포넌트 생성
  - 파일: `src/components/programs/EditProgramDialog.tsx`
  - 기능: 제목, 설명, 카테고리, config 수정
  - Program Type별 설정 수정 (Chat: system_prompt, Form: form_schema, Template: templates)
- [ ] `ProgramCard` 컴포넌트 수정
  - 파일: `src/components/dashboard/ProgramCard.tsx`
  - 드롭다운 메뉴 추가 (수정, 삭제)
  - 본인 프로그램만 수정/삭제 가능하도록 권한 체크
- [ ] `Programs.tsx` 페이지 수정
  - EditProgramDialog 통합
  - 핸들러 추가 (handleEdit, handleDelete)

**데이터베이스**:
- 기존 `programs` 테이블 사용
- RLS 정책 확인: UPDATE, DELETE 권한

---

#### 1.2 Prompts - 수정 기능 추가
**우선순위**: 높음
**예상 소요**: 1-2시간

**작업 내역**:
- [ ] `useUpdatePrompt` 훅 생성 (`src/hooks/usePrompts.ts`)
- [ ] `EditPromptDialog` 컴포넌트 생성
  - 파일: `src/components/prompts/EditPromptDialog.tsx`
  - 기능: 제목, 카테고리, 내용 수정
- [ ] `PromptCard` 컴포넌트 수정
  - 파일: `src/components/dashboard/PromptCard.tsx`
  - 드롭다운 메뉴에 "수정" 옵션 추가
- [ ] `Prompts.tsx` 페이지 수정
  - EditPromptDialog 통합
  - handleEdit 핸들러 추가

**데이터베이스**:
- 기존 `prompts` 테이블 사용
- RLS 정책 확인: UPDATE 권한

---

#### 1.3 History - 삭제 UI 추가
**우선순위**: 중간
**예상 소요**: 1시간

**작업 내역**:
- [ ] `History.tsx` 페이지 수정
  - 파일: `src/pages/History.tsx`
  - HistoryItem에 삭제 버튼 추가 (드롭다운 메뉴)
  - handleDelete 핸들러 추가 (기존 `useDeleteHistory` 훅 활용)
  - 확인 다이얼로그 표시
- [ ] (선택) 전체 히스토리 삭제 버튼
  - `useBulkDeleteHistory` 훅 활용
  - 2단계 확인 프로세스

**데이터베이스**:
- 기존 `execution_history` 테이블 사용
- 기존 훅 사용: `useDeleteHistory`, `useBulkDeleteHistory`

---

### Phase 2: 사용성 개선 (권장) 🟡

#### 2.1 MyPage - 실행 결과 수정 기능
**우선순위**: 중간
**예상 소요**: 1-2시간

**작업 내역**:
- [ ] `useUpdateResult` 훅 생성 (`src/hooks/useExecutionResults.ts`)
- [ ] `EditResultDialog` 컴포넌트 생성
  - 파일: `src/components/results/EditResultDialog.tsx`
  - 기능: 제목, 메모, 카테고리 수정
- [ ] `ResultCard` 컴포넌트 수정
  - 파일: `src/components/results/ResultCard.tsx`
  - 드롭다운 메뉴에 "수정" 옵션 추가
- [ ] `MyPage.tsx` 페이지 수정
  - EditResultDialog 통합

**데이터베이스**:
- 기존 `execution_results` 테이블 사용
- RLS 정책 확인: UPDATE 권한

---

#### 2.2 Projects - 수정 기능 완성
**우선순위**: 중간
**예상 소요**: 1-2시간

**작업 내역**:
- [ ] `EditProjectDialog` 컴포넌트 생성
  - 파일: `src/components/projects/EditProjectDialog.tsx`
  - 기능: 제목, 설명, 상태 수정
  - 프롬프트 추가/제거
- [ ] `Projects.tsx` 페이지 수정
  - 기존 "편집" 메뉴에 EditProjectDialog 연결
  - 기존 `useUpdateProject` 훅 활용

**데이터베이스**:
- 기존 `projects` 테이블 사용
- 기존 훅 사용: `useUpdateProject`

---

### Phase 3: 추가 편의 기능 (선택) 🟢

#### 3.1 일괄 작업 기능
**우선순위**: 낮음
**예상 소요**: 3-4시간

**작업 내역**:
- [ ] Prompts: 체크박스 선택 + 일괄 삭제/카테고리 변경
- [ ] History: 날짜 범위 선택 + 일괄 삭제
- [ ] MyPage: 체크박스 선택 + 일괄 공유/삭제

---

#### 3.2 실행 취소 (Undo) 기능
**우선순위**: 낮음
**예상 소요**: 2-3시간

**작업 내역**:
- [ ] Soft delete 구현 (`deleted_at` 컬럼 추가)
- [ ] Toast에 "실행 취소" 버튼 추가
- [ ] 30일 후 자동 삭제 (Supabase Function)

---

#### 3.3 버전 관리
**우선순위**: 낮음
**예상 소요**: 4-5시간

**작업 내역**:
- [ ] Programs/Prompts 수정 시 이전 버전 백업
- [ ] 버전 히스토리 UI
- [ ] 이전 버전으로 되돌리기

---

## 🎨 구현 패턴 (일관성 유지)

### 드롭다운 메뉴 구조
```
• 실행 / 복사 (있는 경우)
• ─────────
• ✏️ 수정
• 🗑️ 삭제 (빨간색, text-destructive)
```

### 수정 다이얼로그 공통 구조
```tsx
<Dialog>
  <DialogHeader>
    <DialogTitle>{타입} 수정</DialogTitle>
  </DialogHeader>
  <div className="space-y-4">
    {/* 수정 가능한 필드들 */}
  </div>
  <DialogFooter>
    <Button variant="outline" onClick={onCancel}>취소</Button>
    <Button onClick={handleSave}>저장</Button>
  </DialogFooter>
</Dialog>
```

### 삭제 확인 패턴
```tsx
if (window.confirm(`"${title}"을(를) 삭제하시겠습니까?`)) {
  deleteXXX.mutate(id);
}
```

### 훅 네이밍 컨벤션
- 생성: `useCreateXXX`
- 조회: `useXXX` (목록), `useXXXById` (단일)
- 수정: `useUpdateXXX`
- 삭제: `useDeleteXXX`
- 토글: `useToggleXXX`

---

## 📁 파일 구조

```
src/
├── hooks/
│   ├── usePrograms.ts          # useUpdateProgram, useDeleteProgram 추가
│   ├── usePrompts.ts           # useUpdatePrompt 추가
│   ├── useExecutionResults.ts  # useUpdateResult 추가
│   └── useProjects.ts          # 기존 useUpdateProject 활용
├── components/
│   ├── programs/
│   │   └── EditProgramDialog.tsx      # 신규
│   ├── prompts/
│   │   └── EditPromptDialog.tsx       # 신규
│   ├── results/
│   │   └── EditResultDialog.tsx       # 신규
│   ├── projects/
│   │   └── EditProjectDialog.tsx      # 신규
│   └── dashboard/
│       ├── ProgramCard.tsx            # 수정
│       └── PromptCard.tsx             # 수정
└── pages/
    ├── Programs.tsx                    # 수정
    ├── Prompts.tsx                     # 수정
    ├── History.tsx                     # 수정
    ├── MyPage.tsx                      # 수정
    └── Projects.tsx                    # 수정
```

---

## ✅ 체크리스트

### Phase 1 진행 상황 ✅ 완료
- [x] 1.1 Programs 수정/삭제 ✅
- [x] 1.2 Prompts 수정 ✅
- [x] 1.3 History 삭제 UI ✅

### Phase 2 진행 상황
- [ ] 2.1 MyPage 실행 결과 수정
- [ ] 2.2 Projects 수정 완성

### Phase 3 진행 상황
- [ ] 3.1 일괄 작업
- [ ] 3.2 실행 취소
- [ ] 3.3 버전 관리

---

## 📝 참고사항

### 권한 체크
- Programs: 본인이 만든 프로그램만 수정/삭제 가능 (`user_id` 체크)
- 공개 프로그램도 본인 것만 수정 가능
- Supabase RLS 정책으로 서버 측 권한 보장

### UI/UX 일관성
- 모든 수정 다이얼로그는 `CreateXXXDialog`와 유사한 디자인
- 삭제는 항상 확인 과정 포함
- 성공 시 Toast 메시지 표시
- 에러 시 명확한 에러 메시지

### 데이터 무결성
- 삭제 시 연관 데이터 처리 (CASCADE 설정 확인)
- 프로그램 삭제 시 관련 실행 기록 처리 방식 결정 필요

---

## 🔄 업데이트 로그

- **2025-12-25**: 초기 계획 수립, Phase 1 시작
- **2025-12-25**: Phase 1 완료 ✅
  - Programs 페이지: 수정/삭제 기능 구현 (EditProgramDialog, ProgramCard 드롭다운 메뉴)
  - Prompts 페이지: 수정 기능 구현 (EditPromptDialog, PromptCard 수정 메뉴)
  - History 페이지: 삭제 UI 추가 (HistoryItem 드롭다운 메뉴)
