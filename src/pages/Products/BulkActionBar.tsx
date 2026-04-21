import type { ProductStatus } from '../../types'

interface Props {
  count: number
  onClearSelection: () => void
  onBulkStatus: (status: ProductStatus) => void
  onBulkDelete: () => void
  onCreateDocument: () => void
}

export function BulkActionBar({ count, onClearSelection, onBulkStatus, onBulkDelete, onCreateDocument }: Props) {
  if (count === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-gray-900 text-white px-4 py-3 pb-safe shadow-2xl">
      <div className="max-w-5xl mx-auto flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-gray-300">
          {count}件選択中
        </span>
        <div className="flex-1 flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onCreateDocument}
            className="bg-brand-500 text-white text-sm font-semibold px-4 py-2 rounded-lg active:scale-95 transition-all hover:bg-brand-400"
          >
            📄 発注書を作成
          </button>
          <select
            onChange={(e) => {
              if (e.target.value) {
                onBulkStatus(e.target.value as ProductStatus)
                e.target.value = ''
              }
            }}
            className="bg-gray-700 text-white text-sm px-3 py-2 rounded-lg border border-gray-600"
            defaultValue=""
          >
            <option value="" disabled>ステータス変更</option>
            <option value="active">販売中</option>
            <option value="inactive">停止中</option>
            <option value="draft">下書き</option>
            <option value="discontinued">廃番</option>
          </select>
          <button
            type="button"
            onClick={onBulkDelete}
            className="bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg active:scale-95 transition-all hover:bg-red-500"
          >
            削除
          </button>
        </div>
        <button
          type="button"
          onClick={onClearSelection}
          className="text-gray-400 text-sm hover:text-white transition-colors"
        >
          ✕ 解除
        </button>
      </div>
    </div>
  )
}
