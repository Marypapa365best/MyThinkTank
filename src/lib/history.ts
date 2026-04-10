// 对话历史记录 —— 存储在 localStorage，支持单人对话、头脑风暴、质疑团三种类型

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
  title: string          // 自动生成的摘要标题

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

const STORAGE_KEY = 'nuwa_history'
const MAX_SESSIONS = 100

function load(): HistorySession[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function save(sessions: HistorySession[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, MAX_SESSIONS)))
}

export function saveSession(session: Omit<HistorySession, 'id' | 'timestamp'>): string {
  const id = Date.now().toString()
  const sessions = load()
  sessions.unshift({ ...session, id, timestamp: Date.now() })
  save(sessions)
  return id
}

export function getAllSessions(): HistorySession[] {
  return load()
}

export function getSession(id: string): HistorySession | undefined {
  return load().find(s => s.id === id)
}

export function deleteSession(id: string) {
  save(load().filter(s => s.id !== id))
}

export function clearAllSessions() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

// 格式化时间显示
export function formatTime(timestamp: number): string {
  const d = new Date(timestamp)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)

  if (diffDays === 0) return `今天 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  if (diffDays === 1) return `昨天 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}
