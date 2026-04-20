import { supabase, isSupabaseEnabled } from '../supabase'
import type { Document, DocumentItem } from '../../types'

function itemsFromDb(rows: Record<string, unknown>[]): DocumentItem[] {
  return rows.map((r) => ({
    productId: (r.product_id as string | null) ?? '',
    productName: r.product_name as string,
    productCode: r.product_code as string,
    quantity: r.quantity as number,
    unitPrice: r.unit_price as number,
    subtotal: r.subtotal as number,
    memo: (r.memo as string) ?? '',
  }))
}

function fromDb(row: Record<string, unknown>, items: DocumentItem[]): Document {
  return {
    id: row.id as string,
    projectId: (row.project_id as string | null) ?? '',
    type: row.type as Document['type'],
    title: row.title as string,
    issueDate: row.issue_date as string,
    dueDate: (row.due_date as string | null) ?? '',
    recipientName: row.recipient_name as string,
    issuerName: row.issuer_name as string,
    items,
    subtotal: row.subtotal as number,
    tax: row.tax as number,
    total: row.total as number,
    memo: (row.memo as string) ?? '',
    createdAt: row.created_at as string,
  }
}

export async function fetchDocuments(userId: string): Promise<{ data: Document[]; error: string | null }> {
  if (!isSupabaseEnabled || !supabase) return { data: [], error: null }
  const { data, error } = await supabase
    .from('documents')
    .select('*, document_items(*)')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  if (error) return { data: [], error: error.message }
  const docs = (data ?? []).map((row) => {
    const r = row as Record<string, unknown>
    const items = itemsFromDb((r.document_items as Record<string, unknown>[]) ?? [])
    return fromDb(r, items)
  })
  return { data: docs, error: null }
}

export async function createDocument(
  doc: Omit<Document, 'id' | 'createdAt'>,
  userId: string
): Promise<{ data: Document | null; error: string | null }> {
  if (!isSupabaseEnabled || !supabase) return { data: null, error: null }
  const { data: docRow, error: docErr } = await supabase
    .from('documents')
    .insert({
      user_id: userId,
      project_id: doc.projectId || null,
      type: doc.type,
      title: doc.title,
      issue_date: doc.issueDate,
      due_date: doc.dueDate || null,
      recipient_name: doc.recipientName,
      issuer_name: doc.issuerName,
      subtotal: doc.subtotal,
      tax: doc.tax,
      total: doc.total,
      memo: doc.memo,
    })
    .select()
    .single()
  if (docErr || !docRow) return { data: null, error: docErr?.message ?? 'ドキュメントの作成に失敗しました' }

  const docId = (docRow as Record<string, unknown>).id as string
  if (doc.items.length > 0) {
    const itemRows = doc.items.map((item, idx) => ({
      document_id: docId,
      product_id: item.productId || null,
      product_name: item.productName,
      product_code: item.productCode,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      subtotal: item.subtotal,
      memo: item.memo,
      sort_order: idx,
    }))
    const { error: itemErr } = await supabase.from('document_items').insert(itemRows)
    if (itemErr) return { data: null, error: itemErr.message }
  }

  return { data: fromDb(docRow as Record<string, unknown>, doc.items), error: null }
}

export async function deleteDocument(id: string, userId: string): Promise<{ error: string | null }> {
  if (!isSupabaseEnabled || !supabase) return { error: null }
  const { error } = await supabase
    .from('documents')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
  return { error: error ? error.message : null }
}
