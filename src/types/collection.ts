/**
 * 프로그램 수집함 타입 정의
 * AI 도구에서 생성한 HTML 프로그램과 Claude 아티팩트를 관리
 */

export type PreviewMode = 'html' | 'artifact' | 'python' | 'react';

/**
 * 컬렉션 기본 인터페이스 (DB 스키마와 일치)
 */
export interface Collection {
  id: string;
  user_id: string;
  title: string;
  category: string;
  preview_mode: PreviewMode;
  artifact_url: string | null;
  storage_path: string | null;
  memo: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 프론트엔드에서 사용할 확장 인터페이스
 * Storage에서 가져온 HTML 소스 코드 포함
 */
export interface CollectionWithContent extends Collection {
  sourceCode?: string;
}

/**
 * 컬렉션 생성 시 사용하는 입력 타입
 */
export interface CreateCollectionInput {
  title: string;
  category: string;
  preview_mode: PreviewMode;
  artifact_url?: string;
  sourceCode?: string;
  memo?: string;
  is_favorite?: boolean;
}

/**
 * 컬렉션 수정 시 사용하는 입력 타입
 */
export interface UpdateCollectionInput {
  title?: string;
  category?: string;
  preview_mode?: PreviewMode;
  artifact_url?: string;
  sourceCode?: string;
  memo?: string;
  is_favorite?: boolean;
}

/**
 * 컬렉션 카테고리 목록
 */
export const COLLECTION_CATEGORIES = [
  'HTML 도구',
  'Claude 아티팩트',
  'Python 스크립트',
  'React 컴포넌트',
  '데이터 시각화',
  '계산기',
  '폼/템플릿',
  '일반',
] as const;

export type CollectionCategory = typeof COLLECTION_CATEGORIES[number];
