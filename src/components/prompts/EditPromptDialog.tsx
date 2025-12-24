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
import { useUpdatePrompt } from "@/hooks/usePrompts";
import { PROMPT_CATEGORIES } from "@/constants/categories";

interface EditPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt: {
    id: string;
    title: string;
    content: string;
    category: string;
  };
}

export function EditPromptDialog({ open, onOpenChange, prompt }: EditPromptDialogProps) {
  const [title, setTitle] = useState(prompt.title);
  const [content, setContent] = useState(prompt.content);
  const [category, setCategory] = useState(prompt.category);

  const updatePromptMutation = useUpdatePrompt();

  // 프롬프트가 변경되면 상태 업데이트
  useEffect(() => {
    if (open) {
      setTitle(prompt.title);
      setContent(prompt.content);
      setCategory(prompt.category);
    }
  }, [open, prompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !content || !category) {
      return;
    }

    updatePromptMutation.mutate(
      {
        id: prompt.id,
        updates: {
          title,
          content,
          category,
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
          <DialogTitle>프롬프트 수정</DialogTitle>
          <DialogDescription>
            프롬프트 정보를 수정하세요
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              제목 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="프롬프트 제목"
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
            <Label htmlFor="content">
              프롬프트 내용 <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="content"
              placeholder="프롬프트 내용을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updatePromptMutation.isPending}
            >
              취소
            </Button>
            <Button type="submit" disabled={updatePromptMutation.isPending || !title || !content || !category}>
              {updatePromptMutation.isPending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
