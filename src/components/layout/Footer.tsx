import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#30312c] border-t border-[#3d3e39] py-12 px-8">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">

          {/* Brand */}
          <div>
            <p className="font-serif text-base font-medium text-[#f2f1ea] mb-1">
              我的智囊
            </p>
            <p className="text-xs text-[#89726b]">思维框架模拟工具，非任何人物授权</p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-xs font-medium tracking-wide text-[#89726b]">
            <Link href="/terms" className="hover:text-[#dcc1b8] transition-colors">服务条款</Link>
            <Link href="/pricing" className="hover:text-[#dcc1b8] transition-colors">定价</Link>
            <Link href="/history" className="hover:text-[#dcc1b8] transition-colors">历史记录</Link>
            <a href="mailto:legal@mythinkank.ai" className="hover:text-[#dcc1b8] transition-colors">内容投诉</a>
            <a href="mailto:hello@mythinkank.ai" className="hover:text-[#dcc1b8] transition-colors">联系我们</a>
          </div>
        </div>

        {/* Legal */}
        <div className="mt-10 pt-6 border-t border-[#3d3e39]">
          <p className="text-xs text-[#3d3e39] leading-relaxed max-w-3xl">
            本平台所有智囊均基于公开资料推断，模拟思维框架，并非任何人物本人授权、认可或关联。
            内容仅供参考，不构成投资、法律或医疗建议。
            © {new Date().getFullYear()} 我的智囊 · My Think Tank
          </p>
        </div>
      </div>
    </footer>
  )
}
