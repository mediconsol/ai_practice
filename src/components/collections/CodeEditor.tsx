import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RotateCcw, Clipboard, Save } from "lucide-react";
import { toast } from "sonner";

interface CodeEditorProps {
  sourceCode: string;
  setSourceCode: (code: string) => void;
  onSave: () => void;
}

export function CodeEditor({ sourceCode, setSourceCode, onSave }: CodeEditorProps) {
  const handleClear = () => {
    if (sourceCode.trim() && !window.confirm('입력한 내용을 초기화하시겠습니까?')) {
      return;
    }
    setSourceCode('');
    toast.success('초기화되었습니다');
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setSourceCode(text);
      toast.success('클립보드에서 붙여넣었습니다');
    } catch (error) {
      console.error('Paste failed:', error);
      toast.error('붙여넣기 실패');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-3">
        <Label htmlFor="source-code">소스 코드 또는 URL 입력</Label>
        <p className="text-xs text-muted-foreground mt-1">
          <strong>HTML 권장</strong> | React, Python은 제한적 | Claude는 *.mediconsol.com 허용 필수
        </p>
      </div>

      <Textarea
        id="source-code"
        value={sourceCode}
        onChange={(e) => setSourceCode(e.target.value)}
        placeholder="AI 도구에서 생성한 코드를 붙여넣으세요.

✅ 권장:
• HTML: AI에게 'HTML로 구현해줘' 요청 (가장 안정적)
• Claude Artifact: '산출물 게시' → '임베딩 가져오기' → *.mediconsol.com 허용

⚠️ 제한적 지원:
• React: 간단한 컴포넌트만 (npm 라이브러리 불가)
• Python: 기본 라이브러리만 (pip install 불가)

💡 여기저기 흩어진 유용한 결과물을 한 곳에 모아보세요!"
        className="flex-1 font-mono text-sm resize-none"
      />

      <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleClear} className="gap-1.5">
            <RotateCcw className="w-4 h-4" />
            초기화
          </Button>
          <Button variant="outline" size="sm" onClick={handlePaste} className="gap-1.5">
            <Clipboard className="w-4 h-4" />
            붙여넣기
          </Button>
        </div>
        <Button onClick={onSave} disabled={!sourceCode.trim()} className="gap-2">
          <Save className="w-4 h-4" />
          저장
        </Button>
      </div>
    </div>
  );
}
