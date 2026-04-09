import fs from 'fs'
import path from 'path'

// 读取 SKILL.md 文件内容作为 system prompt
export function loadSkillPrompt(skillId: string, lang: 'zh' | 'en' = 'zh'): string {
  const skillsDir = path.join(process.cwd(), 'skills')

  // 语言优先级：指定语言 → 中文降级
  const filenames = lang === 'en'
    ? ['SKILL.en.md', 'SKILL.md']
    : ['SKILL.md']

  for (const filename of filenames) {
    const filePath = path.join(skillsDir, skillId, filename)
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8')
    }
  }

  throw new Error(`Skill not found: ${skillId}`)
}

// 检测用户消息语言（简单判断）
export function detectLanguage(text: string): 'zh' | 'en' {
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length
  return chineseChars > text.length * 0.1 ? 'zh' : 'en'
}
