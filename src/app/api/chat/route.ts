import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { loadSkillPrompt, detectLanguage } from '@/lib/load-skill'
import { getSkillById } from '@/lib/skills-registry'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { skillId, messages } = await req.json()

    // 验证 skill 是否存在
    const skill = getSkillById(skillId)
    if (!skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
    }

    // 检测用户语言（取最后一条用户消息）
    const lastUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === 'user')
    const lang = lastUserMsg ? detectLanguage(lastUserMsg.content) : 'zh'

    // 加载对应语言的 skill prompt
    const systemPrompt = loadSkillPrompt(skillId, lang)

    // 调用 Claude API（流式输出）
    const stream = await anthropic.messages.stream({
      model: 'claude-opus-4-5',
      max_tokens: 2048,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    })

    // 返回 SSE 流
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            const data = JSON.stringify({
              choices: [{ delta: { content: chunk.delta.text } }],
            })
            controller.enqueue(encoder.encode(`data: ${data}\n\n`))
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
