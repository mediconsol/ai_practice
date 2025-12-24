import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useUpdateResult } from "@/hooks/useExecutionResults";
import { PROMPT_CATEGORIES } from "@/constants/categories";

interface EditResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: {
    id: string;
    title: string;
    category: string;
    memo?: string | null;
  };
}

export function EditResultDialog({ open, onOpenChange, result }: EditResultDialogProps) {
  const [title, setTitle] = useState(result.title);
  const [category, setCategory] = useState(result.category);
  const [memo, setMemo] = useState(result.memo || "");

  const updateResultMutation = useUpdateResult();

  // 결과가 변경되면 상태 업데이트
  useEffect(() => {
    if (open) {
      setTitle(result.title);
      setCategory(result.category);
      setMemo(result.memo || "");
    }
  }, [open, result]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !category) {
      return;
    }

    updateResultMutation.mutate(
      {
        id: result.id,
        updates: {
          title,
          category,
          memo: memo || null,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>실행 결과 수정</DialogTitle>
          <DialogDescription>
            실행 결과의 제목, 카테고리, 메모를 수정하세요
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              제목 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="실행 결과 제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">
              카테고리 <span className="text-destructive">*</span>
            </Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
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

          <div className="space-y-2">
            <Label htmlFor="memo">메모</Label>
            <Textarea
              id="memo"
              placeholder="메모를 입력하세요 (선택사항)"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              이 결과물에 대한 추가 메모나 설명을 입력할 수 있습니다
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateResultMutation.isPending}
            >
              취소
            </Button>
            <Button type="submit" disabled={updateResultMutation.isPending || !title || !category}>
              {updateResultMutation.isPending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
