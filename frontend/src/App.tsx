import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/auth-context';
import { AdminAuthProvider } from '@/context/admin-auth-context';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import HomePage from '@/pages/home';
import LoginPage from '@/pages/login';
import SignupPage from '@/pages/signup';
import DictionaryPage from '@/pages/dictionary';
import TranslatePage from '@/pages/translate';
import CoursesPage from '@/pages/courses';
import CourseDetailPage from '@/pages/course-detail';
import LessonPage from '@/pages/lesson';
import QuizPage from '@/pages/quiz';
import AdminLoginPage from '@/pages/admin/admin-login';
import AdminDashboardPage from '@/pages/admin/admin-dashboard';
import PracticePage from '@/pages/practice';

const NO_NAVBAR_ROUTES = ['/login', '/signup'];
const ADMIN_PREFIX = '/admin';

function AppShell() {
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith(ADMIN_PREFIX);
  const hideNavbar =
    isAdminRoute || NO_NAVBAR_ROUTES.includes(pathname);

  return (
    <div className="flex min-h-screen flex-col">
      {!hideNavbar && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dictionary" element={<DictionaryPage />} />
          <Route path="/translate" element={<TranslatePage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:courseId" element={<CourseDetailPage />} />
          <Route
            path="/courses/:courseId/lessons/:lessonId"
            element={<LessonPage />}
          />
          <Route path="/courses/:courseId/quiz" element={<QuizPage />} />
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        </Routes>
      </main>
      {!hideNavbar && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <BrowserRouter>
          <AppShell />
          <Toaster richColors position="top-center" />
        </BrowserRouter>
      </AdminAuthProvider>
    </AuthProvider>
  );
}
