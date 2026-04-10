// Custom skills stored in localStorage
// These are user-created personas that work alongside the built-in skills

export interface CustomSkill {
  id: string           // 'custom-{timestamp}'
  name: string
  emoji: string
  description: string
  content: string      // Full generated SKILL.md content
  compactContent?: string
  createdAt: number
  source: 'text' | 'url'
  sourceUrl?: string
}

const STORAGE_KEY = 'nuwa_custom_skills'

export function getCustomSkills(): CustomSkill[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as CustomSkill[]
  } catch {
    return []
  }
}

export function saveCustomSkill(skill: Omit<CustomSkill, 'id' | 'createdAt'>): CustomSkill {
  const newSkill: CustomSkill = {
    ...skill,
    id: `custom-${Date.now()}`,
    createdAt: Date.now(),
  }
  const all = getCustomSkills()
  all.unshift(newSkill)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  return newSkill
}

export function updateCustomSkill(id: string, updates: Partial<Omit<CustomSkill, 'id' | 'createdAt'>>): void {
  const all = getCustomSkills()
  const idx = all.findIndex(s => s.id === id)
  if (idx !== -1) {
    all[idx] = { ...all[idx], ...updates }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  }
}

export function deleteCustomSkill(id: string): void {
  const all = getCustomSkills().filter(s => s.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function getCustomSkillById(id: string): CustomSkill | undefined {
  return getCustomSkills().find(s => s.id === id)
}
