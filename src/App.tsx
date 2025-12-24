import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Programs from "./pages/Programs";
import Prompts from "./pages/Prompts";
import AIExecute from "./pages/AIExecute";
import Projects from "./pages/Projects";
import History from "./pages/History";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
          <Route path="/programs" element={<DashboardLayout><Programs /></DashboardLayout>} />
          <Route path="/prompts" element={<DashboardLayout><Prompts /></DashboardLayout>} />
          <Route path="/ai-execute" element={<DashboardLayout><AIExecute /></DashboardLayout>} />
          <Route path="/projects" element={<DashboardLayout><Projects /></DashboardLayout>} />
          <Route path="/history" element={<DashboardLayout><History /></DashboardLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
