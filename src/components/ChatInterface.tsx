'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useChat } from 'ai/react'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'
import { saveSession } from '@/lib/history'

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

// 语音识别类型声明
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string
}
interface SpeechRecognitionInstance extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  start(): void
  stop(): void
  onresult: ((e: SpeechRecognitionEvent) => void) | null
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance
    webkitSpeechRecognition: new () => SpeechRecognitionInstance
  }
}

export default function ChatInterface({ skillId, skillName, skillEmoji }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const suggestions = SUGGESTED_QUESTIONS[skillId] || SUGGESTED_QUESTIONS['default']

  const [isRecording, setIsRecording] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)

  const { messages, input, setInput, append, setMessages, isLoading } = useChat({
    api: '/api/chat',
    body: { skillId },
    onFinish: () => {
      // 每次 AI 回复完成后，保存当前完整对话到历史记录
      const allMsgs = messages.map(m => ({ role: m.role as 'user' | 'assistant', content: typeof m.content === 'string' ? m.content : '' }))
      if (allMsgs.length === 0) return
      const firstUser = allMsgs.find(m => m.role === 'user')?.content ?? ''
      saveSession({
        type: 'chat',
        title: firstUser.slice(0, 60) + (firstUser.length > 60 ? '…' : ''),
        skillId,
        skillName,
        skillEmoji,
        messages: allMsgs,
      })
    },
    onError: () => {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant' as const,
          content: '抱歉，连接出现问题，请稍后重试。',
        },
      ])
    },
  })

  // 检测浏览器是否支持语音识别
  useEffect(() => {
    setVoiceSupported(
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    )
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return
    setInput('')
    await append({ role: 'user', content: text.trim() })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      // 停止录音
      recognitionRef.current?.stop()
      setIsRecording(false)
      return
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    // 自动检测语言：先尝试中文，用户说英文也能识别
    recognition.lang = 'zh-CN'
    recognition.continuous = false
    recognition.interimResults = true

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let transcript = ''
      for (let i = 0; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript
      }
      setInput(transcript)
    }

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      console.error('语音识别错误:', e.error)
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsRecording(true)
  }, [isRecording, setInput])

  return (
    <div className="flex flex-col h-full bg-[#fbf9f2] max-w-3xl mx-auto w-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 bg-[#fbf9f2]">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-10 text-center">
            <div>
              <div className="text-7xl mb-6">{skillEmoji}</div>
              <h2 className="text-2xl font-semibold text-[#1b1c18] mb-3">与 {skillName} 对话</h2>
              <p className="text-sm text-[#56423c] max-w-sm leading-relaxed">
                提出你的问题，获得基于严格研究提炼的思维框架洞见
              </p>
            </div>
            {/* Suggested Questions */}
            <div className="flex flex-col gap-3 w-full max-w-lg">
              {suggestions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="group text-left px-5 py-4 rounded-xl border border-[#dcc1b8] bg-gradient-to-r from-white to-[#fffbf7] text-sm text-[#1b1c18] hover:text-[#9a4021] hover:border-[#9a4021] hover:from-[#fffbf7] hover:to-[#fef8f2] transition-all duration-300 [box-shadow:0px_0px_0px_1px_rgba(220,193,184,0.3)] hover:[box-shadow:0px_0px_0px_1px_rgba(154,64,33,0.3),_0px_2px_12px_rgba(27,28,24,0.05)]"
                >
                  <span className="font-medium">{q}</span>
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
            <div className={`flex-none w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              msg.role === 'user'
                ? 'bg-[#9a4021] text-white'
                : 'bg-[#efeee7] text-[#56423c] border border-[#dcc1b8]'
            }`}>
              {msg.role === 'user' ? '你' : skillEmoji}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#9a4021] text-white rounded-tr-sm'
                  : 'bg-[#efeee7] border border-[#dcc1b8]/50 text-[#1b1c18] rounded-tl-sm'
              }`}
            >
              {msg.role === 'assistant' ? (
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    strong: ({ children }) => <strong className="font-semibold text-[#1b1c18]">{children}</strong>,
                    ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 mb-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 mb-2">{children}</ol>,
                    li: ({ children }) => <li>{children}</li>,
                    h3: ({ children }) => <h3 className="font-semibold text-[#1b1c18] mt-3 mb-1">{children}</h3>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-[#dcc1b8] pl-3 text-[#56423c] italic my-2">{children}</blockquote>
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

        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#efeee7] border border-[#dcc1b8] flex items-center justify-center text-sm">
              {skillEmoji}
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[#efeee7] border border-[#dcc1b8]/50 text-[#56423c] text-sm">
              <span className="animate-pulse">思考中…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="flex-none border-t border-[#dcc1b8]/40 bg-[#fbf9f2] px-4 py-4">
        <div className="flex gap-2 items-end">
          {/* 语音按钮 */}
          {voiceSupported && (
            <button
              onClick={toggleRecording}
              disabled={isLoading}
              title={isRecording ? '点击停止录音' : '点击开始语音输入'}
              className={`flex-none w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-[#efeee7] border border-[#dcc1b8] text-[#89726b] hover:text-[#9a4021] hover:border-[#9a4021]'
              }`}
            >
              {isRecording ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="2"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" x2="12" y1="19" y2="22"/>
                </svg>
              )}
            </button>
          )}

          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? '正在聆听…' : `问 ${skillName} 任何问题…`}
            rows={1}
            className="flex-1 bg-white border border-[#dcc1b8] rounded-xl px-4 py-3 text-sm text-[#1b1c18] placeholder-[#89726b] resize-none focus:outline-none focus:border-[#9a4021] transition-colors"
            style={{ maxHeight: '120px' }}
            disabled={isLoading}
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            size="sm"
            className="h-10 px-4 flex-none"
          >
            发送
          </Button>
        </div>
        <p className="text-xs text-[#89726b] mt-2 text-center leading-relaxed">
          Enter 发送 · Shift+Enter 换行
          {voiceSupported && ' · 🎤 支持语音输入'}
        </p>
      </div>
    </div>
  )
}
