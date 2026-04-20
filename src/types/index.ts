// ─── Enums ────────────────────────────────────────────────────────────────────

export type BusinessType = 'product' | 'service'

export type SalesChannel =
  | 'store'
  | 'ec'
  | 'both'
  | 'wholesale'
  | 'made_to_order'

export type UserRole = 'owner' | 'production_manager' | 'sales'

export type CostItemKey =
  | 'material'
  | 'processing'
  | 'rent'
  | 'utilities'
  | 'labor'
  | 'ec_fee'
  | 'payment_fee'
  | 'shipping'
  | 'packaging'
  | 'advertising'
  | 'accountant'
  | 'communication'
  | 'other'

export type ProductStatus =
  | 'active'
  | 'inactive'
  | 'draft'
  | 'discontinued'

export type ProductCategory =
  | 'apparel'
  | 'accessory'
  | 'food'
  | 'beauty'
  | 'home'
  | 'digital'
  | 'service'
  | 'other'

// ─── Onboarding ───────────────────────────────────────────────────────────────

export interface OnboardingData {
  businessType: BusinessType | null
  salesChannels: SalesChannel[]
  userRole: UserRole | null
  selectedCostItems: CostItemKey[]
  productName: string
  productCode: string
  sellingPrice: number | null
  expectedSalesVolume: number | null
  unitCost: number | null
  monthlyFixedCost: number | null
  paymentFeeRate: number | null
  discountRate: number | null
  shippingCost: number | null
  otherCost: number | null
}

// ─── Calculation Results ──────────────────────────────────────────────────────

export interface CalcResult {
  revenue: number
  totalCost: number
  grossProfit: number
  grossMargin: number
  netProfit: number
  netMargin: number
  breakEvenVolume: number
  breakEvenRevenue: number
  warnings: string[]
}

// ─── Product ──────────────────────────────────────────────────────────────────

export interface CostItem {
  key: CostItemKey
  label: string
  amount: number
}

export interface ProductVariant {
  id: string
  color: string
  size: string
  sku: string
  stock: number
}

export interface Product {
  id: string
  projectId: string
  name: string
  code: string
  category: ProductCategory
  colors: string[]
  sizes: string[]
  variants: ProductVariant[]
  sellingPrice: number
  wholesalePrice: number
  unitCost: number
  additionalCosts: CostItem[]
  monthlyFixedCost: number
  paymentFeeRate: number
  discountRate: number
  shippingCost: number
  salesChannels: SalesChannel[]
  status: ProductStatus
  expectedSalesVolume: number
  memo: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

export interface ProductWithCalc extends Product {
  grossProfit: number
  grossMargin: number
  netProfit: number
  netMargin: number
}

// ─── Project (専用シート) ──────────────────────────────────────────────────────

export interface Project {
  id: string
  name: string
  businessType: BusinessType
  salesChannels: SalesChannel[]
  userRole: UserRole
  selectedCostItems: CostItemKey[]
  createdAt: string
  updatedAt: string
}

// ─── Document ────────────────────────────────────────────────────────────────

export type DocumentType = 'purchase_order'

export interface DocumentItem {
  productId: string
  productName: string
  productCode: string
  quantity: number
  unitPrice: number
  subtotal: number
  memo: string
}

export interface Document {
  id: string
  projectId: string
  type: DocumentType
  title: string
  issueDate: string
  dueDate: string
  recipientName: string
  issuerName: string
  items: DocumentItem[]
  subtotal: number
  tax: number
  total: number
  memo: string
  createdAt: string
}

// ─── User Settings ────────────────────────────────────────────────────────────

export interface UserSettings {
  displayName: string
  email: string
  companyName: string
  companyAddress: string
  companyPhone: string
  logoUrl: string
  taxRate: number
  defaultCurrency: string
  defaultPaymentTerms: string
  outputIncludeLogo: boolean
  outputIncludeTax: boolean
  outputFormat: 'a4' | 'letter'
}

// ─── Store State ─────────────────────────────────────────────────────────────

export interface AppState {
  currentProject: Project | null
  onboarding: OnboardingData
  products: Product[]
  projects: Project[]
  documents: Document[]
  selectedProductIds: string[]
  onboardingStep: number
  settings: UserSettings
  isSeeded: boolean
}

// ─── Column visibility ────────────────────────────────────────────────────────

export interface ColumnConfig {
  key: keyof ProductWithCalc | 'actions'
  label: string
  visible: boolean
}

// ─── Filter / Sort ────────────────────────────────────────────────────────────

export type SortOrder = 'asc' | 'desc'

export interface SortConfig {
  key: keyof ProductWithCalc
  order: SortOrder
}

export interface FilterConfig {
  status: ProductStatus | 'all'
  channel: SalesChannel | 'all'
  search: string
}
