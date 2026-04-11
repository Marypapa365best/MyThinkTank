import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#141413] border-t border-[#30302e] mt-0 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="text-center sm:text-left">
            <p className="font-serif text-sm font-medium text-[#b0aea5]">
              我的智囊
            </p>
            <p className="text-xs text-[#5e5d59] mt-0.5">思维框架模拟工具，非任何人物授权</p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[#5e5d59]">
            <Link href="/terms" className="hover:text-[#b0aea5] transition-colors">
              服务条款
            </Link>
            <Link href="/pricing" className="hover:text-[#b0aea5] transition-colors">
              定价
            </Link>
            <Link href="/history" className="hover:text-[#b0aea5] transition-colors">
              历史记录
            </Link>
            <a
              href="mailto:legal@mythinkank.ai"
              className="hover:text-[#b0aea5] transition-colors"
            >
              内容投诉
            </a>
            <a
              href="mailto:hello@mythinkank.ai"
              className="hover:text-[#b0aea5] transition-colors"
            >
              联系我们
            </a>
          </div>
        </div>

        {/* Legal note */}
        <p className="text-center text-xs text-[#3d3d3a] mt-6 leading-relaxed max-w-2xl mx-auto">
          本平台所有智囊均基于公开资料推断，模拟思维框架，并非任何人物本人授权、认可或关联。
          内容仅供参考，不构成投资、法律或医疗建议。
          © {new Date().getFullYear()} 我的智囊
        </p>
      </div>
    </footer>
  )
}
