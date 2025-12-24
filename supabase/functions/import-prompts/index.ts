// Supabase Edge Function: 프롬프트 가져오기
// JSON 파일에서 프롬프트를 가져와 사용자 계정에 추가합니다.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImportPrompt {
  title: string;
  content: string;
  category: string;
  isFavorite?: boolean;
  variables?: any;
}

interface ImportRequest {
  prompts: ImportPrompt[];
  overwriteDuplicates?: boolean; // 중복 제목이 있을 경우 덮어쓰기
  programId?: string; // 특정 프로그램에 연결
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prompts, overwriteDuplicates, programId }: ImportRequest = await req.json();

    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      throw new Error('Invalid prompts data');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    console.log(`Importing ${prompts.length} prompts for user ${user.id}`);

    // 프로그램 ID 검증 (지정된 경우)
    if (programId) {
      const { data: program, error: programError } = await supabase
        .from('programs')
        .select('id')
        .eq('id', programId)
        .single();

      if (programError || !program) {
        throw new Error('Invalid program ID');
      }
    }

    // 중복 체크를 위한 기존 프롬프트 조회
    const { data: existingPrompts } = await supabase
      .from('prompts')
      .select('title, id');

    const existingTitles = new Set(existingPrompts?.map(p => p.title.toLowerCase()) || []);

    let imported = 0;
    let skipped = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const prompt of prompts) {
      try {
        // 필수 필드 검증
        if (!prompt.title || !prompt.content || !prompt.category) {
          errors.push(`Skipped invalid prompt: missing required fields`);
          skipped++;
          continue;
        }

        const isDuplicate = existingTitles.has(prompt.title.toLowerCase());

        if (isDuplicate && !overwriteDuplicates) {
          errors.push(`Skipped duplicate: ${prompt.title}`);
          skipped++;
          continue;
        }

        const promptData = {
          user_id: user.id,
          program_id: programId || null,
          title: prompt.title,
          content: prompt.content,
          category: prompt.category,
          is_favorite: prompt.isFavorite || false,
          usage_count: 0, // 가져온 프롬프트는 사용 횟수 0으로 초기화
          variables: prompt.variables || [],
        };

        if (isDuplicate && overwriteDuplicates) {
          // 중복된 제목이 있고 덮어쓰기 옵션이 활성화된 경우
          const existingPrompt = existingPrompts?.find(
            p => p.title.toLowerCase() === prompt.title.toLowerCase()
          );

          if (existingPrompt) {
            const { error: updateError } = await supabase
              .from('prompts')
              .update(promptData)
              .eq('id', existingPrompt.id);

            if (updateError) {
              errors.push(`Failed to update ${prompt.title}: ${updateError.message}`);
              skipped++;
            } else {
              updated++;
            }
          }
        } else {
          // 새 프롬프트 추가
          const { error: insertError } = await supabase
            .from('prompts')
            .insert(promptData);

          if (insertError) {
            errors.push(`Failed to import ${prompt.title}: ${insertError.message}`);
            skipped++;
          } else {
            imported++;
          }
        }
      } catch (error) {
        errors.push(`Error processing ${prompt.title || 'unknown'}: ${error.message}`);
        skipped++;
      }
    }

    console.log(`Import completed: ${imported} imported, ${updated} updated, ${skipped} skipped`);

    return new Response(
      JSON.stringify({
        success: true,
        imported,
        updated,
        skipped,
        total: prompts.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Import prompts error:', error);

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
