import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from '../lib/nanoid'
import type {
  AppState,
  OnboardingData,
  Product,
  Project,
  Document,
  ProductStatus,
} from '../types'

const defaultOnboarding: OnboardingData = {
  businessType: null,
  salesChannels: [],
  userRole: null,
  selectedCostItems: [],
  productName: '',
  productCode: '',
  sellingPrice: null,
  expectedSalesVolume: null,
  unitCost: null,
  monthlyFixedCost: null,
  paymentFeeRate: null,
  discountRate: null,
  shippingCost: null,
  otherCost: null,
}

interface Actions {
  // Onboarding
  setOnboardingStep: (step: number) => void
  updateOnboarding: (data: Partial<OnboardingData>) => void
  resetOnboarding: () => void
  // Project
  createProject: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Project
  setCurrentProject: (project: Project | null) => void
  // Products
  addProduct: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Product
  updateProduct: (id: string, data: Partial<Product>) => void
  deleteProduct: (id: string) => void
  duplicateProduct: (id: string) => void
  reorderProducts: (ids: string[]) => void
  bulkUpdateStatus: (ids: string[], status: ProductStatus) => void
  bulkDelete: (ids: string[]) => void
  // Selection
  toggleProductSelection: (id: string) => void
  selectAllProducts: (ids: string[]) => void
  clearSelection: () => void
  // Documents
  addDocument: (doc: Omit<Document, 'id' | 'createdAt'>) => Document
  deleteDocument: (id: string) => void
}

type Store = AppState & Actions

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // State
      currentProject: null,
      onboarding: defaultOnboarding,
      products: [],
      documents: [],
      selectedProductIds: [],
      onboardingStep: 0,

      // Onboarding
      setOnboardingStep: (step) => set({ onboardingStep: step }),
      updateOnboarding: (data) =>
        set((s) => ({ onboarding: { ...s.onboarding, ...data } })),
      resetOnboarding: () =>
        set({ onboarding: defaultOnboarding, onboardingStep: 0 }),

      // Project
      createProject: (data) => {
        const now = new Date().toISOString()
        const project: Project = {
          id: nanoid(),
          createdAt: now,
          updatedAt: now,
          ...data,
        }
        set({ currentProject: project })
        return project
      },
      setCurrentProject: (project) => set({ currentProject: project }),

      // Products
      addProduct: (data) => {
        const now = new Date().toISOString()
        const product: Product = {
          id: nanoid(),
          createdAt: now,
          updatedAt: now,
          ...data,
        }
        set((s) => ({ products: [...s.products, product] }))
        return product
      },
      updateProduct: (id, data) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
          ),
        })),
      deleteProduct: (id) =>
        set((s) => ({
          products: s.products.filter((p) => p.id !== id),
          selectedProductIds: s.selectedProductIds.filter((sid) => sid !== id),
        })),
      duplicateProduct: (id) => {
        const src = get().products.find((p) => p.id === id)
        if (!src) return
        const now = new Date().toISOString()
        const copy: Product = {
          ...src,
          id: nanoid(),
          name: `${src.name} (コピー)`,
          code: `${src.code}-copy`,
          createdAt: now,
          updatedAt: now,
        }
        set((s) => ({ products: [...s.products, copy] }))
      },
      reorderProducts: (ids) =>
        set((s) => ({
          products: ids
            .map((id) => s.products.find((p) => p.id === id))
            .filter(Boolean) as Product[],
        })),
      bulkUpdateStatus: (ids, status) =>
        set((s) => ({
          products: s.products.map((p) =>
            ids.includes(p.id) ? { ...p, status, updatedAt: new Date().toISOString() } : p
          ),
        })),
      bulkDelete: (ids) =>
        set((s) => ({
          products: s.products.filter((p) => !ids.includes(p.id)),
          selectedProductIds: s.selectedProductIds.filter((id) => !ids.includes(id)),
        })),

      // Selection
      toggleProductSelection: (id) =>
        set((s) => ({
          selectedProductIds: s.selectedProductIds.includes(id)
            ? s.selectedProductIds.filter((sid) => sid !== id)
            : [...s.selectedProductIds, id],
        })),
      selectAllProducts: (ids) => set({ selectedProductIds: ids }),
      clearSelection: () => set({ selectedProductIds: [] }),

      // Documents
      addDocument: (doc) => {
        const document: Document = {
          id: nanoid(),
          createdAt: new Date().toISOString(),
          ...doc,
        }
        set((s) => ({ documents: [...s.documents, document] }))
        return document
      },
      deleteDocument: (id) =>
        set((s) => ({ documents: s.documents.filter((d) => d.id !== id) })),
    }),
    {
      name: 'ap2026-store',
      partialize: (s) => ({
        currentProject: s.currentProject,
        products: s.products,
        documents: s.documents,
      }),
    }
  )
)

// Selector helpers
export const useCurrentProject = () => useStore((s) => s.currentProject)
export const useProducts = () => useStore((s) => s.products)
export const useSelectedIds = () => useStore((s) => s.selectedProductIds)
export const useOnboarding = () => useStore((s) => s.onboarding)
export const useOnboardingStep = () => useStore((s) => s.onboardingStep)
