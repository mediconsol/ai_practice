import { Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { PyodideRunner } from "./PyodideRunner";
import { ReactRunner } from "./ReactRunner";

interface PreviewPaneProps {
  sourceCode: string;
  previewMode: 'html' | 'artifact' | 'python' | 'react' | 'none';
  artifactUrl?: string;
}

export function PreviewPane({ sourceCode, previewMode, artifactUrl }: PreviewPaneProps) {
  if (previewMode === 'none' || !sourceCode.trim()) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/30 rounded-lg border border-border">
        <div className="text-center px-6 max-w-md">
          <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium mb-1">코드를 입력하면</p>
          <p className="text-muted-foreground mb-3">미리보기가 표시됩니다</p>
          <div className="text-xs text-muted-foreground/80 space-y-1 text-left bg-background/50 p-3 rounded-lg">
            <p className="font-medium text-muted-foreground mb-2">💡 팁:</p>
            <p>• <strong>HTML</strong> 권장 (가장 안정적)</p>
            <p>• <strong>React</strong> 간단한 컴포넌트만</p>
            <p>• <strong>Python</strong> 기본 라이브러리만</p>
            <p>• <strong>Claude URL</strong> *.mediconsol.com 허용 필수</p>
          </div>
        </div>
      </div>
    );
  }

  if (previewMode === 'artifact' && artifactUrl) {
    return (
      <div className="h-full flex flex-col">
        <div className="mb-2 pb-2 border-b border-border">
          <p className="text-xs text-muted-foreground truncate">
            Claude Artifact: {artifactUrl}
          </p>
          <p className="text-xs text-destructive/80 mt-1 font-medium">
            ⚠️ Claude에서 "산출물 게시" → "임베딩 가져오기"로 *.mediconsol.com 도메인 허용 필수
          </p>
        </div>
        <iframe
          src={artifactUrl}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          className="flex-1 w-full border-0 rounded-lg bg-white"
          title="Claude Artifact"
        />
      </div>
    );
  }

  if (previewMode === 'html') {
    return (
      <div className="h-full flex flex-col">
        <div className="mb-2">
          <p className="text-xs text-muted-foreground">
            HTML 미리보기 (Sandboxed)
          </p>
        </div>
        <iframe
          srcDoc={sourceCode}
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
          className="flex-1 w-full border-0 rounded-lg bg-white"
          title="HTML Preview"
        />
      </div>
    );
  }

  if (previewMode === 'python') {
    return (
      <div className="h-full flex flex-col">
        <div className="mb-2 pb-2 border-b border-border">
          <p className="text-xs text-muted-foreground">
            Python 실행 환경 (Pyodide)
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            ⚠️ NumPy, Pandas 등 기본 라이브러리만 지원. pip install 불가
          </p>
        </div>
        <div className="flex-1 overflow-hidden">
          <PyodideRunner code={sourceCode} />
        </div>
      </div>
    );
  }

  if (previewMode === 'react') {
    return (
      <div className="h-full flex flex-col">
        <div className="mb-2 pb-2 border-b border-border">
          <p className="text-xs text-muted-foreground">
            React 렌더링 환경 (Babel Standalone)
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            ⚠️ 간단한 컴포넌트만 지원. npm 라이브러리 불가. 복잡한 앱은 HTML로 구현 권장
          </p>
        </div>
        <div className="flex-1 overflow-hidden">
          <ReactRunner code={sourceCode} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center bg-muted/30 rounded-lg border border-border">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-destructive/50 mx-auto mb-3" />
        <p className="text-muted-foreground">미리보기를 표시할 수 없습니다</p>
        <p className="text-xs text-muted-foreground/60 mt-2">
          HTML/React/Python 코드 또는 유효한 Claude artifact URL을 입력해주세요
        </p>
      </div>
    </div>
  );
}
