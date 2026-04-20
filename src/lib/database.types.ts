/**
 * Supabase データベース型定義
 * supabase/migrations/001_init.sql のスキーマに対応しています。
 */

export interface Database {
  public: {
    Tables: {
      users: {
        Row: DbUser
        Insert: DbUserInsert
        Update: DbUserUpdate
      }
      projects: {
        Row: DbProject
        Insert: DbProjectInsert
        Update: DbProjectUpdate
      }
      products: {
        Row: DbProduct
        Insert: DbProductInsert
        Update: DbProductUpdate
      }
      cost_items: {
        Row: DbCostItem
        Insert: DbCostItemInsert
        Update: DbCostItemUpdate
      }
      documents: {
        Row: DbDocument
        Insert: DbDocumentInsert
        Update: DbDocumentUpdate
      }
      document_items: {
        Row: DbDocumentItem
        Insert: DbDocumentItemInsert
        Update: DbDocumentItemUpdate
      }
      exports: {
        Row: DbExport
        Insert: DbExportInsert
        Update: Partial<DbExportInsert>
      }
    }
  }
}

// ─── Users ────────────────────────────────────────────────────────────────────

export interface DbUser {
  id: string
  display_name: string
  email: string
  company_name: string
  company_address: string
  company_phone: string
  logo_url: string
  tax_rate: number
  default_currency: string
  default_payment_terms: string
  output_include_logo: boolean
  output_include_tax: boolean
  output_format: 'a4' | 'letter'
  created_at: string
  updated_at: string
}
export type DbUserInsert = Omit<DbUser, 'created_at' | 'updated_at'>
export type DbUserUpdate = Partial<DbUserInsert>

// ─── Projects ─────────────────────────────────────────────────────────────────

export interface DbProject {
  id: string
  user_id: string
  name: string
  business_type: 'product' | 'service'
  sales_channels: string[]
  user_role: 'owner' | 'production_manager' | 'sales'
  selected_cost_items: string[]
  deleted_at: string | null
  created_at: string
  updated_at: string
}
export type DbProjectInsert = Omit<DbProject, 'id' | 'created_at' | 'updated_at' | 'deleted_at'> & {
  id?: string
}
export type DbProjectUpdate = Partial<DbProjectInsert>

// ─── Products ─────────────────────────────────────────────────────────────────

export interface DbProduct {
  id: string
  user_id: string
  project_id: string | null
  name: string
  code: string
  category: string
  colors: string[]
  sizes: string[]
  selling_price: number
  wholesale_price: number
  unit_cost: number
  monthly_fixed_cost: number
  payment_fee_rate: number
  discount_rate: number
  shipping_cost: number
  sales_channels: string[]
  status: 'active' | 'inactive' | 'draft' | 'discontinued'
  expected_sales_volume: number
  memo: string
  image_url: string
  deleted_at: string | null
  created_at: string
  updated_at: string
}
export type DbProductInsert = Omit<DbProduct, 'id' | 'created_at' | 'updated_at' | 'deleted_at'> & {
  id?: string
}
export type DbProductUpdate = Partial<DbProductInsert>

// ─── Cost Items ───────────────────────────────────────────────────────────────

export interface DbCostItem {
  id: string
  product_id: string
  user_id: string
  key: string
  label: string
  amount: number
  created_at: string
}
export type DbCostItemInsert = Omit<DbCostItem, 'id' | 'created_at'> & { id?: string }
export type DbCostItemUpdate = Partial<DbCostItemInsert>

// ─── Documents ────────────────────────────────────────────────────────────────

export interface DbDocument {
  id: string
  user_id: string
  project_id: string | null
  type: 'purchase_order'
  title: string
  issue_date: string
  due_date: string | null
  recipient_name: string
  issuer_name: string
  subtotal: number
  tax: number
  total: number
  memo: string
  deleted_at: string | null
  created_at: string
}
export type DbDocumentInsert = Omit<DbDocument, 'id' | 'created_at' | 'deleted_at'> & { id?: string }
export type DbDocumentUpdate = Partial<DbDocumentInsert>

// ─── Document Items ───────────────────────────────────────────────────────────

export interface DbDocumentItem {
  id: string
  document_id: string
  product_id: string | null
  product_name: string
  product_code: string
  quantity: number
  unit_price: number
  subtotal: number
  memo: string
  sort_order: number
}
export type DbDocumentItemInsert = Omit<DbDocumentItem, 'id'> & { id?: string }
export type DbDocumentItemUpdate = Partial<DbDocumentItemInsert>

// ─── Exports ──────────────────────────────────────────────────────────────────

export interface DbExport {
  id: string
  user_id: string
  document_id: string | null
  format: 'pdf' | 'excel' | 'csv'
  file_name: string
  created_at: string
}
export type DbExportInsert = Omit<DbExport, 'id' | 'created_at'> & { id?: string }
