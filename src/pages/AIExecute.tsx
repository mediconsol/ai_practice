import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  Copy,
  RotateCcw,
  History,
  Wand2,
  Save,
  ExternalLink,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useExecuteAI } from "@/hooks/useExecuteAI";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const quickPrompts = [
  {
    title: "환자 안내문",
    prompt: "당뇨병 환자를 위한 식이요법 안내문을 작성해주세요. 환자가 이해하기 쉽게 작성하고, 권장 식단과 피해야 할 음식을 표로 정리해주세요."
  },
  {
    title: "SOAP 정리",
    prompt: "다음 진료 내용을 SOAP 형식으로 정리해주세요:\n\n67세 남자, 가슴 통증 호소. 3일 전부터 시작, 활동 시 악화. 과거력: 고혈압 10년. 혈압 160/95, 심박수 88. 심전도 검사 결과 정상. 협심증 의심. 니트로글리세린 처방, 심장내과 의뢰."
  },
  {
    title: "처방 안내",
    prompt: "아스피린 100mg (혈전 예방용) 처방에 대한 환자 안내문을 작성해주세요. 복용 방법, 주의사항, 부작용을 포함해주세요."
  },
  {
    title: "간호 기록",
    prompt: "입원 환자(72세 여성, 폐렴)의 간호 기록을 작성해주세요. 2024-01-15 14:00 활력징후 측정, 발열 38.5도, 해열제 투여, 30분 후 37.2도로 하강."
  },
];

const aiProviders = [
  {
    name: "ChatGPT",
    description: "OpenAI GPT-4o-mini",
    available: true,
    provider: "openai" as const,
    model: "gpt-4o-mini"
  },
  {
    name: "Gemini",
    description: "Google Gemini 2.5 Flash",
    available: true,
    provider: "gemini" as const,
    model: "gemini-2.5-flash"
  },
  {
    name: "Claude",
    description: "Anthropic Claude 3.5",
    available: true,
    provider: "claude" as const,
    model: "claude-3-5-sonnet-20241022"
  },
];

export default function AIExecute() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [selectedProvider, setSelectedProvider] = useState(aiProviders[0]);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [tokenUsage, setTokenUsage] = useState<any>(null);
  const [isImproving, setIsImproving] = useState(false);

  const executeAI = useExecuteAI();

  const handleExecute = async () => {
    if (!prompt.trim()) {
      toast.error('프롬프트를 입력해주세요');
      return;
    }

    try {
      setResult(""); // 이전 결과 초기화
      setExecutionTime(null);
      setTokenUsage(null);

      const response = await executeAI.mutateAsync({
        prompt: prompt,
        provider: selectedProvider.provider,
        model: selectedProvider.model,
      });

      if (response.success && response.result) {
        setResult(response.result);
        setExecutionTime(response.durationMs || 0);
        setTokenUsage(response.tokenUsage);
      } else {
        throw new Error(response.error || '알 수 없는 오류가 발생했습니다.');
      }
    } catch (error: any) {
      console.error('AI execution error:', error);
      setResult('');
      toast.error('AI 실행 실패', {
        description: error.message || '오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      });
    }
  };

  const handleCopyForExternal = () => {
    if (!prompt.trim()) {
      toast.error('복사할 프롬프트가 없습니다');
      return;
    }
    navigator.clipboard.writeText(prompt);
    toast.success('프롬프트를 클립보드에 복사했습니다');
  };

  const handleCopyResult = () => {
    if (!result) {
      toast.error('복사할 결과가 없습니다');
      return;
    }
    navigator.clipboard.writeText(result);
    toast.success('결과를 클립보드에 복사했습니다');
  };

  const handleRetry = () => {
    handleExecute();
  };

  const handleImprovePrompt = async () => {
    if (!prompt.trim()) {
      toast.error('개선할 프롬프트를 입력해주세요');
      return;
    }

    setIsImproving(true);
    try {
      const response = await executeAI.mutateAsync({
        prompt: `다음 프롬프트를 더 명확하고 구체적이며 효과적으로 개선해주세요. 개선된 프롬프트만 출력하고, 설명이나 부가 설명은 생략하세요:

${prompt}`,
        provider: selectedProvider.provider,
        model: selectedProvider.model,
      });

      if (response.success && response.result) {
        setPrompt(response.result.trim());
        toast.success('프롬프트가 개선되었습니다');
      } else {
        throw new Error(response.error || '프롬프트 개선에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('Prompt improvement error:', error);
      toast.error('프롬프트 개선 실패', {
        description: error.message || '오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      });
    } finally {
      setIsImproving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground mb-1">AI 실행</h1>
        <p className="text-muted-foreground">
          프롬프트를 실행하고 결과를 확인하세요. 내부 AI 또는 외부 AI에서 실행할 수 있습니다.
        </p>
      </div>

      {/* Quick Prompts */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 animate-fade-in">
        <span className="text-sm text-muted-foreground shrink-0">빠른 시작:</span>
        {quickPrompts.map((item) => (
          <Button
            key={item.title}
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => setPrompt(item.prompt)}
          >
            {item.title}
          </Button>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4 animate-fade-in">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-card-foreground">프롬프트 입력</h2>
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                <History className="w-4 h-4" />
                히스토리
              </Button>
            </div>
            
            <Textarea
              placeholder="AI에게 요청할 내용을 입력하세요...

예시:
• 당뇨병 환자를 위한 식이요법 안내문을 작성해주세요.
• 다음 진료 내용을 SOAP 형식으로 정리해주세요.
• 이 논문의 핵심 내용을 3줄로 요약해주세요.

💡 변수는 {변수명} 형식으로 입력하면 나중에 재사용할 수 있습니다."
              className="min-h-[280px] resize-none bg-background"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={handleImprovePrompt}
                  disabled={!prompt.trim() || isImproving || executeAI.isPending}
                >
                  <Wand2 className="w-4 h-4" />
                  {isImproving ? "개선 중..." : "프롬프트 개선"}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5"
                  onClick={handleCopyForExternal}
                  disabled={!prompt.trim()}
                >
                  <ExternalLink className="w-4 h-4" />
                  외부 AI용 복사
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      {selectedProvider.name}
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {aiProviders.map((provider) => (
                      <DropdownMenuItem 
                        key={provider.name}
                        onClick={() => provider.available && setSelectedProvider(provider)}
                        disabled={!provider.available}
                        className={cn(!provider.available && "opacity-50")}
                      >
                        <div>
                          <p className="font-medium">{provider.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {provider.description}
                            {!provider.available && " (준비 중)"}
                          </p>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button
                  onClick={handleExecute}
                  disabled={!prompt.trim() || executeAI.isPending}
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {executeAI.isPending ? "생성 중..." : "실행"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div className="bg-card rounded-xl border border-border p-5 min-h-[400px]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-card-foreground">실행 결과</h2>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={!result}
                  onClick={handleCopyResult}
                  title="결과 복사"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={!result || executeAI.isPending}
                  onClick={handleRetry}
                  title="다시 실행"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className={cn(
              "min-h-[280px] rounded-lg p-4",
              result ? "bg-accent/50" : "bg-muted/30 flex items-center justify-center"
            )}>
              {executeAI.isPending ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">
                    {selectedProvider.name}에서 응답을 생성하고 있습니다...
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    AI 모델: {selectedProvider.model}
                  </p>
                </div>
              ) : result ? (
                <div className="prose prose-base max-w-none dark:prose-invert prose-slate prose-headings:font-bold prose-headings:text-foreground prose-p:text-card-foreground prose-strong:text-foreground prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:not-italic prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-table:border-collapse prose-th:border prose-th:border-border prose-th:bg-muted prose-th:px-4 prose-th:py-2 prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-2 prose-ul:list-disc prose-ol:list-decimal prose-li:text-card-foreground">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // 코드 블록 커스터마이징
                      code({className, children, ...props}: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        return match ? (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                      // 표 커스터마이징
                      table({children}: any) {
                        return (
                          <div className="overflow-x-auto my-4">
                            <table className="min-w-full">{children}</table>
                          </div>
                        );
                      },
                      // 인용구 커스터마이징
                      blockquote({children}: any) {
                        return (
                          <blockquote className="border-l-4 pl-4 py-2 my-4">
                            {children}
                          </blockquote>
                        );
                      },
                    }}
                  >
                    {result}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="text-center">
                  <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">프롬프트를 입력하고 실행하면</p>
                  <p className="text-muted-foreground">결과가 여기에 표시됩니다.</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    외부 AI에서 실행하려면 "외부 AI용 복사" 버튼을 사용하세요.
                  </p>
                </div>
              )}
            </div>

            {result && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">
                    생성 시간: {executionTime ? `${(executionTime / 1000).toFixed(2)}초` : '-'} • {selectedProvider.name}
                  </span>
                  {tokenUsage && (
                    <span className="text-xs text-muted-foreground/60">
                      토큰: {tokenUsage.total_tokens?.toLocaleString() || '-'}
                      {' '}(입력: {tokenUsage.prompt_tokens?.toLocaleString() || '-'},
                      {' '}출력: {tokenUsage.completion_tokens?.toLocaleString() || '-'})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Save className="w-4 h-4" />
                    프롬프트 자산으로 저장
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
