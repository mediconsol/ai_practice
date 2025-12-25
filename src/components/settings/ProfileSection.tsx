import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useUserProfile, useUpdateProfile } from "@/hooks/useUserProfile";
import { useEffect } from "react";

const profileSchema = z.object({
  full_name: z.string().min(1, "이름을 입력해주세요").max(100),
  hospital: z.string().max(200).nullable(),
  department: z.string().max(100).nullable(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileSection() {
  const { data: profile, isLoading } = useUserProfile();
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || "",
      hospital: profile?.hospital || "",
      department: profile?.department || "",
    },
  });

  // 프로필 데이터 로드 시 폼 초기화
  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name || "",
        hospital: profile.hospital || "",
        department: profile.department || "",
      });
    }
  }, [profile, reset]);

  const onSubmit = (data: ProfileFormData) => {
    updateProfile.mutate({
      full_name: data.full_name,
      hospital: data.hospital || null,
      department: data.department || null,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 이메일 (읽기 전용) */}
      <div className="space-y-2">
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          type="email"
          value={profile?.email || ""}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">
          이메일은 변경할 수 없습니다.
        </p>
      </div>

      {/* 이름 */}
      <div className="space-y-2">
        <Label htmlFor="full_name">이름 *</Label>
        <Input
          id="full_name"
          {...register("full_name")}
          placeholder="홍길동"
        />
        {errors.full_name && (
          <p className="text-sm text-destructive">{errors.full_name.message}</p>
        )}
      </div>

      {/* 소속 병원 */}
      <div className="space-y-2">
        <Label htmlFor="hospital">소속 병원</Label>
        <Input
          id="hospital"
          {...register("hospital")}
          placeholder="예: 서울대학교병원"
        />
        {errors.hospital && (
          <p className="text-sm text-destructive">{errors.hospital.message}</p>
        )}
      </div>

      {/* 진료과/부서 */}
      <div className="space-y-2">
        <Label htmlFor="department">진료과/부서</Label>
        <Input
          id="department"
          {...register("department")}
          placeholder="예: 내과, 외과, 응급의학과"
        />
        {errors.department && (
          <p className="text-sm text-destructive">{errors.department.message}</p>
        )}
      </div>

      {/* 구독 플랜 (읽기 전용) */}
      <div className="space-y-2">
        <Label htmlFor="subscription">구독 플랜</Label>
        <Input
          id="subscription"
          value={profile?.subscription_tier || "free"}
          disabled
          className="bg-muted capitalize"
        />
        <p className="text-xs text-muted-foreground">
          구독 플랜을 변경하려면 고객 지원팀에 문의하세요.
        </p>
      </div>

      {/* 저장 버튼 */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!isDirty || updateProfile.isPending}
        >
          {updateProfile.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              저장 중...
            </>
          ) : (
            "변경사항 저장"
          )}
        </Button>
      </div>
    </form>
  );
}
