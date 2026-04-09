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
    model: 'claude-haiku-4-5-20251001',
    available: !!process.env.ANTHROPIC_API_KEY,
  },
}

function getActiveModel() {
  const preferred = process.env.PREFERRED_MODEL as keyof typeof MODELS
  if (preferred && MODELS[preferred]?.available) return MODELS[preferred]
  return Object.values(MODELS).find(m => m.available) ?? MODELS.gemini
}

// content 可能是字符串，也可能是 [{type:'text', text:'...'}] 数组（multimodal SDK 格式）
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

type ChatMessage = { role: 'user' | 'assistant'; content: string }

// 确保消息列表符合 Gemini 要求：角色严格交替，最后一条是 user
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

  // 去掉末尾非 user 消息
  while (deduped.length > 0 && deduped[deduped.length - 1].role !== 'user') {
    deduped.pop()
  }

  return deduped
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { skillId, messages } = body

    console.log('[Chat] skillId:', skillId, 'raw msg count:', Array.isArray(messages) ? messages.length : 'N/A')
    if (Array.isArray(messages) && messages.length > 0) {
      console.log('[Chat] first msg role:', messages[0].role, 'content type:', typeof messages[0].content)
    }

    const skill = getSkillById(skillId)
    if (!skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
    }

    const cleanMessages = sanitizeMessages(messages)
    console.log('[Chat] clean msg count:', cleanMessages.length)

    if (cleanMessages.length === 0) {
      return NextResponse.json({ error: 'No valid user message' }, { status: 400 })
    }

    const lastUserMsg = [...cleanMessages].reverse().find(m => m.role === 'user')
    const lang = lastUserMsg ? detectLanguage(lastUserMsg.content) : 'zh'
    const systemPrompt = loadSkillPrompt(skillId, lang)

    const activeModel = getActiveModel()
    const provider = activeModel.provider()

    console.log(`[Chat] model=${activeModel.model} msgs=${cleanMessages.length}`)

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
