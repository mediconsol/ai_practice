import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Share2 } from "lucide-react";

interface ShareCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onConfirm: () => void;
}

export function ShareCollectionDialog({
  open,
  onOpenChange,
  title,
  onConfirm,
}: ShareCollectionDialogProps) {
  const [checks, setChecks] = useState({
    patientName: false,
    registrationNumber: false,
    contact: false,
    otherPii: false,
  });

  const allChecked = Object.values(checks).every((v) => v);

  const handleConfirm = () => {
    if (allChecked) {
      onConfirm();
      // 체크박스 초기화
      setChecks({
        patientName: false,
        registrationNumber: false,
        contact: false,
        otherPii: false,
      });
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    // 체크박스 초기화
    setChecks({
      patientName: false,
      registrationNumber: false,
      contact: false,
      otherPii: false,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            컬렉션 공유
          </DialogTitle>
          <DialogDescription>
            "{title}"을(를) 다른 의료 전문가들과 공유하시겠습니까?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 경고 메시지 */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>개인정보 보호 필수</strong>
              <br />
              공유 전에 HTML/Python/React 소스 코드에 환자 개인정보가 포함되어 있지 않은지 반드시 확인하세요.
            </AlertDescription>
          </Alert>

          {/* 개인정보 제거 체크리스트 */}
          <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
            <p className="text-sm font-semibold text-foreground">
              개인정보 제거 확인 (필수)
            </p>

            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="check-name"
                  checked={checks.patientName}
                  onCheckedChange={(checked) =>
                    setChecks({ ...checks, patientName: checked as boolean })
                  }
                />
                <Label
                  htmlFor="check-name"
                  className="text-sm font-normal cursor-pointer leading-relaxed"
                >
                  소스 코드에 환자 이름이 포함되어 있지 않습니다
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="check-registration"
                  checked={checks.registrationNumber}
                  onCheckedChange={(checked) =>
                    setChecks({
                      ...checks,
                      registrationNumber: checked as boolean,
                    })
                  }
                />
                <Label
                  htmlFor="check-registration"
                  className="text-sm font-normal cursor-pointer leading-relaxed"
                >
                  소스 코드에 등록번호, 차트번호, 환자번호가 포함되어 있지 않습니다
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="check-contact"
                  checked={checks.contact}
                  onCheckedChange={(checked) =>
                    setChecks({ ...checks, contact: checked as boolean })
                  }
                />
                <Label
                  htmlFor="check-contact"
                  className="text-sm font-normal cursor-pointer leading-relaxed"
                >
                  소스 코드에 전화번호, 주소, 이메일 등 연락처가 포함되어 있지 않습니다
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="check-other"
                  checked={checks.otherPii}
                  onCheckedChange={(checked) =>
                    setChecks({ ...checks, otherPii: checked as boolean })
                  }
                />
                <Label
                  htmlFor="check-other"
                  className="text-sm font-normal cursor-pointer leading-relaxed"
                >
                  소스 코드에 기타 환자를 식별할 수 있는 정보가 포함되어 있지 않습니다
                </Label>
              </div>
            </div>
          </div>

          {/* 공유 안내 */}
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <p className="mb-2">
              ✓ 공유된 컬렉션은 다른 의료 전문가들이 볼 수 있습니다.
            </p>
            <p className="mb-2">
              ✓ 공유 후에도 언제든 공유를 취소할 수 있습니다.
            </p>
            <p>
              ✓ 우수 사례로 선정될 경우 더 많은 사용자에게 노출될 수 있습니다.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            취소
          </Button>
          <Button onClick={handleConfirm} disabled={!allChecked}>
            {allChecked ? "공유하기" : "모든 항목을 확인해주세요"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
