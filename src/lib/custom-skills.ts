// 自定义智囊
// 已登录 → Supabase（通过 /api/db/custom-skills）
// 未登录 → localStorage 降级

export interface CustomSkill {
  id: string
  name: string
  emoji: string
  description: string
  content: string
  compactContent?: string
  createdAt: number
  source: 'text' | 'url'
  sourceUrl?: string
}

const LS_KEY = 'nuwa_custom_skills'

// ── localStorage helpers ──────────────────────────────────────────────────────

function lsLoad(): CustomSkill[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]') } catch { return [] }
}

function lsSave(skills: CustomSkill[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(LS_KEY, JSON.stringify(skills))
}

// ── Public API (async) ────────────────────────────────────────────────────────

export async function getCustomSkills(): Promise<CustomSkill[]> {
  try {
    const res = await fetch('/api/db/custom-skills')
    if (res.ok) {
      const rows = await res.json() as {
        id: string; name: string; emoji: string; description: string
        content: string; compact_content?: string; source: string
        source_url?: string; created_at: string
      }[]
      return rows.map(r => ({
        id: r.id,
        name: r.name,
        emoji: r.emoji,
        description: r.description ?? '',
        content: r.content,
        compactContent: r.compact_content,
        createdAt: new Date(r.created_at).getTime(),
        source: (r.source ?? 'text') as 'text' | 'url',
        sourceUrl: r.source_url,
      }))
    }
    if (res.status === 401) return lsLoad()
  } catch {
    return lsLoad()
  }
  return lsLoad()
}

export async function saveCustomSkill(
  skill: Omit<CustomSkill, 'id' | 'createdAt'>
): Promise<CustomSkill> {
  const newSkill: CustomSkill = {
    ...skill,
    id: `custom-${Date.now()}`,
    createdAt: Date.now(),
  }

  try {
    const res = await fetch('/api/db/custom-skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: newSkill.id,
        name: newSkill.name,
        emoji: newSkill.emoji,
        description: newSkill.description,
        content: newSkill.content,
        compact_content: newSkill.compactContent,
        source: newSkill.source,
        source_url: newSkill.sourceUrl,
      }),
    })
    if (res.ok) return newSkill
    if (res.status === 401) {
      const all = lsLoad()
      all.unshift(newSkill)
      lsSave(all)
      return newSkill
    }
  } catch {
    const all = lsLoad()
    all.unshift(newSkill)
    lsSave(all)
  }

  return newSkill
}

export async function deleteCustomSkill(id: string): Promise<void> {
  lsSave(lsLoad().filter(s => s.id !== id))
  try {
    await fetch('/api/db/custom-skills', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
  } catch { /* ignore */ }
}

export function getCustomSkillById(id: string): Promise<CustomSkill | undefined> {
  return getCustomSkills().then(all => all.find(s => s.id === id))
}
