import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useUserPreferences, useUpdateAIPreferences } from "@/hooks/useUserPreferences";
import type { AIPreferences } from "@/types/settings";

// AI 모델 옵션
const MODEL_OPTIONS = {
  openai: [
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  ],
  claude: [
    { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet" },
    { value: "claude-3-opus-20240229", label: "Claude 3 Opus" },
    { value: "claude-3-sonnet-20240229", label: "Claude 3 Sonnet" },
    { value: "claude-3-haiku-20240307", label: "Claude 3 Haiku" },
  ],
  gemini: [
    { value: "gemini-pro", label: "Gemini Pro" },
    { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
    { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
  ],
};

export function AIPreferencesSection() {
  const { data: preferences, isLoading } = useUserPreferences();
  const updatePreferences = useUpdateAIPreferences();

  const [defaultProvider, setDefaultProvider] = useState<"openai" | "claude" | "gemini">("openai");
  const [models, setModels] = useState({
    openai: "gpt-4o",
    claude: "claude-3-5-sonnet-20241022",
    gemini: "gemini-pro",
  });
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2000);

  // preferences 로드 시 폼 초기화
  useEffect(() => {
    if (preferences?.ai) {
      setDefaultProvider(preferences.ai.default_provider);
      setModels({
        openai: preferences.ai.default_models.openai || "gpt-4o",
        claude: preferences.ai.default_models.claude || "claude-3-5-sonnet-20241022",
        gemini: preferences.ai.default_models.gemini || "gemini-pro",
      });
      setTemperature(preferences.ai.default_temperature);
      setMaxTokens(preferences.ai.default_max_tokens || 2000);
    }
  }, [preferences]);

  const handleSave = () => {
    const aiPreferences: AIPreferences = {
      default_provider: defaultProvider,
      default_models: models,
      default_temperature: temperature,
      default_max_tokens: maxTokens,
    };

    updatePreferences.mutate(aiPreferences);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 기본 AI 프로바이더 */}
      <div className="space-y-2">
        <Label htmlFor="default-provider">기본 AI 프로바이더</Label>
        <Select value={defaultProvider} onValueChange={(value: any) => setDefaultProvider(value)}>
          <SelectTrigger id="default-provider">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="claude">Claude (Anthropic)</SelectItem>
            <SelectItem value="gemini">Gemini (Google)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          AI 실행 시 기본으로 사용할 프로바이더를 선택하세요.
        </p>
      </div>

      {/* 기본 모델 (각 프로바이더별) */}
      <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
        <div className="space-y-2">
          <Label htmlFor="openai-model">OpenAI 기본 모델</Label>
          <Select
            value={models.openai}
            onValueChange={(value) => setModels({ ...models, openai: value })}
          >
            <SelectTrigger id="openai-model">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODEL_OPTIONS.openai.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="claude-model">Claude 기본 모델</Label>
          <Select
            value={models.claude}
            onValueChange={(value) => setModels({ ...models, claude: value })}
          >
            <SelectTrigger id="claude-model">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODEL_OPTIONS.claude.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gemini-model">Gemini 기본 모델</Label>
          <Select
            value={models.gemini}
            onValueChange={(value) => setModels({ ...models, gemini: value })}
          >
            <SelectTrigger id="gemini-model">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODEL_OPTIONS.gemini.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Temperature */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="temperature">Temperature</Label>
          <span className="text-sm text-muted-foreground">{temperature.toFixed(1)}</span>
        </div>
        <Slider
          id="temperature"
          min={0}
          max={1}
          step={0.1}
          value={[temperature]}
          onValueChange={(value) => setTemperature(value[0])}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          값이 높을수록 창의적이고, 낮을수록 일관된 결과를 생성합니다.
        </p>
      </div>

      {/* Max Tokens */}
      <div className="space-y-2">
        <Label htmlFor="max-tokens">최대 토큰 수</Label>
        <Input
          id="max-tokens"
          type="number"
          min={100}
          max={32000}
          step={100}
          value={maxTokens}
          onChange={(e) => setMaxTokens(parseInt(e.target.value) || 2000)}
        />
        <p className="text-xs text-muted-foreground">
          AI가 생성할 수 있는 최대 응답 길이입니다. (기본: 2000)
        </p>
      </div>

      {/* 저장 버튼 */}
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleSave}
          disabled={updatePreferences.isPending}
        >
          {updatePreferences.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              저장 중...
            </>
          ) : (
            "변경사항 저장"
          )}
        </Button>
      </div>
    </div>
  );
}
