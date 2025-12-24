import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PROMPT_CATEGORIES } from "@/constants/categories";

interface SaveResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt: string;
  result: string;
  aiProvider?: string;
  aiModel?: string;
  executionTimeMs?: number;
  tokenUsage?: any;
  onSave: (data: {
    title: string;
    category: string;
    prompt: string;
    result: string;
    memo?: string;
    isFavorite: boolean;
    aiProvider?: string;
    aiModel?: string;
    executionTimeMs?: number;
    tokenUsage?: any;
  }) => Promise<void>;
}

export function SaveResultDialog({
  open,
  onOpenChange,
  prompt,
  result,
  aiProvider,
  aiModel,
  executionTimeMs,
  tokenUsage,
  onSave,
}: SaveResultDialogProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(PROMPT_CATEGORIES[0]);
  const [memo, setMemo] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        title: title.trim(),
        category,
        prompt,
        result,
        memo: memo.trim() || undefined,
        isFavorite,
        aiProvider,
        aiModel,
        executionTimeMs,
        tokenUsage,
      });

      // 성공 시 초기화
      setTitle("");
      setCategory(PROMPT_CATEGORIES[0]);
      setMemo("");
      setIsFavorite(false);
      onOpenChange(false);
    } catch (error) {
      console.error("실행 결과 저장 실패:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>실행 결과 저장</DialogTitle>
          <DialogDescription>
            AI 실행 결과를 저장하여 나중에 다시 확인하거나 공유할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 제목 입력 */}
          <div className="space-y-2">
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              placeholder="예: 당뇨병 환자 식이요법 안내문"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* 카테고리 선택 */}
          <div className="space-y-2">
            <Label htmlFor="category">카테고리</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                {PROMPT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 프롬프트 미리보기 */}
          <div className="space-y-2">
            <Label>프롬프트</Label>
            <div className="max-h-[120px] overflow-y-auto rounded-lg bg-muted p-3 text-sm font-mono">
              {prompt}
            </div>
          </div>

          {/* 결과물 미리보기 */}
          <div className="space-y-2">
            <Label>실행 결과</Label>
            <div className="max-h-[200px] overflow-y-auto rounded-lg bg-muted p-3 text-sm whitespace-pre-wrap">
              {result}
            </div>
          </div>

          {/* 메모 입력 */}
          <div className="space-y-2">
            <Label htmlFor="memo">메모 (선택)</Label>
            <Textarea
              id="memo"
              placeholder="이 결과물에 대한 메모를 입력하세요..."
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="resize-none h-20"
            />
          </div>

          {/* AI 실행 정보 */}
          {aiProvider && (
            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <p>
                AI 모델: {aiProvider} ({aiModel})
              </p>
              {executionTimeMs && (
                <p>실행 시간: {(executionTimeMs / 1000).toFixed(2)}초</p>
              )}
            </div>
          )}

          {/* 즐겨찾기 */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="favorite"
              checked={isFavorite}
              onCheckedChange={(checked) => setIsFavorite(checked as boolean)}
            />
            <Label
              htmlFor="favorite"
              className="text-sm font-normal cursor-pointer"
            >
              즐겨찾기에 추가
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            취소
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim() || isSaving}
          >
            {isSaving ? "저장 중..." : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
