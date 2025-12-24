import { useState } from "react";
import { DynamicFormBuilder } from "@/components/forms/DynamicFormBuilder";
import { FormOutputRenderer } from "@/components/forms/FormOutputRenderer";
import { createAIService } from "@/services/ai";
import type { FormField, AIProvider } from "@/lib/supabase";
import { ClipboardList, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface FormProgramRunnerProps {
  programId: string;
  programTitle: string;
  formSchema: FormField[];
  outputTemplate?: string;
  systemPrompt?: string;
  aiProvider?: AIProvider;
  aiModel?: string;
}

export function FormProgramRunner({
  programId,
  programTitle,
  formSchema,
  outputTemplate,
  systemPrompt,
  aiProvider = 'openai',
  aiModel,
}: FormProgramRunnerProps) {
  const [output, setOutput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: Record<string, any>) => {
    setIsLoading(true);
    setOutput(null);

    try {
      // AI 서비스 생성
      const aiService = createAIService(aiProvider, aiModel);

      // 폼 데이터를 텍스트로 변환
      const formDataText = Object.entries(formData)
        .map(([key, value]) => {
          const field = formSchema.find(f => f.id === key);
          const label = field?.label || key;
          return `${label}: ${value}`;
        })
        .join('\n');

      // 프롬프트 구성
      const userPrompt = outputTemplate
        ? `다음 정보를 바탕으로 ${outputTemplate}을(를) 작성해주세요:\n\n${formDataText}`
        : `다음 정보를 바탕으로 문서를 작성해주세요:\n\n${formDataText}`;

      const messages = [
        ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
        { role: 'user' as const, content: userPrompt },
      ];

      // AI 호출 (Non-streaming)
      const result = await aiService.chat(messages);

      setOutput(result);
      toast.success('문서가 생성되었습니다');
    } catch (error: any) {
      console.error('문서 생성 실패:', error);
      toast.error('문서 생성 실패', {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setOutput(null);
  };

  if (!formSchema || formSchema.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>폼 스키마가 설정되지 않았습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-3xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center pb-6 border-b border-border">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{programTitle}</h2>
          <p className="text-muted-foreground">
            아래 폼을 작성하고 생성 버튼을 클릭하세요
          </p>
        </div>

        {/* Form or Output */}
        {!output ? (
          <div className="bg-card border border-border rounded-lg p-6">
            <DynamicFormBuilder
              fields={formSchema}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              submitButtonText="문서 생성하기"
            />
          </div>
        ) : (
          <div>
            <FormOutputRenderer
              output={output}
              title={programTitle}
              format="text"
            />
            <div className="mt-4 text-center">
              <button
                onClick={handleReset}
                className="text-primary hover:underline text-sm"
              >
                ← 새로운 문서 작성하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
