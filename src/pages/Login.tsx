import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSignIn } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { LogIn, Loader2 } from "lucide-react";

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
              <CardDescription className="text-xs text-slate-500">메디콘솔 AI 프랙티스</CardDescription>
            </div>
          </div>
          <CardDescription>
            이메일과 비밀번호를 입력하여 로그인하세요
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
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
            <div className="text-center text-sm text-slate-600">
              계정이 없으신가요?{" "}
              <Link
                to="/signup"
                className="font-medium text-teal-600 hover:text-teal-700 hover:underline"
              >
                회원가입
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
