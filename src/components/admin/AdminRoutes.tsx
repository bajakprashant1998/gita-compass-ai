import AdminLayout from '@/components/admin/AdminLayout';
import { Routes, Route } from "react-router-dom";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminShlokList from "@/pages/admin/AdminShlokList";
import AdminShlokForm from "@/pages/admin/AdminShlokForm";
import AdminProblemList from "@/pages/admin/AdminProblemList";
import AdminProblemForm from "@/pages/admin/AdminProblemForm";
import AdminChapterList from "@/pages/admin/AdminChapterList";
import AdminChapterForm from "@/pages/admin/AdminChapterForm";
import AdminLanguages from "@/pages/admin/AdminLanguages";
import AdminAIRules from "@/pages/admin/AdminAIRules";
import AdminActivityLog from "@/pages/admin/AdminActivityLog";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminSEOPages from "@/pages/admin/AdminSEOPages";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminForgotPasswordPage from "@/pages/admin/AdminForgotPasswordPage";
import AdminResetPasswordPage from "@/pages/admin/AdminResetPasswordPage";
import AdminBlogList from "@/pages/admin/AdminBlogList";
import AdminBlogForm from "@/pages/admin/AdminBlogForm";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminContactSubmissions from "@/pages/admin/AdminContactSubmissions";
import AdminScheduleCalendar from "@/pages/admin/AdminScheduleCalendar";
import AdminSystemHealth from "@/pages/admin/AdminSystemHealth";
import AdminSEOAudit from "@/pages/admin/AdminSEOAudit";
import AdminRedirects from "@/pages/admin/AdminRedirects";

export default function AdminRoutes() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="login" element={<AdminLoginPage />} />
        <Route path="forgot-password" element={<AdminForgotPasswordPage />} />
        <Route path="reset-password" element={<AdminResetPasswordPage />} />

        <Route element={<AdminLayout />}>
          <Route path="" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
          <Route path="shloks" element={<AdminProtectedRoute><AdminShlokList /></AdminProtectedRoute>} />
          <Route path="shloks/create" element={<AdminProtectedRoute><AdminShlokForm /></AdminProtectedRoute>} />
          <Route path="shloks/edit/:id" element={<AdminProtectedRoute><AdminShlokForm /></AdminProtectedRoute>} />
          <Route path="problems" element={<AdminProtectedRoute><AdminProblemList /></AdminProtectedRoute>} />
          <Route path="problems/create" element={<AdminProtectedRoute><AdminProblemForm /></AdminProtectedRoute>} />
          <Route path="problems/edit/:id" element={<AdminProtectedRoute><AdminProblemForm /></AdminProtectedRoute>} />
          <Route path="chapters" element={<AdminProtectedRoute><AdminChapterList /></AdminProtectedRoute>} />
          <Route path="chapters/edit/:id" element={<AdminProtectedRoute><AdminChapterForm /></AdminProtectedRoute>} />
          <Route path="languages" element={<AdminProtectedRoute><AdminLanguages /></AdminProtectedRoute>} />
          <Route path="ai-rules" element={<AdminProtectedRoute><AdminAIRules /></AdminProtectedRoute>} />
          <Route path="activity" element={<AdminProtectedRoute><AdminActivityLog /></AdminProtectedRoute>} />
          <Route path="settings" element={<AdminProtectedRoute><AdminSettings /></AdminProtectedRoute>} />
          <Route path="analytics" element={<AdminProtectedRoute><AdminAnalytics /></AdminProtectedRoute>} />
          <Route path="users" element={<AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>} />
          <Route path="contacts" element={<AdminProtectedRoute><AdminContactSubmissions /></AdminProtectedRoute>} />
          <Route path="schedule" element={<AdminProtectedRoute><AdminScheduleCalendar /></AdminProtectedRoute>} />
          <Route path="health" element={<AdminProtectedRoute><AdminSystemHealth /></AdminProtectedRoute>} />
          <Route path="seo" element={<AdminProtectedRoute><AdminSEOPages /></AdminProtectedRoute>} />
          <Route path="seo-audit" element={<AdminProtectedRoute><AdminSEOAudit /></AdminProtectedRoute>} />
          <Route path="redirects" element={<AdminProtectedRoute><AdminRedirects /></AdminProtectedRoute>} />
          <Route path="blog" element={<AdminProtectedRoute><AdminBlogList /></AdminProtectedRoute>} />
          <Route path="blog/create" element={<AdminProtectedRoute><AdminBlogForm /></AdminProtectedRoute>} />
          <Route path="blog/edit/:id" element={<AdminProtectedRoute><AdminBlogForm /></AdminProtectedRoute>} />
        </Route>
      </Routes>
    </AdminAuthProvider>
  );
}
