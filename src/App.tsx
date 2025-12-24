import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Dashboard from "./pages/Dashboard";
import Programs from "./pages/Programs";
import ProgramRunner from "./pages/ProgramRunner";
import Prompts from "./pages/Prompts";
import AIExecute from "./pages/AIExecute";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import History from "./pages/History";
import MyPage from "./pages/MyPage";
import UserGuide from "./pages/UserGuide";
import ProgramCollections from "./pages/ProgramCollections";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          {/* 인증 페이지 (로그인 없이 접근 가능) */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* 보호된 페이지 (로그인 필요) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/programs"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Programs />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/programs/:id/run"
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <ProgramRunner />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />
          <Route
            path="/prompts"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Prompts />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-execute"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AIExecute />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Projects />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ProjectDetail />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <History />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-page"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <MyPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-guide"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <UserGuide />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/program-collections"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ProgramCollections />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* 404 페이지 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
