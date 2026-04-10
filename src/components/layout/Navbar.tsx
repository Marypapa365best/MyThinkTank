'use client'

import Link from 'next/link'
import { useState } from 'react'
import { UserButton, SignInButton, useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { isSignedIn } = useUser()

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-[#2a2a28] bg-[#141413]/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">我的智囊</span>
          <span className="hidden sm:inline text-xs text-white/40 font-normal mt-0.5">
            · My Think Tank
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 text-sm text-[#b0aea5]">
          <Link href="/skills" className="hover:text-[#f5f4ed] transition-colors">智囊库</Link>
          <Link href="/brainstorm" className="hover:text-[#f5f4ed] transition-colors">💡 头脑风暴</Link>
          <Link href="/interrogate" className="hover:text-[#f5f4ed] transition-colors">🔍 质疑团</Link>
          <Link href="/create-skill" className="hover:text-[#f5f4ed] transition-colors">✨ 创建智囊</Link>
          <Link href="/history" className="hover:text-[#f5f4ed] transition-colors">📚 历史</Link>
          <Link href="/pricing" className="hover:text-[#f5f4ed] transition-colors">定价</Link>
        </div>

        {/* Auth — desktop */}
        <div className="hidden md:flex items-center gap-3">
          {isSignedIn ? (
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-8 h-8',
                  userButtonPopoverCard: 'bg-[#111] border border-white/10 text-white',
                },
              }}
            />
          ) : (
            <>
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm" className="text-[#b0aea5] hover:text-[#f5f4ed]">
                  登录
                </Button>
              </SignInButton>
              <Link href="/sign-up">
                <Button size="sm" className="bg-[#c96442] text-[#faf9f5] hover:bg-[#d97757]">
                  免费开始
                </Button>
              </Link>
            </>
          )}
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
        <div className="md:hidden border-t border-[#2a2a28] bg-[#141413] px-4 py-4 flex flex-col gap-4 text-sm">
          <Link href="/skills" className="text-[#b0aea5] hover:text-[#f5f4ed]">智囊库</Link>
          <Link href="/brainstorm" className="text-[#b0aea5] hover:text-[#f5f4ed]">💡 头脑风暴</Link>
          <Link href="/interrogate" className="text-[#b0aea5] hover:text-[#f5f4ed]">🔍 质疑团</Link>
          <Link href="/create-skill" className="text-[#b0aea5] hover:text-[#f5f4ed]">✨ 创建智囊</Link>
          <Link href="/history" className="text-[#b0aea5] hover:text-[#f5f4ed]">📚 历史</Link>
          <Link href="/pricing" className="text-[#b0aea5] hover:text-[#f5f4ed]">定价</Link>
          <div className="flex gap-3 pt-2">
            {isSignedIn ? (
              <UserButton />
            ) : (
              <>
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm" className="text-[#b0aea5] hover:text-[#f5f4ed]">登录</Button>
                </SignInButton>
                <Link href="/sign-up">
                  <Button size="sm" className="bg-[#c96442] text-[#faf9f5] hover:bg-[#d97757]">免费开始</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
