// 설정 관련 타입 정의

export interface AIPreferences {
  default_provider: 'openai' | 'claude' | 'gemini';
  default_models: {
    openai?: string;
    claude?: string;
    gemini?: string;
  };
  default_temperature: number;
  default_max_tokens?: number;
}

export interface InterfacePreferences {
  default_view_mode: 'grid' | 'list';
  theme?: 'light' | 'dark' | 'system';
}

export interface UserPreferences {
  ai: AIPreferences;
  interface: InterfacePreferences;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  hospital: string | null;
  department: string | null;
  subscription_tier: string;
  preferences?: UserPreferences;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdateData {
  full_name?: string | null;
  hospital?: string | null;
  department?: string | null;
}

export interface PreferencesUpdateData {
  preferences: UserPreferences;
}
