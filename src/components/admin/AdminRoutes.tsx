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

/**
 * Admin routes wrapper that provides AdminAuthContext.
 * All routes except /admin/login are protected and require admin authentication.
 */
export function AdminRoutes() {
  return (
    <AdminAuthProvider>
      <Routes>
        {/* Public admin route - login page */}
        <Route path="login" element={<AdminLoginPage />} />

        {/* Protected admin routes - require authentication and use Layout */}
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
          <Route path="seo" element={<AdminProtectedRoute><AdminSEOPages /></AdminProtectedRoute>} />
        </Route>
      </Routes>
    </AdminAuthProvider>
  );
}
