import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { nanoid } from '../../lib/nanoid'
import { calcProduct, fmt } from '../../lib/calculations'
import type { ChatMessage } from '../../types'

const SUGGESTED = [
  '利益率を上げるための具体的な方法を教えて',
  '仕入れ単価の交渉で使えるポイントは？',
  'SNSでの商品プロモーション戦略を提案して',
  '今の商品ラインナップの課題を分析して',
]

const MODELS = [
  { value: 'claude-haiku-4-5-20251001', label: 'Haiku（高速・低コスト）' },
  { value: 'claude-sonnet-4-6', label: 'Sonnet（バランス型）' },
]

function buildSystemPrompt(settings: ReturnType<typeof useStore.getState>['settings'], products: ReturnType<typeof useStore.getState>['products']) {
  const totalGrossProfit = products.reduce((s, p) => s + calcProduct(p).grossProfit, 0)
  const avgMargin = products.length > 0
    ? products.reduce((s, p) => s + calcProduct(p).grossMargin, 0) / products.length
    : 0
  const productList = products.slice(0, 15).map((p) => {
    const c = calcProduct(p)
    return `  - ${p.name}（¥${p.sellingPrice.toLocaleString()} / 粗利率${c.grossMargin.toFixed(1)}%）`
  }).join('\n')

  return `あなたは個人事業主・クリエイター向けのビジネスアシスタントです。
ユーザーの事業データをもとに、具体的・実践的なアドバイスを日本語で提供してください。

【事業情報】
- 屋号・ブランド名：${settings.companyName || '未設定'}
- 担当者：${settings.displayName || '未設定'}
- 登録商品数：${products.length}件
- 月間粗利見込み：${fmt(totalGrossProfit)}
- 平均粗利率：${avgMargin.toFixed(1)}%

【商品一覧（抜粋）】
${productList || '  まだ登録されていません'}

回答は簡潔・箇条書き多用・具体的な数値や行動指針を含めてください。`
}

export default function ChatPage() {
  const navigate = useNavigate()
  const { settings, products, chatHistory, setChatHistory, clearChatHistory } = useStore()
  const [messages, setMessages] = useState<ChatMessage[]>(chatHistory)
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamText, setStreamText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, streamText])

  const send = useCallback(async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || streaming) return
    if (!settings.apiKey) {
      setError('APIキーが未設定です。設定 → AIアシスタントで入力してください。')
      return
    }

    const userMsg: ChatMessage = { id: nanoid(), role: 'user', content, createdAt: new Date().toISOString() }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    setStreaming(true)
    setStreamText('')
    setError(null)

    let accumulated = ''
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': settings.apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: settings.aiModel || 'claude-haiku-4-5-20251001',
          max_tokens: 1500,
          stream: true,
          system: buildSystemPrompt(settings, products),
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error?.message ?? `APIエラー (${res.status})`)
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        for (const line of decoder.decode(value).split('\n')) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (raw === '[DONE]') continue
          try {
            const evt = JSON.parse(raw)
            if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
              accumulated += evt.delta.text
              setStreamText(accumulated)
            }
          } catch { /* ignore parse errors */ }
        }
      }

      const assistantMsg: ChatMessage = { id: nanoid(), role: 'assistant', content: accumulated, createdAt: new Date().toISOString() }
      const final = [...history, assistantMsg]
      setMessages(final)
      setChatHistory(final)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '送信に失敗しました')
    } finally {
      setStreaming(false)
      setStreamText('')
    }
  }, [input, messages, streaming, settings, products, setChatHistory])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const handleClear = () => {
    setMessages([])
    clearChatHistory()
    setError(null)
  }

  const hasKey = !!settings.apiKey

  return (
    <div className="flex flex-col bg-slate-50" style={{ height: '100svh' }}>
      {/* Header */}
      <div className="page-header shrink-0">
        <div className="page-header-inner">
          <div>
            <h1 className="page-title">AIアシスタント</h1>
            <p className="page-subtitle">事業の疑問・分析・アドバイス</p>
          </div>
          <div className="flex gap-2">
            {messages.length > 0 && (
              <button type="button" onClick={handleClear} className="btn-ghost border border-slate-200 text-sm">
                クリア
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('/settings')}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
              title="AI設定"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {!hasKey ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="card p-6 max-w-sm w-full text-center">
            <div className="text-5xl mb-4">🤖</div>
            <h2 className="font-semibold text-slate-900 mb-2">APIキーを設定してください</h2>
            <p className="text-sm text-slate-500 mb-1">
              Anthropic Console でAPIキーを取得し、設定画面で入力すると使えるようになります。
            </p>
            <p className="text-xs text-slate-400 mb-5">console.anthropic.com</p>
            <button type="button" onClick={() => navigate('/settings')} className="btn-primary w-full">
              設定画面を開く
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
            {messages.length === 0 && !streaming && (
              <div className="py-8 text-center">
                <div className="text-5xl mb-3">💬</div>
                <p className="font-medium text-slate-800 mb-1">なんでも聞いてください</p>
                <p className="text-sm text-slate-400 mb-6">あなたの事業データをもとに回答します</p>
                <div className="space-y-2 max-w-xs mx-auto">
                  {SUGGESTED.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => send(q)}
                      className="w-full text-left text-sm text-brand-700 bg-brand-50 border border-brand-100 rounded-xl px-4 py-2.5 hover:bg-brand-100 active:bg-brand-200 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => <Bubble key={msg.id} msg={msg} />)}

            {streaming && (
              <Bubble
                msg={{ id: '__stream', role: 'assistant', content: streamText || '…', createdAt: '' }}
                isStreaming
              />
            )}

            {error && (
              <div className="flex justify-center">
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-2.5 max-w-xs">
                  {error}
                </div>
              </div>
            )}
          </div>

          {/* Input bar */}
          <div
            className="shrink-0 bg-white border-t border-slate-200 px-4 pt-3"
            style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
          >
            <div className="flex gap-2 items-end max-w-2xl mx-auto">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                }}
                onKeyDown={handleKeyDown}
                placeholder="メッセージを入力… (Enterで送信 / Shift+Enterで改行)"
                disabled={streaming}
                className="flex-1 input-field resize-none min-h-[44px] max-h-32 disabled:opacity-60 leading-relaxed"
                rows={1}
                style={{ height: '44px' }}
              />
              <button
                type="button"
                onClick={() => send()}
                disabled={!input.trim() || streaming}
                className="btn-primary p-2.5 rounded-xl disabled:opacity-40 shrink-0 self-end"
              >
                {streaming ? (
                  <span className="block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-center text-[10px] text-slate-400 mt-1.5">
              モデル: {MODELS.find(m => m.value === (settings.aiModel || 'claude-haiku-4-5-20251001'))?.label}
            </p>
          </div>
        </>
      )}
    </div>
  )
}

function Bubble({ msg, isStreaming }: { msg: ChatMessage; isStreaming?: boolean }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-1">
          AI
        </div>
      )}
      <div
        className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words
          ${isUser
            ? 'bg-brand-600 text-white rounded-br-sm'
            : `bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm ${isStreaming ? 'animate-pulse' : ''}`
          }`}
      >
        {msg.content}
      </div>
    </div>
  )
}
