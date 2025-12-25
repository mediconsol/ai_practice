import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const passwordSchema = z.object({
  newPassword: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export function AccountSection() {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) throw error;

      toast({
        title: "비밀번호가 변경되었습니다",
        description: "새 비밀번호로 로그인해주세요.",
      });

      reset();
    } catch (error: any) {
      toast({
        title: "비밀번호 변경 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // 1. 사용자 데이터 삭제 (Supabase RLS 정책에 따라 자동 삭제됨)
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("사용자 정보를 찾을 수 없습니다.");
      }

      // 2. 로그아웃
      await supabase.auth.signOut();

      toast({
        title: "계정이 삭제되었습니다",
        description: "그동안 이용해주셔서 감사합니다.",
      });

      // 3. 로그인 페이지로 이동
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "계정 삭제 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 비밀번호 변경 */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">비밀번호 변경</h3>
          <p className="text-sm text-muted-foreground">
            새로운 비밀번호를 설정하세요.
          </p>
        </div>

        <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">새 비밀번호</Label>
            <Input
              id="newPassword"
              type="password"
              {...register("newPassword")}
              placeholder="새 비밀번호 (최소 8자)"
            />
            {errors.newPassword && (
              <p className="text-sm text-destructive">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">비밀번호 확인</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
              placeholder="비밀번호 확인"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isChangingPassword}>
              {isChangingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  변경 중...
                </>
              ) : (
                "비밀번호 변경"
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* 구분선 */}
      <div className="border-t pt-8">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-destructive">위험 구역</h3>
            <p className="text-sm text-muted-foreground">
              아래 작업은 되돌릴 수 없습니다. 신중하게 진행하세요.
            </p>
          </div>

          {/* 계정 탈퇴 */}
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-destructive mb-1">
                  계정 탈퇴
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  계정을 삭제하면 모든 데이터(프롬프트, 실행 결과, 프로젝트 등)가
                  영구적으로 삭제됩니다.
                </p>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  계정 탈퇴
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 계정 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말로 계정을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 모든 데이터가 영구적으로 삭제되며,
              복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  삭제 중...
                </>
              ) : (
                "영구 삭제"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
