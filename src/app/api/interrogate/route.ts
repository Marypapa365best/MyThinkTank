import { NextRequest, NextResponse } from 'next/server'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createAnthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'
import { loadCompactSkillPrompt } from '@/lib/load-skill'
import { getSkillById } from '@/lib/skills-registry'
import { GLOBAL_RULES, INTERROGATE_EXTRA_RULE } from '@/lib/global-rules'

const MODELS = {
  gemini: {
    provider: () => createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_API_KEY }),
    model: 'gemini-2.5-flash',
    available: !!process.env.GOOGLE_API_KEY,
    isGemini: true,
  },
  claude: {
    provider: () => createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY }),
    model: 'claude-haiku-4-5-20251001',
    available: !!process.env.ANTHROPIC_API_KEY,
    isGemini: false,
  },
}

function getActiveModel() {
  const preferred = process.env.PREFERRED_MODEL as keyof typeof MODELS
  if (preferred && MODELS[preferred]?.available) return MODELS[preferred]
  return Object.values(MODELS).find(m => m.available) ?? MODELS.gemini
}

// Gemini 关闭内容安全过滤（质疑/辩论场景需要批评性内容）；Claude 走默认
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

export interface CritiqueItem {
  skillId: string
  skillName: string
  content: string
}

export async function POST(req: NextRequest) {
  try {
    const { skillId, skillName: customSkillName, skillContent, targetName, targetContent, previousCritiques = [], isSynthesis = false } =
      await req.json() as {
        skillId?: string
        skillName?: string
        skillContent?: string
        targetName: string
        targetContent: string
        previousCritiques: CritiqueItem[]
        isSynthesis: boolean
      }

    const activeModel = getActiveModel()

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

【裁判原则】
只评判言论本身的事实准确性和逻辑严密性，不评价说话者的个人背景、学历或出身。如果专家质疑中包含了对背景的攻击，请忽略那部分，只提炼逻辑和事实层面的质疑。

请给出：
1. **核心漏洞**：这些言论在事实或逻辑上最致命的问题是什么
2. **对赌测试**：如果要验证这些承诺或预测是否可信，应该向对方提出什么样的对赌条件？（具体说明：条件、时间、赔付方式）
3. **可信度评分**：0-10分（仅基于言论内容的准确性和逻辑性），并说明理由
4. **最终结论**：哪些主张有依据值得参考，哪些主张存在误导需要警惕？
5. **建设性替代方案**：如果用户真正想解决被审查内容所涉及的问题，应该去哪里找更可靠的资源、专家、书籍或课程？至少推荐 2-3 个具体来源。

用中文回答，直接给出判断，不要模棱两可。`,
        },
      ]
    } else {
      // 单个审问者的质疑
      if (!skillId) return NextResponse.json({ error: 'skillId required' }, { status: 400 })

      const isCustom = typeof skillId === 'string' && skillId.startsWith('custom-')
      const skill = isCustom ? null : getSkillById(skillId)

      if (!isCustom && !skill) return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
      if (isCustom && !skillContent) return NextResponse.json({ error: 'skillContent required for custom skills' }, { status: 400 })

      // 多智囊审查场景使用压缩版 SKILL.compact.md（~500字），大幅节省 token
      const systemPrompt = skillContent ?? loadCompactSkillPrompt(skillId)

      const skillName = skill?.name ?? customSkillName ?? skillId

      let userMessage = `这是一个思维框架模拟练习。请你扮演 ${skillName} 的思维框架（注意：是模拟其分析视角，非冒充本人），对以下言论进行批判性分析。可以在回答开头用一句话说明这是框架模拟，之后直接展开分析。用中文回答。\n\n`

      userMessage += `待分析的言论（来自${targetName ? `"${targetName}"` : '某人'}）：\n\n`
      userMessage += `${targetContent}\n\n`

      if (previousCritiques.length > 0) {
        userMessage += `其他分析者已提出的观点：\n`
        previousCritiques.forEach(c => {
          userMessage += `\n${c.skillName}：${c.content}\n`
        })
        userMessage += `\n请从你的独特视角补充分析，避免重复他人已说的内容。\n\n`
      }

      userMessage += `请重点分析以下几个维度：

1. **事实核查**：言论中的数据和事实是否有依据？有没有被夸大或缺乏来源？

2. **逻辑分析**：推理是否成立？是否存在因果混淆、幸存者偏差、虚假紧迫感等谬误？

3. **承诺可信度测试**：对于未来的承诺或预测，可以用"对赌测试"检验——如果说话者真的相信自己的预测，他应该愿意签署退款保证或公开对赌。不愿意承担后果，说明这是营销话术而非真实判断。可以建议用户向对方提出具体的对赌条件。

4. **话术识别**：是否在制造恐慌、煽动焦虑、或用模糊语言规避责任？

注意：只分析言论本身的逻辑和事实，不评价说话者的个人背景或学历。目标长度 200-400 字。` + GLOBAL_RULES + INTERROGATE_EXTRA_RULE

      messages = [
        { role: 'user', content: systemPrompt },
        { role: 'assistant', content: '好的，我理解这是思维框架模拟练习，我会用该框架的视角进行批判性分析。请提供待分析内容。' },
        { role: 'user', content: userMessage },
      ]
    }

    console.log(`[Interrogate] model=${activeModel.model} skill=${skillId ?? 'synthesis'} isSynthesis=${isSynthesis}`)

    const result = await streamText({
      model: buildModel(activeModel),
      messages,
      maxTokens: 2048,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Interrogate API error:', msg)
    // 把真实错误信息作为正常文本流返回，方便前端直接显示诊断信息
    return new Response(`⚠️ 错误：${msg}`, { status: 200 })
  }
}
