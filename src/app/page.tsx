import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SKILLS_REGISTRY } from '@/lib/skills-registry'
import SkillAvatar from '@/components/SkillAvatar'

const FEATURED_SKILLS = SKILLS_REGISTRY.slice(0, 6)

const STATS = [
  { value: '10+', label: '顶级智囊', sub: 'Think Tank Advisors' },
  { value: '40+', label: '一手资料', sub: 'Primary Sources' },
  { value: '3层', label: '深度分级', sub: 'Depth Tiers' },
  { value: '0门槛', label: '即开即用', sub: 'Zero Setup' },
]

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* ── SECTION 1: Hero — Surface (#fbf9f2) ──────────────────────────────── */}
      <section className="bg-[#fbf9f2] pt-36 pb-24 px-8">
        <div className="max-w-screen-xl mx-auto">

          {/* Overline label — editorial signature */}
          <p className="label-overline text-[#9a4021] mb-7">
            严肃商业决策平台 · 拒绝娱乐化
          </p>

          {/* Hero headline — large Newsreader with italic accent */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl text-[#1b1c18] tracking-tight mb-8 max-w-3xl">
            你的口袋里
            <br />
            装着一整个
            <br />
            <em className="serif-italic text-[#9a4021] not-italic" style={{ fontStyle: 'italic' }}>
              智囊团
            </em>
          </h1>

          <p className="text-xl text-[#56423c] max-w-xl mb-12 leading-relaxed">
            巴菲特的投资框架、马斯克的第一性原理——
            每一个智囊都基于数十年公开记录严格提炼，而非用户想象。
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href="/skills">
              <Button size="xl">免费开始咨询</Button>
            </Link>
            <Link href="/about">
              <Button size="xl" variant="outline">了解方法论</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: Stats — Dark (#30312c) ────────────────────────────────── */}
      <section className="bg-[#30312c] py-14 px-8">
        <div className="max-w-screen-xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="border-l border-[#3d3e39] pl-6 first:border-l-0 first:pl-0">
              <div className="font-serif text-4xl text-[#f2f1ea] font-medium mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-[#f2f1ea]/80 mb-0.5">{stat.label}</div>
              <div className="text-xs text-[#dcc1b8]/60 font-sans tracking-wide">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 3: Featured Skills — Editorial Bento ─────────────────────── */}
      <section className="bg-[#efeee7] py-20 px-8">
        <div className="max-w-screen-xl mx-auto">

          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="label-overline text-[#9a4021] mb-3">精选智囊</p>
              <h2 className="text-4xl text-[#1b1c18]">
                每一位都经过<em style={{ fontStyle: 'italic' }}>严格</em>研究
              </h2>
            </div>
            <Link href="/skills" className="text-sm font-medium text-[#56423c] hover:text-[#9a4021] transition-colors flex items-center gap-1">
              查看全部 →
            </Link>
          </div>

          {/* 3-column skill card grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURED_SKILLS.map((skill, i) => {
              // Alternate surface levels for visual rhythm
              const surface = i % 3 === 0 ? '#f5f4ed' : i % 3 === 1 ? '#ffffff' : '#e9e8e1'
              return (
                <Link
                  key={skill.id}
                  href={`/skills/${skill.id}`}
                  className="group flex flex-col p-7 rounded-lg transition-all duration-300 hover:-translate-y-0.5 [box-shadow:0px_0px_0px_1px_rgba(220,193,184,0.5)] hover:[box-shadow:0px_0px_0px_1px_rgba(154,64,33,0.3),_0px_4px_20px_rgba(27,28,24,0.06)]"
                  style={{ backgroundColor: surface }}
                >
                  <div className="flex items-start justify-between mb-5">
                    <span className={`label-overline text-[10px] mt-1 ${
                      skill.tier === 'free' ? 'text-emerald-700' :
                      skill.tier === 'pro' ? 'text-[#9a4021]' : 'text-amber-700'
                    }`}>
                      {skill.tier === 'free' ? 'Free' : skill.tier === 'pro' ? 'Pro' : 'Elite'}
                    </span>
                    <SkillAvatar
                      name={skill.name}
                      emoji={skill.emoji}
                      avatar={skill.avatar}
                      size={72}
                    />
                  </div>

                  <h3 className="text-lg text-[#1b1c18] mb-1 group-hover:text-[#9a4021] transition-colors">
                    {skill.name}
                  </h3>
                  <p className="text-xs text-[#89726b] mb-3">{skill.nameEn}</p>
                  <p className="text-sm text-[#56423c] leading-relaxed flex-1 mb-5">
                    {skill.tagline}
                  </p>

                  <div className="flex items-center justify-between text-xs text-[#89726b] pt-4 border-t border-[#dcc1b8]/50">
                    <span>📚 {skill.sourcesCount}+ 来源</span>
                    <span>截止 {skill.knowledgeCutoff}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: How it Works — Dark ───────────────────────────────────── */}
      <section className="bg-[#30312c] py-24 px-8">
        <div className="max-w-screen-xl mx-auto">
          <p className="label-overline text-[#dcc1b8] mb-4 text-center">使用方法</p>
          <h2 className="text-4xl text-[#f2f1ea] text-center mb-16">
            三步获得专业洞见
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: '01', title: '选择智囊', desc: '从巴菲特到马斯克，从律师到医生，找到最适合你问题的思维框架' },
              { step: '02', title: '直接提问', desc: '像和真人对话一样，用自然语言描述你的问题或决策困境' },
              { step: '03', title: '获得洞见', desc: '基于40+一手资料提炼的思维框架，给出有深度、有态度的专业判断' },
            ].map((item) => (
              <div key={item.step} className="border-l border-[#3d3e39] pl-8">
                <div className="font-serif text-5xl text-[#3d3e39] font-medium mb-5 leading-none">
                  {item.step}
                </div>
                <h3 className="text-xl text-[#f2f1ea] mb-3">{item.title}</h3>
                <p className="text-sm text-[#dcc1b8]/80 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: Manifesto — Surface-low ───────────────────────────────── */}
      <section className="bg-[#f5f4ed] py-24 px-8 border-t border-[#dcc1b8]/40">
        <div className="max-w-screen-xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="label-overline text-[#9a4021] mb-5">我们的立场</p>
            <h2 className="text-4xl text-[#1b1c18] mb-6">
              我们不是<br />
              <em style={{ fontStyle: 'italic' }}>Character.AI</em>
            </h2>
            <p className="text-[#56423c] leading-relaxed mb-8">
              Character.AI 上的 Elon Musk 第一句话是
              <span className="font-serif italic text-[#89726b]"> &ldquo;You&apos;re wasting my time. I literally rule the world.&rdquo;</span>
              <br /><br />
              真实的 Musk 绝不会这样说。我们的每一个智囊，都基于数十年公开记录严格研究提炼，
              <strong className="text-[#1b1c18] font-medium">不是角色扮演，是真正的思维框架复现。</strong>
            </p>
            <Link href="/skills">
              <Button size="lg">体验真正的智囊</Button>
            </Link>
          </div>

          {/* Pull quote */}
          <div className="border-l-2 border-[#9a4021] pl-10">
            <p className="font-serif text-3xl italic font-light text-[#1b1c18] leading-snug mb-6">
              &ldquo;精确是优雅的基础。每一个智囊框架，都应服务于决策，而非娱乐。&rdquo;
            </p>
            <cite className="label-overline text-[#89726b] not-italic">
              — 我的智囊 · 设计宣言
            </cite>
          </div>
        </div>
      </section>

    </div>
  )
}
