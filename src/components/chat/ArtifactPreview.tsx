import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download, X, Code, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Artifact } from "./types";
import { toast } from "sonner";

interface ArtifactPreviewProps {
  artifact: Artifact | null;
  onClose: () => void;
}

export function ArtifactPreview({ artifact, onClose }: ArtifactPreviewProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");

  if (!artifact) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(artifact.content);
    toast.success("복사되었습니다");
  };

  const handleDownload = () => {
    const blob = new Blob([artifact.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${artifact.title || "artifact"}.${getFileExtension(artifact.type)}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("다운로드되었습니다");
  };

  const getFileExtension = (type: string) => {
    switch (type) {
      case "html":
        return "html";
      case "markdown":
        return "md";
      case "code":
        return artifact.language || "txt";
      case "mermaid":
        return "mmd";
      default:
        return "txt";
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{artifact.title || "아티팩트"}</h2>
          <p className="text-sm text-muted-foreground">
            {artifact.type === "html" && "HTML 문서"}
            {artifact.type === "markdown" && "마크다운 문서"}
            {artifact.type === "code" && `코드 (${artifact.language || "text"})`}
            {artifact.type === "mermaid" && "Mermaid 다이어그램"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-2" />
            복사
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            다운로드
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "preview" | "code")} className="h-full flex flex-col">
          <TabsList className="mx-4 mt-4">
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="w-4 h-4" />
              미리보기
            </TabsTrigger>
            <TabsTrigger value="code" className="gap-2">
              <Code className="w-4 h-4" />
              소스 코드
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="flex-1 m-0 p-4 overflow-auto">
            {artifact.type === "html" && (
              <iframe
                srcDoc={artifact.content}
                className="w-full h-full border border-border rounded-lg bg-white"
                sandbox="allow-scripts"
                title="HTML Preview"
              />
            )}
            {artifact.type === "markdown" && (
              <div className="prose prose-sm max-w-none dark:prose-invert p-4 border border-border rounded-lg bg-card">
                <pre className="whitespace-pre-wrap">{artifact.content}</pre>
              </div>
            )}
            {artifact.type === "code" && (
              <pre className="p-4 border border-border rounded-lg bg-muted overflow-auto">
                <code className="text-sm">{artifact.content}</code>
              </pre>
            )}
            {artifact.type === "mermaid" && (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Mermaid 렌더링은 아직 지원하지 않습니다
              </div>
            )}
          </TabsContent>

          <TabsContent value="code" className="flex-1 m-0 p-4 overflow-auto">
            <pre className="p-4 border border-border rounded-lg bg-muted overflow-auto h-full">
              <code className="text-sm font-mono">{artifact.content}</code>
            </pre>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
