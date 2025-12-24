import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProgramTemplate } from "@/lib/supabase";

interface TemplateSelectorProps {
  templates: ProgramTemplate[];
  selectedTemplate: ProgramTemplate | null;
  onSelectTemplate: (template: ProgramTemplate) => void;
}

export function TemplateSelector({
  templates,
  selectedTemplate,
  onSelectTemplate,
}: TemplateSelectorProps) {
  if (!templates || templates.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>사용 가능한 템플릿이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">템플릿 선택</h3>
        <p className="text-sm text-muted-foreground">
          사용할 템플릿을 선택하세요. 선택 후 AI와 대화하며 내용을 수정할 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => {
          const isSelected = selectedTemplate?.id === template.id;

          return (
            <Card
              key={template.id}
              className={cn(
                "p-4 cursor-pointer transition-all hover:shadow-md",
                isSelected && "border-primary bg-primary/5"
              )}
              onClick={() => onSelectTemplate(template)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold flex items-center gap-2">
                    {template.name}
                    {isSelected && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </h4>
                  {template.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Preview snippet */}
              <div className="mt-3 p-3 bg-muted/50 rounded-md text-xs font-mono overflow-hidden">
                <div className="line-clamp-3 whitespace-pre-wrap">
                  {template.content.substring(0, 150)}...
                </div>
              </div>

              {/* Variables */}
              {template.variables && template.variables.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {template.variables.map((variable) => (
                    <span
                      key={variable}
                      className="text-xs px-2 py-0.5 rounded-md bg-accent text-accent-foreground"
                    >
                      {variable}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {selectedTemplate && (
        <div className="pt-4 border-t">
          <Button
            onClick={() => {}}
            disabled={!selectedTemplate}
            className="w-full"
          >
            이 템플릿으로 시작하기
          </Button>
        </div>
      )}
    </div>
  );
}
