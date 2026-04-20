import jsPDF from 'jspdf'
import type { Document } from '../../types'

export async function exportDocumentToPDF(doc: Document): Promise<void> {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const margin = 20
  const pageWidth = 210
  const contentWidth = pageWidth - margin * 2
  let y = margin

  // ── Helpers ─────────────────────────────────────────────────────────────
  const line = (text: string, x: number, fontSize = 10, align: 'left' | 'right' | 'center' = 'left') => {
    pdf.setFontSize(fontSize)
    if (align === 'right') {
      pdf.text(text, x, y, { align: 'right' })
    } else if (align === 'center') {
      pdf.text(text, x, y, { align: 'center' })
    } else {
      pdf.text(text, x, y)
    }
  }

  const nextLine = (h = 6) => { y += h }
  const hRule = () => {
    pdf.setDrawColor(200, 200, 200)
    pdf.line(margin, y, margin + contentWidth, y)
    nextLine(4)
  }

  // Title
  pdf.setFont('helvetica', 'bold')
  line('PURCHASE ORDER', pageWidth / 2, 18, 'center')
  nextLine(8)
  pdf.setFont('helvetica', 'normal')

  // Header meta
  pdf.setFontSize(10)
  pdf.text(`発注書番号: ${doc.id.slice(0, 8).toUpperCase()}`, margin, y)
  pdf.text(`発行日: ${doc.issueDate}`, pageWidth - margin, y, { align: 'right' })
  nextLine(6)
  pdf.text(`納期: ${doc.dueDate || '—'}`, pageWidth - margin, y, { align: 'right' })
  nextLine(8)

  hRule()

  // Parties
  pdf.setFont('helvetica', 'bold')
  pdf.text('発注先', margin, y)
  pdf.text('発注者', pageWidth / 2 + 10, y)
  pdf.setFont('helvetica', 'normal')
  nextLine(6)
  pdf.text(doc.recipientName || '—', margin, y)
  pdf.text(doc.issuerName || '—', pageWidth / 2 + 10, y)
  nextLine(10)

  hRule()

  // Table header
  pdf.setFillColor(245, 245, 250)
  pdf.rect(margin, y - 3, contentWidth, 8, 'F')
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(9)
  pdf.text('品番', margin + 2, y + 2)
  pdf.text('商品名', margin + 25, y + 2)
  pdf.text('数量', margin + 100, y + 2, { align: 'right' })
  pdf.text('単価', margin + 125, y + 2, { align: 'right' })
  pdf.text('金額', margin + contentWidth - 2, y + 2, { align: 'right' })
  pdf.setFont('helvetica', 'normal')
  nextLine(10)

  // Items
  for (const item of doc.items) {
    pdf.setFontSize(9)
    pdf.text(item.productCode || '—', margin + 2, y)
    const name = item.productName.length > 30 ? item.productName.slice(0, 30) + '…' : item.productName
    pdf.text(name, margin + 25, y)
    pdf.text(item.quantity.toString(), margin + 100, y, { align: 'right' })
    pdf.text(`¥${item.unitPrice.toLocaleString()}`, margin + 125, y, { align: 'right' })
    pdf.text(`¥${item.subtotal.toLocaleString()}`, margin + contentWidth - 2, y, { align: 'right' })
    nextLine(7)
    pdf.setDrawColor(235, 235, 235)
    pdf.line(margin, y - 1, margin + contentWidth, y - 1)
  }

  nextLine(4)
  hRule()

  // Totals
  const totalsX = margin + contentWidth
  pdf.setFontSize(10)
  pdf.text('小計', totalsX - 50, y)
  pdf.text(`¥${doc.subtotal.toLocaleString()}`, totalsX, y, { align: 'right' })
  nextLine(6)
  pdf.text('消費税（10%）', totalsX - 60, y)
  pdf.text(`¥${doc.tax.toLocaleString()}`, totalsX, y, { align: 'right' })
  nextLine(6)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(12)
  pdf.text('合計金額', totalsX - 60, y)
  pdf.text(`¥${doc.total.toLocaleString()}`, totalsX, y, { align: 'right' })
  pdf.setFont('helvetica', 'normal')
  nextLine(12)

  // Memo
  if (doc.memo) {
    hRule()
    pdf.setFontSize(9)
    pdf.text('備考:', margin, y)
    nextLine(5)
    pdf.text(doc.memo, margin, y)
  }

  pdf.save(`purchase-order-${doc.id.slice(0, 8)}.pdf`)
}
