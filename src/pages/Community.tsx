import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Sparkles,
  Lightbulb,
  Wrench,
  Package,
  ChevronDown,
  TrendingUp,
  Heart,
  Eye,
  Share2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useSharedResults, useSaveSharedToMyAssets } from "@/hooks/useExecutionResults";
import { usePublicPrograms } from "@/hooks/usePrograms";
import { useSharedCollections, useSaveSharedCollectionToMy, useCollections } from "@/hooks/useCollections";
import { SharedResultCard } from "@/components/results/SharedResultCard";
import { SharedResultDetailDialog } from "@/components/results/SharedResultDetailDialog";
import { ProgramCard } from "@/components/dashboard/ProgramCard";
import { SharedCollectionCard } from "@/components/collections/SharedCollectionCard";
import { CollectionViewDialog } from "@/components/collections/CollectionViewDialog";
import { getIcon } from "@/lib/iconMap";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Collection } from "@/types/collection";

type SortOption = "latest" | "popular" | "liked";
type CategoryFilter = "all" | string;

export default function Community() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState("prompts");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [isInfoOpen, setIsInfoOpen] = useState(true);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedViewCollection, setSelectedViewCollection] = useState<Collection | null>(null);
  const [showMyShared, setShowMyShared] = useState(false);

  // 데이터 조회
  const { data: sharedResults = [], isLoading: loadingResults } = useSharedResults();
  const { data: publicPrograms = [], isLoading: loadingPrograms } = usePublicPrograms();
  const { data: sharedCollections = [], isLoading: loadingCollections } = useSharedCollections();
  const { getCollectionById } = useCollections();

  // Mutations
  const saveToMyAssets = useSaveSharedToMyAssets();
  const saveSharedCollectionToMy = useSaveSharedCollectionToMy();

  // Handler 함수들
  const handleSaveToMyAssets = (id: string) => {
    saveToMyAssets.mutate(id);
  };

  const handleViewDetail = (id: string) => {
    setSelectedResult(id);
    setDetailDialogOpen(true);
  };

  const handleOpenCollection = (collection: Collection) => {
    setSelectedViewCollection(collection);
    setViewDialogOpen(true);
  };

  const handleSaveCollectionToMy = (id: string) => {
    saveSharedCollectionToMy.mutate(id);
  };

  // 카테고리 목록 추출
  const promptCategories = useMemo(() => {
    // 내가 만든 것 제외
    const otherResults = sharedResults.filter(r => r.user_id !== user?.id);
    const categories = new Set(otherResults.map(r => r.category).filter(Boolean));
    return ["전체", ...Array.from(categories)];
  }, [sharedResults, user?.id]);

  const programCategories = useMemo(() => {
    // 내가 만든 것 제외
    const otherPrograms = publicPrograms.filter(p => p.user_id !== user?.id);
    const categories = new Set(otherPrograms.map(p => p.category).filter(Boolean));
    return ["전체", ...Array.from(categories)];
  }, [publicPrograms, user?.id]);

  const collectionCategories = useMemo(() => {
    // 내가 만든 것 제외
    const otherCollections = sharedCollections.filter(c => c.user_id !== user?.id);
    const categories = new Set(otherCollections.map(c => c.category).filter(Boolean));
    return ["전체", ...Array.from(categories)];
  }, [sharedCollections, user?.id]);

  // 필터링 및 정렬
  const filteredPrompts = useMemo(() => {
    let filtered = sharedResults.filter(result => {
      const matchesSearch = result.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           result.prompt?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || categoryFilter === "전체" || result.category === categoryFilter;
      const matchesOwner = showMyShared
        ? result.user_id === user?.id  // 내가 공유한 것만
        : result.user_id !== user?.id; // 다른 사용자 것만
      return matchesSearch && matchesCategory && matchesOwner;
    });

    // 정렬
    if (sortBy === "popular") {
      filtered.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
    } else if (sortBy === "liked") {
      filtered.sort((a, b) => (b.like_count || 0) - (a.like_count || 0));
    } else {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return filtered;
  }, [sharedResults, searchQuery, categoryFilter, sortBy, user?.id, showMyShared]);

  const filteredPrograms = useMemo(() => {
    let filtered = publicPrograms.filter(program => {
      const matchesSearch = program.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           program.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || categoryFilter === "전체" || program.category === categoryFilter;
      const matchesOwner = showMyShared
        ? program.user_id === user?.id  // 내가 공유한 것만
        : program.user_id !== user?.id; // 다른 사용자 것만
      return matchesSearch && matchesCategory && matchesOwner;
    });

    // 정렬
    if (sortBy === "popular") {
      filtered.sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0));
    } else if (sortBy === "liked") {
      filtered.sort((a, b) => (b.prompt_count || 0) - (a.prompt_count || 0)); // 프롬프트 많은 순
    } else {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return filtered;
  }, [publicPrograms, searchQuery, categoryFilter, sortBy, user?.id, showMyShared]);

  const filteredCollections = useMemo(() => {
    let filtered = sharedCollections.filter(collection => {
      const matchesSearch = collection.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           collection.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || categoryFilter === "전체" || collection.category === categoryFilter;
      const matchesOwner = showMyShared
        ? collection.user_id === user?.id  // 내가 공유한 것만
        : collection.user_id !== user?.id; // 다른 사용자 것만
      return matchesSearch && matchesCategory && matchesOwner;
    });

    // 정렬
    if (sortBy === "popular") {
      filtered.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
    } else if (sortBy === "liked") {
      filtered.sort((a, b) => (b.like_count || 0) - (a.like_count || 0));
    } else {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return filtered;
  }, [sharedCollections, searchQuery, categoryFilter, sortBy, user?.id, showMyShared]);

  // 탭 변경 시 필터 초기화
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchQuery("");
    setCategoryFilter("all");
    setSortBy("latest");
  };

  // 이번 주 신규 계산
  const getNewThisWeek = (items: any[]) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return items.filter(item => new Date(item.created_at) > oneWeekAgo).length;
  };

  const getCurrentCategories = () => {
    if (activeTab === "prompts") return promptCategories;
    if (activeTab === "programs") return programCategories;
    return collectionCategories;
  };

  const getCurrentItems = () => {
    if (activeTab === "prompts") return filteredPrompts;
    if (activeTab === "programs") return filteredPrograms;
    return filteredCollections;
  };

  const getCurrentTotalItems = () => {
    if (activeTab === "prompts") return sharedResults;
    if (activeTab === "programs") return publicPrograms;
    return sharedCollections;
  };

  const isLoading = loadingResults || loadingPrograms || loadingCollections;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-primary" />
          커뮤니티
        </h1>
        <p className="text-muted-foreground">
          다른 의료진이 공유한 우수 사례를 확인하고 활용하세요
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 gap-4 h-auto bg-transparent p-0">
          <TabsTrigger
            value="prompts"
            className="flex-col gap-3 h-auto py-6 px-6 rounded-xl border-2 data-[state=active]:border-primary data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/10 data-[state=active]:to-info/10 data-[state=active]:shadow-lg transition-all duration-200 hover:border-primary/50 hover:shadow-md"
          >
            <Lightbulb className="w-8 h-8 text-primary" />
            <div className="text-center">
              <div className="font-semibold text-base mb-1">프롬프트 결과물</div>
              <div className="text-xs text-muted-foreground">실전 프롬프트 갤러리</div>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="programs"
            className="flex-col gap-3 h-auto py-6 px-6 rounded-xl border-2 data-[state=active]:border-primary data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/10 data-[state=active]:to-info/10 data-[state=active]:shadow-lg transition-all duration-200 hover:border-primary/50 hover:shadow-md"
          >
            <Wrench className="w-8 h-8 text-primary" />
            <div className="text-center">
              <div className="font-semibold text-base mb-1">AI 도구</div>
              <div className="text-xs text-muted-foreground">공유된 AI 프로그램</div>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="collections"
            className="flex-col gap-3 h-auto py-6 px-6 rounded-xl border-2 data-[state=active]:border-primary data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/10 data-[state=active]:to-info/10 data-[state=active]:shadow-lg transition-all duration-200 hover:border-primary/50 hover:shadow-md"
          >
            <Package className="w-8 h-8 text-primary" />
            <div className="text-center">
              <div className="font-semibold text-base mb-1">프로그램 컬렉션</div>
              <div className="text-xs text-muted-foreground">완성된 솔루션 모음</div>
            </div>
          </TabsTrigger>
        </TabsList>

        {/* Prompts Tab */}
        <TabsContent value="prompts" className="space-y-6">
          {/* Info Card */}
          <Collapsible open={isInfoOpen} onOpenChange={setIsInfoOpen}>
            <div className="bg-accent/50 border border-primary/20 rounded-xl p-5 animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <CollapsibleTrigger className="w-full text-left group">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground mb-1">💡 실전 프롬프트 갤러리</h3>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isInfoOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </CollapsibleTrigger>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                    다른 의료진이 실제로 사용하고 공유한 프롬프트 결과물입니다.
                  </p>
                  <CollapsibleContent className="mt-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      우수 사례를 저장하고 수정하여 나만의 프롬프트 자산으로 활용하세요.
                      각 프롬프트의 AI 응답 결과도 함께 확인할 수 있습니다.
                    </p>
                  </CollapsibleContent>
                </div>
              </div>
            </div>
          </Collapsible>

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4 animate-fade-in">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="프롬프트 검색..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="카테고리" />
              </SelectTrigger>
              <SelectContent>
                {getCurrentCategories().map(cat => (
                  <SelectItem key={cat} value={cat === "전체" ? "all" : cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="정렬" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">최신순</SelectItem>
                <SelectItem value="popular">인기순</SelectItem>
                <SelectItem value="liked">좋아요순</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={showMyShared ? "default" : "outline"}
              className="gap-2 shrink-0"
              onClick={() => setShowMyShared(!showMyShared)}
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">내가 공유한 목록</span>
            </Button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground animate-fade-in">
            <span>총 {filteredPrompts.length}개</span>
            {getNewThisWeek(getCurrentTotalItems()) > 0 && (
              <>
                <span>•</span>
                <span className="text-primary flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  이번 주 신규 {getNewThisWeek(getCurrentTotalItems())}개
                </span>
              </>
            )}
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">불러오는 중...</p>
              </div>
            </div>
          ) : filteredPrompts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrompts.map((result, index) => (
                <div
                  key={result.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
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
                    author={result.author}
                    onSaveToMyAssets={handleSaveToMyAssets}
                    onViewDetail={handleViewDetail}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">
                {searchQuery ? "검색 결과가 없습니다." : "아직 공유된 프롬프트가 없습니다."}
              </p>
            </div>
          )}
        </TabsContent>

        {/* Programs Tab */}
        <TabsContent value="programs" className="space-y-6">
          {/* Info Card */}
          <Collapsible open={isInfoOpen} onOpenChange={setIsInfoOpen}>
            <div className="bg-accent/50 border border-primary/20 rounded-xl p-5 animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Wrench className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <CollapsibleTrigger className="w-full text-left group">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground mb-1">🛠️ 커뮤니티 AI 도구</h3>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isInfoOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </CollapsibleTrigger>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                    의료진들이 직접 만들어 공유한 AI 프로그램입니다.
                  </p>
                  <CollapsibleContent className="mt-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      검증된 도구를 바로 사용하거나, 내 업무에 맞게 복제하여 커스터마이징하세요.
                      Chat, Form, Template 등 다양한 형태의 프로그램을 찾을 수 있습니다.
                    </p>
                  </CollapsibleContent>
                </div>
              </div>
            </div>
          </Collapsible>

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4 animate-fade-in">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="AI 도구 검색..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="카테고리" />
              </SelectTrigger>
              <SelectContent>
                {getCurrentCategories().map(cat => (
                  <SelectItem key={cat} value={cat === "전체" ? "all" : cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="정렬" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">최신순</SelectItem>
                <SelectItem value="popular">사용 많은 순</SelectItem>
                <SelectItem value="liked">프롬프트 많은 순</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={showMyShared ? "default" : "outline"}
              className="gap-2 shrink-0"
              onClick={() => setShowMyShared(!showMyShared)}
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">내가 공유한 목록</span>
            </Button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground animate-fade-in">
            <span>총 {filteredPrograms.length}개</span>
            {getNewThisWeek(getCurrentTotalItems()) > 0 && (
              <>
                <span>•</span>
                <span className="text-primary flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  이번 주 신규 {getNewThisWeek(getCurrentTotalItems())}개
                </span>
              </>
            )}
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">불러오는 중...</p>
              </div>
            </div>
          ) : filteredPrograms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPrograms.map((program, index) => (
                <div
                  key={program.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <ProgramCard
                    id={program.id}
                    title={program.title}
                    description={program.description || ""}
                    icon={getIcon(program.icon || "Sparkles")}
                    category={program.category}
                    promptCount={program.prompt_count}
                    usageCount={program.usage_count || 0}
                    gradient={program.gradient}
                    isNew={program.is_new || false}
                    isPublic={program.is_public || false}
                    userId={program.user_id}
                    author={(program as any).author}
                    onStart={(id) => navigate(`/programs/${id}/run`)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">
                {searchQuery ? "검색 결과가 없습니다." : "아직 공유된 AI 도구가 없습니다."}
              </p>
            </div>
          )}
        </TabsContent>

        {/* Collections Tab */}
        <TabsContent value="collections" className="space-y-6">
          {/* Info Card */}
          <Collapsible open={isInfoOpen} onOpenChange={setIsInfoOpen}>
            <div className="bg-accent/50 border border-primary/20 rounded-xl p-5 animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <CollapsibleTrigger className="w-full text-left group">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground mb-1">📦 완성된 솔루션 컬렉션</h3>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isInfoOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </CollapsibleTrigger>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                    Claude Artifacts, ChatGPT 등에서 생성한 HTML/React/Python 코드를 포함한 완성된 프로그램 모음입니다.
                  </p>
                  <CollapsibleContent className="mt-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      바로 실행하고 활용할 수 있는 완성된 솔루션입니다.
                      웹 애플리케이션, 데이터 시각화 도구, 계산기 등 다양한 프로그램을 제공합니다.
                    </p>
                  </CollapsibleContent>
                </div>
              </div>
            </div>
          </Collapsible>

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4 animate-fade-in">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="컬렉션 검색..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="카테고리" />
              </SelectTrigger>
              <SelectContent>
                {getCurrentCategories().map(cat => (
                  <SelectItem key={cat} value={cat === "전체" ? "all" : cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="정렬" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">최신순</SelectItem>
                <SelectItem value="popular">조회수 순</SelectItem>
                <SelectItem value="liked">좋아요 순</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={showMyShared ? "default" : "outline"}
              className="gap-2 shrink-0"
              onClick={() => setShowMyShared(!showMyShared)}
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">내가 공유한 목록</span>
            </Button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground animate-fade-in">
            <span>총 {filteredCollections.length}개</span>
            {getNewThisWeek(getCurrentTotalItems()) > 0 && (
              <>
                <span>•</span>
                <span className="text-primary flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  이번 주 신규 {getNewThisWeek(getCurrentTotalItems())}개
                </span>
              </>
            )}
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">불러오는 중...</p>
              </div>
            </div>
          ) : filteredCollections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCollections.map((collection, index) => (
                <div
                  key={collection.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <SharedCollectionCard
                    collection={collection}
                    onOpen={handleOpenCollection}
                    onSaveToMyCollections={handleSaveCollectionToMy}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">
                {searchQuery ? "검색 결과가 없습니다." : "아직 공유된 컬렉션이 없습니다."}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Shared Result Detail Dialog */}
      {selectedResult && (
        <SharedResultDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          id={selectedResult}
          title={
            sharedResults.find((r) => r.id === selectedResult)?.title || ""
          }
          category={
            sharedResults.find((r) => r.id === selectedResult)?.category || ""
          }
          prompt={
            sharedResults.find((r) => r.id === selectedResult)?.prompt || ""
          }
          result={
            sharedResults.find((r) => r.id === selectedResult)?.result || ""
          }
          memo={sharedResults.find((r) => r.id === selectedResult)?.memo}
          aiProvider={
            sharedResults.find((r) => r.id === selectedResult)?.ai_provider
          }
          aiModel={
            sharedResults.find((r) => r.id === selectedResult)?.ai_model
          }
          executionTimeMs={
            sharedResults.find((r) => r.id === selectedResult)
              ?.execution_time_ms
          }
          createdAt={
            sharedResults.find((r) => r.id === selectedResult)?.created_at || ""
          }
          viewCount={
            sharedResults.find((r) => r.id === selectedResult)?.view_count || 0
          }
          likeCount={
            sharedResults.find((r) => r.id === selectedResult)?.like_count || 0
          }
          onSaveToMyAssets={handleSaveToMyAssets}
        />
      )}

      {/* Collection View Dialog */}
      <CollectionViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        collection={selectedViewCollection}
        onLoadCollection={getCollectionById}
      />
    </div>
  );
}
