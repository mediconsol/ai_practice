import { useState } from "react";
import { TemplateSelector } from "@/components/templates/TemplateSelector";
import { TemplateEditor } from "@/components/templates/TemplateEditor";
import { FormOutputRenderer } from "@/components/forms/FormOutputRenderer";
import type { ProgramTemplate, AIProvider } from "@/lib/supabase";
import { FileText, Sparkles } from "lucide-react";

interface TemplateProgramRunnerProps {
  programId: string;
  programTitle: string;
  templates: ProgramTemplate[];
  systemPrompt?: string;
  aiProvider?: AIProvider;
  aiModel?: string;
}

type ViewMode = 'select' | 'edit' | 'result';

export function TemplateProgramRunner({
  programId,
  programTitle,
  templates,
  systemPrompt,
  aiProvider = 'openai',
  aiModel,
}: TemplateProgramRunnerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('select');
  const [selectedTemplate, setSelectedTemplate] = useState<ProgramTemplate | null>(null);
  const [finalContent, setFinalContent] = useState<string | null>(null);

  const handleSelectTemplate = (template: ProgramTemplate) => {
    setSelectedTemplate(template);
  };

  const handleStartEditing = () => {
    if (selectedTemplate) {
      setViewMode('edit');
    }
  };

  const handleBackToSelect = () => {
    setViewMode('select');
    setSelectedTemplate(null);
  };

  const handleComplete = (content: string) => {
    setFinalContent(content);
    setViewMode('result');
  };

  const handleReset = () => {
    setViewMode('select');
    setSelectedTemplate(null);
    setFinalContent(null);
  };

  if (!templates || templates.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>템플릿이 설정되지 않았습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden flex flex-col">
      {viewMode === 'select' && (
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="text-center pb-6 border-b border-border">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{programTitle}</h2>
              <p className="text-muted-foreground">
                템플릿을 선택하고 AI와 함께 내용을 수정하세요
              </p>
            </div>

            {/* Template Selector */}
            <div className="bg-card border border-border rounded-lg p-6">
              <TemplateSelector
                templates={templates}
                selectedTemplate={selectedTemplate}
                onSelectTemplate={handleSelectTemplate}
              />
              {selectedTemplate && (
                <div className="mt-4 pt-4 border-t">
                  <button
                    onClick={handleStartEditing}
                    className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    이 템플릿으로 시작하기
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'edit' && selectedTemplate && (
        <TemplateEditor
          template={selectedTemplate}
          systemPrompt={systemPrompt}
          aiProvider={aiProvider}
          aiModel={aiModel}
          onBack={handleBackToSelect}
          onComplete={handleComplete}
        />
      )}

      {viewMode === 'result' && finalContent && (
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-6">
            <FormOutputRenderer
              output={finalContent}
              title={selectedTemplate?.name || programTitle}
              format="text"
            />
            <div className="mt-6 text-center">
              <button
                onClick={handleReset}
                className="text-primary hover:underline text-sm"
              >
                ← 새로운 문서 작성하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
