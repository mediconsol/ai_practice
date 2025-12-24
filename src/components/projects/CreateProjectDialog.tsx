import { useState } from "react";
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
import { useCreateProject } from "@/hooks/useProjects";
import type { Database } from "@/lib/supabase";

type ProjectStatus = Database['public']['Tables']['projects']['Row']['status'];

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("active");

  const createProjectMutation = useCreateProject();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title) {
      return;
    }

    createProjectMutation.mutate(
      {
        title,
        description: description || null,
        status,
      },
      {
        onSuccess: () => {
          // 성공 시 폼 초기화 및 다이얼로그 닫기
          setTitle("");
          setDescription("");
          setStatus("active");
          onOpenChange(false);
        },
      }
    );
  };

  const handleCancel = () => {
    // 취소 시 폼 초기화
    setTitle("");
    setDescription("");
    setStatus("active");
    onOpenChange(false);
  };

  const getStatusLabel = (status: ProjectStatus) => {
    switch (status) {
      case "active":
        return "진행 중";
      case "completed":
        return "완료";
      case "archived":
        return "보관됨";
      default:
        return status;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>새 프로젝트 만들기</DialogTitle>
          <DialogDescription>
            프롬프트를 묶어서 관리할 프로젝트를 생성하세요
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              제목 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="프로젝트 제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              placeholder="프로젝트 설명을 입력하세요 (선택사항)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              이 프로젝트의 목적이나 내용을 간단히 설명해주세요
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">
              상태 <span className="text-destructive">*</span>
            </Label>
            <Select value={status} onValueChange={(value) => setStatus(value as ProjectStatus)} required>
              <SelectTrigger>
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{getStatusLabel("active")}</SelectItem>
                <SelectItem value="completed">{getStatusLabel("completed")}</SelectItem>
                <SelectItem value="archived">{getStatusLabel("archived")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={createProjectMutation.isPending}
            >
              취소
            </Button>
            <Button type="submit" disabled={createProjectMutation.isPending || !title}>
              {createProjectMutation.isPending ? "생성 중..." : "생성"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
