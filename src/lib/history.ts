// 对话历史记录
// 已登录 → Supabase（通过 /api/db/sessions）
// 未登录 → localStorage 降级

export type SessionType = 'chat' | 'brainstorm' | 'interrogate'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface BrainstormTurn {
  skillId: string
  skillName: string
  skillEmoji: string
  content: string
}

export interface CritiqueRecord {
  skillId: string
  skillName: string
  skillEmoji: string
  content: string
}

export interface HistorySession {
  id: string
  type: SessionType
  timestamp: number
  title: string

  // 单人对话
  skillId?: string
  skillName?: string
  skillEmoji?: string
  messages?: ChatMessage[]

  // 头脑风暴
  topic?: string
  brainstormSkills?: { skillId: string; skillName: string; skillEmoji: string }[]
  turns?: BrainstormTurn[]

  // 质疑团
  targetName?: string
  targetContent?: string
  critiques?: CritiqueRecord[]
  synthesis?: string
  interrogators?: { skillId: string; skillName: string; skillEmoji: string }[]
}

// ── localStorage helpers ──────────────────────────────────────────────────────

const LS_KEY = 'nuwa_history'
const MAX_LOCAL = 100

function lsLoad(): HistorySession[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]') } catch { return [] }
}

function lsSave(sessions: HistorySession[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(LS_KEY, JSON.stringify(sessions.slice(0, MAX_LOCAL)))
}

// ── Public API (async) ────────────────────────────────────────────────────────

/** 保存会话。登录时写 Supabase，否则写 localStorage */
export async function saveSession(
  session: Omit<HistorySession, 'id' | 'timestamp'>
): Promise<string> {
  const id = Date.now().toString()
  const timestamp = Date.now()
  const full: HistorySession = { ...session, id, timestamp }

  // 尝试写服务端
  try {
    const res = await fetch('/api/db/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, type: full.type, title: full.title, data: full }),
    })
    if (res.ok) return id
    if (res.status === 401) {
      // 未登录，降级 localStorage
      const sessions = lsLoad()
      sessions.unshift(full)
      lsSave(sessions)
      return id
    }
  } catch {
    // 网络错误，降级 localStorage
    const sessions = lsLoad()
    sessions.unshift(full)
    lsSave(sessions)
  }

  return id
}

/** 获取所有会话。登录时从 Supabase，否则从 localStorage */
export async function getAllSessions(): Promise<HistorySession[]> {
  try {
    const res = await fetch('/api/db/sessions')
    if (res.ok) {
      const rows = await res.json() as { id: string; data: HistorySession; created_at: string }[]
      return rows.map(r => ({
        ...r.data,
        id: r.id,
        timestamp: r.data.timestamp ?? new Date(r.created_at).getTime(),
      }))
    }
    if (res.status === 401) return lsLoad()
  } catch {
    return lsLoad()
  }
  return lsLoad()
}

/** 删除单条会话 */
export async function deleteSession(id: string): Promise<void> {
  // 先清 localStorage（无论登录与否）
  lsSave(lsLoad().filter(s => s.id !== id))
  // 再尝试删服务端
  try {
    await fetch('/api/db/sessions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
  } catch { /* ignore */ }
}

/** 清空所有会话 */
export async function clearAllSessions(): Promise<void> {
  // localStorage
  if (typeof window !== 'undefined') localStorage.removeItem(LS_KEY)
  // 服务端：逐条删除（简单实现）
  try {
    const sessions = await getAllSessions()
    await Promise.all(sessions.map(s =>
      fetch('/api/db/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: s.id }),
      })
    ))
  } catch { /* ignore */ }
}

// ── Formatting ────────────────────────────────────────────────────────────────

export function formatTime(timestamp: number): string {
  const d = new Date(timestamp)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  const hm = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  if (diffDays === 0) return `今天 ${hm}`
  if (diffDays === 1) return `昨天 ${hm}`
  return `${d.getMonth() + 1}月${d.getDate()}日 ${hm}`
}
