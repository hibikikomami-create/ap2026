import * as XLSX from 'xlsx'
import type { Document, Product } from '../../types'
import { calcProduct, fmtPct } from '../calculations'

export function exportDocumentToExcel(doc: Document): void {
  const wb = XLSX.utils.book_new()

  const rows = [
    ['発注書', '', '', '', ''],
    ['発注書番号', doc.id.slice(0, 8).toUpperCase(), '', '発行日', doc.issueDate],
    ['発注先', doc.recipientName, '', '発注者', doc.issuerName],
    ['納期', doc.dueDate || '—', '', '', ''],
    [],
    ['品番', '商品名', '数量', '単価', '金額'],
    ...doc.items.map((item) => [
      item.productCode,
      item.productName,
      item.quantity,
      item.unitPrice,
      item.subtotal,
    ]),
    [],
    ['', '', '', '小計', doc.subtotal],
    ['', '', '', '消費税（10%）', doc.tax],
    ['', '', '', '合計', doc.total],
    [],
    ['備考', doc.memo],
  ]

  const ws = XLSX.utils.aoa_to_sheet(rows)

  // Column widths
  ws['!cols'] = [
    { wch: 15 }, { wch: 30 }, { wch: 10 }, { wch: 15 }, { wch: 15 },
  ]

  XLSX.utils.book_append_sheet(wb, ws, '発注書')
  XLSX.writeFile(wb, `purchase-order-${doc.id.slice(0, 8)}.xlsx`)
}

export function exportProductsToExcel(products: Product[], filename = 'products'): void {
  const wb = XLSX.utils.book_new()

  const header = ['商品名', '品番', '販売価格', '原価', '配送料', '手数料率(%)', '値引率(%)', '想定販売数', '月間粗利', '粗利率', '月間純利益', 'ステータス', '備考']
  const rows = products.map((p) => {
    const c = calcProduct(p)
    return [
      p.name,
      p.code,
      p.sellingPrice,
      p.unitCost,
      p.shippingCost,
      p.paymentFeeRate,
      p.discountRate,
      p.expectedSalesVolume,
      Math.round(c.grossProfit),
      fmtPct(c.grossMargin),
      Math.round(c.netProfit),
      p.status,
      p.memo,
    ]
  })

  const ws = XLSX.utils.aoa_to_sheet([header, ...rows])
  ws['!cols'] = [
    { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 10 },
    { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 10 },
    { wch: 12 }, { wch: 10 }, { wch: 30 },
  ]

  XLSX.utils.book_append_sheet(wb, ws, '商品一覧')
  XLSX.writeFile(wb, `${filename}.xlsx`)
}
