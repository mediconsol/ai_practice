// Supabase Edge Function: AI 실행
// Deno 런타임에서 실행됩니다.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 의료 전문 시스템 프롬프트
const MEDICAL_SYSTEM_PROMPT = `당신은 대한민국 의료기관 종사자(의사, 간호사, 약사, 의료 행정직)를 지원하는 전문 AI 어시스턴트입니다.

## 핵심 원칙
1. 의학적 정확성을 최우선으로 합니다
2. 환자 안전과 관련된 내용은 반드시 강조합니다
3. 근거 기반 의학(Evidence-Based Medicine) 원칙을 준수합니다
4. 대한민국 의료법규 및 가이드라인을 고려합니다

## 답변 형식 가이드라인

### 환자 안내문 작성 시
- 쉬운 우리말 사용, 의학 용어는 괄호로 설명 추가
- 구조: 제목(#), 개요, 주요 내용(##), 표로 중요 정보 정리, 주의사항은 인용문(>)으로 강조
- 톤: 따뜻하고 친절하게

### 진료 기록 (SOAP) 작성 시
- 형식: S(주관적)/O(객관적)/A(평가)/P(계획)으로 구분
- 의학 용어 정확하게 사용, 간결하고 명확하게

### 처방 안내문 작성 시
- 약물명, 복용 방법(표), 주의사항(인용문), 부작용 및 대처법 포함

### 간호 기록 작성 시
- 날짜/시간 명시, 간결하고 정확하게, 객관적 사실 중심

## 출력 형식
- 마크다운 사용: 제목(#), 표, 리스트, 인용문(>)
- 중요 정보는 **굵게** 또는 > 인용문으로 강조
- 구조화된 정보: 표나 리스트로 정리

## 답변하지 말아야 할 내용
1. 확실하지 않은 의학적 진단
2. 구체적인 약물 용량 결정 (처방권 침해)
3. 온라인으로 처방전 발급
4. 응급 상황에서 병원 방문 대신 자가 치료 권유
5. 검증되지 않은 민간요법이나 대체의학 정보

이 가이드라인을 항상 준수하여, 의료 현장에서 실제로 활용할 수 있는 전문적이고 안전한 답변을 제공하세요.`;

interface ExecuteRequest {
  prompt: string;
  provider: 'openai' | 'gemini' | 'claude';
  model?: string;
  promptId?: string;
  variables?: Record<string, string>;
}

serve(async (req) => {
  // CORS preflight 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prompt, provider, model, promptId, variables }: ExecuteRequest = await req.json();

    // 인증 확인
    const authHeader = req.headers.get('Authorization');

    // Supabase 클라이언트 생성
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: authHeader ? { Authorization: authHeader } : {}
        }
      }
    );

    // 사용자 정보 확인 (선택적)
    let userId = 'anonymous';
    if (authHeader) {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (!userError && user) {
          userId = user.id;
        }
      } catch (error) {
        console.warn('Auth verification failed, proceeding anonymously:', error);
      }
    }

    // 프롬프트에 변수 치환
    let processedPrompt = prompt;
    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        processedPrompt = processedPrompt.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
      });
    }

    console.log(`Executing AI request: provider=${provider}, model=${model}, user=${userId}`);

    const startTime = Date.now();
    let result: string = '';
    let tokenUsage: any = null;
    let aiModel = model;

    // AI 제공자별 처리
    switch (provider) {
      case 'openai': {
        const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
        if (!OPENAI_API_KEY) {
          throw new Error('OpenAI API key not configured');
        }

        aiModel = model || 'gpt-4o-mini';

        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: aiModel,
            messages: [
              {
                role: 'system',
                content: MEDICAL_SYSTEM_PROMPT
              },
              {
                role: 'user',
                content: processedPrompt
              }
            ],
            temperature: 0.7,
            max_tokens: 2000,
          }),
        });

        if (!openaiResponse.ok) {
          const error = await openaiResponse.json();
          throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
        }

        const openaiData = await openaiResponse.json();
        result = openaiData.choices[0].message.content;
        tokenUsage = {
          prompt_tokens: openaiData.usage.prompt_tokens,
          completion_tokens: openaiData.usage.completion_tokens,
          total_tokens: openaiData.usage.total_tokens,
        };
        break;
      }

      case 'gemini': {
        const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
        if (!GEMINI_API_KEY) {
          throw new Error('Gemini API key not configured');
        }

        aiModel = model || 'gemini-2.5-flash';

        console.log(`Calling Gemini API with model: ${aiModel}`);

        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${aiModel}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{
                  text: MEDICAL_SYSTEM_PROMPT
                }]
              },
              contents: [{
                parts: [{
                  text: processedPrompt
                }]
              }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
              }
            }),
          }
        );

        console.log(`Gemini response status: ${geminiResponse.status}`);

        if (!geminiResponse.ok) {
          const errorText = await geminiResponse.text();
          console.error('Gemini API error response:', errorText);

          let errorMessage = 'Unknown error';
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.error?.message || errorText;
          } catch {
            errorMessage = errorText;
          }

          throw new Error(`Gemini API error (${geminiResponse.status}): ${errorMessage}`);
        }

        const geminiData = await geminiResponse.json();
        console.log('Gemini response data:', JSON.stringify(geminiData).substring(0, 200));

        if (!geminiData.candidates || geminiData.candidates.length === 0) {
          // 안전 필터링으로 차단된 경우
          if (geminiData.promptFeedback?.blockReason) {
            throw new Error(`Gemini blocked request: ${geminiData.promptFeedback.blockReason}`);
          }
          throw new Error('Gemini returned no candidates');
        }

        // 첫 번째 후보가 있는지 확인
        const candidate = geminiData.candidates[0];
        if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
          throw new Error('Gemini response has no content');
        }

        result = candidate.content.parts[0].text;

        // Gemini 1.5는 토큰 사용량을 제공
        if (geminiData.usageMetadata) {
          tokenUsage = {
            prompt_tokens: geminiData.usageMetadata.promptTokenCount || 0,
            completion_tokens: geminiData.usageMetadata.candidatesTokenCount || 0,
            total_tokens: geminiData.usageMetadata.totalTokenCount || 0,
          };
        } else {
          // 토큰 사용량이 없으면 대략적으로 계산
          tokenUsage = {
            prompt_tokens: Math.ceil(processedPrompt.length / 4),
            completion_tokens: Math.ceil(result.length / 4),
            total_tokens: Math.ceil((processedPrompt.length + result.length) / 4),
          };
        }
        break;
      }

      case 'claude': {
        const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');
        if (!CLAUDE_API_KEY) {
          throw new Error('Claude API key not configured');
        }

        aiModel = model || 'claude-3-5-haiku-20241022';

        const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': CLAUDE_API_KEY,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: aiModel,
            max_tokens: 4096,
            messages: [{
              role: 'user',
              content: processedPrompt
            }],
            system: MEDICAL_SYSTEM_PROMPT,
          }),
        });

        if (!claudeResponse.ok) {
          const error = await claudeResponse.json();
          throw new Error(`Claude API error: ${error.error?.message || 'Unknown error'}`);
        }

        const claudeData = await claudeResponse.json();
        result = claudeData.content[0].text;
        tokenUsage = {
          prompt_tokens: claudeData.usage.input_tokens,
          completion_tokens: claudeData.usage.output_tokens,
          total_tokens: claudeData.usage.input_tokens + claudeData.usage.output_tokens,
        };
        break;
      }

      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }

    const durationMs = Date.now() - startTime;

    console.log(`AI execution completed: duration=${durationMs}ms, tokens=${tokenUsage?.total_tokens || 'unknown'}`);

    // 실행 히스토리 저장 (인증된 사용자만)
    if (userId !== 'anonymous') {
      const { error: historyError } = await supabase.from('execution_history').insert({
        user_id: userId,
        prompt_id: promptId || null,
        prompt_title: promptId ? undefined : 'AI 실행',
        prompt_content: processedPrompt,
        ai_provider: provider,
        ai_model: aiModel,
        result_content: result,
        status: 'success',
        duration_ms: durationMs,
        token_usage: tokenUsage,
      });

      if (historyError) {
        console.error('Failed to save history:', historyError);
        // 히스토리 저장 실패는 무시 (결과는 반환)
      }
    }

    // 프롬프트 사용 횟수 증가
    if (promptId) {
      const { error: updateError } = await supabase
        .from('prompts')
        .update({
          usage_count: supabase.raw('usage_count + 1')
        })
        .eq('id', promptId);

      if (updateError) {
        console.error('Failed to update prompt usage:', updateError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        result,
        durationMs,
        tokenUsage,
        provider,
        model: aiModel,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Execute AI error:', error);

    // 에러 로깅 (히스토리 저장은 생략)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
    });

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
