import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSignIn } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { LogIn, Loader2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const signInMutation = useSignIn();

  // 로그인 성공 시 대시보드로 이동
  useEffect(() => {
    if (signInMutation.isSuccess) {
      navigate("/");
    }
  }, [signInMutation.isSuccess, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("이메일과 비밀번호를 입력해주세요");
      return;
    }

    signInMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center">
              <img src="/favicon.svg" alt="메디콘솔 로고" className="h-10 w-10" />
            </div>
            <div>
              <CardTitle className="text-2xl">로그인</CardTitle>
              <CardDescription className="text-xs text-slate-500">메디콘솔 AI Tool</CardDescription>
            </div>
          </div>
          <CardDescription>
            이메일과 비밀번호를 입력하여 로그인하세요
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {/* 베타 테스트 안내 */}
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-slate-700 ml-2">
                <p className="font-semibold text-blue-900 mb-2">메디콘솔 AI Tool은 현재 베타 테스트 중입니다.</p>
                <p className="mb-2">본 서비스는 사전 선정된 의료종사자에게만 아이디와 비밀번호가 발급되어 이용하실 수 있습니다.</p>
                <p className="text-xs mt-2">
                  <span className="font-medium">베타 테스트 참가 문의:</span>
                  <br />
                  <a href="mailto:admin@mediconsol.com" className="text-blue-600 hover:underline">
                    admin@mediconsol.com
                  </a>
                  {" 또는 "}
                  <a
                    href="https://www.mediconsol.com/consulting"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    문의신청 페이지
                  </a>
                </p>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={signInMutation.isPending}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">비밀번호</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-teal-600 hover:text-teal-700 hover:underline"
                >
                  비밀번호 찾기
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={signInMutation.isPending}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
              disabled={signInMutation.isPending}
            >
              {signInMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  로그인 중...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  로그인
                </>
              )}
            </Button>
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
