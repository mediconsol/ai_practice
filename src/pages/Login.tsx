import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSignIn } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { LogIn, Loader2, Info, Sparkles, Boxes, Archive, Users, Zap } from "lucide-react";
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
      <div className="w-full max-w-6xl">
        {/* 상단 로고 및 회사명 */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <img src="/favicon.svg" alt="메디콘솔 로고" className="h-12 w-12" />
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl font-bold text-slate-800">메디콘솔</h1>
            <p className="text-sm text-slate-600">병원경영솔루션</p>
          </div>
        </div>

        {/* 로그인 및 서비스 소개 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 로그인 카드 */}
        <Card className="w-full shadow-lg">
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
          <CardDescription className="mt-6 pt-6 border-t border-slate-200">
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
          <CardFooter className="flex flex-col gap-6 pt-6 pb-6">
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
          </CardFooter>
        </form>
      </Card>

        {/* 서비스 소개 카드 */}
        <Card className="w-full shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">메디콘솔 AI Tool</CardTitle>
                <CardDescription className="text-xs">의료업무를 위한 AI 도구 플랫폼</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 서비스 소개 */}
            <div>
              <p className="text-sm text-slate-700 leading-relaxed">
                의료 전문가를 위한 AI 기반 업무 자동화 플랫폼입니다.
                복잡한 의료 업무를 AI로 빠르고 정확하게 처리하세요.
              </p>
            </div>

            {/* 주요 기능 */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 text-sm">주요 기능</h3>

              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm text-slate-900">프롬프트 작업실</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    ChatGPT, Claude, Gemini 등 다양한 AI 모델로 즉시 작업 실행
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Boxes className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-sm text-slate-900">AI도구 제작실</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    코드 없이 나만의 AI 업무 도구를 만들고 바로 사용
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                  <Archive className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-sm text-slate-900">AI소스 수집함</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    AI가 생성한 HTML/Python/React 코드를 실행하고 보관
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-sm text-slate-900">커뮤니티</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    다른 의료 전문가들과 유용한 AI 도구 공유
                  </p>
                </div>
              </div>
            </div>

            {/* 베타 테스터 혜택 */}
            <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg p-4 border border-teal-200">
              <h3 className="font-semibold text-slate-900 text-sm mb-2">베타 테스터 혜택</h3>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-0.5">✓</span>
                  <span>정식 출시 후 프리미엄 기능 무료 제공</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-0.5">✓</span>
                  <span>서비스 개선에 직접 참여 (피드백 반영)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-0.5">✓</span>
                  <span>의료 업무에 최적화된 AI 템플릿 우선 제공</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-0.5">✓</span>
                  <span>베타 기간 동안 무제한 AI 토큰 사용</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>

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
