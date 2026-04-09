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
    model: 'gemini-2.5-flash-preview-04-17',  // Gemini 2.5 Flash
    available: !!process.env.GOOGLE_API_KEY,
  },
  claude: {
    provider: () => createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY }),
    model: 'claude-haiku-4-5-20251001',
    available: !!process.env.ANTHROPIC_API_KEY,
  },
}

function getActiveModel() {
  // 优先使用环境变量指定的模型，否则按顺序找第一个可用的
  const preferred = process.env.PREFERRED_MODEL as keyof typeof MODELS
  if (preferred && MODELS[preferred]?.available) return MODELS[preferred]
  return Object.values(MODELS).find(m => m.available) ?? MODELS.gemini
}

export async function POST(req: NextRequest) {
  try {
    const { skillId, messages } = await req.json()

    const skill = getSkillById(skillId)
    if (!skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
    }

    const lastUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === 'user')
    const lang = lastUserMsg ? detectLanguage(lastUserMsg.content) : 'zh'
    const systemPrompt = loadSkillPrompt(skillId, lang)

    const activeModel = getActiveModel()
    const provider = activeModel.provider()

    const result = await streamText({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      model: (provider as any)(activeModel.model),
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      maxTokens: 2048,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Chat API error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
