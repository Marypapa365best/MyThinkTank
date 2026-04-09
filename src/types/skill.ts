export type SkillTier = 'free' | 'pro' | 'elite'
export type SkillCategory = 'investment' | 'tech' | 'philosophy' | 'education' | 'expert' | 'cn-figure'

export interface Skill {
  id: string
  name: string
  nameEn: string
  tagline: string         // 一句话介绍（中文）
  taglineEn: string       // 一句话介绍（英文）
  description: string     // 详细描述
  category: SkillCategory
  tier: SkillTier         // 需要什么订阅等级才能访问
  sourcesCount: number    // 基于多少一手资料
  knowledgeCutoff: string // 知识截止日期
  emoji: string           // 头像 emoji
  tags: string[]
  available: boolean      // 是否上线
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
}

export interface ChatSession {
  id: string
  skillId: string
  messages: Message[]
  createdAt: Date
}
