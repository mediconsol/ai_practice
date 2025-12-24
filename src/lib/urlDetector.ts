/**
 * 프로그램 수집함 - URL 감지 유틸리티
 */

/**
 * Claude Artifact URL인지 확인
 * @param text 입력 텍스트
 * @returns Claude Artifact URL 여부
 */
export function isClaudeArtifactUrl(text: string): boolean {
  const trimmed = text.trim();
  return /^https?:\/\/(www\.)?claude\.site\/artifacts\/[a-zA-Z0-9_-]+/.test(trimmed);
}

/**
 * 텍스트에서 Claude Artifact URL 추출
 * @param text 입력 텍스트
 * @returns 추출된 URL 또는 null
 */
export function extractArtifactUrl(text: string): string | null {
  const match = text.match(/https?:\/\/(www\.)?claude\.site\/artifacts\/[a-zA-Z0-9_-]+/);
  return match ? match[0] : null;
}

/**
 * HTML 코드인지 확인
 * @param text 입력 텍스트
 * @returns HTML 코드 여부
 */
export function isHtmlCode(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.startsWith('<') && trimmed.includes('>');
}

/**
 * Python 코드인지 확인
 * @param text 입력 텍스트
 * @returns Python 코드 여부
 */
export function isPythonCode(text: string): boolean {
  const trimmed = text.trim();
  // Python 키워드 패턴으로 감지
  const pythonKeywords = /^(import\s|from\s|def\s|class\s|if\s|for\s|while\s|print\(|#\s*python)/im;
  return pythonKeywords.test(trimmed);
}

/**
 * React/JSX 코드인지 확인
 * @param text 입력 텍스트
 * @returns React 코드 여부
 */
export function isReactCode(text: string): boolean {
  const trimmed = text.trim();

  // JSX 문법 패턴 (return 문 안에 JSX)
  const jsxPattern = /<[A-Z][a-zA-Z0-9]*[\s/>]|<[a-z]+[\s>].*\/>/s;

  // React 관련 키워드
  const reactKeywords = /(import.*from\s+['"]react['"]|function\s+[A-Z]\w*\s*\(|const\s+[A-Z]\w*\s*=.*=>|useState|useEffect|useCallback|useMemo|useRef)/;

  // JSX return 패턴
  const jsxReturnPattern = /return\s*\(?\s*<[A-Z]|return\s*\(?\s*<[a-z]/;

  return jsxPattern.test(trimmed) || (reactKeywords.test(trimmed) && jsxReturnPattern.test(trimmed));
}
