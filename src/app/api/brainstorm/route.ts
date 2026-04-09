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

    // 判断是否是该角色第一次发言
    const isFirstAppearance = !history.some(h => h.skillId === skillId)

    // 构建对话上下文
    let contextMessage = ''

    // 强制覆盖 SKILL.md 中的免责声明指令
    if (isFirstAppearance) {
      contextMessage += `【重要覆盖指令】这是头脑风暴辩论场景。你只需在本次发言的最后一句加一句简短声明（如"以上观点基于公开资料推断"），其余时间完全以角色身份直接发言，禁止在发言开头或中间插入任何免责说明。\n\n`
    } else {
      contextMessage += `【重要覆盖指令】这是辩论第二轮。完全禁止任何形式的免责声明。直接以角色身份反驳对手，如同真实辩论。\n\n`
    }

    contextMessage += `话题：${topic}\n\n`

    if (history.length > 0) {
      contextMessage += '其他参与者的观点：\n'
      history.forEach(item => {
        contextMessage += `\n【${item.skillName}】：${item.content}\n`
      })
      contextMessage += `\n请针对以上观点直接发表看法，回应对方具体论点，展现你的独特视角。`
    } else {
      contextMessage += `请直接以你的思维框架对这个话题发表看法。`
    }

    contextMessage += `\n\n【语言】必须用中文回答。观点说透为止，不要强行截短。`

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
      maxTokens: 1024,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Brainstorm API error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
