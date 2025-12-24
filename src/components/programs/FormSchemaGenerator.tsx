import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles, Loader2, Lightbulb } from "lucide-react";
import { createAIService } from "@/services/ai";
import type { FormField } from "@/lib/supabase";
import { toast } from "sonner";
import { DynamicFormBuilder } from "@/components/forms/DynamicFormBuilder";

interface FormSchemaGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSchemaGenerated: (schema: FormField[]) => void;
}

const SYSTEM_PROMPT = `당신은 의료 업무용 폼 스키마 생성 전문가입니다.
사용자의 요구사항을 듣고 FormField[] 타입의 JSON 스키마를 생성하세요.

FormField 구조:
{
  "id": "field_id",           // snake_case 필드 ID (예: patient_name, phone_number)
  "label": "필드 라벨",        // 사용자에게 보여질 한글 라벨
  "type": "text" | "textarea" | "number" | "select" | "date" | "checkbox",
  "required": true | false,
  "placeholder": "입력 힌트" (선택사항),
  "options": ["옵션1", "옵션2"] (select 타입인 경우만),
  "validation": {
    "min": 최소값,
    "max": 최대값,
    "pattern": "정규식"
  } (선택사항)
}

규칙:
1. 반드시 유효한 JSON 배열만 출력하세요
2. 설명이나 주석 없이 순수 JSON만 출력
3. 의료 업무에 적합한 필드명과 검증 규칙 사용
4. 필수 입력 필드는 required: true
5. id는 영문 snake_case, label은 한글

예시 입력: "환자 예약 폼. 이름, 전화번호, 예약날짜, 증상 입력"
예시 출력:
[
  {
    "id": "patient_name",
    "label": "환자명",
    "type": "text",
    "required": true,
    "placeholder": "홍길동"
  },
  {
    "id": "phone",
    "label": "전화번호",
    "type": "text",
    "required": true,
    "placeholder": "010-1234-5678",
    "validation": {
      "pattern": "^01[0-9]-[0-9]{4}-[0-9]{4}$"
    }
  },
  {
    "id": "appointment_date",
    "label": "예약 날짜",
    "type": "date",
    "required": true
  },
  {
    "id": "symptoms",
    "label": "증상",
    "type": "textarea",
    "required": true,
    "placeholder": "증상을 자세히 설명해주세요"
  }
]`;

export function FormSchemaGenerator({
  open,
  onOpenChange,
  onSchemaGenerated,
}: FormSchemaGeneratorProps) {
  const [userPrompt, setUserPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSchema, setGeneratedSchema] = useState<FormField[] | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerate = async () => {
    if (!userPrompt.trim()) {
      toast.error("폼 설명을 입력해주세요");
      return;
    }

    setIsGenerating(true);

    try {
      const aiService = createAIService("openai", "gpt-4o");

      const response = await aiService.chat([
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ]);

      // JSON 파싱
      let schema: FormField[];
      try {
        // 코드 블록 제거 (```json ... ```)
        const jsonString = response
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();

        schema = JSON.parse(jsonString);

        // 스키마 검증
        if (!Array.isArray(schema) || schema.length === 0) {
          throw new Error("Invalid schema: 배열이 아니거나 비어있습니다");
        }

        // 각 필드 검증
        schema.forEach((field, index) => {
          if (!field.id || !field.label || !field.type) {
            throw new Error(`Invalid field at index ${index}: id, label, type은 필수입니다`);
          }
        });

        setGeneratedSchema(schema);
        setShowPreview(true);
        toast.success("폼 스키마가 생성되었습니다!");
      } catch (parseError: any) {
        console.error("JSON 파싱 에러:", parseError);
        toast.error("AI 응답을 파싱하는데 실패했습니다", {
          description: "다시 시도해주세요",
        });
        return;
      }
    } catch (error: any) {
      console.error("스키마 생성 실패:", error);
      toast.error("폼 스키마 생성 실패", {
        description: error.message,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirm = () => {
    if (generatedSchema) {
      onSchemaGenerated(generatedSchema);
      handleReset();
      onOpenChange(false);
    }
  };

  const handleReset = () => {
    setUserPrompt("");
    setGeneratedSchema(null);
    setShowPreview(false);
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI로 폼 생성하기
          </DialogTitle>
          <DialogDescription>
            만들고 싶은 폼을 자연어로 설명하면 AI가 자동으로 입력 필드를 생성합니다
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 프롬프트 입력 */}
          {!showPreview && (
            <div className="space-y-3">
              <Label htmlFor="formPrompt">폼 설명</Label>
              <Textarea
                id="formPrompt"
                placeholder="예: 환자 예약 폼을 만들고 싶어요. 이름, 전화번호, 예약날짜, 증상을 입력받고 싶습니다."
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                rows={6}
                className="resize-none"
              />

              {/* 팁 */}
              <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <div className="font-medium text-foreground mb-1">💡 작성 팁</div>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li>필요한 입력 필드명을 구체적으로 나열하세요</li>
                    <li>필드 타입을 명시하면 더 정확합니다 (텍스트, 숫자, 날짜, 드롭다운 등)</li>
                    <li>필수 입력 여부를 알려주세요</li>
                    <li>선택 항목(드롭다운)의 경우 옵션을 나열하세요</li>
                  </ul>
                  <div className="mt-2 text-xs text-primary font-medium">
                    예: "환자 예약 폼. 필수: 이름(텍스트), 전화번호, 예약날짜. 선택: 증상(긴 텍스트), 진료과(내과/외과/소아과 중 선택)"
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 미리보기 */}
          {showPreview && generatedSchema && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>생성된 폼 미리보기</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(false)}
                >
                  다시 생성하기
                </Button>
              </div>
              <div className="border border-border rounded-lg p-6 bg-muted/30">
                <DynamicFormBuilder
                  fields={generatedSchema}
                  onSubmit={(data) => console.log("Preview submit:", data)}
                  isLoading={false}
                />
              </div>
              <div className="flex items-start gap-2 p-3 bg-success/5 border border-success/20 rounded-lg">
                <div className="text-sm text-muted-foreground">
                  ✅ 총 <span className="font-semibold text-foreground">{generatedSchema.length}개 필드</span>가 생성되었습니다.
                  위 미리보기를 확인하고 마음에 드시면 "폼 사용하기"를 클릭하세요.
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            취소
          </Button>
          {!showPreview ? (
            <Button onClick={handleGenerate} disabled={isGenerating || !userPrompt.trim()}>
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  폼 생성하기
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleConfirm}>
              폼 사용하기
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
