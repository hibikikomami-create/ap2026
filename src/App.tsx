import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Welcome from './pages/Welcome'
import Step1BusinessType from './pages/Onboarding/Step1BusinessType'
import Step2SalesChannel from './pages/Onboarding/Step2SalesChannel'
import Step3UserRole from './pages/Onboarding/Step3UserRole'
import Step4CostItems from './pages/Onboarding/Step4CostItems'
import Step5Numbers from './pages/Onboarding/Step5Numbers'
import StepResult from './pages/Onboarding/StepResult'
import Dashboard from './pages/Dashboard'
import ProductDetail from './pages/ProductDetail'
import DocumentsNew from './pages/Documents'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/onboarding/1" element={<Step1BusinessType />} />
        <Route path="/onboarding/2" element={<Step2SalesChannel />} />
        <Route path="/onboarding/3" element={<Step3UserRole />} />
        <Route path="/onboarding/4" element={<Step4CostItems />} />
        <Route path="/onboarding/5" element={<Step5Numbers />} />
        <Route path="/onboarding/result" element={<StepResult />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/documents/new" element={<DocumentsNew />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
