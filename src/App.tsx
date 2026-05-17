import { lazy, Suspense, useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { AuthGuard } from './components/AuthGuard'
import { ToastContainer } from './components/common/Toast'
import { useAuthStore } from './store/authStore'

const Welcome = lazy(() => import('./pages/Welcome'))
const Home = lazy(() => import('./pages/Home'))
const Step1BusinessType = lazy(() => import('./pages/Onboarding/Step1BusinessType'))
const Step2SalesChannel = lazy(() => import('./pages/Onboarding/Step2SalesChannel'))
const Step3UserRole = lazy(() => import('./pages/Onboarding/Step3UserRole'))
const Step4CostItems = lazy(() => import('./pages/Onboarding/Step4CostItems'))
const Step5Numbers = lazy(() => import('./pages/Onboarding/Step5Numbers'))
const StepResult = lazy(() => import('./pages/Onboarding/StepResult'))
const SheetResult = lazy(() => import('./pages/SheetResult'))
const ProductsPage = lazy(() => import('./pages/Products'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const DocumentsList = lazy(() => import('./pages/Documents/List'))
const DocumentsNew = lazy(() => import('./pages/Documents'))
const Settings = lazy(() => import('./pages/Settings'))
const ChatPage = lazy(() => import('./pages/Chat'))
const CalendarPage = lazy(() => import('./pages/Calendar'))
const LoginPage = lazy(() => import('./pages/Login'))
const SignupPage = lazy(() => import('./pages/Signup'))
const WebDashboardPreview = lazy(() => import('./pages/Preview/WebDashboard'))

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
        <Suspense fallback={<div style={{ minHeight: '100dvh' }} />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/" element={<Welcome />} />
            <Route path="/onboarding/1" element={<Step1BusinessType />} />
            <Route path="/onboarding/2" element={<Step2SalesChannel />} />
            <Route path="/onboarding/3" element={<Step3UserRole />} />
            <Route path="/onboarding/4" element={<Step4CostItems />} />
            <Route path="/onboarding/5" element={<Step5Numbers />} />
            <Route path="/onboarding/result" element={<StepResult />} />
            <Route path="/sheet-result" element={<SheetResult />} />
            <Route path="/home" element={<AuthGuard><Home /></AuthGuard>} />
            <Route path="/products" element={<AuthGuard><ProductsPage /></AuthGuard>} />
            <Route path="/products/new" element={<AuthGuard><ProductDetail /></AuthGuard>} />
            <Route path="/products/:id" element={<AuthGuard><ProductDetail /></AuthGuard>} />
            <Route path="/documents" element={<AuthGuard><DocumentsList /></AuthGuard>} />
            <Route path="/documents/new" element={<AuthGuard><DocumentsNew /></AuthGuard>} />
            <Route path="/documents/:id" element={<AuthGuard><DocumentsNew /></AuthGuard>} />
            <Route path="/chat" element={<AuthGuard><ChatPage /></AuthGuard>} />
            <Route path="/calendar" element={<AuthGuard><CalendarPage /></AuthGuard>} />
            <Route path="/settings" element={<AuthGuard><Settings /></AuthGuard>} />
            <Route path="/preview/web-dashboard" element={<AuthGuard><WebDashboardPreview /></AuthGuard>} />
            <Route path="/dashboard" element={<Navigate to="/products" replace />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </Suspense>
      </AppShell>
    </HashRouter>
  )
}
