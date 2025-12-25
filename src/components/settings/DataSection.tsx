import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Download, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useMyResults } from "@/hooks/useExecutionResults";
import { usePrompts } from "@/hooks/usePrompts";
import { useHistory } from "@/hooks/useHistory";

export function DataSection() {
  const [deleteType, setDeleteType] = useState<"results" | "prompts" | "history" | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 데이터 조회
  const { data: results = [] } = useMyResults();
  const { data: prompts = [] } = usePrompts();
  const { data: history = [] } = useHistory();

  const handleDelete = async () => {
    if (!deleteType) return;

    setIsDeleting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("로그인이 필요합니다.");
      }

      let tableName = "";
      let queryKey = "";

      switch (deleteType) {
        case "results":
          tableName = "execution_results";
          queryKey = "myResults";
          break;
        case "prompts":
          tableName = "prompts";
          queryKey = "prompts";
          break;
        case "history":
          tableName = "execution_history";
          queryKey = "history";
          break;
      }

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: [queryKey] });

      toast({
        title: "데이터가 삭제되었습니다",
        description: `모든 ${
          deleteType === "results"
            ? "실행 결과"
            : deleteType === "prompts"
            ? "프롬프트"
            : "히스토리"
        }가 삭제되었습니다.`,
      });
    } catch (error: any) {
      toast({
        title: "삭제 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteType(null);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("로그인이 필요합니다.");
      }

      // 모든 데이터 수집
      const exportData = {
        exported_at: new Date().toISOString(),
        user_email: user.email,
        data: {
          results,
          prompts,
          history,
        },
        stats: {
          total_results: results.length,
          total_prompts: prompts.length,
          total_history: history.length,
        },
      };

      // JSON 파일로 다운로드
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mediconsol-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "데이터 내보내기 완료",
        description: "데이터가 JSON 파일로 다운로드되었습니다.",
      });
    } catch (error: any) {
      toast({
        title: "내보내기 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 데이터 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">실행 결과</p>
          <p className="text-2xl font-bold">{results.length}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">저장된 프롬프트</p>
          <p className="text-2xl font-bold">{prompts.length}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">실행 히스토리</p>
          <p className="text-2xl font-bold">{history.length}</p>
        </div>
      </div>

      {/* 데이터 내보내기 */}
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-medium">데이터 내보내기</h3>
          <p className="text-sm text-muted-foreground">
            모든 데이터를 JSON 파일로 다운로드합니다.
          </p>
        </div>
        <Button onClick={handleExport} disabled={isExporting} variant="outline">
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              내보내는 중...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              데이터 내보내기
            </>
          )}
        </Button>
      </div>

      {/* 데이터 삭제 */}
      <div className="space-y-4 border-t pt-6">
        <div>
          <h3 className="text-lg font-medium text-destructive">데이터 삭제</h3>
          <p className="text-sm text-muted-foreground">
            선택한 데이터를 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium">실행 결과 삭제</p>
              <p className="text-sm text-muted-foreground">
                저장된 모든 AI 실행 결과를 삭제합니다 ({results.length}개)
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteType("results")}
              disabled={results.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              삭제
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium">프롬프트 삭제</p>
              <p className="text-sm text-muted-foreground">
                저장된 모든 프롬프트를 삭제합니다 ({prompts.length}개)
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteType("prompts")}
              disabled={prompts.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              삭제
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium">실행 히스토리 삭제</p>
              <p className="text-sm text-muted-foreground">
                모든 실행 히스토리를 삭제합니다 ({history.length}개)
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteType("history")}
              disabled={history.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              삭제
            </Button>
          </div>
        </div>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={!!deleteType} onOpenChange={() => setDeleteType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>데이터를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 모든{" "}
              {deleteType === "results"
                ? "실행 결과"
                : deleteType === "prompts"
                ? "프롬프트"
                : "히스토리"}
              가 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  삭제 중...
                </>
              ) : (
                "삭제"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
