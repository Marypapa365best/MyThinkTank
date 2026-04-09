'use client'

import { useState, useRef, useEffect } from 'react'
import { SKILLS_REGISTRY } from '@/lib/skills-registry'
import type { BrainstormHistoryItem } from '@/app/api/brainstorm/route'

interface TurnResult {
  skillId: string
  skillName: string
  skillEmoji: string
  content: string
  isStreaming: boolean
}

const MAX_SKILLS = 3
const DEBATE_ROUNDS = 2

export default function BrainstormInterface() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [topic, setTopic] = useState('')
  const [turns, setTurns] = useState<TurnResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const availableSkills = SKILLS_REGISTRY.filter(s => s.available)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [turns])

  function toggleSkill(id: string) {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(s => s !== id)
        : prev.length < MAX_SKILLS ? [...prev, id] : prev
    )
  }

  async function streamPersonaResponse(
    skillId: string,
    skillName: string,
    skillEmoji: string,
    topic: string,
    history: BrainstormHistoryItem[],
    signal: AbortSignal,
    turnIndex: number
  ) {
    // 在 turns 列表末尾追加这个 turn（空内容 + isStreaming）
    setTurns(prev => [
      ...prev,
      { skillId, skillName, skillEmoji, content: '', isStreaming: true }
    ])

    const res = await fetch('/api/brainstorm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skillId, topic, history }),
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
          setTurns(prev => {
            const updated = [...prev]
            updated[turnIndex] = { ...updated[turnIndex], content: fullContent }
            return updated
          })
        }
        // flush 剩余字节（修复最后几个字被截断的问题）
        const remaining = decoder.decode()
        if (remaining) {
          fullContent += remaining
        }
      } catch (streamErr) {
        if ((streamErr as Error).name === 'AbortError') throw streamErr
        console.error('Stream read error:', streamErr)
      }
    }

    // 标记完成（即使内容为空也要清除 isStreaming，防止卡在"思考中"）
    setTurns(prev => {
      const updated = [...prev]
      updated[turnIndex] = {
        ...updated[turnIndex],
        content: fullContent || '（未能获取回答，请重试）',
        isStreaming: false,
      }
      return updated
    })

    return fullContent
  }

  async function startBrainstorm() {
    if (selectedIds.length < 2 || !topic.trim() || isRunning) return

    setTurns([])
    setIsDone(false)
    setIsRunning(true)

    const abort = new AbortController()
    abortRef.current = abort

    try {
      const history: BrainstormHistoryItem[] = []
      let turnIndex = 0

      for (let round = 0; round < DEBATE_ROUNDS; round++) {
        for (const skillId of selectedIds) {
          const skill = availableSkills.find(s => s.id === skillId)!
          const content = await streamPersonaResponse(
            skillId,
            skill.name,
            skill.emoji,
            topic,
            [...history],
            abort.signal,
            turnIndex
          )
          history.push({ skillId, skillName: skill.name, content })
          turnIndex++
        }
      }
      setIsDone(true)
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        console.error('Brainstorm error:', e)
      }
      // 清除所有卡在"思考中"的 turn，防止永久卡住
      setTurns(prev => prev.map(t =>
        t.isStreaming ? { ...t, isStreaming: false, content: t.content || '（回答失败，请重试）' } : t
      ))
    } finally {
      setIsRunning(false)
    }
  }

  function stopBrainstorm() {
    abortRef.current?.abort()
    setIsRunning(false)
    // 清理未完成的 streaming 状态
    setTurns(prev => prev.map(t => ({ ...t, isStreaming: false })))
  }

  function reset() {
    stopBrainstorm()
    setTurns([])
    setIsDone(false)
    setTopic('')
  }

  const canStart = selectedIds.length >= 2 && topic.trim().length > 0 && !isRunning

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="text-4xl mb-3">💡</div>
          <h1 className="text-3xl font-bold mb-2">头脑风暴</h1>
          <p className="text-white/40 text-sm max-w-md mx-auto">
            选择 2–3 位智囊，输入话题，让他们相互辩论，碰撞出不同视角的火花
          </p>
        </div>

        {/* Setup Panel */}
        {turns.length === 0 && (
          <div className="space-y-8">
            {/* Skill Selector */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider">
                  选择参与者
                </h2>
                <span className="text-xs text-white/30">
                  已选 {selectedIds.length} / {MAX_SKILLS}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {availableSkills.map(skill => {
                  const selected = selectedIds.includes(skill.id)
                  const disabled = !selected && selectedIds.length >= MAX_SKILLS
                  return (
                    <button
                      key={skill.id}
                      onClick={() => toggleSkill(skill.id)}
                      disabled={disabled}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all ${
                        selected
                          ? 'border-white/40 bg-white/10 text-white'
                          : disabled
                            ? 'border-white/5 bg-white/[0.02] text-white/20 cursor-not-allowed'
                            : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-white/25 hover:text-white hover:bg-white/[0.06]'
                      }`}
                    >
                      <span className="text-base">{skill.emoji}</span>
                      <span className="truncate">{skill.name}</span>
                      {selected && (
                        <span className="ml-auto text-white/60 text-xs">
                          #{selectedIds.indexOf(skill.id) + 1}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Topic Input */}
            <div>
              <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-3">
                辩论话题
              </h2>
              <textarea
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="例如：AI 会彻底颠覆价值投资吗？创业者该优先追求规模还是盈利？"
                rows={3}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 resize-none focus:outline-none focus:border-white/25 transition-colors"
              />
            </div>

            {/* Start Button */}
            <div className="flex justify-center">
              <button
                onClick={startBrainstorm}
                disabled={!canStart}
                className="px-8 py-3 bg-white text-black text-sm font-medium rounded-xl hover:bg-white/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {selectedIds.length < 2
                  ? `再选 ${2 - selectedIds.length} 位参与者`
                  : !topic.trim()
                    ? '请输入话题'
                    : '🚀 开始辩论'}
              </button>
            </div>
          </div>
        )}

        {/* Debate Display */}
        {turns.length > 0 && (
          <div className="space-y-1">
            {/* Topic Header */}
            <div className="mb-6 p-4 rounded-xl bg-white/[0.03] border border-white/10 text-center">
              <div className="text-xs text-white/40 mb-1">话题</div>
              <div className="text-white/80 text-sm">{topic}</div>
              <div className="flex justify-center gap-2 mt-3">
                {selectedIds.map(id => {
                  const s = availableSkills.find(sk => sk.id === id)!
                  return (
                    <span key={id} className="text-xs px-2 py-0.5 rounded-full bg-white/[0.06] text-white/50">
                      {s.emoji} {s.name}
                    </span>
                  )
                })}
              </div>
            </div>

            {/* Turns */}
            {turns.map((turn, i) => {
              const round = Math.floor(i / selectedIds.length) + 1
              const isFirstInRound = i % selectedIds.length === 0
              return (
                <div key={i}>
                  {isFirstInRound && (
                    <div className="text-center text-xs text-white/20 py-4">
                      ── 第 {round} 轮 ──
                    </div>
                  )}
                  <div className="flex gap-3 py-3">
                    {/* Avatar */}
                    <div className="flex-none w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg">
                      {turn.skillEmoji}
                    </div>
                    {/* Content */}
                    <div className="flex-1">
                      <div className="text-xs text-white/40 mb-1.5">{turn.skillName}</div>
                      <div className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                        {turn.content || (turn.isStreaming ? (
                          <span className="text-white/30 animate-pulse">思考中…</span>
                        ) : '')}
                        {turn.isStreaming && turn.content && (
                          <span className="inline-block w-0.5 h-3.5 bg-white/60 ml-0.5 animate-pulse align-middle" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {isDone && (
              <div className="text-center text-xs text-white/20 py-4">
                ── 辩论结束 ──
              </div>
            )}

            <div ref={bottomRef} />

            {/* Controls */}
            <div className="flex justify-center gap-3 pt-6">
              {isRunning ? (
                <button
                  onClick={stopBrainstorm}
                  className="px-6 py-2.5 border border-white/20 text-white/60 text-sm rounded-xl hover:text-white hover:border-white/40 transition-all"
                >
                  停止
                </button>
              ) : (
                <>
                  <button
                    onClick={reset}
                    className="px-6 py-2.5 border border-white/20 text-white/60 text-sm rounded-xl hover:text-white hover:border-white/40 transition-all"
                  >
                    重新设置
                  </button>
                  <button
                    onClick={startBrainstorm}
                    disabled={isRunning}
                    className="px-6 py-2.5 bg-white/10 text-white text-sm rounded-xl hover:bg-white/15 transition-all"
                  >
                    🔄 换个话题再辩
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
