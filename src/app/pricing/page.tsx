import Link from 'next/link'

const serifStyle = { fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 500 }

const PLANS = [
  {
    name: '免费',
    price: '¥0',
    period: '永久',
    description: '体验核心功能，感受智囊力量',
    highlight: false,
    cta: '免费开始',
    ctaHref: '/sign-up',
    features: [
      { text: '单人对话（5次/天）', included: true },
      { text: '头脑风暴（2次/天）', included: true },
      { text: '质疑团（2次/天）', included: true },
      { text: '创建自定义智囊（1个）', included: true },
      { text: '对话历史（最近 7 天）', included: true },
      { text: '内置智囊库（全部10位）', included: true },
      { text: 'URL 网页抓取', included: false },
      { text: '历史记录导出', included: false },
      { text: '优先响应速度', included: false },
    ],
  },
  {
    name: '专业版',
    price: '¥39',
    period: '/月',
    description: '高频使用者的最佳选择',
    highlight: true,
    badge: '最受欢迎',
    cta: '开始 7 天试用',
    ctaHref: '/sign-up?plan=pro',
    features: [
      { text: '单人对话（无限次）', included: true },
      { text: '头脑风暴（无限次）', included: true },
      { text: '质疑团（无限次）', included: true },
      { text: '创建自定义智囊（20个）', included: true },
      { text: '对话历史（永久保存）', included: true },
      { text: '内置智囊库（全部10位）', included: true },
      { text: 'URL 网页抓取', included: true },
      { text: '历史记录导出（PDF / Markdown）', included: true },
      { text: '优先响应速度', included: false },
    ],
  },
  {
    name: '团队版',
    price: '¥199',
    period: '/月',
    description: '5 人以内团队，共享决策智慧',
    highlight: false,
    cta: '联系我们',
    ctaHref: 'mailto:hello@mythinkank.ai',
    features: [
      { text: '全部专业版功能', included: true },
      { text: '团队成员（最多 5 人）', included: true },
      { text: '共享智囊库', included: true },
      { text: '创建自定义智囊（无限）', included: true },
      { text: '优先响应速度', included: true },
      { text: '专属客户支持', included: true },
      { text: '定制智囊框架服务', included: true },
      { text: '团队使用统计看板', included: true },
      { text: '发票与合同', included: true },
    ],
  },
]

const FAQ = [
  {
    q: '7 天试用结束后会自动扣费吗？',
    a: '不会。试用期结束后你的账号自动回到免费版，不会扣费。如需继续使用专业版功能，再手动订阅即可。',
  },
  {
    q: '自定义智囊的数据存在哪里？',
    a: '存储在你的账号数据库中，云端永久保存。登录即可跨设备访问。',
  },
  {
    q: '智囊的回答是真实人物的观点吗？',
    a: '不是。所有内容均基于该人物公开发表的著作、演讲、访谈等资料推断而来，代表其思维框架，并非本人直接发言或认可。',
  },
  {
    q: '支持哪些支付方式？',
    a: '支持微信支付、支付宝、银行卡。团队版支持对公转账并可开具发票。',
  },
  {
    q: '可以随时取消订阅吗？',
    a: '可以。在账户设置中随时取消，当前订阅周期内仍可使用全部功能，不会额外收费。',
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen">

      {/* ── Header — LIGHT ─────────────────────────────────────────────────── */}
      <div className="bg-[#fbf9f2] pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs text-[#9a4021] mb-4 tracking-wider uppercase font-medium">定价方案</p>
          <h1
            className="text-5xl text-[#1b1c18] mb-4"
            style={serifStyle}
          >
            为各种需求设计的简单定价
          </h1>
          <p className="text-[#56423c] text-base max-w-lg mx-auto leading-relaxed">
            从免费版开始探索智囊力量，随时升级获得更多功能。无隐藏费用，随时取消。
          </p>
        </div>
      </div>

      {/* ── Plans — LIGHT ───────────────────────────────────────────────────── */}
      <div className="bg-[#fbf9f2] py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 flex flex-col transition-all duration-300 ${
                  plan.highlight
                    ? 'bg-white border border-[#dcc1b8] text-[#1b1c18] shadow-lg hover:shadow-xl hover:-translate-y-1'
                    : 'bg-[#efeee7] border border-[#dcc1b8]/40 text-[#1b1c18] hover:border-[#dcc1b8] hover:shadow-md'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#9a4021] text-white text-xs font-medium px-4 py-1.5 rounded-full shadow-sm">
                      ⭐ {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan name & price */}
                <div className="mb-5">
                  <div className={`text-xs font-medium mb-3 tracking-wide uppercase ${
                    plan.highlight ? 'text-[#89726b]' : 'text-[#56423c]'
                  }`}>
                    {plan.name}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span
                      className="text-4xl"
                      style={serifStyle}
                    >
                      {plan.price}
                    </span>
                    <span className={`text-sm ${plan.highlight ? 'text-[#89726b]' : 'text-[#56423c]'}`}>
                      {plan.period}
                    </span>
                  </div>
                  <p className={`text-sm mt-2 leading-relaxed ${
                    plan.highlight ? 'text-[#56423c]' : 'text-[#89726b]'
                  }`}>
                    {plan.description}
                  </p>
                </div>

                {/* CTA */}
                <Link
                  href={plan.ctaHref}
                  className={`block text-center py-3 rounded-xl text-sm font-medium transition-all mb-6 ${
                    plan.highlight
                      ? 'bg-[#9a4021] text-white hover:bg-[#9a4021]/90 shadow-sm'
                      : 'border border-[#dcc1b8] text-[#56423c] hover:text-[#9a4021] hover:border-[#9a4021] hover:bg-[#fbf9f2]'
                  }`}
                >
                  {plan.cta}
                </Link>

                {/* Features */}
                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f.text} className="flex items-start gap-2.5 text-sm">
                      <span className={`mt-0.5 flex-none text-base leading-none ${
                        f.included
                          ? plan.highlight ? 'text-[#9a4021]' : 'text-[#9a4021]'
                          : plan.highlight ? 'text-[#dcc1b8]' : 'text-[#89726b]'
                      }`}>
                        {f.included ? '✓' : '–'}
                      </span>
                      <span className={
                        f.included
                          ? plan.highlight ? 'text-[#1b1c18]' : 'text-[#89726b]'
                          : plan.highlight ? 'text-[#dcc1b8]' : 'text-[#89726b]'
                      }>
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="text-center text-[#56423c] text-xs">
            所有价格含税 · 年付享 8 折优惠 · 汇率变动时价格可能调整
          </p>
        </div>
      </div>

      {/* ── FAQ — LIGHT ────────────────────────────────────────────────────── */}
      <div className="bg-[#fbf9f2] py-24 px-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs text-[#9a4021] mb-4 tracking-wider uppercase font-medium text-center">FAQ</p>
          <h2
            className="text-3xl text-[#1b1c18] mb-14 text-center"
            style={serifStyle}
          >
            常见问题
          </h2>
          <div className="space-y-8">
            {FAQ.map((item) => (
              <div key={item.q} className="border-b border-[#dcc1b8]/30 pb-8">
                <h3
                  className="text-base font-semibold text-[#1b1c18] mb-3"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  {item.q}
                </h3>
                <p className="text-sm text-[#56423c] leading-relaxed text-opacity-80">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <p className="text-[#89726b] text-sm mb-5">还有其他疑问？</p>
          <a
            href="mailto:hello@mythinkank.ai"
            className="text-[#9a4021] hover:text-[#9a4021]/80 text-sm font-medium underline underline-offset-4 transition-colors"
          >
            📧 发邮件给我们
          </a>
        </div>
      </div>

    </div>
  )
}
