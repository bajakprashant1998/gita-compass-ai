import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import ChaptersPage from "./pages/ChaptersPage";
import ChapterDetailPage from "./pages/ChapterDetailPage";
import ProblemsPage from "./pages/ProblemsPage";
import ProblemDetailPage from "./pages/ProblemDetailPage";
import ShlokDetailPage from "./pages/ShlokDetailPage";
import ShlokByVerseRedirect from "./pages/ShlokByVerseRedirect";
import ChatPage from "./pages/ChatPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminShlokList from "./pages/admin/AdminShlokList";
import AdminShlokForm from "./pages/admin/AdminShlokForm";
import AdminProblemList from "./pages/admin/AdminProblemList";
import AdminProblemForm from "./pages/admin/AdminProblemForm";
import AdminChapterList from "./pages/admin/AdminChapterList";
import AdminChapterForm from "./pages/admin/AdminChapterForm";
import AdminLanguages from "./pages/admin/AdminLanguages";
import AdminAIRules from "./pages/admin/AdminAIRules";
import AdminActivityLog from "./pages/admin/AdminActivityLog";
import AdminSettings from "./pages/admin/AdminSettings";
import { AdminProtectedRoute } from "./components/admin/AdminProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/chapters" element={<ChaptersPage />} />
              <Route path="/chapters/:chapterNumber" element={<ChapterDetailPage />} />
              <Route path="/chapters/:chapterNumber/verse/:verseNumber" element={<ShlokDetailPage />} />
              <Route path="/chapter/:chapterNumber/verse/:verseNumber" element={<ShlokByVerseRedirect />} />
              <Route path="/shlok/:shlokId" element={<ShlokByVerseRedirect />} />
              <Route path="/problems" element={<ProblemsPage />} />
              <Route path="/problems/:slug" element={<ProblemDetailPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
              <Route path="/admin/shloks" element={<AdminProtectedRoute><AdminShlokList /></AdminProtectedRoute>} />
              <Route path="/admin/shloks/create" element={<AdminProtectedRoute><AdminShlokForm /></AdminProtectedRoute>} />
              <Route path="/admin/shloks/edit/:id" element={<AdminProtectedRoute><AdminShlokForm /></AdminProtectedRoute>} />
              <Route path="/admin/problems" element={<AdminProtectedRoute><AdminProblemList /></AdminProtectedRoute>} />
              <Route path="/admin/problems/create" element={<AdminProtectedRoute><AdminProblemForm /></AdminProtectedRoute>} />
              <Route path="/admin/problems/edit/:id" element={<AdminProtectedRoute><AdminProblemForm /></AdminProtectedRoute>} />
              <Route path="/admin/chapters" element={<AdminProtectedRoute><AdminChapterList /></AdminProtectedRoute>} />
              <Route path="/admin/chapters/edit/:id" element={<AdminProtectedRoute><AdminChapterForm /></AdminProtectedRoute>} />
              <Route path="/admin/languages" element={<AdminProtectedRoute><AdminLanguages /></AdminProtectedRoute>} />
              <Route path="/admin/ai-rules" element={<AdminProtectedRoute><AdminAIRules /></AdminProtectedRoute>} />
              <Route path="/admin/activity" element={<AdminProtectedRoute><AdminActivityLog /></AdminProtectedRoute>} />
              <Route path="/admin/settings" element={<AdminProtectedRoute><AdminSettings /></AdminProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
