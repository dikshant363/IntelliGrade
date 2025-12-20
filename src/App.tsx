import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "@/modules/auth/AuthPage";
import Dashboard from "./pages/Dashboard";
import Users from "@/modules/admin/UsersPage";
import Rubrics from "@/modules/teacher/RubricsPage";
import SubmissionDetail from "@/modules/teacher/SubmissionDetailPage";
import Submissions from "@/modules/teacher/SubmissionsPage";
import MySubmissionsPage from "@/modules/student/MySubmissionsPage";
import SystemOverviewPage from "@/modules/admin/SystemOverviewPage";
import EvaluationConfigPage from "@/modules/admin/EvaluationConfigPage";
import EvaluationLogsPage from "@/modules/admin/EvaluationLogsPage";
import ErrorLogsPage from "@/modules/admin/ErrorLogsPage";
import ClassAnalyticsPage from "@/modules/teacher/ClassAnalyticsPage";
import DashboardLayout from "./components/layouts/DashboardLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/admin/system-overview" element={<SystemOverviewPage />} />
              <Route path="/admin/evaluation-config" element={<EvaluationConfigPage />} />
              <Route path="/admin/logs/evaluations" element={<EvaluationLogsPage />} />
              <Route path="/admin/logs/errors" element={<ErrorLogsPage />} />
              <Route path="/rubrics" element={<Rubrics />} />
              <Route path="/submissions" element={<Submissions />} />
              <Route path="/my-submissions" element={<MySubmissionsPage />} />
              <Route path="/submission/:id" element={<SubmissionDetail />} />
              <Route path="/teacher/analytics" element={<ClassAnalyticsPage />} />
              {/* Additional protected routes will go here */}
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
