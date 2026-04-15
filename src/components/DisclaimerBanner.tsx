'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'nuwa_disclaimer_accepted'

export default function DisclaimerBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // 只在用户未确认过时显示
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true)
    }
  }, [])

  function accept() {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto bg-[#111] border border-white/15 rounded-2xl shadow-2xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white/90 mb-1">使用须知</p>
          <p className="text-xs text-white/45 leading-relaxed">
            本平台所有智囊均基于公开资料推断，模拟其思维框架，
            <strong className="text-[#56423c]">并非本人授权或认可</strong>，内容仅供参考，
            不构成投资、法律或医疗建议。继续使用即表示你同意我们的{' '}
            <Link href="/terms" className="underline underline-offset-2 text-[#56423c] hover:text-[#1b1c18] transition-colors">
              服务条款
            </Link>。
          </p>
        </div>
        <button
          onClick={accept}
          className="shrink-0 px-5 py-2 bg-white text-black text-sm font-medium rounded-xl hover:bg-white/90 transition-all"
        >
          我已了解
        </button>
      </div>
    </div>
  )
}
