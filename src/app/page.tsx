import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SKILLS_REGISTRY } from '@/lib/skills-registry'

const FEATURED_SKILLS = SKILLS_REGISTRY.slice(0, 6)

const STATS = [
  { value: '10+', label: '顶级智囊' },
  { value: '40+', label: '一手资料来源' },
  { value: '3层', label: '深度分级' },
  { value: '0门槛', label: '即开即用' },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: '选择智囊',
    desc: '从巴菲特到马斯克，从律师到医生，找到最适合你问题的思维框架',
  },
  {
    step: '02',
    title: '直接提问',
    desc: '像和真人对话一样，用自然语言描述你的问题或决策困境',
  },
  {
    step: '03',
    title: '获得洞见',
    desc: '基于40+一手资料提炼的思维框架，给出有深度、有态度的专业判断',
  },
]

const serifStyle = { fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 500 }

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* ── SECTION 1: Hero — LIGHT (Parchment) ─────────────────────────────── */}
      <section className="bg-[#f5f4ed] pt-32 pb-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge
            variant="outline"
            className="mb-8 border-[#e8e6dc] text-[#87867f] bg-[#faf9f5] text-xs px-3 py-1 rounded-full"
          >
            严肃商业决策平台 · 拒绝娱乐化
          </Badge>
          <h1
            className="text-5xl md:text-7xl tracking-tight mb-6 leading-[1.10] text-[#141413]"
            style={serifStyle}
          >
            你的口袋里
            <br />
            <span className="text-[#87867f]">装着一整个</span>
            <br />
            智囊团
          </h1>
          <p className="text-lg md:text-xl text-[#5e5d59] max-w-2xl mx-auto mb-10 leading-relaxed">
            巴菲特的投资框架、马斯克的第一性原理、芒格的多元思维——
            <br className="hidden md:block" />
            每一个智囊都基于数十年公开记录严格提炼，而非用户想象。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/skills">
              <Button
                size="lg"
                className="bg-[#c96442] text-[#faf9f5] hover:bg-[#d97757] px-8 h-12 text-base font-medium w-full rounded-xl"
                style={{ boxShadow: '0px 0px 0px 0px #c96442, 0px 0px 0px 1px #c96442' }}
              >
                免费开始咨询
              </Button>
            </Link>
            <Link href="/about">
              <Button
                size="lg"
                variant="outline"
                className="border-[#e8e6dc] bg-[#faf9f5] text-[#4d4c48] hover:bg-[#f0eee6] hover:border-[#d1cfc5] px-8 h-12 text-base w-full rounded-xl"
                style={{ boxShadow: '0px 0px 0px 0px #e8e6dc, 0px 0px 0px 1px #d1cfc5' }}
              >
                了解方法论
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: Stats — DARK (Near Black) ─────────────────────────────── */}
      <section className="bg-[#141413] py-14 px-4 border-y border-[#30302e]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <div
                className="text-3xl text-[#faf9f5] mb-1"
                style={serifStyle}
              >
                {stat.value}
              </div>
              <div className="text-sm text-[#87867f]">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 3: Featured Skills — LIGHT (Ivory) ───────────────────────── */}
      <section className="bg-[#f5f4ed] py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2
                className="text-3xl text-[#141413] mb-2"
                style={serifStyle}
              >
                精选智囊
              </h2>
              <p className="text-[#87867f] text-sm">每一位都经过严格研究与质检</p>
            </div>
            <Link href="/skills" className="text-sm text-[#87867f] hover:text-[#141413] transition-colors">
              查看全部 →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURED_SKILLS.map((skill) => (
              <Link
                key={skill.id}
                href={`/skills/${skill.id}`}
                className="group p-6 rounded-xl border border-[#f0eee6] bg-[#faf9f5] hover:border-[#e8e6dc] hover:shadow-[rgba(0,0,0,0.05)_0px_4px_24px] transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{skill.emoji}</span>
                  <Badge
                    variant="outline"
                    className={`text-xs border-[#f0eee6] bg-[#f5f4ed] ${
                      skill.tier === 'free' ? 'text-emerald-600' :
                      skill.tier === 'pro' ? 'text-[#c96442]' : 'text-amber-600'
                    }`}
                  >
                    {skill.tier === 'free' ? '免费' : skill.tier === 'pro' ? 'Pro' : 'Elite'}
                  </Badge>
                </div>
                <h3
                  className="text-base mb-1 text-[#141413] group-hover:text-[#c96442] transition-colors"
                  style={serifStyle}
                >
                  {skill.name}
                </h3>
                <p className="text-xs text-[#87867f] mb-3 leading-relaxed">{skill.tagline}</p>
                <div className="flex items-center gap-3 text-xs text-[#b0aea5]">
                  <span>📚 {skill.sourcesCount}+ 来源</span>
                  <span>·</span>
                  <span>截止 {skill.knowledgeCutoff}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: How it Works — DARK (Near Black) ──────────────────────── */}
      <section className="bg-[#141413] py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-3xl text-[#faf9f5] text-center mb-4"
            style={serifStyle}
          >
            如何使用
          </h2>
          <p className="text-[#87867f] text-center text-sm mb-14 leading-relaxed">
            三步获得专业洞见，零技术门槛
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="text-center">
                <div
                  className="text-5xl text-[#30302e] mb-4"
                  style={serifStyle}
                >
                  {item.step}
                </div>
                <h3
                  className="text-base text-[#faf9f5] mb-2"
                  style={serifStyle}
                >
                  {item.title}
                </h3>
                <p className="text-sm text-[#87867f] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: VS Character.AI — LIGHT (Parchment) ──────────────────── */}
      <section className="bg-[#f5f4ed] py-20 px-4 border-t border-[#f0eee6]">
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className="text-3xl text-[#141413] mb-6"
            style={serifStyle}
          >
            我们不是 Character.AI
          </h2>
          <p className="text-[#5e5d59] text-base leading-relaxed mb-10">
            Character.AI 上的 Elon Musk 第一句话是
            <br />
            <span className="text-[#87867f] italic">&ldquo;You&apos;re wasting my time. I literally rule the world.&rdquo;</span>
            <br /><br />
            真实的 Musk 绝不会这样说。
            <br />
            我们的每一个智囊，都基于数十年公开记录严格研究提炼，
            <br />
            <strong className="text-[#141413] font-medium">不是用户想象，不是角色扮演，是真正的思维框架复现。</strong>
          </p>
          <Link href="/skills">
            <Button
              size="lg"
              className="bg-[#c96442] text-[#faf9f5] hover:bg-[#d97757] px-8 h-12 text-base rounded-xl"
              style={{ boxShadow: '0px 0px 0px 0px #c96442, 0px 0px 0px 1px #c96442' }}
            >
              体验真正的智囊
            </Button>
          </Link>
        </div>
      </section>

    </div>
  )
}
