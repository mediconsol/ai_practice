// Supabase Edge Function: 프롬프트 내보내기
// JSON 또는 CSV 형식으로 사용자의 프롬프트를 내보냅니다.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExportRequest {
  format: 'json' | 'csv';
  includeHistory?: boolean;
  promptIds?: string[]; // 특정 프롬프트만 내보내기
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { format, includeHistory, promptIds }: ExportRequest = await req.json();

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

    // 프롬프트 조회
    let query = supabase
      .from('prompts')
      .select('id, title, content, category, is_favorite, usage_count, variables, created_at, updated_at')
      .order('created_at', { ascending: false });

    // 특정 프롬프트만 선택한 경우
    if (promptIds && promptIds.length > 0) {
      query = query.in('id', promptIds);
    }

    const { data: prompts, error: promptsError } = await query;

    if (promptsError) {
      throw new Error(`Failed to fetch prompts: ${promptsError.message}`);
    }

    if (!prompts || prompts.length === 0) {
      throw new Error('No prompts found');
    }

    console.log(`Exporting ${prompts.length} prompts for user ${user.id} in ${format} format`);

    // JSON 형식
    if (format === 'json') {
      const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        totalPrompts: prompts.length,
        prompts: prompts.map(p => ({
          title: p.title,
          content: p.content,
          category: p.category,
          isFavorite: p.is_favorite,
          usageCount: p.usage_count,
          variables: p.variables,
          createdAt: p.created_at,
        })),
      };

      // 히스토리 포함 요청 시
      if (includeHistory) {
        const { data: history } = await supabase
          .from('execution_history')
          .select('*')
          .in('prompt_id', prompts.map(p => p.id))
          .order('created_at', { ascending: false })
          .limit(100);

        exportData['history'] = history;
      }

      return new Response(
        JSON.stringify(exportData, null, 2),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="mediconsol-prompts-${new Date().toISOString().split('T')[0]}.json"`,
          },
        }
      );
    }

    // CSV 형식
    if (format === 'csv') {
      const csvHeaders = ['제목', '내용', '카테고리', '즐겨찾기', '사용 횟수', '생성일'];
      const csvRows = prompts.map(p => [
        `"${p.title.replace(/"/g, '""')}"`,
        `"${p.content.replace(/"/g, '""')}"`,
        `"${p.category}"`,
        p.is_favorite ? '예' : '아니오',
        p.usage_count.toString(),
        new Date(p.created_at).toLocaleDateString('ko-KR'),
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.join(',')),
      ].join('\n');

      // UTF-8 BOM 추가 (Excel에서 한글 깨짐 방지)
      const bom = '\uFEFF';

      return new Response(
        bom + csvContent,
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="mediconsol-prompts-${new Date().toISOString().split('T')[0]}.csv"`,
          },
        }
      );
    }

    throw new Error('Invalid format specified');

  } catch (error) {
    console.error('Export prompts error:', error);

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
