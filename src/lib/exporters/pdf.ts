/**
 * PDF出力 — ブラウザのネイティブ印刷機能を利用する方式
 *
 * 【なぜjsPDF + フォント埋め込みをしないか】
 * jsPDFのデフォルトフォント(helvetica)は日本語非対応で文字化けが発生する。
 * Noto Sans JP等の日本語フォントをbase64埋め込みすると1ファイル6〜10MBになり
 * バンドルサイズ・初回ロードに大きな悪影響を与える。
 *
 * 【採用方式: window.print()】
 * 1. 帳票HTMLを新規ウィンドウで開く
 * 2. ブラウザ組み込みのフォントレンダリングを使うため日本語が正しく表示される
 * 3. ユーザーが「印刷→PDFとして保存」することで完全な日本語PDFが得られる
 * 4. 追加依存ゼロ
 *
 * 【本実装への移行パス】
 * - @react-pdf/renderer + カスタムフォント（Noto Sans JP）で完全自動PDF生成が可能
 * - または Puppeteer/Playwright をサーバーサイドで動かす方式
 */

import type { Document } from '../../types'

function buildPrintHTML(doc: Document): string {
  const fmtNum = (n: number) => `¥${Math.round(n).toLocaleString('ja-JP')}`
  const itemRows = doc.items
    .map(
      (item) => `
      <tr>
        <td>${item.productCode || '—'}</td>
        <td>${item.productName}</td>
        <td class="right">${item.quantity}</td>
        <td class="right">${fmtNum(item.unitPrice)}</td>
        <td class="right bold">${fmtNum(item.subtotal)}</td>
      </tr>`
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <title>発注書 ${doc.id.slice(0, 8).toUpperCase()}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Meiryo', sans-serif;
      font-size: 11pt;
      color: #111;
      padding: 20mm;
      background: #fff;
    }
    h1 { font-size: 20pt; font-weight: 700; text-align: center; margin-bottom: 8mm; letter-spacing: 0.05em; }
    .meta { display: flex; justify-content: space-between; margin-bottom: 8mm; font-size: 10pt; }
    .meta-group { display: flex; flex-direction: column; gap: 3px; }
    .label { color: #666; font-size: 9pt; }
    .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; margin-bottom: 8mm; }
    .party h2 { font-size: 9pt; color: #666; margin-bottom: 2mm; }
    .party p { font-size: 11pt; font-weight: 600; }
    hr { border: none; border-top: 1.5px solid #333; margin: 4mm 0; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 6mm; }
    thead tr { background: #f4f4f8; }
    th {
      padding: 3mm 2mm;
      font-size: 9pt;
      font-weight: 600;
      border-bottom: 1px solid #ccc;
      text-align: left;
    }
    th.right, td.right { text-align: right; }
    td {
      padding: 2.5mm 2mm;
      font-size: 10pt;
      border-bottom: 1px solid #e8e8e8;
    }
    td.bold { font-weight: 600; }
    .totals { margin-left: auto; width: 60mm; margin-bottom: 6mm; }
    .totals table { border-collapse: collapse; }
    .totals td { padding: 1.5mm 2mm; font-size: 10pt; border: none; }
    .totals .grand { font-size: 13pt; font-weight: 700; border-top: 2px solid #333; }
    .memo { font-size: 9.5pt; color: #444; margin-top: 6mm; padding: 3mm; border: 1px solid #ccc; border-radius: 3px; }
    .memo-label { font-weight: 600; margin-bottom: 1mm; font-size: 9pt; color: #666; }
    @media print {
      @page { size: A4; margin: 15mm; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <h1>発 注 書</h1>
  <div class="meta">
    <div class="meta-group">
      <span class="label">発注書番号</span>
      <span>${doc.id.slice(0, 8).toUpperCase()}</span>
    </div>
    <div class="meta-group" style="text-align:right">
      <span class="label">発行日</span>
      <span>${doc.issueDate}</span>
      <span class="label" style="margin-top:4px">納期</span>
      <span>${doc.dueDate || '—'}</span>
    </div>
  </div>
  <hr />
  <div class="parties">
    <div class="party">
      <h2>発注先</h2>
      <p>${doc.recipientName || '—'}</p>
    </div>
    <div class="party">
      <h2>発注者</h2>
      <p>${doc.issuerName || '—'}</p>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width:18%">品番</th>
        <th>商品名</th>
        <th class="right" style="width:10%">数量</th>
        <th class="right" style="width:16%">単価</th>
        <th class="right" style="width:16%">金額</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>
  <div class="totals">
    <table>
      <tr><td>小計</td><td class="right">${fmtNum(doc.subtotal)}</td></tr>
      <tr><td>消費税（10%）</td><td class="right">${fmtNum(doc.tax)}</td></tr>
      <tr class="grand"><td><strong>合計金額</strong></td><td class="right"><strong>${fmtNum(doc.total)}</strong></td></tr>
    </table>
  </div>
  ${doc.memo ? `<div class="memo"><div class="memo-label">備考</div>${doc.memo}</div>` : ''}
  <script>
    // Google Fontsの読み込み完了を待ってから印刷ダイアログを開く
    document.fonts.ready.then(() => {
      window.print();
    });
  </script>
</body>
</html>`
}

export async function exportDocumentToPDF(doc: Document): Promise<void> {
  const html = buildPrintHTML(doc)
  const blob = new Blob([html], { type: 'text/html; charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const win = window.open(url, '_blank', 'width=794,height=1123')
  if (!win) {
    // ポップアップブロッカーで弾かれた場合はダウンロードにフォールバック
    const a = document.createElement('a')
    a.href = url
    a.download = `purchase-order-${doc.id.slice(0, 8)}.html`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
    return
  }

  // ウィンドウが読み込まれたらリソースを解放
  win.addEventListener('afterprint', () => {
    win.close()
    URL.revokeObjectURL(url)
  })
  // afterprintが発火しない環境用のフォールバック
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}
