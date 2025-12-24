import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import LoginPage from "@/modules/auth/LoginPage";
import AuthDebugPage from "@/modules/auth/AuthDebugPage";
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
import SystemMonitoringPage from "@/modules/admin/SystemMonitoringPage";
import ClassAnalyticsPage from "@/modules/teacher/ClassAnalyticsPage";
import DashboardLayout from "./components/layouts/DashboardLayout";
import NotFound from "./pages/NotFound";
import StudentDashboard from "@/modules/student/StudentDashboard";
import TeacherDashboard from "@/modules/teacher/TeacherDashboard";
import AdminDashboard from "@/modules/admin/AdminDashboard";
import StudentSettingsPage from "@/modules/student/StudentSettingsPage";
import TeacherSettingsPage from "@/modules/teacher/TeacherSettingsPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

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
            <Route path="/auth" element={<LoginPage />} />
            <Route
              path="/auth/debug"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AuthDebugPage />
                </ProtectedRoute>
              }
            />
            <Route element={<DashboardLayout />}>
              {/* Role-dispatcher for backwards compatibility and deep links */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["admin", "teacher", "student"]}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/system-overview"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <SystemOverviewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                 path="/admin/evaluation-config"
                 element={
                   <ProtectedRoute allowedRoles={["admin"]}>
                     <EvaluationConfigPage />
                   </ProtectedRoute>
                 }
               />
               <Route
                 path="/admin/system-monitoring"
                 element={
                   <ProtectedRoute allowedRoles={["admin"]}>
                     <SystemMonitoringPage />
                   </ProtectedRoute>
                 }
               />
               <Route
                 path="/admin/logs/evaluations"
                 element={
                   <ProtectedRoute allowedRoles={["admin"]}>
                     <EvaluationLogsPage />
                   </ProtectedRoute>
                 }
               />
               <Route
                 path="/admin/logs/errors"
                 element={
                   <ProtectedRoute allowedRoles={["admin"]}>
                     <ErrorLogsPage />
                   </ProtectedRoute>
                 }
               />

              {/* Teacher routes */}
              <Route
                path="/teacher/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <TeacherDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/rubrics"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <Rubrics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/submissions"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <Submissions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/finalization"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <Submissions
                      basePath="/teacher/finalization"
                      defaultStatusFilter="graded"
                    />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/submissions/:id"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <SubmissionDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/analytics"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <ClassAnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/settings"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <TeacherSettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Student routes */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentDashboard view="dashboard" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/report-submission"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentDashboard view="submission" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/results"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentDashboard view="results" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/download"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentDashboard view="download" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/settings"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentSettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/panel"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentDashboard view="all" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/my-submissions"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <MySubmissionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/submission/:id"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <SubmissionDetail />
                  </ProtectedRoute>
                }
              />
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
