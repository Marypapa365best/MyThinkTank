'use client'

import { useState, useRef, useEffect } from 'react'
import { SKILLS_REGISTRY } from '@/lib/skills-registry'
import ReactMarkdown from 'react-markdown'
import { saveSession } from '@/lib/history'
import type { CritiqueItem } from '@/app/api/interrogate/route'
import { getCustomSkills, type CustomSkill } from '@/lib/custom-skills'
import SkillAvatar from '@/components/SkillAvatar'

interface SkillEntry {
  id: string
  name: string
  emoji: string
  available: boolean
  isCustom: boolean
  content?: string
}

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

  const [allSkills, setAllSkills] = useState<SkillEntry[]>(
    SKILLS_REGISTRY.filter(s => s.available).map(s => ({ ...s, isCustom: false }))
  )
  const hasStarted = critiques.length > 0

  useEffect(() => {
    getCustomSkills().then(customList => {
      const custom = customList.map((cs: CustomSkill): SkillEntry => ({
        id: cs.id,
        name: cs.name,
        emoji: cs.emoji,
        available: true,
        isCustom: true,
        content: cs.content,
      }))
      const builtIn = SKILLS_REGISTRY.filter(s => s.available).map(s => ({ ...s, isCustom: false, content: undefined }))
      setAllSkills([...builtIn, ...custom])
    })
  }, [])

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
        const skill = allSkills.find(s => s.id === skillId)!

        // 追加空的 critique 条目
        setCritiques(prev => [
          ...prev,
          { skillId, skillName: skill.name, skillEmoji: skill.emoji, content: '', isStreaming: true },
        ])

        const reqBody: Record<string, unknown> = {
          skillId,
          skillName: skill.name,
          targetName,
          targetContent,
          previousCritiques: [...collectedCritiques],
        }
        if (skill.isCustom && skill.content) reqBody.skillContent = skill.content

        const content = await streamResponse(
          '/api/interrogate',
          reqBody,
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

      // 保存到历史记录
      setCritiques(finalCritiques => {
        const validCritiques = finalCritiques.filter(c => c.content && !c.content.includes('回答失败'))
        if (validCritiques.length > 0) {
          const interrogators = selectedIds.map(id => {
            const sk = allSkills.find(s => s.id === id)
            return { skillId: id, skillName: sk?.name ?? id, skillEmoji: sk?.emoji ?? '' }
          })
          saveSession({
            type: 'interrogate',
            title: targetName ? `审查：${targetName}` : targetContent.slice(0, 50) + '…',
            targetName,
            targetContent,
            critiques: validCritiques.map(c => ({ skillId: c.skillId, skillName: c.skillName, skillEmoji: c.skillEmoji, content: c.content })),
            synthesis: verdictContent,
            interrogators,
          })
        }
        return finalCritiques
      })
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
    <div className="min-h-screen bg-[#fbf9f2] text-[#1b1c18] pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <h1 className="text-3xl font-bold mb-2">质疑团</h1>
          <p className="text-[#56423c] text-sm max-w-md mx-auto">
            粘贴任何人的言论，让顶级智囊联合审查——只评判事实与逻辑，不搞人身攻击
          </p>
          <p className="mt-3 text-xs text-[#89726b] max-w-sm mx-auto">
            以下内容基于公开资料推断，代表各人物的思维框架，非本人观点
          </p>
        </div>

        {/* Setup Panel */}
        {!hasStarted && (
          <div className="space-y-6">
            {/* Target Input */}
            <div className="rounded-2xl border border-[#dcc1b8] bg-[#fbf9f2] p-6 space-y-4">
              <h2 className="text-sm font-medium text-[#1b1c18]/50 uppercase tracking-wider">被审查对象</h2>

              <input
                type="text"
                value={targetName}
                onChange={e => setTargetName(e.target.value)}
                placeholder='对象名称（选填，如 "某AI教父"、"某创投博主"）'
                className="w-full bg-white border border-[#dcc1b8] rounded-xl px-4 py-2.5 text-sm text-[#1b1c18] placeholder-[#89726b] focus:outline-none focus:border-[#9a4021] transition-colors"
              />

              <textarea
                value={targetContent}
                onChange={e => setTargetContent(e.target.value)}
                placeholder={`粘贴被审查的言论、文章或主张…\n\n例如：\n"AI将在3年内取代90%的程序员，现在学编程已经没有意义了。掌握提示词工程才是未来，我的课程将帮助你月入10万…"`}
                rows={7}
                className="w-full bg-white border border-[#dcc1b8] rounded-xl px-4 py-3 text-sm text-[#1b1c18] placeholder-[#89726b] resize-none focus:outline-none focus:border-[#9a4021] transition-colors"
              />
              <div className="text-right text-xs text-[#89726b]">
                {targetContent.length} 字
              </div>
            </div>

            {/* Interrogator Selector */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-[#1b1c18]/50 uppercase tracking-wider">
                  选择审问者
                </h2>
                <span className="text-xs text-[#1b1c18]/25">最多 {MAX_INTERROGATORS} 位</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {allSkills.map(skill => {
                  const selected = selectedIds.includes(skill.id)
                  const disabled = !selected && selectedIds.length >= MAX_INTERROGATORS
                  return (
                    <button
                      key={skill.id}
                      onClick={() => toggleSkill(skill.id)}
                      disabled={disabled}
                      className={`flex flex-col items-center gap-3 px-4 py-4 rounded-lg text-sm transition-all ${
                        selected
                          ? 'bg-[#243137] text-[#bd9f67] shadow-lg shadow-[#bd9f67]/30'
                          : disabled
                            ? 'bg-[#243137] text-[#bd9f67]/40 cursor-not-allowed'
                            : 'bg-[#243137] text-[#bd9f67] hover:shadow-md hover:shadow-[#bd9f67]/40 hover:scale-105'
                      }`}
                    >
                      <SkillAvatar
                        name={skill.name}
                        emoji={skill.emoji}
                        avatar={(skill as { avatar?: string }).avatar}
                        size={36}
                      />
                      <span className="text-xs text-center font-medium">{skill.name}</span>
                      {selected && (
                        <span className="text-[#bd9f67] text-sm font-bold">✓</span>
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
                className="px-8 py-3 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
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
            <div className="p-4 rounded-xl bg-[#efeee7] border border-[#dcc1b8]">
              <div className="text-xs text-[#89726b] mb-1">审查对象{targetName ? `：${targetName}` : ''}</div>
              <div className="text-sm text-[#56423c] line-clamp-3">{targetContent}</div>
            </div>

            {/* Critiques */}
            {critiques.map((critique, i) => (
              <div key={i} className="rounded-2xl border border-[#dcc1b8] bg-[#fbf9f2] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{critique.skillEmoji}</span>
                  <span className="text-sm font-medium text-[#1b1c18]/80">{critique.skillName}</span>
                  <span className="text-xs text-[#89726b] ml-1">的质疑</span>
                  {critique.isStreaming && (
                    <span className="ml-auto text-xs text-[#89726b] animate-pulse">分析中…</span>
                  )}
                </div>
                <div className="text-sm text-[#1b1c18]/75 leading-relaxed">
                  {critique.content ? (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold text-[#1b1c18]">{children}</strong>,
                        ul: ({ children }) => <ul className="list-disc pl-4 space-y-1">{children}</ul>,
                        li: ({ children }) => <li>{children}</li>,
                      }}
                    >
                      {critique.content}
                    </ReactMarkdown>
                  ) : (
                    <span className="text-[#1b1c18]/25 animate-pulse">思考中…</span>
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
                <div className="text-sm text-[#1b1c18]/80 leading-relaxed">
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
                    <span className="text-[#1b1c18]/25 animate-pulse">汇总中…</span>
                  )}
                  {synthesis.isStreaming && synthesis.content && (
                    <span className="inline-block w-0.5 h-3.5 bg-yellow-400/60 ml-0.5 animate-pulse align-middle" />
                  )}
                </div>
              </div>
            )}

            {isDone && (
              <div className="text-center text-xs text-[#89726b] py-2">── 审查完毕 ──</div>
            )}

            <div ref={bottomRef} />

            {/* Controls */}
            <div className="flex justify-center gap-3 pt-4">
              {isRunning ? (
                <button
                  onClick={() => { abortRef.current?.abort(); setIsRunning(false) }}
                  className="px-6 py-2.5 border border-[#dcc1b8]/50 text-[#56423c] text-sm rounded-xl hover:text-[#1b1c18] hover:border-[#dcc1b8] transition-all"
                >
                  停止审查
                </button>
              ) : (
                <button
                  onClick={reset}
                  className="px-6 py-2.5 border border-[#dcc1b8]/50 text-[#56423c] text-sm rounded-xl hover:text-[#1b1c18] hover:border-[#dcc1b8] transition-all"
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
