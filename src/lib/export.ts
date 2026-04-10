import type { HistorySession } from './history'

// ── Markdown ──────────────────────────────────────────────────────────────────

export function sessionToMarkdown(s: HistorySession): string {
  const lines: string[] = []
  const date = new Date(s.timestamp).toLocaleString('zh-CN')

  if (s.type === 'chat') {
    lines.push(`# ${s.skillEmoji ?? ''} ${s.skillName ?? ''} 对话记录`)
    lines.push(`\n> 时间：${date}\n`)
    s.messages?.forEach(m => {
      if (m.role === 'user') {
        lines.push(`**你：**\n\n${m.content}\n`)
      } else {
        lines.push(`**${s.skillEmoji ?? ''} ${s.skillName ?? ''}：**\n\n${m.content}\n`)
      }
      lines.push('---')
    })
  } else if (s.type === 'brainstorm') {
    lines.push(`# 💡 头脑风暴：${s.title}`)
    lines.push(`\n> 时间：${date}\n`)
    const participants = s.brainstormSkills?.map(sk => `${sk.skillEmoji} ${sk.skillName}`).join('、') ?? ''
    lines.push(`**参与者：** ${participants}\n`)
    lines.push(`**话题：** ${s.topic}\n`)
    lines.push('---')
    s.turns?.forEach((t, i) => {
      const round = Math.floor(i / (s.brainstormSkills?.length ?? 1)) + 1
      const posInRound = i % (s.brainstormSkills?.length ?? 1)
      if (posInRound === 0) {
        lines.push(`\n## 第 ${round} 轮\n`)
      }
      lines.push(`### ${t.skillEmoji} ${t.skillName}\n\n${t.content}\n`)
    })
  } else if (s.type === 'interrogate') {
    lines.push(`# 🔍 质疑团：${s.title}`)
    lines.push(`\n> 时间：${date}\n`)
    if (s.targetName) lines.push(`**审查对象：** ${s.targetName}\n`)
    if (s.targetContent) {
      lines.push('**审查内容：**\n')
      lines.push(`> ${s.targetContent.replace(/\n/g, '\n> ')}\n`)
    }
    lines.push('---')
    s.critiques?.forEach(c => {
      lines.push(`\n### ${c.skillEmoji} ${c.skillName} 的质疑\n\n${c.content}\n`)
    })
    if (s.synthesis) {
      lines.push('\n---\n\n## ⚖️ 综合裁决\n')
      lines.push(s.synthesis)
    }
  }

  return lines.join('\n')
}

export function downloadMarkdown(s: HistorySession) {
  const md = sessionToMarkdown(s)
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const safeName = s.title.replace(/[^\u4e00-\u9fa5\w\s-]/g, '').trim().slice(0, 30) || 'history'
  a.href = url
  a.download = `${safeName}.md`
  a.click()
  URL.revokeObjectURL(url)
}

// ── PDF (browser print) ────────────────────────────────────────────────────────

export function printSession(s: HistorySession) {
  const md = sessionToMarkdown(s)
  // Convert minimal markdown to HTML for printing
  const html = md
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^\*\*(.+?)\*\*$/gm, '<strong>$1</strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^---$/gm, '<hr>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')

  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(`<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="utf-8">
<title>${s.title}</title>
<style>
  body { font-family: -apple-system, sans-serif; max-width: 720px; margin: 40px auto; color: #111; line-height: 1.7; font-size: 15px; }
  h1 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 8px; }
  h2 { font-size: 1.2em; margin-top: 2em; color: #333; }
  h3 { font-size: 1em; margin-top: 1.5em; color: #555; }
  blockquote { border-left: 3px solid #ddd; margin: 0; padding: 8px 16px; color: #666; font-size: 0.9em; }
  hr { border: none; border-top: 1px solid #eee; margin: 1.5em 0; }
  @media print { body { margin: 20px; } }
</style>
</head>
<body><p>${html}</p>
<script>window.onload = function(){ window.print(); }<\/script>
</body></html>`)
  win.document.close()
}

// ── Batch export all as one Markdown file ────────────────────────────────────

export function downloadAllMarkdown(sessions: HistorySession[]) {
  const md = sessions.map(s => sessionToMarkdown(s)).join('\n\n---\n\n')
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `我的智囊历史_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.md`
  a.click()
  URL.revokeObjectURL(url)
}
