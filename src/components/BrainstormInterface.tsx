'use client'

import { useState, useRef, useEffect } from 'react'
import { SKILLS_REGISTRY } from '@/lib/skills-registry'
import type { BrainstormHistoryItem } from '@/app/api/brainstorm/route'
import { saveSession } from '@/lib/history'
import { getCustomSkills, type CustomSkill } from '@/lib/custom-skills'
import SkillAvatar from '@/components/SkillAvatar'

interface SkillEntry {
  id: string
  name: string
  emoji: string
  available: boolean
  isCustom: boolean
  content?: string  // only for custom skills
}

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

  const [allSkills, setAllSkills] = useState<SkillEntry[]>(
    SKILLS_REGISTRY.filter(s => s.available).map(s => ({ ...s, isCustom: false }))
  )

  // Load custom skills on mount
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
  }, [turns])

  function toggleSkill(id: string) {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(s => s !== id)
        : prev.length < MAX_SKILLS ? [...prev, id] : prev
    )
  }

  async function streamPersonaResponse(
    skill: SkillEntry,
    topic: string,
    history: BrainstormHistoryItem[],
    signal: AbortSignal,
    turnIndex: number
  ) {
    const { id: skillId, name: skillName, emoji: skillEmoji, isCustom, content: skillContent } = skill

    // 在 turns 列表末尾追加这个 turn（空内容 + isStreaming）
    setTurns(prev => [
      ...prev,
      { skillId, skillName, skillEmoji, content: '', isStreaming: true }
    ])

    const body: Record<string, unknown> = { skillId, skillName, topic, history }
    if (isCustom && skillContent) body.skillContent = skillContent

    const res = await fetch('/api/brainstorm', {
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
          if (turnIndex > 0) await new Promise(r => setTimeout(r, 2500))
          const skill = allSkills.find(s => s.id === skillId)!
          const content = await streamPersonaResponse(
            skill,
            topic,
            [...history],
            abort.signal,
            turnIndex
          )
          history.push({ skillId, skillName: skill.name, content })
          turnIndex++
        }
      }
      // 保存到历史记录（直接用 history 数组，避免异步 setState 副作用）
      if (history.length > 0) {
        const skills = selectedIds.map(id => {
          const sk = allSkills.find(s => s.id === id)
          return { skillId: id, skillName: sk?.name ?? id, skillEmoji: sk?.emoji ?? '' }
        })
        saveSession({
          type: 'brainstorm',
          title: topic.slice(0, 60) + (topic.length > 60 ? '…' : ''),
          topic,
          brainstormSkills: skills,
          turns: history.map(h => {
            const sk = allSkills.find(s => s.id === h.skillId)
            return { skillId: h.skillId, skillName: h.skillName, skillEmoji: sk?.emoji ?? '', content: h.content }
          }),
        })
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
    <div className="min-h-screen bg-[#fbf9f2] text-[#1b1c18] pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="text-4xl mb-3">💡</div>
          <h1 className="text-3xl font-bold mb-2 text-[#1b1c18]">头脑风暴</h1>
          <p className="text-[#56423c] text-sm max-w-md mx-auto">
            选择 2–3 位智囊，输入话题，让他们相互辩论，碰撞出不同视角的火花
          </p>
          <p className="mt-3 text-xs text-[#89726b] max-w-sm mx-auto">
            以下内容基于公开资料推断，代表各人物的思维框架，非本人观点
          </p>
        </div>

        {/* Setup Panel */}
        {turns.length === 0 && (
          <div className="space-y-8">
            {/* Skill Selector */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-[#56423c] uppercase tracking-wider">
                  选择参与者
                </h2>
                <span className="text-xs text-[#89726b]">
                  已选 {selectedIds.length} / {MAX_SKILLS}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {allSkills.map(skill => {
                  const selected = selectedIds.includes(skill.id)
                  const disabled = !selected && selectedIds.length >= MAX_SKILLS
                  return (
                    <button
                      key={skill.id}
                      onClick={() => toggleSkill(skill.id)}
                      disabled={disabled}
                      className={`flex flex-col items-center gap-3 px-4 py-4 rounded-lg text-sm transition-all ${
                        selected
                          ? 'bg-white text-[#1b1c18] shadow-lg shadow-[#d97757]/25'
                          : disabled
                            ? 'bg-[#fbf9f2] text-[#89726b]/50 cursor-not-allowed'
                            : 'bg-white text-[#56423c] shadow-md shadow-black/10 hover:text-[#1b1c18] hover:shadow-lg hover:shadow-[#d97757]/20 hover:scale-105'
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
                        <span className="text-[#d97757] text-sm font-medium">
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
              <h2 className="text-sm font-medium text-[#56423c] uppercase tracking-wider mb-3">
                辩论话题
              </h2>
              <textarea
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="例如：AI 会彻底颠覆价值投资吗？创业者该优先追求规模还是盈利？"
                rows={3}
                className="w-full bg-white/[0.04] border border-[#dcc1b8] rounded-xl px-4 py-3 text-sm text-[#1b1c18] placeholder-white/25 resize-none focus:outline-none focus:border-white/25 transition-colors"
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
            <div className="mb-6 p-4 rounded-xl bg-[#efeee7] border border-[#dcc1b8] text-center">
              <div className="text-xs text-[#56423c] mb-1">话题</div>
              <div className="text-[#1b1c18] text-sm">{topic}</div>
              <div className="flex justify-center gap-2 mt-3">
                {selectedIds.map(id => {
                  const s = allSkills.find(sk => sk.id === id)!
                  return (
                    <span key={id} className="text-xs px-2 py-0.5 rounded-full bg-white/[0.06] text-[#56423c]">
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
                    <div className="text-center text-xs text-[#89726b] py-4">
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
                      <div className="text-xs text-[#56423c] mb-1.5">{turn.skillName}</div>
                      <div className="text-sm text-[#1b1c18] leading-relaxed whitespace-pre-wrap">
                        {turn.content || (turn.isStreaming ? (
                          <span className="text-[#89726b] animate-pulse">思考中…</span>
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
              <div className="text-center text-xs text-[#89726b] py-4">
                ── 辩论结束 ──
              </div>
            )}

            <div ref={bottomRef} />

            {/* Controls */}
            <div className="flex justify-center gap-3 pt-6">
              {isRunning ? (
                <button
                  onClick={stopBrainstorm}
                  className="px-6 py-2.5 border border-[#dcc1b8]/50 text-[#56423c] text-sm rounded-xl hover:text-[#1b1c18] hover:border-white/40 transition-all"
                >
                  停止
                </button>
              ) : (
                <>
                  <button
                    onClick={reset}
                    className="px-6 py-2.5 border border-[#dcc1b8]/50 text-[#56423c] text-sm rounded-xl hover:text-[#1b1c18] hover:border-white/40 transition-all"
                  >
                    重新设置
                  </button>
                  <button
                    onClick={startBrainstorm}
                    disabled={isRunning}
                    className="px-6 py-2.5 bg-white/10 text-[#1b1c18] text-sm rounded-xl hover:bg-white/15 transition-all"
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
