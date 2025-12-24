import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSignUp } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { UserPlus, Loader2, CheckCircle2 } from "lucide-react";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [fullName, setFullName] = useState("");
  const [hospital, setHospital] = useState("");
  const [department, setDepartment] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const signUpMutation = useSignUp();

  // 회원가입 성공 시 성공 화면 표시
  useEffect(() => {
    if (signUpMutation.isSuccess) {
      setSuccess(true);
      // 3초 후 로그인 페이지로 이동
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    }
  }, [signUpMutation.isSuccess, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!email || !password || !fullName) {
      toast.error("필수 항목을 입력해주세요");
      return;
    }

    if (password !== passwordConfirm) {
      toast.error("비밀번호가 일치하지 않습니다");
      return;
    }

    if (password.length < 6) {
      toast.error("비밀번호는 최소 6자 이상이어야 합니다");
      return;
    }

    if (!agreed) {
      toast.error("약관에 동의해주세요");
      return;
    }

    signUpMutation.mutate({
      email,
      password,
      fullName,
      hospital,
      department,
    });
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-50 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">회원가입 완료!</CardTitle>
            <CardDescription>
              환영합니다, {fullName}님!
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-slate-600">
              가입하신 이메일 <strong>{email}</strong>로<br />
              인증 메일이 발송되었습니다.
            </p>
            <p className="text-sm text-slate-500">
              이메일을 확인하여 인증을 완료해주세요.
            </p>
            <div className="pt-4">
              <Button
                onClick={() => navigate("/login")}
                className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
              >
                로그인 페이지로 이동
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">회원가입</CardTitle>
              <CardDescription className="text-xs text-slate-500">메디콘솔 AI 프랙티스</CardDescription>
            </div>
          </div>
          <CardDescription>
            메디콘솔 AI 프랙티스에 오신 것을 환영합니다
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            {/* 필수 정보 */}
            <div className="space-y-2">
              <Label htmlFor="email">
                이메일 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={signUpMutation.isPending}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">
                이름 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="홍길동"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={signUpMutation.isPending}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                비밀번호 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="최소 6자 이상"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={signUpMutation.isPending}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">
                비밀번호 확인 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="passwordConfirm"
                type="password"
                placeholder="비밀번호 재입력"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                disabled={signUpMutation.isPending}
                required
              />
            </div>

            {/* 선택 정보 */}
            <div className="pt-2 border-t">
              <p className="text-sm text-slate-500 mb-3">선택 정보</p>

              <div className="space-y-2 mb-3">
                <Label htmlFor="hospital">병원/소속</Label>
                <Input
                  id="hospital"
                  type="text"
                  placeholder="예: 서울대학교병원"
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  disabled={signUpMutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">부서/직책</Label>
                <Input
                  id="department"
                  type="text"
                  placeholder="예: 내과 / 의사"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  disabled={signUpMutation.isPending}
                />
              </div>
            </div>

            {/* 약관 동의 */}
            <div className="flex items-start space-x-2 pt-2">
              <Checkbox
                id="terms"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
                disabled={signUpMutation.isPending}
              />
              <label
                htmlFor="terms"
                className="text-sm text-slate-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                <span className="text-red-500">*</span> 서비스 이용약관 및 개인정보 처리방침에 동의합니다
              </label>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
              disabled={signUpMutation.isPending}
            >
              {signUpMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  가입 중...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  회원가입
                </>
              )}
            </Button>
            <div className="text-center text-sm text-slate-600">
              이미 계정이 있으신가요?{" "}
              <Link
                to="/login"
                className="font-medium text-teal-600 hover:text-teal-700 hover:underline"
              >
                로그인
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>

      {/* 하단 정보 */}
      <div className="fixed bottom-4 text-center text-xs text-slate-500">
        <p>메디콘솔 (병원경영솔루션)</p>
        <p className="mt-1">
          <a href="https://mediconsol.co.kr" target="_blank" rel="noopener noreferrer" className="hover:text-teal-600">
            mediconsol.co.kr
          </a>
          {" · "}
          <a href="mailto:admin@mediconsol.com" className="hover:text-teal-600">
            admin@mediconsol.com
          </a>
        </p>
      </div>
    </div>
  );
}
