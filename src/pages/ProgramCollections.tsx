import { useState, useEffect } from "react";
import { Sparkles, ChevronDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CodeEditor } from "@/components/collections/CodeEditor";
import { PreviewPane } from "@/components/collections/PreviewPane";
import { SaveCollectionDialog } from "@/components/collections/SaveCollectionDialog";
import { CollectionList } from "@/components/collections/CollectionList";
import { CollectionViewDialog } from "@/components/collections/CollectionViewDialog";
import { isClaudeArtifactUrl, extractArtifactUrl, isHtmlCode, isPythonCode, isReactCode } from "@/lib/urlDetector";
import { useCollections } from "@/hooks/useCollections";
import type { CreateCollectionInput, Collection } from "@/types/collection";
import { toast } from "sonner";

export default function ProgramCollections() {
  const [sourceCode, setSourceCode] = useState("");
  const [previewMode, setPreviewMode] = useState<'html' | 'artifact' | 'python' | 'react' | 'none'>('none');
  const [artifactUrl, setArtifactUrl] = useState("");
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<'editor' | 'list'>('editor');
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedViewCollection, setSelectedViewCollection] = useState<Collection | null>(null);

  const { collections, saveCollection, deleteCollection, getCollectionById } = useCollections();

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground mb-1">프로그램 수집함</h1>
        <p className="text-muted-foreground">
          AI 도구에서 생성한 프로그램을 실행하고 보관하세요 (HTML 권장, React/Python 제한적)
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
      <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as 'editor' | 'list')} className="animate-fade-in" style={{ animationDelay: "100ms" }}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="editor">에디터</TabsTrigger>
          <TabsTrigger value="list">
            저장된 목록 ({collections.length})
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

        <TabsContent value="list" className="mt-6">
          <CollectionList
            collections={collections}
            onOpen={handleOpenCollection}
            onDelete={deleteCollection}
          />
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
    </div>
  );
}
