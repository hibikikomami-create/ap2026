import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { fmt } from '../../lib/calculations'

export default function SheetResult() {
  const navigate = useNavigate()
  const { currentProject, products } = useStore()

  const projectProducts = products.filter(
    (p) => currentProject && p.projectId === currentProject.id
  )

  return (
    <div className="min-h-svh bg-gradient-to-br from-brand-600 via-brand-700 to-accent-600 flex flex-col">
      {/* Success animation area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="text-center max-w-sm w-full">
          {/* Icon */}
          <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-6 backdrop-blur-sm shadow-lg">
            ✨
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            専用シートを作成しました
          </h1>
          <p className="text-white/70 text-base leading-relaxed mb-8">
            {currentProject?.name || 'マイシート'} が生成されました。
            商品の管理・編集・帳票出力がすぐに始められます。
          </p>

          {/* Generated items */}
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 mb-8 space-y-3 text-left">
            <div className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-3">
              生成されたコンテンツ
            </div>
            <CheckItem label={`プロジェクト「${currentProject?.name || 'マイシート'}」`} />
            <CheckItem label={`商品 ${projectProducts.length}件`} />
            <CheckItem label="収益計算シート" />
            <CheckItem label="損益分岐点レポート" />
          </div>

          {/* CTAs */}
          <div className="space-y-3 w-full">
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="w-full bg-white text-brand-700 font-bold py-4 rounded-2xl text-lg shadow-lg active:scale-95 transition-all hover:bg-brand-50"
            >
              商品一覧を確認する
            </button>
            <button
              type="button"
              onClick={() => navigate('/documents/new')}
              className="w-full bg-white/15 text-white font-semibold py-4 rounded-2xl active:scale-95 transition-all border border-white/20 hover:bg-white/20"
            >
              発注書を作成する
            </button>
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="w-full text-white/60 text-sm py-2"
            >
              ホームへ戻る
            </button>
          </div>
        </div>
      </div>

      {/* Project details */}
      {projectProducts.length > 0 && (
        <div className="bg-white/10 backdrop-blur-sm px-4 py-6">
          <div className="max-w-sm mx-auto">
            <div className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">
              登録済み商品
            </div>
            <div className="space-y-2">
              {projectProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between bg-white/10 rounded-xl px-3 py-2">
                  <div className="text-white text-sm font-medium truncate">{p.name}</div>
                  <div className="text-white/70 text-sm flex-shrink-0 ml-2">{fmt(p.sellingPrice)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CheckItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <span className="text-white/90 text-sm">{label}</span>
    </div>
  )
}
