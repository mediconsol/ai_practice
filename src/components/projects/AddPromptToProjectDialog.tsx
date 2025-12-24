import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePrompts } from "@/hooks/usePrompts";
import { useAddPromptToProject } from "@/hooks/useProjects";
import { PROMPT_CATEGORIES_WITH_ALL } from "@/constants/categories";
import { cn } from "@/lib/utils";

interface AddPromptToProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  existingPromptIds: string[];
}

export function AddPromptToProjectDialog({
  open,
  onOpenChange,
  projectId,
  existingPromptIds,
}: AddPromptToProjectDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");

  const { data: allPrompts = [], isLoading } = usePrompts();
  const addPromptMutation = useAddPromptToProject();

  // 이미 프로젝트에 있는 프롬프트 제외
  const availablePrompts = useMemo(() => {
    return allPrompts.filter((prompt) => !existingPromptIds.includes(prompt.id));
  }, [allPrompts, existingPromptIds]);

  // 필터링
  const filteredPrompts = useMemo(() => {
    return availablePrompts.filter((prompt) => {
      const matchesCategory =
        selectedCategory === "전체" || prompt.category === selectedCategory;
      const matchesSearch =
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [availablePrompts, selectedCategory, searchQuery]);

  const handleAddPrompt = (promptId: string) => {
    addPromptMutation.mutate(
      {
        projectId,
        promptId,
      },
      {
        onSuccess: () => {
          // 성공 시 다이얼로그는 열어둠 (계속 추가할 수 있도록)
          setSearchQuery("");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>프롬프트 추가</DialogTitle>
          <DialogDescription>
            프로젝트에 추가할 프롬프트를 선택하세요
          </DialogDescription>
        </DialogHeader>

        {/* Search & Filter */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="프롬프트 검색..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="카테고리" />
            </SelectTrigger>
            <SelectContent>
              {PROMPT_CATEGORIES_WITH_ALL.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Prompts List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">프롬프트를 불러오는 중...</p>
            </div>
          ) : filteredPrompts.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">
                {availablePrompts.length === 0
                  ? "모든 프롬프트가 이미 추가되었습니다."
                  : "검색 결과가 없습니다."}
              </p>
            </div>
          ) : (
            filteredPrompts.map((prompt, index) => (
              <div
                key={prompt.id}
                className={cn(
                  "bg-card rounded-lg border border-border p-4 transition-all duration-300 hover:shadow-md hover:border-primary/30 animate-fade-in",
                  addPromptMutation.isPending && "opacity-50 pointer-events-none"
                )}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-primary bg-accent px-2 py-0.5 rounded-full">
                        {prompt.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-card-foreground mb-2 truncate">
                      {prompt.title}
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono bg-muted/50 p-2 rounded max-h-[60px] overflow-y-auto line-clamp-3">
                      {prompt.content}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="gap-1.5 shrink-0"
                    onClick={() => handleAddPrompt(prompt.id)}
                    disabled={addPromptMutation.isPending}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    추가
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Info */}
        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            {availablePrompts.length > 0 ? (
              <>
                <span className="font-medium text-foreground">
                  {filteredPrompts.length}
                </span>
                개의 프롬프트를 추가할 수 있습니다
              </>
            ) : (
              "모든 프롬프트가 이미 추가되었습니다"
            )}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
