import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import Welcome from './pages/Welcome'
import Home from './pages/Home'
import Step1BusinessType from './pages/Onboarding/Step1BusinessType'
import Step2SalesChannel from './pages/Onboarding/Step2SalesChannel'
import Step3UserRole from './pages/Onboarding/Step3UserRole'
import Step4CostItems from './pages/Onboarding/Step4CostItems'
import Step5Numbers from './pages/Onboarding/Step5Numbers'
import StepResult from './pages/Onboarding/StepResult'
import SheetResult from './pages/SheetResult'
import Dashboard from './pages/Dashboard'
import ProductDetail from './pages/ProductDetail'
import DocumentsNew from './pages/Documents'
import Settings from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          {/* Landing */}
          <Route path="/" element={<Welcome />} />

          {/* Onboarding wizard — full screen */}
          <Route path="/onboarding/1" element={<Step1BusinessType />} />
          <Route path="/onboarding/2" element={<Step2SalesChannel />} />
          <Route path="/onboarding/3" element={<Step3UserRole />} />
          <Route path="/onboarding/4" element={<Step4CostItems />} />
          <Route path="/onboarding/5" element={<Step5Numbers />} />
          <Route path="/onboarding/result" element={<StepResult />} />

          {/* Sheet generated — full screen */}
          <Route path="/sheet-result" element={<SheetResult />} />

          {/* App shell pages */}
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/documents/new" element={<DocumentsNew />} />
          <Route path="/settings" element={<Settings />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}
