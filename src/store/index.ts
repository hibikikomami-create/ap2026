import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { nanoid } from '../lib/nanoid'
import {
  SAMPLE_PRODUCTS,
  SAMPLE_PROJECTS,
  SAMPLE_DOCUMENTS,
  SAMPLE_SETTINGS,
} from '../lib/sampleData'
import { safeSave, safeLoad, trimDocuments, trimProducts, STORAGE_KEY, isStorageNearLimit } from '../lib/storage'
import type {
  AppState,
  OnboardingData,
  Product,
  Project,
  Document,
  ProductStatus,
  UserSettings,
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
  // Seed
  seedSampleData: () => void
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
  updateDocument: (id: string, data: Partial<Document>) => void
  deleteDocument: (id: string) => void
  duplicateDocument: (id: string) => void
  bulkDeleteDocuments: (ids: string[]) => void
  // Settings
  updateSettings: (patch: Partial<UserSettings>) => void
  // Danger
  resetAllData: () => void
}

type Store = AppState & Actions

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // ── State ─────────────────────────────────────────────────────────────
      currentProject: SAMPLE_PROJECTS[0],
      onboarding: defaultOnboarding,
      products: SAMPLE_PRODUCTS,
      projects: SAMPLE_PROJECTS,
      documents: SAMPLE_DOCUMENTS,
      selectedProductIds: [],
      onboardingStep: 0,
      settings: SAMPLE_SETTINGS,
      isSeeded: true,

      // ── Seed ──────────────────────────────────────────────────────────────
      seedSampleData: () => {
        if (get().isSeeded) return
        set({
          products: SAMPLE_PRODUCTS,
          projects: SAMPLE_PROJECTS,
          documents: SAMPLE_DOCUMENTS,
          currentProject: SAMPLE_PROJECTS[0],
          isSeeded: true,
        })
      },

      // ── Onboarding ────────────────────────────────────────────────────────
      setOnboardingStep: (step) => set({ onboardingStep: step }),
      updateOnboarding: (data) =>
        set((s) => ({ onboarding: { ...s.onboarding, ...data } })),
      resetOnboarding: () =>
        set({ onboarding: defaultOnboarding, onboardingStep: 0 }),

      // ── Project ───────────────────────────────────────────────────────────
      createProject: (data) => {
        const now = new Date().toISOString()
        const project: Project = { id: nanoid(), createdAt: now, updatedAt: now, ...data }
        set((s) => ({
          currentProject: project,
          projects: [...s.projects, project],
        }))
        return project
      },
      setCurrentProject: (project) => set({ currentProject: project }),

      // ── Products ──────────────────────────────────────────────────────────
      addProduct: (data) => {
        const now = new Date().toISOString()
        const product: Product = { id: nanoid(), createdAt: now, updatedAt: now, ...data }
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

      // ── Selection ─────────────────────────────────────────────────────────
      toggleProductSelection: (id) =>
        set((s) => ({
          selectedProductIds: s.selectedProductIds.includes(id)
            ? s.selectedProductIds.filter((sid) => sid !== id)
            : [...s.selectedProductIds, id],
        })),
      selectAllProducts: (ids) => set({ selectedProductIds: ids }),
      clearSelection: () => set({ selectedProductIds: [] }),

      // ── Documents ─────────────────────────────────────────────────────────
      addDocument: (doc) => {
        const document: Document = {
          id: nanoid(),
          createdAt: new Date().toISOString(),
          ...doc,
        }
        set((s) => ({ documents: [...s.documents, document] }))
        return document
      },
      updateDocument: (id, data) =>
        set((s) => ({
          documents: s.documents.map((d) =>
            d.id === id ? { ...d, ...data } : d
          ),
        })),
      deleteDocument: (id) =>
        set((s) => ({ documents: s.documents.filter((d) => d.id !== id) })),
      duplicateDocument: (id) => {
        const src = get().documents.find((d) => d.id === id)
        if (!src) return
        const copy: Document = {
          ...src,
          id: nanoid(),
          title: `${src.title} (コピー)`,
          issueDate: new Date().toISOString().slice(0, 10),
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ documents: [...s.documents, copy] }))
      },
      bulkDeleteDocuments: (ids) =>
        set((s) => ({
          documents: s.documents.filter((d) => !ids.includes(d.id)),
        })),

      // ── Settings ──────────────────────────────────────────────────────────
      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      // ── Danger: 全データリセット ───────────────────────────────────────
      resetAllData: () => {
        set({
          products: [],
          documents: [],
          projects: [],
          currentProject: null,
          selectedProductIds: [],
          onboarding: defaultOnboarding,
          onboardingStep: 0,
          isSeeded: false,
        })
      },
    }),
    {
      name: STORAGE_KEY,
      // カスタムストレージアダプタ: try-catch でクォータ超過を安全に処理
      storage: createJSONStorage(() => ({
        getItem: (key) => safeLoad(key),
        setItem: (key, value) => {
          if (isStorageNearLimit()) {
            console.warn('[store] Storage near limit (>3MB). Consider clearing old data.')
          }
          safeSave(key, value)
        },
        removeItem: (key) => {
          try { localStorage.removeItem(key) } catch { /* ignore */ }
        },
      })),
      // 永続化する項目のみを限定（UI状態は除外して容量を節約）
      partialize: (s) => ({
        currentProject: s.currentProject,
        // 件数が多い場合は古いものからトリミング
        products: trimProducts(s.products),
        projects: s.projects,
        documents: trimDocuments(s.documents),
        settings: s.settings,
        isSeeded: s.isSeeded,
        // selectedProductIds / onboarding / onboardingStep は永続化しない
      }),
    }
  )
)

export const useCurrentProject = () => useStore((s) => s.currentProject)
export const useProducts = () => useStore((s) => s.products)
export const useProjects = () => useStore((s) => s.projects)
export const useSelectedIds = () => useStore((s) => s.selectedProductIds)
export const useOnboarding = () => useStore((s) => s.onboarding)
export const useOnboardingStep = () => useStore((s) => s.onboardingStep)
export const useSettings = () => useStore((s) => s.settings)
export const useDocuments = () => useStore((s) => s.documents)
