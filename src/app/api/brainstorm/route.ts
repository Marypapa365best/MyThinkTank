import { NextRequest, NextResponse } from 'next/server'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createAnthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'
import { loadSkillPrompt } from '@/lib/load-skill'
import { getSkillById } from '@/lib/skills-registry'

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

export interface BrainstormHistoryItem {
  skillId: string
  skillName: string
  content: string
}

export async function POST(req: NextRequest) {
  try {
    const { skillId, topic, history = [] } = await req.json() as {
      skillId: string
      topic: string
      history: BrainstormHistoryItem[]
    }

    const skill = getSkillById(skillId)
    if (!skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
    }

    const systemPrompt = loadSkillPrompt(skillId, 'zh')
    const activeModel = getActiveModel()
    const provider = activeModel.provider()

    // 构建对话上下文
    let contextMessage = `话题：${topic}\n\n`

    if (history.length > 0) {
      contextMessage += '以下是其他参与者的观点：\n'
      history.forEach(item => {
        contextMessage += `\n【${item.skillName}】：\n${item.content}\n`
      })
      contextMessage += `\n请你针对以上观点，以自己的思维框架发表看法。要直接回应对方的具体论点，展现你的独特视角。回复控制在200字以内，言简意赅。`
    } else {
      contextMessage += `请以你的思维框架，对这个话题发表看法。控制在200字以内，言简意赅。`
    }

    const messages = [
      { role: 'user' as const, content: systemPrompt },
      { role: 'assistant' as const, content: '好的，我已理解以上设定，将严格按照这个框架来回答。请提问。' },
      { role: 'user' as const, content: contextMessage },
    ]

    console.log(`[Brainstorm] model=${activeModel.model} skill=${skillId} round=${history.length}`)

    const result = await streamText({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      model: (provider as any)(activeModel.model),
      messages,
      maxTokens: 512,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Brainstorm API error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
