import { NextRequest, NextResponse } from 'next/server'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createAnthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'
import { loadSkillPrompt, detectLanguage } from '@/lib/load-skill'
import { getSkillById } from '@/lib/skills-registry'

// 支持的模型配置
const MODELS = {
  gemini: {
    provider: () => createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_API_KEY }),
    model: 'gemini-2.5-flash',
    available: !!process.env.GOOGLE_API_KEY,
  },
  claude: {
    provider: () => createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY }),
    model: 'claude-haiku-4-5-20251001',
    available: !!process.env.ANTHROPIC_API_KEY,
  },
}

function getActiveModel() {
  const preferred = process.env.PREFERRED_MODEL as keyof typeof MODELS
  if (preferred && MODELS[preferred]?.available) return MODELS[preferred]
  return Object.values(MODELS).find(m => m.available) ?? MODELS.gemini
}

type ChatMessage = { role: 'user' | 'assistant'; content: string }

// 清理消息列表，确保符合 Gemini 格式要求：
// 1. 只保留 user / assistant 角色
// 2. 不能有连续相同角色
// 3. 必须以 user 结尾
function sanitizeMessages(raw: { role: string; content: string }[]): ChatMessage[] {
  // 过滤有效角色且内容非空
  const filtered = raw
    .filter(m => (m.role === 'user' || m.role === 'assistant') && m.content?.trim())
    .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content.trim() }))

  if (filtered.length === 0) return []

  // 去除连续相同角色（保留后者）
  const deduped: ChatMessage[] = [filtered[0]]
  for (let i = 1; i < filtered.length; i++) {
    if (filtered[i].role !== deduped[deduped.length - 1].role) {
      deduped.push(filtered[i])
    } else {
      // 合并相同角色的连续消息
      deduped[deduped.length - 1].content += '\n' + filtered[i].content
    }
  }

  // 确保最后一条是 user
  while (deduped.length > 0 && deduped[deduped.length - 1].role !== 'user') {
    deduped.pop()
  }

  return deduped
}

export async function POST(req: NextRequest) {
  try {
    const { skillId, messages } = await req.json()

    const skill = getSkillById(skillId)
    if (!skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
    }

    const cleanMessages = sanitizeMessages(messages)
    if (cleanMessages.length === 0) {
      return NextResponse.json({ error: 'No valid user message' }, { status: 400 })
    }

    const lastUserMsg = [...cleanMessages].reverse().find(m => m.role === 'user')
    const lang = lastUserMsg ? detectLanguage(lastUserMsg.content) : 'zh'
    const systemPrompt = loadSkillPrompt(skillId, lang)

    const activeModel = getActiveModel()
    const provider = activeModel.provider()

    console.log(`[Chat] model=${activeModel.model} skill=${skillId} msgs=${cleanMessages.length}`)

    const result = await streamText({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      model: (provider as any)(activeModel.model),
      system: systemPrompt || undefined,
      messages: cleanMessages,
      maxTokens: 2048,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Chat API error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
