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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PROMPT_CATEGORIES } from "@/constants/categories";

interface SavePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt: string;
  onSave: (data: {
    title: string;
    category: string;
    content: string;
    isFavorite: boolean;
  }) => Promise<void>;
}

export function SavePromptDialog({
  open,
  onOpenChange,
  prompt,
  onSave,
}: SavePromptDialogProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(PROMPT_CATEGORIES[0]);
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
        content: prompt,
        isFavorite,
      });

      // 성공 시 초기화
      setTitle("");
      setCategory(PROMPT_CATEGORIES[0]);
      setIsFavorite(false);
      onOpenChange(false);
    } catch (error) {
      console.error("프롬프트 저장 실패:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>프롬프트 자산으로 저장</DialogTitle>
          <DialogDescription>
            자주 사용하는 프롬프트를 저장하여 나중에 재사용하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 제목 입력 */}
          <div className="space-y-2">
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              placeholder="예: 당뇨병 환자 식이요법 안내"
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
            <Label>프롬프트 내용</Label>
            <div className="max-h-[200px] overflow-y-auto rounded-lg bg-muted p-3 text-sm font-mono">
              {prompt}
            </div>
          </div>

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
