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
      <div className="bg-[#f5f4ed] pt-28 pb-16 px-4 border-b border-[#f0eee6]">
        <div className="max-w-5xl mx-auto text-center">
          <h1
            className="text-4xl text-[#141413] mb-3"
            style={serifStyle}
          >
            简单透明的定价
          </h1>
          <p className="text-[#5e5d59] text-base max-w-md mx-auto leading-relaxed">
            从免费版开始，随时升级。不绑定，不套路。
          </p>
        </div>
      </div>

      {/* ── Plans — DARK ───────────────────────────────────────────────────── */}
      <div className="bg-[#141413] py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-5 mb-6">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-6 flex flex-col ${
                  plan.highlight
                    ? 'bg-[#faf9f5] text-[#141413]'
                    : 'bg-[#1e1e1c] border border-[#30302e] text-[#f5f4ed]'
                }`}
                style={plan.highlight ? { boxShadow: 'rgba(0,0,0,0.12) 0px 8px 32px' } : {}}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#c96442] text-[#faf9f5] text-xs font-medium px-3 py-1 rounded-full">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan name & price */}
                <div className="mb-5">
                  <div className={`text-xs font-medium mb-3 tracking-wide uppercase ${
                    plan.highlight ? 'text-[#87867f]' : 'text-[#5e5d59]'
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
                    <span className={`text-sm ${plan.highlight ? 'text-[#87867f]' : 'text-[#5e5d59]'}`}>
                      {plan.period}
                    </span>
                  </div>
                  <p className={`text-sm mt-2 leading-relaxed ${
                    plan.highlight ? 'text-[#5e5d59]' : 'text-[#87867f]'
                  }`}>
                    {plan.description}
                  </p>
                </div>

                {/* CTA */}
                <Link
                  href={plan.ctaHref}
                  className={`block text-center py-2.5 rounded-xl text-sm font-medium transition-all mb-6 ${
                    plan.highlight
                      ? 'bg-[#c96442] text-[#faf9f5] hover:bg-[#d97757]'
                      : 'bg-[#30302e] text-[#b0aea5] hover:bg-[#3a3a38] border border-[#3a3a38]'
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
                          ? plan.highlight ? 'text-[#c96442]' : 'text-[#c96442]'
                          : plan.highlight ? 'text-[#d1cfc5]' : 'text-[#3a3a38]'
                      }`}>
                        {f.included ? '✓' : '–'}
                      </span>
                      <span className={
                        f.included
                          ? plan.highlight ? 'text-[#141413]' : 'text-[#b0aea5]'
                          : plan.highlight ? 'text-[#c2c0b6]' : 'text-[#3a3a38]'
                      }>
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="text-center text-[#5e5d59] text-xs">
            所有价格含税 · 年付享 8 折优惠 · 汇率变动时价格可能调整
          </p>
        </div>
      </div>

      {/* ── FAQ — LIGHT ────────────────────────────────────────────────────── */}
      <div className="bg-[#f5f4ed] py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <h2
            className="text-2xl text-[#141413] mb-10 text-center"
            style={serifStyle}
          >
            常见问题
          </h2>
          <div className="space-y-6">
            {FAQ.map((item) => (
              <div key={item.q} className="border-b border-[#f0eee6] pb-6">
                <h3
                  className="text-sm font-medium text-[#141413] mb-2"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  {item.q}
                </h3>
                <p className="text-sm text-[#5e5d59] leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-[#87867f] text-sm mb-4">还有疑问？</p>
          <a
            href="mailto:hello@mythinkank.ai"
            className="text-[#c96442] hover:text-[#d97757] text-sm underline underline-offset-4 transition-colors"
          >
            发邮件给我们
          </a>
        </div>
      </div>

    </div>
  )
}
