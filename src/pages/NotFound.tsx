import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, AlertCircle } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);

    // 카운트다운 타이머
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-orange-600" />
          </div>
          <CardTitle className="text-3xl">404</CardTitle>
          <CardDescription className="text-base">
            페이지를 찾을 수 없습니다
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div>
            <p className="text-sm text-slate-600 mb-2">
              요청하신 페이지가 존재하지 않거나 이동되었습니다.
            </p>
            <p className="text-sm text-slate-500">
              잘못된 경로: <code className="text-xs bg-slate-100 px-2 py-1 rounded">{location.pathname}</code>
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-slate-700">
              <span className="font-semibold text-blue-900">{countdown}초</span> 후 홈 화면으로 자동 이동합니다...
            </p>
          </div>

          <Button
            onClick={() => navigate("/")}
            className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
          >
            <Home className="mr-2 h-4 w-4" />
            지금 홈으로 이동
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
