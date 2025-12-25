import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Sparkles, ChevronDown, Share2, Search, Grid, List, Code } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CodeEditor } from "@/components/collections/CodeEditor";
import { PreviewPane } from "@/components/collections/PreviewPane";
import { SaveCollectionDialog } from "@/components/collections/SaveCollectionDialog";
import { ShareCollectionDialog } from "@/components/collections/ShareCollectionDialog";
import { CollectionList } from "@/components/collections/CollectionList";
import { SharedCollectionCard } from "@/components/collections/SharedCollectionCard";
import { CollectionViewDialog } from "@/components/collections/CollectionViewDialog";
import { isClaudeArtifactUrl, extractArtifactUrl, isHtmlCode, isPythonCode, isReactCode } from "@/lib/urlDetector";
import {
  useCollections,
  useSharedCollections,
  useToggleCollectionShare,
  useSaveSharedCollectionToMy,
} from "@/hooks/useCollections";
import type { CreateCollectionInput, Collection } from "@/types/collection";
import { COLLECTION_CATEGORIES } from "@/types/collection";
import { toast } from "sonner";

type SortOption = "latest" | "popular" | "likes" | "views";

export default function ProgramCollections() {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [sourceCode, setSourceCode] = useState("");
  const [previewMode, setPreviewMode] = useState<'html' | 'artifact' | 'python' | 'react' | 'none'>('none');
  const [artifactUrl, setArtifactUrl] = useState("");
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<'editor' | 'my-collections' | 'shared-collections'>(
    tabParam === "shared" ? "shared-collections" : "editor"
  );
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedViewCollection, setSelectedViewCollection] = useState<Collection | null>(null);

  // Phase 2: 공유 관련 state
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [collectionToShare, setCollectionToShare] = useState<{ id: string; title: string; isShared: boolean } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { collections, saveCollection, deleteCollection, getCollectionById } = useCollections();
  const { data: sharedCollections = [], isLoading: isLoadingShared } = useSharedCollections();
  const toggleShare = useToggleCollectionShare();
  const saveSharedToMy = useSaveSharedCollectionToMy();

  // 자동 감지 로직
  useEffect(() => {
    const trimmed = sourceCode.trim();

    if (!trimmed) {
      setPreviewMode('none');
      setArtifactUrl('');
      return;
    }

    // Claude Artifact URL 감지
    if (isClaudeArtifactUrl(trimmed)) {
      const url = extractArtifactUrl(trimmed);
      if (url) {
        setPreviewMode('artifact');
        setArtifactUrl(url);
        return;
      }
    }

    // React/JSX 코드 감지 (HTML보다 먼저 체크)
    if (isReactCode(trimmed)) {
      setPreviewMode('react');
      setArtifactUrl('');
      return;
    }

    // HTML 코드 감지
    if (isHtmlCode(trimmed)) {
      setPreviewMode('html');
      setArtifactUrl('');
      return;
    }

    // Python 코드 감지
    if (isPythonCode(trimmed)) {
      setPreviewMode('python');
      setArtifactUrl('');
      return;
    }

    // 그 외
    setPreviewMode('none');
    setArtifactUrl('');
  }, [sourceCode]);

  const handleSave = () => {
    setIsSaveDialogOpen(true);
  };

  const handleSaveCollection = async (data: CreateCollectionInput) => {
    await saveCollection(data);
    setIsSaveDialogOpen(false);
  };

  const handleOpenCollection = (collection: Collection) => {
    setSelectedViewCollection(collection);
    setViewDialogOpen(true);
  };

  // Phase 2: 공유 관련 핸들러
  const handleToggleShare = (id: string, currentShared: boolean) => {
    const collection = collections.find((c) => c.id === id);
    if (!collection) return;

    if (currentShared) {
      // 공유 취소
      if (window.confirm("공유를 취소하시겠습니까?")) {
        toggleShare.mutate({ id, isShared: currentShared });
      }
    } else {
      // 공유하기 - 다이얼로그 표시
      setCollectionToShare({
        id,
        title: collection.title,
        isShared: currentShared,
      });
      setShareDialogOpen(true);
    }
  };

  const handleConfirmShare = () => {
    if (collectionToShare) {
      toggleShare.mutate({ id: collectionToShare.id, isShared: collectionToShare.isShared });
    }
  };

  const handleSaveSharedToMy = (id: string) => {
    saveSharedToMy.mutate(id);
  };

  // 공유 컬렉션 필터링 및 정렬
  const filteredSharedCollections = sharedCollections
    .filter((collection) => {
      const matchesCategory =
        selectedCategory === "전체" || collection.category === selectedCategory;
      const matchesSearch =
        collection.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (collection.memo && collection.memo.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "latest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "popular":
          // 인기도 = 좋아요 * 2 + 조회수
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground mb-1">AI소스 수집함</h1>
        <p className="text-muted-foreground">
          AI 도구에서 생성한 소스코드를 실행하고 보관하세요 (HTML 권장, React/Python 제한적)
        </p>
      </div>

      {/* Info Card */}
      <Collapsible open={isInfoOpen} onOpenChange={setIsInfoOpen}>
        <div className="bg-accent/50 border border-primary/20 rounded-xl p-5 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <CollapsibleTrigger className="w-full text-left group">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold mb-1">이 기능이 왜 필요한가요?</h3>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isInfoOpen ? 'rotate-180' : ''}`} />
                </div>
              </CollapsibleTrigger>
              <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                ChatGPT, Gemini 등 AI 도구는 HTML/React/Python으로 인터랙티브한 프로그램을 만들어주지만,
                이를 실행하고 보관할 곳이 없어 매번 복사/붙여넣기 해야 합니다.
                또한 Claude Artifacts는 Claude 플랫폼에서만 볼 수 있어 따로 보관하기 어렵습니다.
              </p>
              <CollapsibleContent className="mt-3">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <strong>💡 사용 방법:</strong>
                    </p>
                    <ul className="text-sm text-muted-foreground mt-2 ml-4 space-y-1.5">
                      <li>
                        <strong>HTML:</strong> AI가 생성한 HTML 코드를 복사해서 붙여넣기
                        <br />
                        <span className="text-xs text-muted-foreground/80">
                          → 가장 안정적이고 빠릅니다. 복잡한 앱은 HTML로 구현 권장
                        </span>
                      </li>
                      <li>
                        <strong>React:</strong> 간단한 UI 컴포넌트만 지원 (외부 라이브러리 불가)
                        <br />
                        <span className="text-xs text-muted-foreground/80">
                          → 복잡한 앱은 Claude에게 "HTML로 구현해줘"라고 요청하세요
                        </span>
                      </li>
                      <li>
                        <strong>Python:</strong> 간단한 스크립트와 데이터 분석용
                        <br />
                        <span className="text-xs text-muted-foreground/80">
                          → NumPy, Pandas 등 기본 라이브러리만 지원
                        </span>
                      </li>
                      <li>
                        <strong>Claude Artifact:</strong> Claude에서 "산출물 게시" → "임베딩 가져오기"
                        <br />
                        <span className="text-xs text-destructive/80 font-medium">
                          ⚠️ 중요: *.mediconsol.com 도메인만 허용되도록 설정해야 합니다
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <strong>✅ 권장하는 사용법:</strong>
                    </p>
                    <ol className="text-sm text-muted-foreground mt-2 ml-4 space-y-1 list-decimal">
                      <li>간단한 도구 → HTML로 구현 요청</li>
                      <li>복잡한 앱 → Claude Artifact로 만들고 임베딩</li>
                      <li>데이터 분석 → Python 스크립트</li>
                      <li>빠른 프로토타입 → React (제한적)</li>
                    </ol>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </div>
        </div>
      </Collapsible>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as 'editor' | 'my-collections' | 'shared-collections')} className="animate-fade-in" style={{ animationDelay: "100ms" }}>
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="editor" className="gap-2">
            <Code className="w-4 h-4 text-info" />
            에디터
          </TabsTrigger>
          <TabsTrigger value="my-collections" className="gap-2">
            <Sparkles className="w-4 h-4 text-warning" />
            저장목록 ({collections.length})
          </TabsTrigger>
          <TabsTrigger value="shared-collections" className="gap-2">
            <Share2 className="w-4 h-4 text-success" />
            공유목록
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="mt-6">
          {/* 2-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Code Editor */}
            <div className="bg-card rounded-xl border border-border p-5 min-h-[600px]">
              <CodeEditor
                sourceCode={sourceCode}
                setSourceCode={setSourceCode}
                onSave={handleSave}
              />
            </div>

            {/* Right: Preview Pane */}
            <div className="bg-card rounded-xl border border-border p-5 min-h-[600px]">
              <div className="mb-3">
                <h2 className="font-semibold text-card-foreground">미리보기</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  샌드박스 환경에서 안전하게 실행됩니다
                </p>
              </div>
              <div className="h-[calc(100%-60px)]">
                <PreviewPane
                  sourceCode={sourceCode}
                  previewMode={previewMode}
                  artifactUrl={artifactUrl}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="my-collections" className="mt-6">
          <CollectionList
            collections={collections}
            onOpen={handleOpenCollection}
            onDelete={deleteCollection}
            onToggleShare={handleToggleShare}
          />
        </TabsContent>

        {/* 공유 컬렉션 탭 */}
        <TabsContent value="shared-collections" className="space-y-4 mt-6">
          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Category Select */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="카테고리" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="전체">전체</SelectItem>
                {COLLECTION_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="공유 컬렉션 검색..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* View Mode */}
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

          {/* Sort Options */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-sm font-medium text-muted-foreground shrink-0">
              정렬:
            </span>
            <Button
              variant={sortBy === "latest" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("latest")}
              className="shrink-0"
            >
              최신순
            </Button>
            <Button
              variant={sortBy === "popular" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("popular")}
              className="shrink-0"
            >
              인기순
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

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{filteredSharedCollections.length}개 공유 컬렉션</span>
            <span>•</span>
            <span>
              총 조회수{" "}
              {filteredSharedCollections.reduce((acc, c) => acc + c.view_count, 0)}
            </span>
          </div>

          {/* Shared Collections Grid */}
          {isLoadingShared ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                공유 컬렉션을 불러오는 중...
              </p>
            </div>
          ) : filteredSharedCollections.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory !== "전체"
                  ? "검색 결과가 없습니다."
                  : "공유된 컬렉션이 없습니다."}
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
              {filteredSharedCollections.map((collection, index) => (
                <div
                  key={collection.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <SharedCollectionCard
                    collection={collection}
                    onOpen={handleOpenCollection}
                    onSaveToMyCollections={handleSaveSharedToMy}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Save Collection Dialog */}
      <SaveCollectionDialog
        open={isSaveDialogOpen}
        onOpenChange={setIsSaveDialogOpen}
        sourceCode={sourceCode}
        previewMode={previewMode === 'none' ? 'html' : previewMode}
        artifactUrl={artifactUrl}
        onSave={handleSaveCollection}
      />

      {/* Collection View Dialog */}
      <CollectionViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        collection={selectedViewCollection}
        onLoadCollection={getCollectionById}
      />

      {/* Share Collection Dialog */}
      <ShareCollectionDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        title={collectionToShare?.title || ""}
        onConfirm={handleConfirmShare}
      />
    </div>
  );
}
