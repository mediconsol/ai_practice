import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Sparkles, MessageSquare, Lightbulb, ClipboardList, Loader2 } from "lucide-react";
import { useCreateProgram } from "@/hooks/usePrograms";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createAIService } from "@/services/ai";
import type { FormField } from "@/lib/supabase";

// 프롬프트 내용에서 의미있는 제목 추출
const generateTitleFromContent = (content: string, maxLength: number = 30): string => {
  if (!content) return "";

  // 첫 줄 또는 첫 문장을 추출
  const firstLine = content.split('\n')[0].trim();
  const firstSentence = firstLine.split(/[.!?。]/)[0].trim();

  // maxLength로 제한
  const title = (firstSentence || firstLine).substring(0, maxLength);

  // 너무 짧으면 조금 더 추가
  if (title.length < 10 && content.length > maxLength) {
    return content.substring(0, maxLength).trim() + '...';
  }

  return title || "제목 없음";
};

interface ConvertToProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promptTitle: string;
  promptContent: string;
  promptCategory: string;
  promptResult?: string | null;
}

export function ConvertToProgramDialog({
  open,
  onOpenChange,
  promptTitle,
  promptContent,
  promptCategory,
  promptResult,
}: ConvertToProgramDialogProps) {
  const [isConverting, setIsConverting] = useState(false);
  const [convertType, setConvertType] = useState<"prompt" | "result">("prompt");
  const [editableTitle, setEditableTitle] = useState("");
  const createProgram = useCreateProgram();
  const navigate = useNavigate();

  const hasResult = !!promptResult;

  // 다이얼로그가 열릴 때 제목 자동 생성
  useEffect(() => {
    if (open) {
      // 기존 제목이 있으면 사용, 없으면 프롬프트 내용에서 생성
      if (promptTitle && promptTitle !== "제목 없음") {
        setEditableTitle(promptTitle);
      } else {
        const autoTitle = generateTitleFromContent(promptContent);
        setEditableTitle(autoTitle);
      }
      // convertType 초기화
      setConvertType("prompt");
    }
  }, [open, promptTitle, promptContent]);

  // AI를 사용해서 결과로부터 form_schema 생성
  const generateFormSchemaFromResult = async (result: string): Promise<FormField[]> => {
    const SYSTEM_PROMPT = `당신은 의료 업무용 폼 스키마 생성 전문가입니다.
사용자가 제공한 결과 데이터를 분석하여 FormField[] 타입의 JSON 스키마를 생성하세요.

FormField 구조:
{
  "id": "field_id",           // snake_case 필드 ID
  "label": "필드 라벨",        // 사용자에게 보여질 한글 라벨
  "type": "text" | "textarea" | "number" | "select" | "date" | "checkbox",
  "required": true | false,
  "placeholder": "입력 힌트",
  "options": ["옵션1", "옵션2"] (select 타입만),
  "validation": { "min": 최소값, "max": 최대값, "pattern": "정규식" }
}

규칙:
1. 반드시 유효한 JSON 배열만 출력
2. 설명 없이 순수 JSON만 출력
3. 결과 데이터의 구조를 분석하여 적절한 필드 생성
4. 의료 업무에 적합한 필드명과 검증 규칙`;

    const aiService = createAIService("openai", "gpt-4o");
    const response = await aiService.chat([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `다음 결과 데이터를 분석하여 입력 폼 스키마를 생성하세요:\n\n${result}` },
    ]);

    // JSON 파싱
    const jsonString = response
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const schema = JSON.parse(jsonString);

    // 스키마 검증
    if (!Array.isArray(schema) || schema.length === 0) {
      throw new Error("Invalid schema: 배열이 아니거나 비어있습니다");
    }

    schema.forEach((field, index) => {
      if (!field.id || !field.label || !field.type) {
        throw new Error(`Invalid field at index ${index}: id, label, type은 필수입니다`);
      }
    });

    return schema;
  };

  const handleConvert = async () => {
    setIsConverting(true);

    try {
      if (convertType === "prompt") {
        // Chat 프로그램으로 생성 (프롬프트를 시스템 프롬프트로 사용)
        createProgram.mutate(
          {
            title: editableTitle,
            description: `내 프롬프트에서 변환된 AI 대화형 프로그램입니다.`,
            category: promptCategory,
            program_type: "chat",
            config: {
              system_prompt: promptContent,
              artifacts_enabled: true,
              ai_provider: "openai",
              ai_model: "gpt-4o",
            },
            icon: "MessageSquare",
            gradient: "from-primary to-info",
            is_public: false,
            is_new: true,
          },
          {
            onSuccess: (program) => {
              toast.success("Chat 프로그램이 생성되었습니다!", {
                description: "Programs 페이지에서 확인하세요",
                action: {
                  label: "바로 실행",
                  onClick: () => navigate(`/programs/${program.id}/run`),
                },
              });
              onOpenChange(false);
            },
            onError: (error: any) => {
              toast.error("프로그램 생성 실패", {
                description: error.message,
              });
            },
          }
        );
      } else {
        // Form 프로그램으로 생성 (AI가 결과를 분석해서 form_schema 생성)
        try {
          // AI로 form_schema 생성
          const formSchema = await generateFormSchemaFromResult(promptResult || "");

          createProgram.mutate(
            {
              title: editableTitle,
              description: `실행 결과에서 자동 생성된 폼 기반 프로그램입니다.`,
              category: promptCategory,
              program_type: "form",
              config: {
                form_schema: formSchema,
              },
              icon: "ClipboardList",
              gradient: "from-success to-primary",
              is_public: false,
              is_new: true,
            },
            {
              onSuccess: (program) => {
                toast.success("Form 프로그램이 생성되었습니다!", {
                  description: `${formSchema.length}개 필드가 자동 생성되었습니다`,
                  action: {
                    label: "바로 실행",
                    onClick: () => navigate(`/programs/${program.id}/run`),
                  },
                });
                onOpenChange(false);
              },
              onError: (error: any) => {
                toast.error("프로그램 생성 실패", {
                  description: error.message,
                });
              },
            }
          );
        } catch (error: any) {
          console.error("Form schema generation error:", error);
          toast.error("폼 스키마 생성 실패", {
            description: error.message || "AI가 결과를 분석하는데 실패했습니다",
          });
        }
      }
    } catch (error) {
      console.error("Convert error:", error);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            프롬프트를 프로그램으로 전환
          </DialogTitle>
          <DialogDescription>
            이 프롬프트를 Chat 대화형 프로그램으로 만들어 다른 사람과 공유할 수 있습니다
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 변환 타입 선택 (결과가 있을 때만) */}
          {hasResult && (
            <div className="space-y-3">
              <Label>어떤 방식으로 프로그램을 만들까요?</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setConvertType("prompt")}
                  className={cn(
                    "flex flex-col items-start gap-2 p-4 rounded-lg border-2 transition-all text-left",
                    convertType === "prompt"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-accent"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <span className="font-medium">프롬프트로 만들기</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Chat 대화형 프로그램 생성
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setConvertType("result")}
                  className={cn(
                    "flex flex-col items-start gap-2 p-4 rounded-lg border-2 transition-all text-left",
                    convertType === "result"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-accent"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-success" />
                    <span className="font-medium">결과로 폼 생성</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Form 프로그램 자동 생성
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* 프롬프트/결과 정보 */}
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg border border-border">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">프롬프트 제목</Label>
              <p className="font-medium">{promptTitle}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">카테고리</Label>
              <p className="text-sm">{promptCategory}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                {convertType === "prompt" ? "프롬프트 내용 (미리보기)" : "결과 내용 (미리보기)"}
              </Label>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {convertType === "prompt" ? promptContent : promptResult}
              </p>
            </div>
          </div>

          {/* 생성될 프로그램 제목 편집 */}
          <div className="space-y-2">
            <Label htmlFor="program-title">생성될 프로그램 제목</Label>
            <Input
              id="program-title"
              value={editableTitle}
              onChange={(e) => setEditableTitle(e.target.value)}
              placeholder="프로그램 제목을 입력하세요"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              제목이 자동으로 생성되었습니다. 원하는 대로 수정할 수 있습니다.
            </p>
          </div>

          {/* 생성될 프로그램 정보 */}
          <div className={cn(
            "space-y-3 p-4 rounded-lg border",
            convertType === "prompt"
              ? "bg-primary/5 border-primary/20"
              : "bg-success/5 border-success/20"
          )}>
            <div className="flex items-start gap-2">
              {convertType === "prompt" ? (
                <MessageSquare className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              ) : (
                <ClipboardList className="w-5 h-5 text-success shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <Label className="text-sm font-semibold">
                  {convertType === "prompt" ? "Chat 대화형 프로그램" : "Form 폼 기반 프로그램"}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {convertType === "prompt"
                    ? "AI와 자유로운 대화가 가능한 프로그램으로 생성됩니다. 시스템 프롬프트로 현재 프롬프트 내용이 사용됩니다."
                    : "AI가 결과를 분석하여 자동으로 입력 폼을 생성합니다. 생성된 폼 필드는 나중에 수정 가능합니다."
                  }
                </p>
              </div>
            </div>
          </div>

          {/* 안내 */}
          <div className="flex items-start gap-2 p-3 bg-accent/50 border border-border rounded-lg">
            <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <div className="font-medium text-foreground mb-1">💡 전환 후 가능한 작업</div>
              <ul className="space-y-1 ml-4 list-disc">
                <li>Programs 페이지에서 바로 실행 가능</li>
                <li>다른 사용자와 공유 (공개 설정 시)</li>
                <li>프로그램 설정에서 AI Provider 변경 가능</li>
                {convertType === "prompt" ? (
                  <li>아티팩트 생성 기능 활용 가능</li>
                ) : (
                  <li>AI가 자동 생성한 폼 필드 사용</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isConverting}
          >
            취소
          </Button>
          <Button onClick={handleConvert} disabled={isConverting}>
            {isConverting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {convertType === "result" ? "AI 분석 중..." : "생성 중..."}
              </>
            ) : (
              "프로그램 만들기"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
