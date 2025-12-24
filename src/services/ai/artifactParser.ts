import type { ParsedArtifact } from './types';

/**
 * AI 응답에서 아티팩트를 파싱
 *
 * 아티팩트 형식:
 * <artifact type="html" title="제목">
 * 내용
 * </artifact>
 */

const ARTIFACT_REGEX = /<artifact\s+type="([^"]+)"(?:\s+title="([^"]*)")?\s*>([\s\S]*?)<\/artifact>/g;

export interface ParseResult {
  text: string; // 아티팩트를 제거한 텍스트
  artifacts: ParsedArtifact[];
}

export function parseArtifacts(content: string): ParseResult {
  const artifacts: ParsedArtifact[] = [];
  let text = content;

  // 모든 아티팩트 추출
  const matches = content.matchAll(ARTIFACT_REGEX);

  for (const match of matches) {
    const [fullMatch, type, title, artifactContent] = match;

    const artifact: ParsedArtifact = {
      type: type as ParsedArtifact['type'],
      title: title || undefined,
      content: artifactContent.trim(),
    };

    // 코드 타입인 경우 언어 추출
    if (type === 'code') {
      const firstLine = artifactContent.trim().split('\n')[0];
      const langMatch = firstLine.match(/^```(\w+)/);
      if (langMatch) {
        artifact.language = langMatch[1];
        // 코드 블록 마커 제거
        artifact.content = artifactContent
          .replace(/^```\w*\n/, '')
          .replace(/\n```$/, '')
          .trim();
      }
    }

    artifacts.push(artifact);

    // 텍스트에서 아티팩트 제거
    text = text.replace(fullMatch, `\n[아티팩트: ${artifact.title || artifact.type}]\n`);
  }

  return {
    text: text.trim(),
    artifacts,
  };
}

/**
 * 코드 블록을 자동으로 아티팩트로 변환
 * ```html ... ``` 형식을 <artifact> 형식으로 변환
 */
export function detectCodeBlockArtifacts(content: string): string {
  const codeBlockRegex = /```(html|css|javascript|typescript|python|java|cpp|sql)\n([\s\S]*?)```/g;

  return content.replace(codeBlockRegex, (match, lang, code) => {
    const type = lang === 'html' ? 'html' : 'code';
    return `<artifact type="${type}" language="${lang}">\n${code.trim()}\n</artifact>`;
  });
}
