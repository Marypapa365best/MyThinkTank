import { NextRequest, NextResponse } from 'next/server'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createAnthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'
import { loadCompactSkillPrompt } from '@/lib/load-skill'
import { getSkillById } from '@/lib/skills-registry'

const MODELS = {
  gemini: {
    provider: () => createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_API_KEY }),
    model: 'gemini-2.5-flash',
    available: !!process.env.GOOGLE_API_KEY,
    isGemini: true,
  },
  claude: {
    provider: () => createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY }),
    model: 'claude-3-5-haiku-20241022',
    available: !!process.env.ANTHROPIC_API_KEY,
    isGemini: false,
  },
}

function getActiveModel() {
  const preferred = process.env.PREFERRED_MODEL as keyof typeof MODELS
  if (preferred && MODELS[preferred]?.available) return MODELS[preferred]
  return Object.values(MODELS).find(m => m.available) ?? MODELS.gemini
}

// Gemini 关闭内容安全过滤（辩论场景需要批评性内容）；Claude 走默认
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildModel(activeModel: ReturnType<typeof getActiveModel>): any {
  const provider = activeModel.provider()
  if (activeModel.isGemini) {
    return (provider as any)(activeModel.model, {
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      ],
    })
  }
  return (provider as any)(activeModel.model)
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

    // 多智囊场景使用压缩版 SKILL.compact.md（~500字），大幅节省 token
    const systemPrompt = loadCompactSkillPrompt(skillId)
    const activeModel = getActiveModel()

    // 构建对话上下文
    let contextMessage = ''

    // 思维框架模拟：顺应 Claude 安全机制，用"框架分析"替代"角色扮演冒充"
    contextMessage += `这是一个思维框架模拟练习。请模拟上述人物的思维框架和分析视角，对以下话题发表看法（可以在开头用一句话说明这是框架模拟，之后直接展开）。用中文回答。\n\n`

    contextMessage += `话题：${topic}\n\n`

    if (history.length > 0) {
      contextMessage += '其他参与者的分析：\n'
      history.forEach(item => {
        contextMessage += `\n【${item.skillName}】：${item.content}\n`
      })
      contextMessage += `\n请从你的独特视角回应对方具体论点，展现该思维框架的独特视角。`
    } else {
      contextMessage += `请用该思维框架对这个话题发表看法。`
    }

    contextMessage += `\n\n要求有实质内容：给出具体论点、真实案例或数据支撑，展开分析而非点到为止。目标长度 200-400 字。`

    const messages = [
      { role: 'user' as const, content: systemPrompt },
      { role: 'assistant' as const, content: '好的，我理解这是思维框架模拟练习，我会用该框架的视角进行分析。请提问。' },
      { role: 'user' as const, content: contextMessage },
    ]

    console.log(`[Brainstorm] model=${activeModel.model} skill=${skillId} round=${history.length}`)

    const result = await streamText({
      model: buildModel(activeModel),
      messages,
      maxTokens: 2048,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Brainstorm API error:', msg)
    // Gemini 内容过滤导致的错误，返回可读提示
    if (msg.includes('SAFETY') || msg.includes('blocked') || msg.includes('finish_reason')) {
      return new Response('（该角色的风格被当前模型的安全过滤拦截，可在 .env.local 切换 PREFERRED_MODEL=claude 解决）', { status: 200 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
