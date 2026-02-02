import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
import ContactPage from "./pages/ContactPage";
import DonatePage from "./pages/DonatePage";
import NotFound from "./pages/NotFound";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import { AdminRoutes } from "@/components/admin/AdminRoutes";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
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
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/donate" element={<DonatePage />} />

              {/* Admin Routes - handles its own layout and protection */}
              <Route path="/admin/*" element={<AdminRoutes />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
