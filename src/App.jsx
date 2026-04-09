import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'

// Auth pages
import Login    from './pages/auth/Login'
import Register from './pages/auth/Register'

// Student pages
import StudentLayout       from './components/layouts/StudentLayout'
import StudentDashboard    from './pages/student/Dashboard'
import StudentJobs         from './pages/student/Jobs'
import StudentApplications from './pages/student/Applications'
import StudentInterviews   from './pages/student/Interviews'
import StudentProfile      from './pages/student/Profile'
import StudentDrives       from './pages/student/Drives'

// Company pages
import CompanyLayout       from './components/layouts/CompanyLayout'
import CompanyDashboard    from './pages/company/Dashboard'
import CompanyPostJob      from './pages/company/PostJob'
import CompanyJobs         from './pages/company/Jobs'
import CompanyApplications from './pages/company/Applications'
import CompanyInterviews   from './pages/company/Interviews'
import CompanyProfile      from './pages/company/Profile'

// Admin pages
import AdminLayout      from './components/layouts/AdminLayout'
import AdminDashboard   from './pages/admin/Dashboard'
import AdminStudents    from './pages/admin/Students'
import AdminCompanies   from './pages/admin/Companies'
import AdminDrives      from './pages/admin/Drives'
import AdminReports     from './pages/admin/Reports'
import AdminInterviews  from './pages/admin/Interviews'

// ── Global loading spinner ──────────────────────────────────────────────────
function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  )
}

// ── Private route guard ─────────────────────────────────────────────────────
function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <FullPageSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role}`} replace />
  return children
}

// ── All routes ──────────────────────────────────────────────────────────────
function AppRoutes() {
  const { user, loading } = useAuth()

  // Don't render ANY routes until auth state is resolved.
  // This is the fix for the /undefined flash — previously the root route
  // evaluated user.role before fetchMe() finished, giving /${null} = /undefined
  if (loading) return <FullPageSpinner />

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to={`/${user.role}`} replace />}
      />
      <Route
        path="/register"
        element={!user ? <Register /> : <Navigate to={`/${user.role}`} replace />}
      />

      {/* Student */}
      <Route
        path="/student"
        element={<PrivateRoute roles={['student']}><StudentLayout /></PrivateRoute>}
      >
        <Route index              element={<StudentDashboard />} />
        <Route path="jobs"        element={<StudentJobs />} />
        <Route path="applications" element={<StudentApplications />} />
        <Route path="interviews"  element={<StudentInterviews />} />
        <Route path="drives"      element={<StudentDrives />} />
        <Route path="profile"     element={<StudentProfile />} />
      </Route>

      {/* Company */}
      <Route
        path="/company"
        element={<PrivateRoute roles={['company']}><CompanyLayout /></PrivateRoute>}
      >
        <Route index               element={<CompanyDashboard />} />
        <Route path="post-job"     element={<CompanyPostJob />} />
        <Route path="jobs"         element={<CompanyJobs />} />
        <Route path="applications" element={<CompanyApplications />} />
        <Route path="interviews"   element={<CompanyInterviews />} />
        <Route path="profile"      element={<CompanyProfile />} />
      </Route>

      {/* Admin */}
      <Route
        path="/admin"
        element={<PrivateRoute roles={['admin']}><AdminLayout /></PrivateRoute>}
      >
        <Route index              element={<AdminDashboard />} />
        <Route path="students"    element={<AdminStudents />} />
        <Route path="companies"   element={<AdminCompanies />} />
        <Route path="drives"      element={<AdminDrives />} />
        <Route path="interviews"  element={<AdminInterviews />} />
        <Route path="reports"     element={<AdminReports />} />
      </Route>

      {/* Root redirect — safe because loading=false here */}
      <Route
        path="/"
        element={<Navigate to={user ? `/${user.role}` : '/login'} replace />}
      />

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// ── App root ────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '14px',
                borderRadius: '12px',
              },
              success: { iconTheme: { primary: '#e2a800', secondary: '#fff' } },
            }}
          />
          <AppRoutes />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
