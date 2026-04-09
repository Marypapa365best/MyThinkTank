'use client'

import { useState, useRef, useEffect } from 'react'
import { SKILLS_REGISTRY } from '@/lib/skills-registry'
import ReactMarkdown from 'react-markdown'
import type { CritiqueItem } from '@/app/api/interrogate/route'

interface CritiqueResult {
  skillId: string
  skillName: string
  skillEmoji: string
  content: string
  isStreaming: boolean
}

interface SynthesisResult {
  content: string
  isStreaming: boolean
}

const MAX_INTERROGATORS = 4

export default function InterrogateInterface() {
  const [targetName, setTargetName] = useState('')
  const [targetContent, setTargetContent] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [critiques, setCritiques] = useState<CritiqueResult[]>([])
  const [synthesis, setSynthesis] = useState<SynthesisResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const availableSkills = SKILLS_REGISTRY.filter(s => s.available)
  const hasStarted = critiques.length > 0

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [critiques, synthesis])

  function toggleSkill(id: string) {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(s => s !== id)
        : prev.length < MAX_INTERROGATORS ? [...prev, id] : prev
    )
  }

  async function streamResponse(
    url: string,
    body: object,
    signal: AbortSignal,
    onChunk: (text: string) => void
  ): Promise<string> {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    })

    if (!res.ok) throw new Error(`API error: ${res.status}`)

    const reader = res.body?.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''

    if (reader) {
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          fullContent += chunk
          onChunk(fullContent)
        }
        const remaining = decoder.decode()
        if (remaining) {
          fullContent += remaining
          onChunk(fullContent)
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') throw err
      }
    }

    return fullContent
  }

  async function startInterrogation() {
    if (selectedIds.length === 0 || !targetContent.trim() || isRunning) return

    setCritiques([])
    setSynthesis(null)
    setIsDone(false)
    setIsRunning(true)

    const abort = new AbortController()
    abortRef.current = abort

    try {
      const collectedCritiques: CritiqueItem[] = []

      // 依次让每个审问者发言（每次请求间隔 800ms，避免触发速率限制）
      for (let i = 0; i < selectedIds.length; i++) {
        if (i > 0) await new Promise(r => setTimeout(r, 2500))
        const skillId = selectedIds[i]
        const skill = availableSkills.find(s => s.id === skillId)!

        // 追加空的 critique 条目
        setCritiques(prev => [
          ...prev,
          { skillId, skillName: skill.name, skillEmoji: skill.emoji, content: '', isStreaming: true },
        ])

        const content = await streamResponse(
          '/api/interrogate',
          {
            skillId,
            targetName,
            targetContent,
            previousCritiques: [...collectedCritiques],
          },
          abort.signal,
          (text) => {
            setCritiques(prev => {
              const updated = [...prev]
              updated[i] = { ...updated[i], content: text }
              return updated
            })
          }
        )

        // 标记该条完成
        setCritiques(prev => {
          const updated = [...prev]
          updated[i] = { ...updated[i], content: content || '（未能获取回答）', isStreaming: false }
          return updated
        })

        collectedCritiques.push({ skillId, skillName: skill.name, content })
      }

      // 综合裁决
      setSynthesis({ content: '', isStreaming: true })

      const verdictContent = await streamResponse(
        '/api/interrogate',
        {
          targetName,
          targetContent,
          previousCritiques: collectedCritiques,
          isSynthesis: true,
        },
        abort.signal,
        (text) => setSynthesis({ content: text, isStreaming: true })
      )

      setSynthesis({ content: verdictContent || '（无法生成裁决）', isStreaming: false })
      setIsDone(true)
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        console.error('Interrogation error:', e)
      }
      setCritiques(prev => prev.map(c =>
        c.isStreaming ? { ...c, isStreaming: false, content: c.content || '（回答失败）' } : c
      ))
      setSynthesis(prev => prev?.isStreaming ? { content: prev.content || '（裁决失败）', isStreaming: false } : prev)
    } finally {
      setIsRunning(false)
    }
  }

  function reset() {
    abortRef.current?.abort()
    setCritiques([])
    setSynthesis(null)
    setIsDone(false)
    setIsRunning(false)
    setTargetContent('')
    setTargetName('')
  }

  const canStart = selectedIds.length > 0 && targetContent.trim().length > 20 && !isRunning

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <h1 className="text-3xl font-bold mb-2">质疑团</h1>
          <p className="text-white/40 text-sm max-w-md mx-auto">
            粘贴任何人的言论，让顶级智囊联合审查——找漏洞、戳谎言、去伪存真
          </p>
        </div>

        {/* Setup Panel */}
        {!hasStarted && (
          <div className="space-y-6">
            {/* Target Input */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
              <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">被审查对象</h2>

              <input
                type="text"
                value={targetName}
                onChange={e => setTargetName(e.target.value)}
                placeholder='对象名称（选填，如 "某AI教父"、"某创投博主"）'
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/25 transition-colors"
              />

              <textarea
                value={targetContent}
                onChange={e => setTargetContent(e.target.value)}
                placeholder={`粘贴被审查的言论、文章或主张…\n\n例如：\n"AI将在3年内取代90%的程序员，现在学编程已经没有意义了。掌握提示词工程才是未来，我的课程将帮助你月入10万…"`}
                rows={7}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 resize-none focus:outline-none focus:border-white/25 transition-colors"
              />
              <div className="text-right text-xs text-white/20">
                {targetContent.length} 字
              </div>
            </div>

            {/* Interrogator Selector */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">
                  选择审问者
                </h2>
                <span className="text-xs text-white/25">最多 {MAX_INTERROGATORS} 位</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {availableSkills.map(skill => {
                  const selected = selectedIds.includes(skill.id)
                  const disabled = !selected && selectedIds.length >= MAX_INTERROGATORS
                  return (
                    <button
                      key={skill.id}
                      onClick={() => toggleSkill(skill.id)}
                      disabled={disabled}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all ${
                        selected
                          ? 'border-red-500/40 bg-red-500/10 text-white'
                          : disabled
                            ? 'border-white/5 bg-white/[0.02] text-white/20 cursor-not-allowed'
                            : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-white/25 hover:text-white hover:bg-white/[0.06]'
                      }`}
                    >
                      <span className="text-base">{skill.emoji}</span>
                      <span className="truncate">{skill.name}</span>
                      {selected && (
                        <span className="ml-auto text-red-400/60 text-xs">✓</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Start Button */}
            <div className="flex justify-center pt-2">
              <button
                onClick={startInterrogation}
                disabled={!canStart}
                className="px-8 py-3 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:bg-white disabled:text-black"
              >
                {selectedIds.length === 0
                  ? '请选择至少 1 位审问者'
                  : targetContent.trim().length <= 20
                    ? '请粘贴更多内容（至少20字）'
                    : `🔍 开始审查（${selectedIds.length} 位审问者）`}
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {hasStarted && (
          <div className="space-y-4">
            {/* Target Summary */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="text-xs text-white/30 mb-1">审查对象{targetName ? `：${targetName}` : ''}</div>
              <div className="text-sm text-white/60 line-clamp-3">{targetContent}</div>
            </div>

            {/* Critiques */}
            {critiques.map((critique, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{critique.skillEmoji}</span>
                  <span className="text-sm font-medium text-white/80">{critique.skillName}</span>
                  <span className="text-xs text-white/30 ml-1">的质疑</span>
                  {critique.isStreaming && (
                    <span className="ml-auto text-xs text-white/30 animate-pulse">分析中…</span>
                  )}
                </div>
                <div className="text-sm text-white/75 leading-relaxed">
                  {critique.content ? (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                        ul: ({ children }) => <ul className="list-disc pl-4 space-y-1">{children}</ul>,
                        li: ({ children }) => <li>{children}</li>,
                      }}
                    >
                      {critique.content}
                    </ReactMarkdown>
                  ) : (
                    <span className="text-white/25 animate-pulse">思考中…</span>
                  )}
                  {critique.isStreaming && critique.content && (
                    <span className="inline-block w-0.5 h-3.5 bg-white/50 ml-0.5 animate-pulse align-middle" />
                  )}
                </div>
              </div>
            ))}

            {/* Synthesis Verdict */}
            {synthesis && (
              <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">⚖️</span>
                  <span className="text-sm font-medium text-yellow-400/90">综合裁决</span>
                  {synthesis.isStreaming && (
                    <span className="ml-auto text-xs text-yellow-500/40 animate-pulse">裁决中…</span>
                  )}
                </div>
                <div className="text-sm text-white/80 leading-relaxed">
                  {synthesis.content ? (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold text-yellow-300">{children}</strong>,
                        ul: ({ children }) => <ul className="list-disc pl-4 space-y-1">{children}</ul>,
                        li: ({ children }) => <li>{children}</li>,
                        h1: ({ children }) => <h1 className="font-bold text-yellow-300 mb-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="font-semibold text-yellow-300 mb-1">{children}</h2>,
                      }}
                    >
                      {synthesis.content}
                    </ReactMarkdown>
                  ) : (
                    <span className="text-white/25 animate-pulse">汇总中…</span>
                  )}
                  {synthesis.isStreaming && synthesis.content && (
                    <span className="inline-block w-0.5 h-3.5 bg-yellow-400/60 ml-0.5 animate-pulse align-middle" />
                  )}
                </div>
              </div>
            )}

            {isDone && (
              <div className="text-center text-xs text-white/20 py-2">── 审查完毕 ──</div>
            )}

            <div ref={bottomRef} />

            {/* Controls */}
            <div className="flex justify-center gap-3 pt-4">
              {isRunning ? (
                <button
                  onClick={() => { abortRef.current?.abort(); setIsRunning(false) }}
                  className="px-6 py-2.5 border border-white/20 text-white/60 text-sm rounded-xl hover:text-white hover:border-white/40 transition-all"
                >
                  停止审查
                </button>
              ) : (
                <button
                  onClick={reset}
                  className="px-6 py-2.5 border border-white/20 text-white/60 text-sm rounded-xl hover:text-white hover:border-white/40 transition-all"
                >
                  重新审查
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
