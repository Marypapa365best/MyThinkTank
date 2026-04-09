'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  skillId: string
  skillName: string
  skillEmoji: string
}

const SUGGESTED_QUESTIONS: Record<string, string[]> = {
  'warren-buffett': [
    '现在美股大跌，是入场的好时机吗？',
    '如何判断一家公司是否有真正的护城河？',
    '普通人应该如何开始价值投资？',
  ],
  'elon-musk': [
    '如何用第一性原理分析一个商业想法？',
    '创业公司什么时候该融资，什么时候该自力更生？',
    '如何建立一个高效执行的团队？',
  ],
  'charlie-munger': [
    '如何建立自己的多元思维框架？',
    '投资中最常见的认知偏差有哪些？',
    '如何判断一个生意值不值得投资？',
  ],
  'default': [
    '你最核心的思维框架是什么？',
    '面对重大决策，你通常如何思考？',
    '你认为普通人最容易犯的错误是什么？',
  ],
}

export default function ChatInterface({ skillId, skillName, skillEmoji }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const suggestions = SUGGESTED_QUESTIONS[skillId] || SUGGESTED_QUESTIONS['default']

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillId,
          messages: [...messages, userMsg].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!res.ok) throw new Error('API error')

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
      }
      setMessages(prev => [...prev, assistantMsg])

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') break
              try {
                const parsed = JSON.parse(data)
                const delta = parsed.choices?.[0]?.delta?.content || ''
                assistantContent += delta
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantMsg.id ? { ...m, content: assistantContent } : m
                  )
                )
              } catch {}
            }
          }
        }
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: '抱歉，连接出现问题，请稍后重试。',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto w-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-8 text-center">
            <div>
              <div className="text-6xl mb-4">{skillEmoji}</div>
              <h2 className="text-xl font-semibold mb-2">与 {skillName} 对话</h2>
              <p className="text-sm text-white/40 max-w-sm">
                提出你的问题，获得基于严格研究提炼的思维框架洞见
              </p>
            </div>
            {/* Suggested Questions */}
            <div className="flex flex-col gap-2 w-full max-w-md">
              {suggestions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-left px-4 py-3 rounded-xl border border-white/10 text-sm text-white/60 hover:text-white hover:border-white/25 hover:bg-white/5 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`flex-none w-8 h-8 rounded-full flex items-center justify-center text-sm ${
              msg.role === 'user'
                ? 'bg-white text-black'
                : 'bg-white/10 text-white'
            }`}>
              {msg.role === 'user' ? '你' : skillEmoji}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-white text-black rounded-tr-sm'
                  : 'bg-white/[0.06] text-white/90 rounded-tl-sm'
              }`}
            >
              {msg.role === 'assistant' ? (
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                    ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 mb-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 mb-2">{children}</ol>,
                    li: ({ children }) => <li>{children}</li>,
                    h3: ({ children }) => <h3 className="font-semibold text-white mt-3 mb-1">{children}</h3>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-white/20 pl-3 text-white/60 italic my-2">{children}</blockquote>
                    ),
                  }}
                >
                  {msg.content || '▌'}
                </ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {loading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">
              {skillEmoji}
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white/[0.06] text-white/40 text-sm">
              <span className="animate-pulse">思考中…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="flex-none border-t border-white/10 px-4 py-4">
        <div className="flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`问 ${skillName} 任何问题…`}
            rows={1}
            className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:border-white/25 transition-colors"
            style={{ maxHeight: '120px' }}
            disabled={loading}
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            size="sm"
            className="bg-white text-black hover:bg-white/90 h-10 px-4 flex-none disabled:opacity-30"
          >
            发送
          </Button>
        </div>
        <p className="text-xs text-white/20 mt-2 text-center">
          Enter 发送 · Shift+Enter 换行
        </p>
      </div>
    </div>
  )
}
