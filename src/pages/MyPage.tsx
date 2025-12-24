import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Grid, List, FileText, Sparkles } from "lucide-react";
import { useMyResults, useToggleResultFavorite, useDeleteResult, useToggleShare } from "@/hooks/useExecutionResults";
import { usePrompts, useToggleFavorite, useDeletePrompt } from "@/hooks/usePrompts";
import { ResultCard } from "@/components/results/ResultCard";
import { PromptCard } from "@/components/dashboard/PromptCard";
import { ShareConfirmDialog } from "@/components/results/ShareConfirmDialog";
import { EditResultDialog } from "@/components/results/EditResultDialog";
import { PROMPT_CATEGORIES_WITH_ALL } from "@/constants/categories";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export default function MyPage() {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedResultForShare, setSelectedResultForShare] = useState<{
    id: string;
    title: string;
    isShared: boolean;
  } | null>(null);
  const [editResultDialogOpen, setEditResultDialogOpen] = useState(false);
  const [selectedResultForEdit, setSelectedResultForEdit] = useState<{
    id: string;
    title: string;
    category: string;
    memo?: string | null;
  } | null>(null);

  // 데이터 조회
  const { data: results = [], isLoading: isLoadingResults } = useMyResults();
  const { data: prompts = [], isLoading: isLoadingPrompts } = usePrompts();

  // Mutations
  const toggleResultFavorite = useToggleResultFavorite();
  const deleteResult = useDeleteResult();
  const toggleShare = useToggleShare();
  const togglePromptFavorite = useToggleFavorite();
  const deletePrompt = useDeletePrompt();

  // 사용자 정보 조회
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session?.user || null;
    },
  });

  // 필터링
  const filteredResults = results.filter((result) => {
    const matchesCategory =
      selectedCategory === "전체" || result.category === selectedCategory;
    const matchesSearch =
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.result.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredPrompts = prompts.filter((prompt) => {
    const matchesCategory =
      selectedCategory === "전체" || prompt.category === selectedCategory;
    const matchesSearch =
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // 핸들러
  const handleToggleResultFavorite = (id: string, currentFavorite: boolean) => {
    toggleResultFavorite.mutate({ id, isFavorite: currentFavorite });
  };

  const handleEditResult = (id: string) => {
    const result = results.find((r) => r.id === id);
    if (result) {
      setSelectedResultForEdit({
        id: result.id,
        title: result.title,
        category: result.category,
        memo: result.memo,
      });
      setEditResultDialogOpen(true);
    }
  };

  const handleDeleteResult = (id: string, title: string) => {
    if (window.confirm(`"${title}" 실행 결과를 삭제하시겠습니까?`)) {
      deleteResult.mutate(id);
    }
  };

  const handleToggleShare = (id: string, currentShared: boolean) => {
    const result = results.find((r) => r.id === id);
    if (!result) return;

    if (currentShared) {
      // 공유 취소
      if (window.confirm("공유를 취소하시겠습니까?")) {
        toggleShare.mutate({ id, isShared: currentShared });
      }
    } else {
      // 공유하기 - 다이얼로그 표시
      setSelectedResultForShare({
        id,
        title: result.title,
        isShared: currentShared,
      });
      setShareDialogOpen(true);
    }
  };

  const handleShareConfirm = () => {
    if (selectedResultForShare) {
      toggleShare.mutate({
        id: selectedResultForShare.id,
        isShared: selectedResultForShare.isShared,
      });
      setSelectedResultForShare(null);
    }
  };

  const handleTogglePromptFavorite = (id: string, currentFavorite: boolean) => {
    togglePromptFavorite.mutate({ id, isFavorite: currentFavorite });
  };

  const handleDeletePrompt = (id: string, title: string) => {
    if (window.confirm(`"${title}" 프롬프트를 삭제하시겠습니까?`)) {
      deletePrompt.mutate(id);
    }
  };

  const favoriteResultsCount = results.filter((r) => r.is_favorite).length;
  const favoritePromptsCount = prompts.filter((p) => p.is_favorite).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground mb-1">마이페이지</h1>
        <p className="text-muted-foreground">
          저장된 프롬프트와 실행 결과를 관리하세요.
        </p>
      </div>

      {/* Profile Section */}
      {user && (
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {user.email}
              </h2>
              <p className="text-sm text-muted-foreground">
                의료 전문가
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-3xl font-bold text-primary">{results.length}</p>
          <p className="text-sm text-muted-foreground">저장된 실행 결과</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-3xl font-bold text-success">{prompts.length}</p>
          <p className="text-sm text-muted-foreground">저장된 프롬프트</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-3xl font-bold text-warning">
            {favoriteResultsCount + favoritePromptsCount}
          </p>
          <p className="text-sm text-muted-foreground">즐겨찾기</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-3xl font-bold text-foreground">
            {results.reduce((acc, r) => acc + (r.execution_time_ms || 0), 0) / 1000}초
          </p>
          <p className="text-sm text-muted-foreground">총 실행 시간</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="results" className="animate-fade-in">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="results" className="gap-2">
            <Sparkles className="w-4 h-4" />
            실행 결과
          </TabsTrigger>
          <TabsTrigger value="prompts" className="gap-2">
            <FileText className="w-4 h-4" />
            내 프롬프트
          </TabsTrigger>
        </TabsList>

        {/* 실행 결과 탭 */}
        <TabsContent value="results" className="space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="실행 결과 검색..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
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
            <span>{filteredResults.length}개 결과</span>
            <span>•</span>
            <span>즐겨찾기 {favoriteResultsCount}개</span>
          </div>

          {/* Results Grid */}
          {isLoadingResults ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">실행 결과를 불러오는 중...</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory !== "전체"
                  ? "검색 결과가 없습니다."
                  : "저장된 실행 결과가 없습니다. AI 실행 후 결과를 저장해보세요."}
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
              {filteredResults.map((result, index) => (
                <div
                  key={result.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ResultCard
                    id={result.id}
                    title={result.title}
                    category={result.category}
                    prompt={result.prompt}
                    result={result.result}
                    memo={result.memo}
                    isFavorite={result.is_favorite}
                    isShared={result.is_shared}
                    aiProvider={result.ai_provider}
                    aiModel={result.ai_model}
                    executionTimeMs={result.execution_time_ms}
                    createdAt={result.created_at}
                    onToggleFavorite={handleToggleResultFavorite}
                    onToggleShare={handleToggleShare}
                    onEdit={handleEditResult}
                    onDelete={handleDeleteResult}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 내 프롬프트 탭 */}
        <TabsContent value="prompts" className="space-y-4">
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
                    onToggleFavorite={handleTogglePromptFavorite}
                    onDelete={handleDeletePrompt}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Share Confirm Dialog */}
      <ShareConfirmDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        title={selectedResultForShare?.title || ""}
        onConfirm={handleShareConfirm}
      />

      {/* Edit Result Dialog */}
      {selectedResultForEdit && (
        <EditResultDialog
          open={editResultDialogOpen}
          onOpenChange={setEditResultDialogOpen}
          result={selectedResultForEdit}
        />
      )}
    </div>
  );
}
