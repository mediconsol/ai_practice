import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PromptCard } from "@/components/dashboard/PromptCard";
import { ConvertToProgramDialog } from "@/components/prompts/ConvertToProgramDialog";
import { EditPromptDialog } from "@/components/prompts/EditPromptDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Download,
  Upload,
  FolderPlus,
} from "lucide-react";
import { usePrompts, useToggleFavorite, useDeletePrompt } from "@/hooks/usePrompts";
import { usePrograms } from "@/hooks/usePrograms";
import { PROMPT_CATEGORIES_WITH_ALL } from "@/constants/categories";

export default function Prompts() {
  const [searchParams] = useSearchParams();
  const programId = searchParams.get("program");

  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [promptToConvert, setPromptToConvert] = useState<{
    title: string;
    content: string;
    category: string;
  } | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [promptToEdit, setPromptToEdit] = useState<{
    id: string;
    title: string;
    content: string;
    category: string;
  } | null>(null);

  // 데이터 조회
  const { data: prompts = [], isLoading: isLoadingPrompts } = usePrompts();
  const { data: programs = [] } = usePrograms();

  // 현재 선택된 프로그램 찾기
  const selectedProgram = programId
    ? programs.find((p) => p.id === programId)
    : null;

  // Mutations
  const toggleFavorite = useToggleFavorite();
  const deletePrompt = useDeletePrompt();

  // 핸들러
  const handleToggleFavorite = (id: string, currentFavorite: boolean) => {
    toggleFavorite.mutate({ id, isFavorite: currentFavorite });
  };

  const handleEdit = (id: string) => {
    const prompt = prompts.find((p) => p.id === id);
    if (prompt) {
      setPromptToEdit({
        id: prompt.id,
        title: prompt.title,
        content: prompt.content,
        category: prompt.category,
      });
      setEditDialogOpen(true);
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`"${title}" 프롬프트를 삭제하시겠습니까?`)) {
      deletePrompt.mutate(id);
    }
  };

  const handleConvertToProgram = (
    id: string,
    title: string,
    content: string,
    category: string
  ) => {
    setPromptToConvert({ title, content, category });
    setConvertDialogOpen(true);
  };

  // 필터링
  const filteredPrompts = prompts.filter((prompt) => {
    const matchesProgram = !programId || prompt.program_id === programId;
    const matchesCategory =
      selectedCategory === "전체" || prompt.category === selectedCategory;
    const matchesSearch =
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProgram && matchesCategory && matchesSearch;
  });

  const favoritePromptsCount = prompts.filter((p) => p.is_favorite).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {selectedProgram ? selectedProgram.title : "내 프롬프트"}
          </h1>
          <p className="text-muted-foreground">
            {selectedProgram
              ? selectedProgram.description || "프로그램의 프롬프트를 확인하고 실행하세요"
              : "나만의 프롬프트를 저장하고 관리하세요. AI 실행 후 유용한 프롬프트를 저장해보세요."}
          </p>
          {selectedProgram && (
            <Button
              variant="link"
              className="px-0 h-auto mt-2 text-sm"
              onClick={() => window.location.href = "/prompts"}
            >
              ← 전체 프롬프트로 돌아가기
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            가져오기
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            내보내기
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            새 프롬프트
          </Button>
        </div>
      </div>

      {/* Asset Summary */}
      <div className="grid grid-cols-3 gap-4 animate-fade-in">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-3xl font-bold text-foreground">{prompts.length}</p>
          <p className="text-sm text-muted-foreground">내 프롬프트</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-3xl font-bold text-warning">
            {favoritePromptsCount}
          </p>
          <p className="text-sm text-muted-foreground">즐겨찾기</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-3xl font-bold text-primary">
            {prompts.reduce((acc, p) => acc + p.usage_count, 0)}
          </p>
          <p className="text-sm text-muted-foreground">총 실행 횟수</p>
        </div>
      </div>

      {/* Prompts Section */}
      <div className="space-y-4 animate-fade-in">
          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="프롬프트 검색..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <FolderPlus className="w-4 h-4" />
              </Button>
              <div className="border-l border-border h-6 mx-1" />
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {PROMPT_CATEGORIES_WITH_ALL.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="shrink-0"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{filteredPrompts.length}개 프롬프트</span>
            <span>•</span>
            <span>즐겨찾기 {favoritePromptsCount}개</span>
          </div>

          {/* Prompts Grid */}
          {isLoadingPrompts ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">프롬프트를 불러오는 중...</p>
            </div>
          ) : filteredPrompts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory !== "전체"
                  ? "검색 결과가 없습니다."
                  : "저장된 프롬프트가 없습니다. AI 실행 후 프롬프트를 저장해보세요."}
              </p>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  : "space-y-3"
              }
            >
              {filteredPrompts.map((prompt, index) => (
                <div
                  key={prompt.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <PromptCard
                    id={prompt.id}
                    title={prompt.title}
                    category={prompt.category}
                    content={prompt.content}
                    isFavorite={prompt.is_favorite}
                    usageCount={prompt.usage_count}
                    onToggleFavorite={handleToggleFavorite}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onConvertToProgram={handleConvertToProgram}
                  />
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Convert to Program Dialog */}
      {promptToConvert && (
        <ConvertToProgramDialog
          open={convertDialogOpen}
          onOpenChange={setConvertDialogOpen}
          promptTitle={promptToConvert.title}
          promptContent={promptToConvert.content}
          promptCategory={promptToConvert.category}
        />
      )}

      {/* Edit Prompt Dialog */}
      {promptToEdit && (
        <EditPromptDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          prompt={promptToEdit}
        />
      )}
    </div>
  );
}
