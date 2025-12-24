import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Plus,
  FolderOpen,
  Calendar,
  Sparkles,
  Trash2,
  Play,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProject, useRemovePromptFromProject } from "@/hooks/useProjects";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import type { Database } from "@/lib/supabase";
import { toast } from "sonner";
import { AddPromptToProjectDialog } from "@/components/projects/AddPromptToProjectDialog";

type ProjectStatus = Database['public']['Tables']['projects']['Row']['status'];

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [addPromptDialogOpen, setAddPromptDialogOpen] = useState(false);

  const { data: project, isLoading } = useProject(id || "");
  const removePromptMutation = useRemovePromptFromProject();

  const handleRemovePrompt = (promptId: string, promptTitle: string) => {
    if (window.confirm(`"${promptTitle}" 프롬프트를 이 프로젝트에서 제거하시겠습니까?`)) {
      removePromptMutation.mutate({
        projectId: id!,
        promptId,
      });
    }
  };

  const handleCopyPrompt = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("프롬프트를 클립보드에 복사했습니다");
  };

  const handleExecutePrompt = (content: string) => {
    navigate("/ai-execute", { state: { prompt: content } });
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">세트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <FolderOpen className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          세트를 찾을 수 없습니다
        </h2>
        <Button variant="outline" onClick={() => navigate("/projects")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          세트 목록으로
        </Button>
      </div>
    );
  }

  const prompts = project.project_prompts?.map((pp: any) => pp.prompts) || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 animate-fade-in">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/projects")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-foreground">{project.title}</h1>
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                project.status === "active" && "bg-success/10 text-success",
                project.status === "completed" && "bg-primary/10 text-primary",
                project.status === "archived" && "bg-muted text-muted-foreground"
              )}
            >
              {getStatusLabel(project.status)}
            </span>
          </div>
          {project.description && (
            <p className="text-muted-foreground">{project.description}</p>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {formatDistanceToNow(new Date(project.updated_at), {
                addSuffix: true,
                locale: ko,
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats & Actions */}
      <div className="flex items-center justify-between animate-fade-in">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-foreground">{prompts.length}</p>
          <p className="text-sm text-muted-foreground">포함된 프롬프트</p>
        </div>
        <Button className="gap-2" onClick={() => setAddPromptDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          프롬프트 추가
        </Button>
      </div>

      {/* Prompts List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">프롬프트 목록</h2>
        {prompts.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border animate-fade-in">
            <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">
              아직 프롬프트가 없습니다.
            </p>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setAddPromptDialogOpen(true)}
            >
              <Plus className="w-4 h-4" />
              첫 프롬프트 추가하기
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {prompts.map((prompt: any, index: number) => (
              <div
                key={prompt.id}
                className="bg-card rounded-xl border border-border p-4 transition-all duration-300 hover:shadow-md hover:border-primary/30 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-primary bg-accent px-2 py-0.5 rounded-full">
                        {prompt.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-card-foreground mb-2">
                      {prompt.title}
                    </h3>
                    <div className="text-xs text-muted-foreground font-mono bg-muted/50 p-3 rounded-lg max-h-[100px] overflow-y-auto">
                      {prompt.content}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    {prompt.usage_count || 0}회 사용됨
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleCopyPrompt(prompt.content)}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      복사
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleExecutePrompt(prompt.content)}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      실행
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-destructive hover:text-destructive"
                      onClick={() => handleRemovePrompt(prompt.id, prompt.title)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      제거
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Prompt Dialog */}
      <AddPromptToProjectDialog
        open={addPromptDialogOpen}
        onOpenChange={setAddPromptDialogOpen}
        projectId={id!}
        existingPromptIds={prompts.map((p: any) => p.id)}
      />
    </div>
  );
}
