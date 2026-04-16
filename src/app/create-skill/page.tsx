'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveCustomSkill } from '@/lib/custom-skills'
import { RULES_DISPLAY } from '@/lib/global-rules'

type Step = 'input' | 'generating' | 'preview' | 'done'

const EMOJI_OPTIONS = ['🧠', '💡', '📚', '🔬', '💼', '🎯', '🌍', '⚡', '🏛️', '🎨', '🔥', '🌱', '💰', '🤝', '⚖️']

export default function CreateSkillPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('input')
  const [personName, setPersonName] = useState('')
  const [rawText, setRawText] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [urlLoading, setUrlLoading] = useState(false)
  const [urlError, setUrlError] = useState('')
  const [inputMode, setInputMode] = useState<'text' | 'url'>('text')

  // Preview state
  const [generatedContent, setGeneratedContent] = useState('')
  const [editedContent, setEditedContent] = useState('')
  const [detectedName, setDetectedName] = useState('')
  const [skillName, setSkillName] = useState('')
  const [skillEmoji, setSkillEmoji] = useState('🧠')
  const [skillDescription, setSkillDescription] = useState('')
  const [error, setError] = useState('')

  async function fetchUrl() {
    if (!urlInput.trim()) return
    setUrlLoading(true)
    setUrlError('')
    try {
      const res = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setUrlError(data.error ?? '抓取失败')
      } else {
        setRawText(data.text)
        setUrlError('')
      }
    } catch {
      setUrlError('网络错误，请直接粘贴文本')
    } finally {
      setUrlLoading(false)
    }
  }

  async function generate() {
    if (rawText.trim().length < 50) {
      setError('请提供至少 50 字的参考资料')
      return
    }
    setError('')
    setStep('generating')

    try {
      const res = await fetch('/api/generate-skill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: rawText.trim(), personName: personName.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? '生成失败')
        setStep('input')
        return
      }
      setGeneratedContent(data.content)
      setEditedContent(data.content)
      setDetectedName(data.detectedName)
      setSkillName(data.detectedName)
      setSkillDescription(`${data.detectedName} 的思维框架模拟`)
      setStep('preview')
    } catch {
      setError('网络错误，请重试')
      setStep('input')
    }
  }

  async function saveSkill() {
    if (!skillName.trim()) {
      setError('请填写智囊名称')
      return
    }
    await saveCustomSkill({
      name: skillName.trim(),
      emoji: skillEmoji,
      description: skillDescription.trim() || `${skillName} 的思维框架`,
      content: editedContent,
      source: inputMode === 'url' ? 'url' : 'text',
      sourceUrl: inputMode === 'url' ? urlInput.trim() : undefined,
    })
    setStep('done')
  }

  if (step === 'done') {
    return (
      <div className="min-h-screen pt-24 pb-20 px-4 flex items-center justify-center bg-[#fbf9f2]">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">{skillEmoji}</div>
          <h1 className="text-2xl font-bold mb-2 text-[#1b1c18]">智囊已创建！</h1>
          <p className="text-[#56423c] text-sm mb-8">
            「{skillName}」已保存到你的智囊库，可以在头脑风暴和质疑团中使用
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => router.push('/brainstorm')}
              className="px-5 py-2.5 bg-[#f97316] text-[#1b1c18] text-sm font-medium rounded-xl hover:bg-[#f97316]/90 transition-all"
            >
              💡 去头脑风暴
            </button>
            <button
              onClick={() => router.push('/interrogate')}
              className="px-5 py-2.5 border border-[#dcc1b8] text-[#56423c] text-sm rounded-xl hover:text-[#f97316] hover:border-[#f97316] transition-all"
            >
              🔍 去质疑团
            </button>
            <button
              onClick={() => { setStep('input'); setRawText(''); setPersonName(''); setUrlInput('') }}
              className="px-5 py-2.5 border border-[#dcc1b8] text-[#56423c] text-sm rounded-xl hover:text-[#f97316] hover:border-[#f97316] transition-all"
            >
              再建一个
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'generating') {
    return (
      <div className="min-h-screen pt-24 pb-20 px-4 flex items-center justify-center bg-[#fbf9f2]">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🧠</div>
          <p className="text-[#56423c] text-sm">正在分析资料，提炼思维框架…</p>
          <p className="text-[#89726b] text-xs mt-2">通常需要 10-20 秒</p>
        </div>
      </div>
    )
  }

  if (step === 'preview') {
    return (
      <div className="min-h-screen pt-24 pb-20 px-4 bg-[#fbf9f2]">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold mb-1 text-[#1b1c18]">预览与编辑</h1>
            <p className="text-[#56423c] text-sm">检查生成的思维框架，可直接编辑内容</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: metadata */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#dcc1b8]/40 bg-[#efeee7] p-5 space-y-4">
                <h2 className="text-sm font-medium text-[#56423c] uppercase tracking-wider">智囊信息</h2>

                {/* Emoji picker */}
                <div>
                  <label className="text-xs text-[#89726b] mb-2 block">选择头像</label>
                  <div className="flex flex-wrap gap-2">
                    {EMOJI_OPTIONS.map(e => (
                      <button
                        key={e}
                        onClick={() => setSkillEmoji(e)}
                        className={`w-9 h-9 rounded-lg text-xl flex items-center justify-center transition-all ${
                          skillEmoji === e
                            ? 'bg-[#f97316] border border-[#f97316] text-white'
                            : 'bg-white border border-[#dcc1b8] hover:bg-[#fbf9f2]'
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#89726b] mb-1.5 block">智囊名称 *</label>
                  <input
                    value={skillName}
                    onChange={e => setSkillName(e.target.value)}
                    className="w-full bg-white border border-[#dcc1b8] rounded-xl px-4 py-2.5 text-sm text-[#1b1c18] placeholder-[#89726b] focus:outline-none focus:border-[#f97316] transition-colors"
                    placeholder="例如：彼得·德鲁克"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#89726b] mb-1.5 block">简介</label>
                  <input
                    value={skillDescription}
                    onChange={e => setSkillDescription(e.target.value)}
                    className="w-full bg-white border border-[#dcc1b8] rounded-xl px-4 py-2.5 text-sm text-[#1b1c18] placeholder-[#89726b] focus:outline-none focus:border-[#f97316] transition-colors"
                    placeholder="一句话描述这位智囊"
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-600 text-sm text-center">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('input')}
                  className="flex-1 py-2.5 border border-[#dcc1b8] text-[#56423c] text-sm rounded-xl hover:text-[#f97316] hover:border-[#f97316] transition-all"
                >
                  重新生成
                </button>
                <button
                  onClick={saveSkill}
                  className="flex-1 py-2.5 bg-[#f97316] text-[#1b1c18] text-sm font-medium rounded-xl hover:bg-[#f97316]/90 transition-all"
                >
                  保存智囊
                </button>
              </div>
            </div>

            {/* Right: content editor */}
            <div className="rounded-2xl border border-[#dcc1b8]/40 bg-[#efeee7] p-5">
              <h2 className="text-sm font-medium text-[#56423c] uppercase tracking-wider mb-3">思维框架内容</h2>
              <textarea
                value={editedContent}
                onChange={e => setEditedContent(e.target.value)}
                rows={20}
                className="w-full bg-white text-xs text-[#1b1c18] font-mono resize-none focus:outline-none focus:border focus:border-[#f97316] leading-relaxed rounded-lg px-3 py-2 border border-[#dcc1b8]"
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Step: input
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 bg-[#fbf9f2]">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10 text-center">
          <div className="text-4xl mb-3">✨</div>
          <h1 className="text-3xl font-bold mb-2 text-[#1b1c18]">创建智囊</h1>
          <p className="text-[#56423c] text-sm max-w-md mx-auto">
            提供任意真实人物的公开资料，AI 自动提炼其思维框架
          </p>
          <p className="mt-2 text-xs text-[#89726b] max-w-sm mx-auto">
            仅支持真实历史人物和公众人物，基于公开资料推断
          </p>
        </div>

        {/* Platform rules */}
        <div className="rounded-2xl border border-[#dcc1b8]/40 bg-[#efeee7] p-5 mb-6">
          <h2 className="text-xs font-medium text-[#89726b] uppercase tracking-wider mb-4">
            平台统一规则 · 所有智囊均遵守
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {RULES_DISPLAY.map((rule) => (
              <div
                key={rule.title}
                className={`flex gap-3 p-3 rounded-xl ${
                  rule.interrogateOnly
                    ? 'bg-amber-50 border border-amber-200'
                    : 'bg-white border border-[#dcc1b8]'
                }`}
              >
                <span className="text-lg flex-none">{rule.icon}</span>
                <div>
                  <div className="text-sm font-medium text-[#1b1c18] mb-0.5">
                    {rule.title}
                    {rule.interrogateOnly && (
                      <span className="ml-1.5 text-xs text-amber-700 font-normal">质疑团</span>
                    )}
                  </div>
                  <p className="text-xs text-[#56423c] leading-relaxed">{rule.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          {/* Person name */}
          <div className="rounded-2xl border border-[#dcc1b8]/40 bg-[#efeee7] p-5 space-y-4">
            <h2 className="text-sm font-medium text-[#56423c] uppercase tracking-wider">人物信息</h2>
            <input
              value={personName}
              onChange={e => setPersonName(e.target.value)}
              placeholder='人物姓名（选填，如 "彼得·德鲁克"、"乔布斯"）'
              className="w-full bg-white border border-[#dcc1b8] rounded-xl px-4 py-2.5 text-sm text-[#1b1c18] placeholder-[#89726b] focus:outline-none focus:border-[#f97316] transition-colors"
            />
          </div>

          {/* Input mode tabs */}
          <div className="rounded-2xl border border-[#dcc1b8]/40 bg-[#efeee7] p-5 space-y-4">
            <div className="flex gap-1 p-1 bg-[#fbf9f2] rounded-xl w-fit">
              <button
                onClick={() => setInputMode('text')}
                className={`px-4 py-1.5 rounded-lg text-sm transition-all ${
                  inputMode === 'text' ? 'bg-[#f97316] text-white' : 'text-[#89726b] hover:text-[#56423c]'
                }`}
              >
                粘贴文本
              </button>
              <button
                onClick={() => setInputMode('url')}
                className={`px-4 py-1.5 rounded-lg text-sm transition-all ${
                  inputMode === 'url' ? 'bg-[#f97316] text-white' : 'text-[#89726b] hover:text-[#56423c]'
                }`}
              >
                网页链接
              </button>
            </div>

            {inputMode === 'url' && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    placeholder="粘贴文章或维基百科链接…"
                    className="flex-1 bg-white border border-[#dcc1b8] rounded-xl px-4 py-2.5 text-sm text-[#1b1c18] placeholder-[#89726b] focus:outline-none focus:border-[#f97316] transition-colors"
                  />
                  <button
                    onClick={fetchUrl}
                    disabled={urlLoading || !urlInput.trim()}
                    className="px-4 py-2.5 bg-[#f97316] text-[#1b1c18] text-sm rounded-xl hover:bg-[#f97316]/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {urlLoading ? '抓取中…' : '抓取'}
                  </button>
                </div>
                {urlError && <p className="text-red-600 text-xs">{urlError}</p>}
                <p className="text-xs text-[#89726b]">仅支持公开静态页面，不支持需要登录的内容</p>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-[#89726b]">
                  {inputMode === 'text' ? '参考资料' : '抓取内容（可编辑）'}
                </label>
                <span className="text-xs text-[#89726b]">{rawText.length} / 5000 字</span>
              </div>
              <textarea
                value={rawText}
                onChange={e => setRawText(e.target.value.slice(0, 5000))}
                placeholder={inputMode === 'text'
                  ? '粘贴该人物的著作摘录、演讲稿、访谈记录、维基百科介绍…\n\n越详细越好，建议至少 200 字。'
                  : '点击上方"抓取"按钮自动填充，或手动粘贴内容…'}
                rows={10}
                className="w-full bg-white border border-[#dcc1b8] rounded-xl px-4 py-3 text-sm text-[#1b1c18] placeholder-[#89726b] resize-none focus:outline-none focus:border-[#f97316] transition-colors"
              />
            </div>
          </div>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <div className="flex justify-center">
            <button
              onClick={generate}
              disabled={rawText.trim().length < 50}
              className="px-8 py-3 bg-[#f97316] text-white text-sm font-medium rounded-xl hover:bg-[#f97316]/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {rawText.trim().length < 50
                ? `还需 ${50 - rawText.trim().length} 字`
                : '✨ 生成智囊框架'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
