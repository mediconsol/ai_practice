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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useUpdateProgram } from "@/hooks/usePrograms";
import type { ProgramType, FormField } from "@/lib/supabase";
import {
  FileText,
  MessageSquare,
  BookOpen,
  ClipboardList,
  Stethoscope,
  Users,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FormSchemaGenerator } from "./FormSchemaGenerator";
import { toast } from "sonner";

interface EditProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program: {
    id: string;
    title: string;
    description: string | null;
    category: string;
    program_type: ProgramType;
    icon: string;
    gradient: string;
    is_public: boolean;
    is_new: boolean;
    config: any;
  };
}

const iconOptions: { name: string; icon: LucideIcon; label: string }[] = [
  { name: "FileText", icon: FileText, label: "문서" },
  { name: "MessageSquare", icon: MessageSquare, label: "메시지" },
  { name: "BookOpen", icon: BookOpen, label: "책" },
  { name: "ClipboardList", icon: ClipboardList, label: "체크리스트" },
  { name: "Stethoscope", icon: Stethoscope, label: "청진기" },
  { name: "Users", icon: Users, label: "사용자" },
  { name: "Sparkles", icon: Sparkles, label: "스파클" },
];

const gradientOptions = [
  { value: "from-primary to-info", label: "파랑", preview: "bg-gradient-to-br from-primary to-info" },
  { value: "from-success to-primary", label: "초록-파랑", preview: "bg-gradient-to-br from-success to-primary" },
  { value: "from-warning to-destructive", label: "노랑-빨강", preview: "bg-gradient-to-br from-warning to-destructive" },
  { value: "from-info to-primary", label: "하늘-파랑", preview: "bg-gradient-to-br from-info to-primary" },
  { value: "from-primary to-success", label: "파랑-초록", preview: "bg-gradient-to-br from-primary to-success" },
  { value: "from-destructive to-warning", label: "빨강-노랑", preview: "bg-gradient-to-br from-destructive to-warning" },
  { value: "from-info to-success", label: "하늘-초록", preview: "bg-gradient-to-br from-info to-success" },
  { value: "from-warning to-primary", label: "노랑-파랑", preview: "bg-gradient-to-br from-warning to-primary" },
];

const categoryOptions = [
  "문서 처리",
  "환자 커뮤니케이션",
  "문서 작성",
  "교육",
  "연구",
  "진단 지원",
  "업무 자동화",
];

export function EditProgramDialog({ open, onOpenChange, program }: EditProgramDialogProps) {
  const [title, setTitle] = useState(program.title);
  const [description, setDescription] = useState(program.description || "");
  const [category, setCategory] = useState(program.category);
  const [programType, setProgramType] = useState<ProgramType>(program.program_type);
  const [selectedIcon, setSelectedIcon] = useState(program.icon);
  const [selectedGradient, setSelectedGradient] = useState(program.gradient);
  const [isPublic, setIsPublic] = useState(program.is_public);
  const [isNew, setIsNew] = useState(program.is_new);
  const [formSchema, setFormSchema] = useState<FormField[] | null>(
    program.program_type === 'form' && program.config?.form_schema
      ? program.config.form_schema
      : null
  );
  const [formGeneratorOpen, setFormGeneratorOpen] = useState(false);

  const updateProgramMutation = useUpdateProgram();

  // 프로그램이 변경되면 상태 업데이트
  useEffect(() => {
    if (open) {
      setTitle(program.title);
      setDescription(program.description || "");
      setCategory(program.category);
      setProgramType(program.program_type);
      setSelectedIcon(program.icon);
      setSelectedGradient(program.gradient);
      setIsPublic(program.is_public);
      setIsNew(program.is_new);
      setFormSchema(
        program.program_type === 'form' && program.config?.form_schema
          ? program.config.form_schema
          : null
      );
    }
  }, [open, program]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !category) {
      return;
    }

    // Form 타입인데 스키마가 없으면 경고
    if (programType === 'form' && !formSchema) {
      toast.error("AI로 폼을 생성해주세요", {
        description: "폼 타입 프로그램은 입력 필드가 필요합니다",
      });
      return;
    }

    // config 구성
    const config = programType === 'form' && formSchema
      ? { form_schema: formSchema }
      : program.config; // 기존 config 유지

    updateProgramMutation.mutate(
      {
        id: program.id,
        updates: {
          title,
          description: description || null,
          category,
          program_type: programType,
          config,
          icon: selectedIcon,
          gradient: selectedGradient,
          is_public: isPublic,
          is_new: isNew,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const handleFormSchemaGenerated = (schema: FormField[]) => {
    setFormSchema(schema);
    toast.success(`폼 스키마가 적용되었습니다 (${schema.length}개 필드)`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>프로그램 수정</DialogTitle>
          <DialogDescription>
            프로그램 정보를 수정하세요
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                프로그램 이름 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="예: 환자 안내문 생성기"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                placeholder="프로그램의 주요 기능과 용도를 설명해주세요"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">
                카테고리 <span className="text-destructive">*</span>
              </Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                프로그램 타입 <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setProgramType("chat")}
                  className={cn(
                    "flex flex-col items-start gap-2 p-4 rounded-lg border-2 transition-all hover:bg-accent text-left",
                    programType === "chat"
                      ? "border-primary bg-primary/10"
                      : "border-border"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    <span className="font-medium">Chat</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    AI와 자유로운 대화, 실시간 아티팩트 생성
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setProgramType("form")}
                  className={cn(
                    "flex flex-col items-start gap-2 p-4 rounded-lg border-2 transition-all hover:bg-accent text-left",
                    programType === "form"
                      ? "border-primary bg-primary/10"
                      : "border-border"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5" />
                    <span className="font-medium">Form</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    구조화된 입력/출력, 정해진 포맷
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setProgramType("template")}
                  className={cn(
                    "flex flex-col items-start gap-2 p-4 rounded-lg border-2 transition-all hover:bg-accent text-left",
                    programType === "template"
                      ? "border-primary bg-primary/10"
                      : "border-border"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    <span className="font-medium">Template</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    미리 만든 템플릿 선택 및 커스터마이징
                  </span>
                </button>
              </div>
            </div>

            {/* Form 타입일 때 AI 폼 생성 버튼 */}
            {programType === 'form' && (
              <div className="space-y-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => setFormGeneratorOpen(true)}
                >
                  <Sparkles className="w-4 h-4" />
                  {formSchema ? `폼 수정하기 (${formSchema.length}개 필드)` : 'AI로 폼 생성하기'}
                </Button>
                {formSchema && (
                  <p className="text-xs text-muted-foreground">
                    ✅ 폼 스키마가 설정되었습니다 ({formSchema.length}개 필드)
                  </p>
                )}
                {!formSchema && (
                  <p className="text-xs text-muted-foreground">
                    💡 Form 타입 프로그램은 입력 필드 설정이 필요합니다
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 아이콘 선택 */}
          <div className="space-y-2">
            <Label>아이콘</Label>
            <div className="grid grid-cols-7 gap-2">
              {iconOptions.map(({ name, icon: Icon, label }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedIcon(name)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all hover:bg-accent",
                    selectedIcon === name
                      ? "border-primary bg-primary/10"
                      : "border-border"
                  )}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 그라디언트 선택 */}
          <div className="space-y-2">
            <Label>색상 테마</Label>
            <div className="grid grid-cols-4 gap-2">
              {gradientOptions.map(({ value, label, preview }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelectedGradient(value)}
                  className={cn(
                    "relative overflow-hidden rounded-lg border-2 transition-all h-16",
                    selectedGradient === value
                      ? "border-primary ring-2 ring-primary ring-offset-2"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className={cn("w-full h-full", preview)} />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white drop-shadow-lg">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 옵션 */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublic"
                checked={isPublic}
                onCheckedChange={(checked) => setIsPublic(checked as boolean)}
              />
              <label
                htmlFor="isPublic"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                다른 사용자와 공유 (공개 프로그램)
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isNew"
                checked={isNew}
                onCheckedChange={(checked) => setIsNew(checked as boolean)}
              />
              <label
                htmlFor="isNew"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                NEW 배지 표시
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateProgramMutation.isPending}
            >
              취소
            </Button>
            <Button type="submit" disabled={updateProgramMutation.isPending || !title || !category}>
              {updateProgramMutation.isPending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* AI 폼 생성기 다이얼로그 */}
      <FormSchemaGenerator
        open={formGeneratorOpen}
        onOpenChange={setFormGeneratorOpen}
        onSchemaGenerated={handleFormSchemaGenerated}
      />
    </Dialog>
  );
}
