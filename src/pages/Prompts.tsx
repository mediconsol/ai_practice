import { useState } from "react";
import { PromptCard } from "@/components/dashboard/PromptCard";
import { SharedResultCard } from "@/components/results/SharedResultCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Download,
  Upload,
  FolderPlus,
  FileText,
  Share2,
} from "lucide-react";
import { usePrompts, useToggleFavorite, useDeletePrompt } from "@/hooks/usePrompts";
import {
  useSharedResults,
  useSaveSharedToMyAssets,
} from "@/hooks/useExecutionResults";
import { PROMPT_CATEGORIES_WITH_ALL } from "@/constants/categories";

type SortOption = "latest" | "popular" | "likes" | "views";

export default function Prompts() {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<SortOption>("popular");

  // 데이터 조회
  const { data: prompts = [], isLoading: isLoadingPrompts } = usePrompts();
  const { data: sharedResults = [], isLoading: isLoadingShared } =
    useSharedResults();

  // Mutations
  const toggleFavorite = useToggleFavorite();
  const deletePrompt = useDeletePrompt();
  const saveSharedToMyAssets = useSaveSharedToMyAssets();

  // 핸들러
  const handleToggleFavorite = (id: string, currentFavorite: boolean) => {
    toggleFavorite.mutate({ id, isFavorite: currentFavorite });
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`"${title}" 프롬프트를 삭제하시겠습니까?`)) {
      deletePrompt.mutate(id);
    }
  };

  const handleSaveToMyAssets = (id: string) => {
    saveSharedToMyAssets.mutate(id);
  };

  // 필터링
  const filteredPrompts = prompts.filter((prompt) => {
    const matchesCategory =
      selectedCategory === "전체" || prompt.category === selectedCategory;
    const matchesSearch =
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredSharedResults = sharedResults
    .filter((result) => {
      const matchesCategory =
        selectedCategory === "전체" || result.category === selectedCategory;
      const matchesSearch =
        result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.result.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "latest":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "popular":
          // 인기도 = 좋아요 * 2 + 조회수 (좋아요에 더 높은 가중치)
          const popularityA = a.like_count * 2 + a.view_count;
          const popularityB = b.like_count * 2 + b.view_count;
          return popularityB - popularityA;
        case "likes":
          return b.like_count - a.like_count;
        case "views":
          return b.view_count - a.view_count;
        default:
          return 0;
      }
    });

  const favoritePromptsCount = prompts.filter((p) => p.is_favorite).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            프롬프트 자산
          </h1>
          <p className="text-muted-foreground">
            나만의 프롬프트를 저장하고 관리하세요. 다른 의료진이 공유한 우수 사례도 확인할 수 있습니다.
          </p>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
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
          <p className="text-3xl font-bold text-success">
            {sharedResults.length}
          </p>
          <p className="text-sm text-muted-foreground">공유된 콘텐츠</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-3xl font-bold text-primary">
            {prompts.reduce((acc, p) => acc + p.usage_count, 0)}
          </p>
          <p className="text-sm text-muted-foreground">총 실행 횟수</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="my-prompts" className="animate-fade-in">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="my-prompts" className="gap-2">
            <FileText className="w-4 h-4" />
            내 프롬프트
          </TabsTrigger>
          <TabsTrigger value="shared" className="gap-2">
            <Share2 className="w-4 h-4" />
            공유 프롬프트
          </TabsTrigger>
        </TabsList>

        {/* 내 프롬프트 탭 */}
        <TabsContent value="my-prompts" className="space-y-4">
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
                    onDelete={handleDelete}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 공유 프롬프트 탭 */}
        <TabsContent value="shared" className="space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="공유 프롬프트 검색..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
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

          {/* Sort Options */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-sm font-medium text-muted-foreground shrink-0">
              정렬:
            </span>
            <Button
              variant={sortBy === "popular" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("popular")}
              className="shrink-0"
            >
              인기순
            </Button>
            <Button
              variant={sortBy === "latest" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("latest")}
              className="shrink-0"
            >
              최신순
            </Button>
            <Button
              variant={sortBy === "likes" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("likes")}
              className="shrink-0"
            >
              좋아요순
            </Button>
            <Button
              variant={sortBy === "views" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("views")}
              className="shrink-0"
            >
              조회순
            </Button>
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
            <span>{filteredSharedResults.length}개 공유 콘텐츠</span>
            <span>•</span>
            <span>
              총 조회수{" "}
              {filteredSharedResults.reduce(
                (acc, r) => acc + r.view_count,
                0
              )}
            </span>
          </div>

          {/* Shared Results Grid */}
          {isLoadingShared ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                공유 콘텐츠를 불러오는 중...
              </p>
            </div>
          ) : filteredSharedResults.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory !== "전체"
                  ? "검색 결과가 없습니다."
                  : "공유된 콘텐츠가 없습니다."}
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
              {filteredSharedResults.map((result, index) => (
                <div
                  key={result.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <SharedResultCard
                    id={result.id}
                    title={result.title}
                    category={result.category}
                    prompt={result.prompt}
                    result={result.result}
                    memo={result.memo}
                    aiProvider={result.ai_provider}
                    aiModel={result.ai_model}
                    executionTimeMs={result.execution_time_ms}
                    createdAt={result.created_at}
                    viewCount={result.view_count}
                    likeCount={result.like_count}
                    onSaveToMyAssets={handleSaveToMyAssets}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
