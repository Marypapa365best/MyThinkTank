import { NextRequest, NextResponse } from 'next/server'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createAnthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'
import { loadSkillPrompt, detectLanguage } from '@/lib/load-skill'
import { getSkillById } from '@/lib/skills-registry'

const MODELS = {
  gemini: {
    provider: () => createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_API_KEY }),
    model: 'gemini-2.5-flash',
    available: !!process.env.GOOGLE_API_KEY,
  },
  claude: {
    provider: () => createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY }),
    model: 'claude-3-5-haiku-20241022',
    available: !!process.env.ANTHROPIC_API_KEY,
  },
}

function getActiveModel() {
  const preferred = process.env.PREFERRED_MODEL as keyof typeof MODELS
  if (preferred && MODELS[preferred]?.available) return MODELS[preferred]
  return Object.values(MODELS).find(m => m.available) ?? MODELS.gemini
}

type ChatMessage = { role: 'user' | 'assistant'; content: string }

// content 可能是字符串或 [{type:'text', text:'...'}] 数组
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractText(content: any): string {
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    return content
      .filter((p: { type: string; text?: string }) => p.type === 'text' && p.text)
      .map((p: { type: string; text?: string }) => p.text ?? '')
      .join('')
  }
  return String(content ?? '')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sanitizeMessages(raw: any[]): ChatMessage[] {
  if (!Array.isArray(raw)) return []

  const filtered: ChatMessage[] = raw
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => ({ role: m.role as 'user' | 'assistant', content: extractText(m.content) }))
    .filter(m => m.content.trim().length > 0)

  if (filtered.length === 0) return []

  // 合并连续相同角色
  const deduped: ChatMessage[] = [filtered[0]]
  for (let i = 1; i < filtered.length; i++) {
    if (filtered[i].role !== deduped[deduped.length - 1].role) {
      deduped.push(filtered[i])
    } else {
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
    const body = await req.json()
    const { skillId, messages } = body

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

    // Gemini 不支持 system 参数，将 system prompt 作为第一轮对话注入
    // 这样可以避免 @ai-sdk/google 的 system 转换兼容性问题
    const allMessages: ChatMessage[] = systemPrompt
      ? [
          { role: 'user', content: systemPrompt },
          { role: 'assistant', content: '好的，我已完全理解以上设定，将严格按照这个框架来回答。请提问。' },
          ...cleanMessages,
        ]
      : cleanMessages

    console.log(`[Chat] model=${activeModel.model} skill=${skillId} msgs=${allMessages.length}`)

    const result = await streamText({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      model: (provider as any)(activeModel.model),
      messages: allMessages,
      maxTokens: 2048,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Chat API error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
