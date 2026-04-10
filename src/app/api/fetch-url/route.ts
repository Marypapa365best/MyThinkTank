import { NextRequest, NextResponse } from 'next/server'

// Simple server-side URL fetcher for static pages (free tier)
// Strips HTML tags and returns clean text content
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: '请提供有效的 URL' }, { status: 400 })
    }

    // Basic URL validation
    let parsed: URL
    try {
      parsed = new URL(url)
    } catch {
      return NextResponse.json({ error: 'URL 格式不正确' }, { status: 400 })
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return NextResponse.json({ error: '只支持 HTTP/HTTPS 链接' }, { status: 400 })
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NuwaBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml,text/plain',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      return NextResponse.json({ error: `无法访问该页面（${response.status}）` }, { status: 400 })
    }

    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      return NextResponse.json({ error: '该链接不是文本页面' }, { status: 400 })
    }

    const html = await response.text()

    // Strip HTML tags and clean up whitespace
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s{3,}/g, '\n\n')
      .trim()

    // Limit to 5000 chars
    const truncated = text.length > 5000 ? text.slice(0, 5000) + '…（内容已截断）' : text

    return NextResponse.json({ text: truncated, url })
  } catch (err) {
    if (err instanceof Error && err.name === 'TimeoutError') {
      return NextResponse.json({ error: '页面加载超时，请直接粘贴文本' }, { status: 400 })
    }
    console.error('fetch-url error:', err)
    return NextResponse.json({ error: '抓取失败，请直接粘贴文本内容' }, { status: 500 })
  }
}
