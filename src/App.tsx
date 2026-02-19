import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import { CanonicalRedirect } from "./components/CanonicalRedirect";
import { FloatingChatButton } from "./components/chat/FloatingChatButton";

// Eager load the index page for best LCP
import Index from "./pages/Index";

// Lazy load all other routes for code splitting
const ChaptersPage = lazy(() => import("./pages/ChaptersPage"));
const ChapterDetailPage = lazy(() => import("./pages/ChapterDetailPage"));
const ProblemsPage = lazy(() => import("./pages/ProblemsPage"));
const ProblemDetailPage = lazy(() => import("./pages/ProblemDetailPage"));
const ShlokDetailPage = lazy(() => import("./pages/ShlokDetailPage"));
const ShlokByVerseRedirect = lazy(() => import("./pages/ShlokByVerseRedirect"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const DonatePage = lazy(() => import("./pages/DonatePage"));
const ReadingPlansPage = lazy(() => import("./pages/ReadingPlansPage"));
const ReadingPlanDetailPage = lazy(() => import("./pages/ReadingPlanDetailPage"));
const BadgesPage = lazy(() => import("./pages/BadgesPage"));
const CompareVersesPage = lazy(() => import("./pages/CompareVersesPage"));
const MoodFinderPage = lazy(() => import("./pages/MoodFinderPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const StudyGroupsPage = lazy(() => import("./pages/StudyGroupsPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminRoutes = lazy(() => import("@/components/admin/AdminRoutes").then(m => ({ default: m.AdminRoutes })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
  },
});

// Minimal loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <CanonicalRedirect />
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
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
                <Route path="/reading-plans" element={<ReadingPlansPage />} />
                <Route path="/reading-plans/:planId" element={<ReadingPlanDetailPage />} />
                <Route path="/badges" element={<BadgesPage />} />
                <Route path="/compare" element={<CompareVersesPage />} />
                <Route path="/mood" element={<MoodFinderPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                <Route path="/study-groups" element={<StudyGroupsPage />} />

                {/* Admin Routes - handles its own layout and protection */}
                <Route path="/admin/*" element={<AdminRoutes />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            {/* Floating chat button - visible on all pages except /chat */}
            <FloatingChatButton />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
