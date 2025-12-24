import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { FormField } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

interface DynamicFormBuilderProps {
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => void;
  isLoading?: boolean;
  submitButtonText?: string;
}

export function DynamicFormBuilder({
  fields,
  onSubmit,
  isLoading = false,
  submitButtonText = "생성하기",
}: DynamicFormBuilderProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  const renderField = (field: FormField) => {
    const value = watch(field.id);

    switch (field.type) {
      case "text":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              placeholder={field.placeholder}
              {...register(field.id, {
                required: field.required ? `${field.label}은(는) 필수입니다` : false,
                minLength: field.validation?.min
                  ? {
                      value: field.validation.min,
                      message: `최소 ${field.validation.min}자 이상 입력해주세요`,
                    }
                  : undefined,
                maxLength: field.validation?.max
                  ? {
                      value: field.validation.max,
                      message: `최대 ${field.validation.max}자까지 입력 가능합니다`,
                    }
                  : undefined,
                pattern: field.validation?.pattern
                  ? {
                      value: new RegExp(field.validation.pattern),
                      message: "올바른 형식이 아닙니다",
                    }
                  : undefined,
              })}
            />
            {errors[field.id] && (
              <p className="text-sm text-destructive">
                {errors[field.id]?.message as string}
              </p>
            )}
          </div>
        );

      case "textarea":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Textarea
              id={field.id}
              placeholder={field.placeholder}
              rows={5}
              {...register(field.id, {
                required: field.required ? `${field.label}은(는) 필수입니다` : false,
                minLength: field.validation?.min
                  ? {
                      value: field.validation.min,
                      message: `최소 ${field.validation.min}자 이상 입력해주세요`,
                    }
                  : undefined,
                maxLength: field.validation?.max
                  ? {
                      value: field.validation.max,
                      message: `최대 ${field.validation.max}자까지 입력 가능합니다`,
                    }
                  : undefined,
              })}
            />
            {errors[field.id] && (
              <p className="text-sm text-destructive">
                {errors[field.id]?.message as string}
              </p>
            )}
          </div>
        );

      case "number":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="number"
              placeholder={field.placeholder}
              {...register(field.id, {
                required: field.required ? `${field.label}은(는) 필수입니다` : false,
                valueAsNumber: true,
                min: field.validation?.min
                  ? {
                      value: field.validation.min,
                      message: `최소값은 ${field.validation.min}입니다`,
                    }
                  : undefined,
                max: field.validation?.max
                  ? {
                      value: field.validation.max,
                      message: `최대값은 ${field.validation.max}입니다`,
                    }
                  : undefined,
              })}
            />
            {errors[field.id] && (
              <p className="text-sm text-destructive">
                {errors[field.id]?.message as string}
              </p>
            )}
          </div>
        );

      case "select":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(val) => setValue(field.id, val)}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || "선택하세요"} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors[field.id] && (
              <p className="text-sm text-destructive">
                {errors[field.id]?.message as string}
              </p>
            )}
          </div>
        );

      case "date":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="date"
              {...register(field.id, {
                required: field.required ? `${field.label}은(는) 필수입니다` : false,
              })}
            />
            {errors[field.id] && (
              <p className="text-sm text-destructive">
                {errors[field.id]?.message as string}
              </p>
            )}
          </div>
        );

      case "checkbox":
        return (
          <div key={field.id} className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={value || false}
              onCheckedChange={(checked) => setValue(field.id, checked)}
            />
            <Label
              htmlFor={field.id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {field.label}
            </Label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {fields.map((field) => renderField(field))}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            생성 중...
          </>
        ) : (
          submitButtonText
        )}
      </Button>
    </form>
  );
}
