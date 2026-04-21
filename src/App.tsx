import { useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { AuthGuard } from './components/AuthGuard'
import { ToastContainer } from './components/common/Toast'
import { useAuthStore } from './store/authStore'
import Welcome from './pages/Welcome'
import Home from './pages/Home'
import Step1BusinessType from './pages/Onboarding/Step1BusinessType'
import Step2SalesChannel from './pages/Onboarding/Step2SalesChannel'
import Step3UserRole from './pages/Onboarding/Step3UserRole'
import Step4CostItems from './pages/Onboarding/Step4CostItems'
import Step5Numbers from './pages/Onboarding/Step5Numbers'
import StepResult from './pages/Onboarding/StepResult'
import SheetResult from './pages/SheetResult'
import ProductsPage from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import DocumentsList from './pages/Documents/List'
import DocumentsNew from './pages/Documents'
import Settings from './pages/Settings'
import LoginPage from './pages/Login'
import SignupPage from './pages/Signup'
import WebDashboardPreview from './pages/Preview/WebDashboard'

function AuthInit() {
  const initAuth = useAuthStore((s) => s.initAuth)
  useEffect(() => {
    const unsubscribe = initAuth()
    return unsubscribe
  }, [initAuth])
  return null
}

export default function App() {
  return (
    <HashRouter>
      <AuthInit />
      <ToastContainer />
      <AppShell>
        <Routes>
          {/* Public auth routes (full-screen) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Landing */}
          <Route path="/" element={<Welcome />} />

          {/* Onboarding wizard (full-screen) */}
          <Route path="/onboarding/1" element={<Step1BusinessType />} />
          <Route path="/onboarding/2" element={<Step2SalesChannel />} />
          <Route path="/onboarding/3" element={<Step3UserRole />} />
          <Route path="/onboarding/4" element={<Step4CostItems />} />
          <Route path="/onboarding/5" element={<Step5Numbers />} />
          <Route path="/onboarding/result" element={<StepResult />} />

          {/* Sheet result (full-screen) */}
          <Route path="/sheet-result" element={<SheetResult />} />

          {/* Protected app pages */}
          <Route path="/home" element={<AuthGuard><Home /></AuthGuard>} />

          {/* Products — canonical route */}
          <Route path="/products" element={<AuthGuard><ProductsPage /></AuthGuard>} />
          <Route path="/products/new" element={<AuthGuard><ProductDetail /></AuthGuard>} />
          <Route path="/products/:id" element={<AuthGuard><ProductDetail /></AuthGuard>} />

          {/* Documents */}
          <Route path="/documents" element={<AuthGuard><DocumentsList /></AuthGuard>} />
          <Route path="/documents/new" element={<AuthGuard><DocumentsNew /></AuthGuard>} />

          {/* Settings */}
          <Route path="/settings" element={<AuthGuard><Settings /></AuthGuard>} />

          {/* Preview/test pages */}
          <Route path="/preview/web-dashboard" element={<AuthGuard><WebDashboardPreview /></AuthGuard>} />

          {/* Legacy redirect from old /dashboard route */}
          <Route path="/dashboard" element={<Navigate to="/products" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </AppShell>
    </HashRouter>
  )
}
