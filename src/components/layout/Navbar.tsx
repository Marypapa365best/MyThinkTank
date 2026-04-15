'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { UserButton, SignInButton, useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { isSignedIn } = useUser()
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    // Ring shadow nav — no hard border, just a whisper ring
    <nav className="fixed top-0 w-full z-50 bg-[#fbf9f2]/85 backdrop-blur-md [box-shadow:0px_0px_0px_1px_rgba(27,28,24,0.06)]">
      <div className="max-w-screen-xl mx-auto px-8 h-16 flex items-center justify-between">

        {/* Logo — Newsreader serif */}
        <Link href="/" className="flex items-center gap-2.5">
          <span className="font-serif text-xl font-medium tracking-tight text-[#1b1c18]">
            我的智囊
          </span>
          <span className="hidden sm:inline text-xs text-[#89726b] font-normal mt-0.5 font-sans">
            · My Think Tank
          </span>
        </Link>

        {/* Desktop Nav — Inter, headline weight */}
        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-[#56423c]">
          <Link href="/skills" className={`relative pb-1 hover:text-[#9a4021] transition-colors duration-200 ${isActive('/skills') ? 'text-[#9a4021]' : ''}`}>
            智囊库
            {isActive('/skills') && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#9a4021]"></div>}
          </Link>
          <Link href="/brainstorm" className={`relative pb-1 hover:text-[#9a4021] transition-colors duration-200 ${isActive('/brainstorm') ? 'text-[#9a4021]' : ''}`}>
            <span aria-hidden="true">💡</span> 头脑风暴
            {isActive('/brainstorm') && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#9a4021]"></div>}
          </Link>
          <Link href="/interrogate" className={`relative pb-1 hover:text-[#9a4021] transition-colors duration-200 ${isActive('/interrogate') ? 'text-[#9a4021]' : ''}`}>
            <span aria-hidden="true">🔍</span> 质疑团
            {isActive('/interrogate') && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#9a4021]"></div>}
          </Link>
          <Link href="/create-skill" className={`relative pb-1 hover:text-[#9a4021] transition-colors duration-200 ${isActive('/create-skill') ? 'text-[#9a4021]' : ''}`}>
            <span aria-hidden="true">✨</span> 创建智囊
            {isActive('/create-skill') && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#9a4021]"></div>}
          </Link>
          <Link href="/history" className={`relative pb-1 hover:text-[#9a4021] transition-colors duration-200 ${isActive('/history') ? 'text-[#9a4021]' : ''}`}>
            <span aria-hidden="true">📚</span> 历史
            {isActive('/history') && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#9a4021]"></div>}
          </Link>
          <Link href="/pricing" className={`relative pb-1 hover:text-[#9a4021] transition-colors duration-200 ${isActive('/pricing') ? 'text-[#9a4021]' : ''}`}>
            定价
            {isActive('/pricing') && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#9a4021]"></div>}
          </Link>
        </div>

        {/* Auth */}
        <div className="hidden md:flex items-center gap-3">
          {isSignedIn ? (
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-8 h-8',
                  userButtonPopoverCard: 'bg-[#ffffff] border border-[#dcc1b8] text-[#1b1c18]',
                },
              }}
            />
          ) : (
            <>
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm" className="text-[#56423c]">
                  登录
                </Button>
              </SignInButton>
              <Link href="/sign-up">
                <Button size="sm" className="px-5 text-white">
                  免费开始
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-[#56423c] hover:text-[#1b1c18] p-2 -mr-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? '关闭导航菜单' : '打开导航菜单'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-[#dcc1b8] bg-[#fbf9f2] px-6 py-5 flex flex-col gap-4 text-sm font-medium text-[#56423c]">
          <Link href="/skills" className={`flex items-center gap-2 hover:text-[#9a4021] transition-colors ${isActive('/skills') ? 'text-[#9a4021]' : ''}`}>
            <span className={`inline-block w-1 h-1 rounded-full transition-colors ${isActive('/skills') ? 'bg-[#9a4021]' : 'bg-transparent'}`}></span>
            智囊库
          </Link>
          <Link href="/brainstorm" className={`flex items-center gap-2 hover:text-[#9a4021] transition-colors ${isActive('/brainstorm') ? 'text-[#9a4021]' : ''}`}>
            <span className={`inline-block w-1 h-1 rounded-full transition-colors ${isActive('/brainstorm') ? 'bg-[#9a4021]' : 'bg-transparent'}`}></span>
            <span aria-hidden="true">💡</span> 头脑风暴
          </Link>
          <Link href="/interrogate" className={`flex items-center gap-2 hover:text-[#9a4021] transition-colors ${isActive('/interrogate') ? 'text-[#9a4021]' : ''}`}>
            <span className={`inline-block w-1 h-1 rounded-full transition-colors ${isActive('/interrogate') ? 'bg-[#9a4021]' : 'bg-transparent'}`}></span>
            <span aria-hidden="true">🔍</span> 质疑团
          </Link>
          <Link href="/create-skill" className={`flex items-center gap-2 hover:text-[#9a4021] transition-colors ${isActive('/create-skill') ? 'text-[#9a4021]' : ''}`}>
            <span className={`inline-block w-1 h-1 rounded-full transition-colors ${isActive('/create-skill') ? 'bg-[#9a4021]' : 'bg-transparent'}`}></span>
            <span aria-hidden="true">✨</span> 创建智囊
          </Link>
          <Link href="/history" className={`flex items-center gap-2 hover:text-[#9a4021] transition-colors ${isActive('/history') ? 'text-[#9a4021]' : ''}`}>
            <span className={`inline-block w-1 h-1 rounded-full transition-colors ${isActive('/history') ? 'bg-[#9a4021]' : 'bg-transparent'}`}></span>
            <span aria-hidden="true">📚</span> 历史
          </Link>
          <Link href="/pricing" className={`flex items-center gap-2 hover:text-[#9a4021] transition-colors ${isActive('/pricing') ? 'text-[#9a4021]' : ''}`}>
            <span className={`inline-block w-1 h-1 rounded-full transition-colors ${isActive('/pricing') ? 'bg-[#9a4021]' : 'bg-transparent'}`}></span>
            定价
          </Link>
          <div className="flex gap-3 pt-2 border-t border-[#dcc1b8]">
            {isSignedIn ? (
              <UserButton />
            ) : (
              <>
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm">登录</Button>
                </SignInButton>
                <Link href="/sign-up">
                  <Button size="sm">免费开始</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
