import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `你是一个专业的思维框架提炼专家。你的任务是：根据用户提供的关于某位真实历史人物或知名公众人物的原始资料，生成一份结构化的 SKILL.md 文件，用于模拟该人物的分析视角和思维方式。

**重要原则：**
1. 只能基于该人物公开发表的著作、演讲、访谈等真实资料
2. 所有推断内容必须标注"（基于公开资料推断）"
3. 这是思维框架模拟练习，不代表本人观点
4. 只接受真实历史人物和知名公众人物（不接受虚构角色）
5. 严格基于事实，不夸大，不歪曲

**输出格式（严格遵守）：**

\`\`\`markdown
# [人物名称] 思维框架

## 核心身份
[2-3句话：身份定位、核心领域、历史地位]

## 思维方式与方法论
[该人物最具代表性的3-5个思维工具或分析框架，每个附简短说明]

## 核心价值观与信念
[驱动其决策的底层价值观，3-5条]

## 典型决策风格
[面对问题时的典型反应模式，具体且有辨识度]

## 语言与表达特点
[该人物的语言风格、常用表达、语气特征]

## 代表性观点
[该人物公开表达过的、最具代表性的3-5个核心主张]

## 局限性与盲点
[基于公开记录，该人物思维的局限或批评者常提到的问题]

## 模拟边界
- 以下内容基于公开资料推断，代表其思维框架，非本人观点
- 模拟仅用于分析和学习目的
\`\`\`

只输出 markdown 内容本身，不要添加任何额外说明。`

export async function POST(req: NextRequest) {
  try {
    const { rawText, personName } = await req.json()

    if (!rawText || rawText.trim().length < 50) {
      return NextResponse.json({ error: '请提供至少 50 字的参考资料' }, { status: 400 })
    }

    if (rawText.length > 5000) {
      return NextResponse.json({ error: '资料不超过 5000 字' }, { status: 400 })
    }

    const userPrompt = personName
      ? `请为【${personName}】生成 SKILL.md。以下是参考资料：\n\n${rawText}`
      : `请根据以下资料识别人物并生成 SKILL.md：\n\n${rawText}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      return NextResponse.json({ error: '生成失败，请重试' }, { status: 500 })
    }

    // Extract name and emoji suggestion from the generated content
    const nameMatch = content.text.match(/^#\s+(.+?)\s+思维框架/m)
    const detectedName = nameMatch ? nameMatch[1].trim() : (personName || '未知人物')

    return NextResponse.json({
      content: content.text,
      detectedName,
    })
  } catch (err) {
    console.error('generate-skill error:', err)
    return NextResponse.json({ error: '生成失败，请检查 API 配置' }, { status: 500 })
  }
}
