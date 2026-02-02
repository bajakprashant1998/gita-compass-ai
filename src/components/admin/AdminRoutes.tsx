import { Routes, Route } from "react-router-dom";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
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
import AdminLoginPage from "@/pages/admin/AdminLoginPage";

/**
 * Admin routes wrapper that provides AdminAuthContext.
 * Must be rendered inside BrowserRouter since AdminAuthProvider uses useNavigate.
 */
export function AdminRoutes() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="login" element={<AdminLoginPage />} />
        <Route path="" element={<AdminDashboard />} />
        <Route path="shloks" element={<AdminShlokList />} />
        <Route path="shloks/create" element={<AdminShlokForm />} />
        <Route path="shloks/edit/:id" element={<AdminShlokForm />} />
        <Route path="problems" element={<AdminProblemList />} />
        <Route path="problems/create" element={<AdminProblemForm />} />
        <Route path="problems/edit/:id" element={<AdminProblemForm />} />
        <Route path="chapters" element={<AdminChapterList />} />
        <Route path="chapters/edit/:id" element={<AdminChapterForm />} />
        <Route path="languages" element={<AdminLanguages />} />
        <Route path="ai-rules" element={<AdminAIRules />} />
        <Route path="activity" element={<AdminActivityLog />} />
        <Route path="settings" element={<AdminSettings />} />
      </Routes>
    </AdminAuthProvider>
  );
}
