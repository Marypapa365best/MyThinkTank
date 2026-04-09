import fs from 'fs'
import path from 'path'

// 读取 SKILL.md 文件内容作为 system prompt
export function loadSkillPrompt(
  skillId: string,
  lang: 'zh' | 'en' = 'zh',
  maxChars?: number  // 可选截断：多智囊场景节省 token
): string {
  const skillsDir = path.join(process.cwd(), 'skills')

  const filenames = lang === 'en'
    ? ['SKILL.en.md', 'SKILL.md']
    : ['SKILL.md']

  for (const filename of filenames) {
    const filePath = path.join(skillsDir, skillId, filename)
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8')
      if (maxChars && content.length > maxChars) {
        // 在段落边界截断，不截断半句话
        const truncated = content.slice(0, maxChars)
        const lastPara = truncated.lastIndexOf('\n\n')
        return lastPara > maxChars * 0.7
          ? truncated.slice(0, lastPara)
          : truncated
      }
      return content
    }
  }

  throw new Error(`Skill not found: ${skillId}`)
}

// 检测用户消息语言（简单判断）
export function detectLanguage(text: string): 'zh' | 'en' {
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length
  return chineseChars > text.length * 0.1 ? 'zh' : 'en'
}
