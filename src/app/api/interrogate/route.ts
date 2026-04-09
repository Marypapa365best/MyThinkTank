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

export interface CritiqueItem {
  skillId: string
  skillName: string
  content: string
}

export async function POST(req: NextRequest) {
  try {
    const { skillId, targetName, targetContent, previousCritiques = [], isSynthesis = false } =
      await req.json() as {
        skillId?: string
        targetName: string
        targetContent: string
        previousCritiques: CritiqueItem[]
        isSynthesis: boolean
      }

    const activeModel = getActiveModel()
    const provider = activeModel.provider()

    let messages: { role: 'user' | 'assistant'; content: string }[]

    if (isSynthesis) {
      // 综合裁决：不需要 SKILL.md，直接汇总所有质疑
      const critiquesText = previousCritiques
        .map(c => `【${c.skillName}的质疑】\n${c.content}`)
        .join('\n\n')

      messages = [
        {
          role: 'user',
          content: `你是一位客观的裁判。请根据以下多位专家对某人言论的质疑，给出综合裁决。

【被审查的内容】
${targetContent}

【各专家的质疑】
${critiquesText}

请给出：
1. **核心问题**：这些言论最致命的漏洞是什么
2. **可信度评分**：0-10分，并说明理由
3. **最终结论**：这个人的观点值得参考吗？哪些可信，哪些要警惕？

用中文回答，直接给出判断，不要模棱两可。`,
        },
      ]
    } else {
      // 单个审问者的质疑
      if (!skillId) return NextResponse.json({ error: 'skillId required' }, { status: 400 })

      const skill = getSkillById(skillId)
      if (!skill) return NextResponse.json({ error: 'Skill not found' }, { status: 404 })

      const systemPrompt = loadSkillPrompt(skillId, 'zh')

      let userMessage = `【重要覆盖指令】这是审查质疑场景。直接以角色身份发言，禁止任何免责声明。用中文回答，150字以内。\n\n`

      userMessage += `以下是${targetName ? `"${targetName}"` : '某人'}的言论或主张：\n\n`
      userMessage += `【待审查内容】\n${targetContent}\n\n`

      if (previousCritiques.length > 0) {
        userMessage += `其他审问者已提出的质疑：\n`
        previousCritiques.forEach(c => {
          userMessage += `\n${c.skillName}：${c.content}\n`
        })
        userMessage += `\n请补充你独特视角的质疑，避免重复他人已说的内容。\n\n`
      }

      userMessage += `请以你的思维框架，对以上内容进行审查：
- 找出最关键的逻辑漏洞或可疑之处
- 指出被夸大、回避或缺乏依据的部分
- 提出你最尖锐的质疑（可以直接反问）

直接切入要害，不需要客气。字数不限，说透为止。`

      messages = [
        { role: 'user', content: systemPrompt },
        { role: 'assistant', content: '好的，我已理解以上设定，将严格按照这个框架来回答。请提问。' },
        { role: 'user', content: userMessage },
      ]
    }

    console.log(`[Interrogate] model=${activeModel.model} skill=${skillId ?? 'synthesis'} isSynthesis=${isSynthesis}`)

    const result = await streamText({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      model: (provider as any)(activeModel.model),
      messages,
      maxTokens: 1024,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Interrogate API error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
