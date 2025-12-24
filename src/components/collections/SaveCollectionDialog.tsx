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
import { COLLECTION_CATEGORIES } from "@/types/collection";
import type { CreateCollectionInput } from "@/types/collection";

interface SaveCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceCode: string;
  previewMode: 'html' | 'artifact' | 'python' | 'react';
  artifactUrl?: string;
  onSave: (data: CreateCollectionInput) => void;
}

export function SaveCollectionDialog({
  open,
  onOpenChange,
  sourceCode,
  previewMode,
  artifactUrl,
  onSave,
}: SaveCollectionDialogProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(COLLECTION_CATEGORIES[0]);
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
        preview_mode: previewMode,
        artifact_url: artifactUrl,
        sourceCode,
        memo: memo.trim() || undefined,
        is_favorite: isFavorite,
      });

      // 성공 시 초기화
      setTitle("");
      setCategory(COLLECTION_CATEGORIES[0]);
      setMemo("");
      setIsFavorite(false);
      onOpenChange(false);
    } catch (error) {
      console.error("컬렉션 저장 실패:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>컬렉션으로 저장</DialogTitle>
          <DialogDescription>
            유용한 프로그램을 저장하여 나중에 다시 사용하세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 제목 입력 */}
          <div className="space-y-2">
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              placeholder="예: BMI 계산기"
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
                {COLLECTION_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 미리보기 정보 */}
          <div className="space-y-2">
            <Label>미리보기 모드</Label>
            <div className="text-sm bg-muted px-3 py-2 rounded-md">
              {previewMode === 'html' ? (
                <span className="font-medium">HTML 프로그램</span>
              ) : previewMode === 'python' ? (
                <span className="font-medium">Python 스크립트</span>
              ) : previewMode === 'react' ? (
                <span className="font-medium">React 컴포넌트</span>
              ) : (
                <span className="font-medium">Claude Artifact</span>
              )}
            </div>
          </div>

          {/* 소스 미리보기 */}
          <div className="space-y-2">
            <Label>소스 코드</Label>
            <div className="max-h-[150px] overflow-y-auto rounded-lg bg-muted p-3 text-xs font-mono">
              {previewMode === 'artifact' && artifactUrl ? (
                <div>
                  <p className="text-muted-foreground mb-1">URL:</p>
                  <p className="break-all">{artifactUrl}</p>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap break-words">
                  {sourceCode.length > 500
                    ? `${sourceCode.substring(0, 500)}...\n\n(${sourceCode.length} 글자)`
                    : sourceCode}
                </pre>
              )}
            </div>
          </div>

          {/* 메모 */}
          <div className="space-y-2">
            <Label htmlFor="memo">메모 (선택)</Label>
            <Textarea
              id="memo"
              placeholder="이 프로그램에 대한 메모를 입력하세요"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="min-h-[80px]"
            />
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
