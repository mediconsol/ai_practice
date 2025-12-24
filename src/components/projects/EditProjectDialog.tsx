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
import { useUpdateProject } from "@/hooks/useProjects";
import type { Database } from "@/lib/supabase";

type ProjectStatus = Database['public']['Tables']['projects']['Row']['status'];

interface EditProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: {
    id: string;
    title: string;
    description: string | null;
    status: ProjectStatus;
  };
}

export function EditProjectDialog({ open, onOpenChange, project }: EditProjectDialogProps) {
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description || "");
  const [status, setStatus] = useState<ProjectStatus>(project.status);

  const updateProjectMutation = useUpdateProject();

  // 프로젝트가 변경되면 상태 업데이트
  useEffect(() => {
    if (open) {
      setTitle(project.title);
      setDescription(project.description || "");
      setStatus(project.status);
    }
  }, [open, project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title) {
      return;
    }

    updateProjectMutation.mutate(
      {
        id: project.id,
        updates: {
          title,
          description: description || null,
          status,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
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
          <DialogTitle>프로젝트 수정</DialogTitle>
          <DialogDescription>
            프로젝트 정보를 수정하세요
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              제목 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="프로젝트 제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
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
              onClick={() => onOpenChange(false)}
              disabled={updateProjectMutation.isPending}
            >
              취소
            </Button>
            <Button type="submit" disabled={updateProjectMutation.isPending || !title}>
              {updateProjectMutation.isPending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
