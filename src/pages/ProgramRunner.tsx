import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";
import { ChatProgramRunner } from "@/components/programs/ChatProgramRunner";
import { FormProgramRunner } from "@/components/programs/FormProgramRunner";
import { TemplateProgramRunner } from "@/components/programs/TemplateProgramRunner";
import { useIncrementProgramUsage } from "@/hooks/usePrograms";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type Program = Database['public']['Tables']['programs']['Row'];

export default function ProgramRunner() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const incrementUsage = useIncrementProgramUsage();

  const { data: program, isLoading } = useQuery({
    queryKey: ['program', id],
    queryFn: async () => {
      if (!id) throw new Error('Program ID is required');

      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Program;
    },
    enabled: !!id,
  });

  // 프로그램 사용 횟수 증가
  useEffect(() => {
    if (program?.id) {
      incrementUsage.mutate(program.id);
    }
  }, [program?.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">프로그램을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">프로그램을 찾을 수 없습니다</h1>
          <p className="text-muted-foreground">존재하지 않거나 삭제된 프로그램입니다.</p>
        </div>
      </div>
    );
  }

  // 프로그램 타입에 따라 다른 컴포넌트 렌더링
  return (
    <div className="min-h-screen h-screen bg-background flex flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="border-b border-border bg-card shrink-0">
        <div className="px-4 py-3 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/programs")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">{program.title}</h1>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="px-2 py-0.5 rounded-md bg-accent">{program.category}</span>
              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                {program.program_type === 'chat' && 'AI 대화형'}
                {program.program_type === 'form' && '폼 기반'}
                {program.program_type === 'template' && '템플릿 기반'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 프로그램 실행 영역 */}
      <div className="flex-1 overflow-hidden">
        {program.program_type === 'chat' && (
          <ChatProgramRunner
            programId={program.id}
            programTitle={program.title}
            systemPrompt={program.config?.system_prompt}
            aiProvider={(program.config?.ai_provider as any) || 'openai'}
            aiModel={program.config?.ai_model}
          />
        )}
        {program.program_type === 'form' && (
          <FormProgramRunner
            programId={program.id}
            programTitle={program.title}
            formSchema={program.config?.form_schema || []}
            outputTemplate={program.config?.output_template}
            systemPrompt={program.config?.system_prompt}
            aiProvider={(program.config?.ai_provider as any) || 'openai'}
            aiModel={program.config?.ai_model}
          />
        )}
        {program.program_type === 'template' && (
          <TemplateProgramRunner
            programId={program.id}
            programTitle={program.title}
            templates={program.config?.templates || []}
            systemPrompt={program.config?.system_prompt}
            aiProvider={(program.config?.ai_provider as any) || 'openai'}
            aiModel={program.config?.ai_model}
          />
        )}
      </div>
    </div>
  );
}
