import { supabase, isSupabaseEnabled } from '../supabase'
import type { Product } from '../../types'

function toDb(p: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }, userId: string) {
  return {
    id: p.id,
    user_id: userId,
    project_id: p.projectId || null,
    name: p.name,
    code: p.code,
    category: p.category,
    colors: p.colors,
    sizes: p.sizes,
    selling_price: p.sellingPrice,
    wholesale_price: p.wholesalePrice,
    unit_cost: p.unitCost,
    monthly_fixed_cost: p.monthlyFixedCost,
    payment_fee_rate: p.paymentFeeRate,
    discount_rate: p.discountRate,
    shipping_cost: p.shippingCost,
    sales_channels: p.salesChannels,
    status: p.status,
    expected_sales_volume: p.expectedSalesVolume,
    memo: p.memo,
    image_url: p.imageUrl ?? '',
  }
}

function fromDb(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    projectId: (row.project_id as string | null) ?? '',
    name: row.name as string,
    code: row.code as string,
    category: row.category as Product['category'],
    colors: (row.colors as string[]) ?? [],
    sizes: (row.sizes as string[]) ?? [],
    variants: [],
    sellingPrice: row.selling_price as number,
    wholesalePrice: row.wholesale_price as number,
    unitCost: row.unit_cost as number,
    additionalCosts: [],
    monthlyFixedCost: row.monthly_fixed_cost as number,
    paymentFeeRate: row.payment_fee_rate as number,
    discountRate: row.discount_rate as number,
    shippingCost: row.shipping_cost as number,
    salesChannels: (row.sales_channels as Product['salesChannels']) ?? [],
    status: row.status as Product['status'],
    expectedSalesVolume: row.expected_sales_volume as number,
    memo: (row.memo as string) ?? '',
    imageUrl: (row.image_url as string) || undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export async function fetchProducts(userId: string): Promise<{ data: Product[]; error: string | null }> {
  if (!isSupabaseEnabled || !supabase) return { data: [], error: null }
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  if (error) return { data: [], error: error.message }
  return { data: (data ?? []).map(fromDb), error: null }
}

export async function createProduct(
  product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
  userId: string
): Promise<{ data: Product | null; error: string | null }> {
  if (!isSupabaseEnabled || !supabase) return { data: null, error: null }
  const { data, error } = await supabase
    .from('products')
    .insert(toDb(product, userId))
    .select()
    .single()
  if (error) return { data: null, error: error.message }
  return { data: fromDb(data as Record<string, unknown>), error: null }
}

export async function updateProduct(
  id: string,
  patch: Partial<Product>,
  userId: string
): Promise<{ error: string | null }> {
  if (!isSupabaseEnabled || !supabase) return { error: null }
  const dbPatch: Record<string, unknown> = {}
  if (patch.name !== undefined) dbPatch.name = patch.name
  if (patch.code !== undefined) dbPatch.code = patch.code
  if (patch.category !== undefined) dbPatch.category = patch.category
  if (patch.colors !== undefined) dbPatch.colors = patch.colors
  if (patch.sizes !== undefined) dbPatch.sizes = patch.sizes
  if (patch.sellingPrice !== undefined) dbPatch.selling_price = patch.sellingPrice
  if (patch.wholesalePrice !== undefined) dbPatch.wholesale_price = patch.wholesalePrice
  if (patch.unitCost !== undefined) dbPatch.unit_cost = patch.unitCost
  if (patch.monthlyFixedCost !== undefined) dbPatch.monthly_fixed_cost = patch.monthlyFixedCost
  if (patch.paymentFeeRate !== undefined) dbPatch.payment_fee_rate = patch.paymentFeeRate
  if (patch.discountRate !== undefined) dbPatch.discount_rate = patch.discountRate
  if (patch.shippingCost !== undefined) dbPatch.shipping_cost = patch.shippingCost
  if (patch.salesChannels !== undefined) dbPatch.sales_channels = patch.salesChannels
  if (patch.status !== undefined) dbPatch.status = patch.status
  if (patch.expectedSalesVolume !== undefined) dbPatch.expected_sales_volume = patch.expectedSalesVolume
  if (patch.memo !== undefined) dbPatch.memo = patch.memo
  if (patch.imageUrl !== undefined) dbPatch.image_url = patch.imageUrl
  dbPatch.updated_at = new Date().toISOString()

  const { error } = await supabase
    .from('products')
    .update(dbPatch)
    .eq('id', id)
    .eq('user_id', userId)
  return { error: error ? error.message : null }
}

export async function deleteProduct(id: string, userId: string): Promise<{ error: string | null }> {
  if (!isSupabaseEnabled || !supabase) return { error: null }
  const { error } = await supabase
    .from('products')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
  return { error: error ? error.message : null }
}
