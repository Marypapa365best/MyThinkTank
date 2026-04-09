'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">
            我的智囊
          </span>
          <span className="hidden sm:inline text-xs text-white/40 font-normal mt-0.5">
            · My Think Tank
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 text-sm text-white/60">
          <Link href="/skills" className="hover:text-white transition-colors">
            智囊库
          </Link>
          <Link href="/brainstorm" className="hover:text-white transition-colors">
            💡 头脑风暴
          </Link>
          <Link href="/interrogate" className="hover:text-white transition-colors">
            🔍 质疑团
          </Link>
          <Link href="/pricing" className="hover:text-white transition-colors">
            定价
          </Link>
          <Link href="/about" className="hover:text-white transition-colors">
            关于
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">登录</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="bg-white text-black hover:bg-white/90">免费开始</Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white/60 hover:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0a0a0a] px-4 py-4 flex flex-col gap-4 text-sm">
          <Link href="/skills" className="text-white/60 hover:text-white">智囊库</Link>
          <Link href="/brainstorm" className="text-white/60 hover:text-white">💡 头脑风暴</Link>
          <Link href="/interrogate" className="text-white/60 hover:text-white">🔍 质疑团</Link>
          <Link href="/pricing" className="text-white/60 hover:text-white">定价</Link>
          <Link href="/about" className="text-white/60 hover:text-white">关于</Link>
          <div className="flex gap-3 pt-2">
            <Link href="/login"><Button variant="ghost" size="sm">登录</Button></Link>
            <Link href="/signup"><Button size="sm" className="bg-white text-black">免费开始</Button></Link>
          </div>
        </div>
      )}
    </nav>
  )
}
