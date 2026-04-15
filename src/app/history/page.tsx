'use client'

import { useState, useEffect } from 'react'
import { getAllSessions, deleteSession, clearAllSessions, formatTime, type HistorySession } from '@/lib/history'
import { downloadMarkdown, printSession, downloadAllMarkdown } from '@/lib/export'

const TYPE_LABEL = { chat: '单人对话', brainstorm: '头脑风暴', interrogate: '质疑团' }
const TYPE_ICON  = { chat: '💬', brainstorm: '💡', interrogate: '🔍' }
const TYPE_COLOR = {
  chat:        'border-blue-500/30 bg-blue-500/5',
  brainstorm:  'border-yellow-500/30 bg-yellow-500/5',
  interrogate: 'border-red-500/30 bg-red-500/5',
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<HistorySession[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    getAllSessions().then(s => {
      setSessions(s)
      setLoading(false)
    })
  }, [])

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    await deleteSession(id)
    setSessions(prev => prev.filter(s => s.id !== id))
    if (expanded === id) setExpanded(null)
  }

  async function handleClear() {
    if (!confirm('确定要清空所有历史记录吗？')) return
    await clearAllSessions()
    setSessions([])
    setExpanded(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <p className="text-[#89726b] text-sm animate-pulse">加载中…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">📚 历史记录</h1>
            <p className="text-[#1b1c18]/40 text-sm mt-1">共 {sessions.length} 条对话</p>
          </div>
          {sessions.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => downloadAllMarkdown(sessions)}
                className="text-xs text-[#1b1c18]/40 hover:text-[#1b1c18] transition-colors px-3 py-1.5 border border-[#dcc1b8] rounded-lg hover:border-[#9a4021]/25"
              >
                ↓ 全部导出 .md
              </button>
              <button
                onClick={handleClear}
                className="text-xs text-[#89726b] hover:text-red-400 transition-colors"
              >
                清空全部
              </button>
            </div>
          )}
        </div>

        {/* Empty state */}
        {sessions.length === 0 && (
          <div className="text-center py-20 text-[#89726b]">
            <div className="text-4xl mb-3">🗂️</div>
            <p>暂无历史记录</p>
            <p className="text-xs mt-2">完成一次对话后会自动保存</p>
          </div>
        )}

        {/* Session list */}
        <div className="space-y-3">
          {sessions.map(s => (
            <div key={s.id} className={`border rounded-xl overflow-hidden transition-colors ${TYPE_COLOR[s.type]}`}>
              <div
                className="flex items-start gap-3 p-4 cursor-pointer hover:bg-white/5"
                onClick={() => setExpanded(expanded === s.id ? null : s.id)}
              >
                <span className="text-xl mt-0.5">{TYPE_ICON[s.type]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-[#1b1c18]/40">{TYPE_LABEL[s.type]}</span>
                    {s.type === 'chat' && s.skillEmoji && (
                      <span className="text-xs text-[#56423c]">{s.skillEmoji} {s.skillName}</span>
                    )}
                    {s.type === 'brainstorm' && s.brainstormSkills && (
                      <span className="text-xs text-[#56423c]">
                        {s.brainstormSkills.map(sk => sk.skillEmoji).join(' ')}
                      </span>
                    )}
                    {s.type === 'interrogate' && s.targetName && (
                      <span className="text-xs text-[#56423c]">审查：{s.targetName}</span>
                    )}
                  </div>
                  <p className="text-sm text-[#1b1c18]/80 truncate">{s.title}</p>
                  <p className="text-xs text-[#89726b] mt-1">{formatTime(s.timestamp)}</p>
                </div>
                <div className="flex items-center gap-2 ml-2 shrink-0">
                  <button
                    onClick={e => { e.stopPropagation(); downloadMarkdown(s) }}
                    className="text-[#1b1c18]/25 hover:text-[#56423c] text-xs transition-colors px-1.5 py-0.5 rounded border border-[#dcc1b8] hover:border-[#9a4021]/25"
                    title="下载 Markdown"
                  >
                    .md
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); printSession(s) }}
                    className="text-[#1b1c18]/25 hover:text-[#56423c] text-xs transition-colors px-1.5 py-0.5 rounded border border-[#dcc1b8] hover:border-[#9a4021]/25"
                    title="导出 PDF"
                  >
                    PDF
                  </button>
                  <button
                    onClick={e => handleDelete(s.id, e)}
                    className="text-[#1b1c18]/20 hover:text-red-400 text-xs transition-colors px-1"
                  >
                    删除
                  </button>
                  <span className="text-[#89726b] text-xs">{expanded === s.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {expanded === s.id && (
                <div className="border-t border-[#dcc1b8] p-4 space-y-4">
                  <SessionDetail session={s} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SessionDetail({ session: s }: { session: HistorySession }) {
  if (s.type === 'chat' && s.messages) {
    return (
      <div className="space-y-3">
        {s.messages.map((m, i) => (
          <div key={i} className={`text-sm ${m.role === 'user' ? 'text-[#56423c]' : 'text-[#1b1c18]/90'}`}>
            <span className="text-xs text-[#89726b] mr-2">{m.role === 'user' ? '你' : (s.skillEmoji ?? '') + ' ' + (s.skillName ?? '')}</span>
            <span className="whitespace-pre-wrap">{m.content}</span>
          </div>
        ))}
      </div>
    )
  }
  if (s.type === 'brainstorm' && s.turns) {
    return (
      <div className="space-y-4">
        <p className="text-xs text-[#1b1c18]/40">话题：{s.topic}</p>
        {s.turns.map((t, i) => (
          <div key={i}>
            <div className="text-xs text-[#1b1c18]/40 mb-1">{t.skillEmoji} {t.skillName}</div>
            <p className="text-sm text-[#1b1c18]/80 whitespace-pre-wrap">{t.content}</p>
          </div>
        ))}
      </div>
    )
  }
  if (s.type === 'interrogate') {
    return (
      <div className="space-y-4">
        {s.targetContent && (
          <div>
            <p className="text-xs text-[#1b1c18]/40 mb-1">审查内容</p>
            <p className="text-sm text-[#56423c] whitespace-pre-wrap line-clamp-4">{s.targetContent}</p>
          </div>
        )}
        {s.critiques?.map((c, i) => (
          <div key={i}>
            <div className="text-xs text-[#1b1c18]/40 mb-1">{c.skillEmoji} {c.skillName} 的质疑</div>
            <p className="text-sm text-[#1b1c18]/80 whitespace-pre-wrap">{c.content}</p>
          </div>
        ))}
        {s.synthesis && (
          <div className="border-t border-yellow-500/20 pt-3">
            <div className="text-xs text-yellow-400/60 mb-1">⚖️ 综合裁决</div>
            <p className="text-sm text-[#1b1c18]/80 whitespace-pre-wrap">{s.synthesis}</p>
          </div>
        )}
      </div>
    )
  }
  return null
}
