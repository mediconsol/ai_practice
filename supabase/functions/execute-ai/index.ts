// Supabase Edge Function: AI 실행
// Deno 런타임에서 실행됩니다.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    // Supabase 클라이언트 생성 (RLS 적용)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    );

    // 사용자 정보 확인
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // 프롬프트에 변수 치환
    let processedPrompt = prompt;
    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        processedPrompt = processedPrompt.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
      });
    }

    console.log(`Executing AI request: provider=${provider}, model=${model}, user=${user.id}`);

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
                content: '당신은 의료 전문가를 돕는 AI 어시스턴트입니다. 정확하고 전문적인 답변을 제공하세요.'
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

        aiModel = model || 'gemini-pro';

        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${aiModel}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: processedPrompt
                }]
              }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2000,
              }
            }),
          }
        );

        if (!geminiResponse.ok) {
          const error = await geminiResponse.json();
          throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`);
        }

        const geminiData = await geminiResponse.json();

        if (!geminiData.candidates || geminiData.candidates.length === 0) {
          throw new Error('Gemini returned no candidates');
        }

        result = geminiData.candidates[0].content.parts[0].text;

        // Gemini는 토큰 사용량을 직접 제공하지 않으므로 대략적으로 계산
        tokenUsage = {
          prompt_tokens: Math.ceil(processedPrompt.length / 4),
          completion_tokens: Math.ceil(result.length / 4),
          total_tokens: Math.ceil((processedPrompt.length + result.length) / 4),
        };
        break;
      }

      case 'claude': {
        const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');
        if (!CLAUDE_API_KEY) {
          throw new Error('Claude API key not configured');
        }

        aiModel = model || 'claude-3-5-sonnet-20241022';

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
            system: '당신은 의료 전문가를 돕는 AI 어시스턴트입니다. 정확하고 전문적인 답변을 제공하세요.',
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

    // 실행 히스토리 저장
    const { error: historyError } = await supabase.from('execution_history').insert({
      user_id: user.id,
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

    // 에러 히스토리 저장 시도
    try {
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? '',
          { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const requestBody = await req.clone().json();

          await supabase.from('execution_history').insert({
            user_id: user.id,
            prompt_id: requestBody.promptId || null,
            prompt_title: 'AI 실행',
            prompt_content: requestBody.prompt || '',
            ai_provider: requestBody.provider || 'unknown',
            ai_model: requestBody.model || null,
            status: 'error',
            error_message: error.message || 'Unknown error',
            duration_ms: 0,
          });
        }
      }
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

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
