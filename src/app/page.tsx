import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SKILLS_REGISTRY } from '@/lib/skills-registry'
import SkillAvatar from '@/components/SkillAvatar'

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

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* ── SECTION 1: Hero — LIGHT (Parchment) ─────────────────────────────── */}
      <section className="bg-[#f5f4ed] pt-32 pb-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge
            variant="outline"
            className="mb-8 px-3 py-1 rounded-full"
          >
            严肃商业决策平台 · 拒绝娱乐化
          </Badge>

          {/* h1 → automatically Lora 500 from globals.css */}
          <h1 className="text-5xl md:text-7xl text-[#141413] tracking-tight mb-6">
            你的口袋里
            <br />
            <span className="text-[#87867f]">装着一整个</span>
            <br />
            智囊团
          </h1>

          <p className="text-lg md:text-xl text-[#5e5d59] max-w-2xl mx-auto mb-10">
            巴菲特的投资框架、马斯克的第一性原理、芒格的多元思维——
            <br className="hidden md:block" />
            每一个智囊都基于数十年公开记录严格提炼，而非用户想象。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/skills">
              <Button size="xl" className="w-full sm:w-auto">
                免费开始咨询
              </Button>
            </Link>
            <Link href="/about">
              <Button size="xl" variant="secondary" className="w-full sm:w-auto">
                了解方法论
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: Stats — DARK (Near Black) ─────────────────────────────── */}
      <section className="bg-[#141413] py-14 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((stat) => (
            <div key={stat.label}>
              {/* font-serif class → Lora via @theme --font-serif */}
              <div className="font-serif text-3xl text-[#faf9f5] mb-1 font-medium">
                {stat.value}
              </div>
              <div className="text-sm text-[#87867f]">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 3: Featured Skills — WARM SAND base / Ivory cards ─────── */}
      <section className="bg-[#e8e6dc] py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl text-[#141413] mb-2">精选智囊</h2>
              <p className="text-sm text-[#87867f]">每一位都经过严格研究与质检</p>
            </div>
            <Link
              href="/skills"
              className="text-sm text-[#5e5d59] hover:text-[#c96442] transition-colors"
            >
              查看全部 →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURED_SKILLS.map((skill) => (
              <Link
                key={skill.id}
                href={`/skills/${skill.id}`}
                className="group p-6 rounded-xl border border-[#e8e6dc] bg-[#faf9f5] hover:border-[#d1cfc5] hover:[box-shadow:rgba(0,0,0,0.08)_0px_4px_24px] transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <SkillAvatar
                    name={skill.name}
                    emoji={skill.emoji}
                    avatar={skill.avatar}
                    size={48}
                  />
                  <Badge
                    variant="outline"
                    className={
                      skill.tier === 'free' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' :
                      skill.tier === 'pro' ? 'text-[#c96442] border-[#e8c4b8] bg-[#fdf6f3]' :
                      'text-amber-600 border-amber-200 bg-amber-50'
                    }
                  >
                    {skill.tier === 'free' ? '免费' : skill.tier === 'pro' ? 'Pro' : 'Elite'}
                  </Badge>
                </div>
                {/* h3 → Lora auto */}
                <h3 className="text-base text-[#141413] mb-1 group-hover:text-[#c96442] transition-colors">
                  {skill.name}
                </h3>
                <p className="text-xs text-[#87867f] mb-3 leading-relaxed">{skill.tagline}</p>
                <div className="flex items-center gap-3 text-xs text-[#b0aea5] pt-3 border-t border-[#f0eee6]">
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
          <h2 className="text-3xl text-[#faf9f5] text-center mb-3">
            如何使用
          </h2>
          <p className="text-[#87867f] text-center text-sm mb-14">
            三步获得专业洞见，零技术门槛
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="text-center">
                <div className="font-serif text-6xl text-[#2a2a28] mb-5 font-medium leading-none">
                  {item.step}
                </div>
                <h3 className="text-base text-[#faf9f5] mb-2">{item.title}</h3>
                <p className="text-sm text-[#87867f]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: VS Character.AI — LIGHT (Parchment) ──────────────────── */}
      <section className="bg-[#f5f4ed] py-20 px-4 border-t border-[#f0eee6]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl text-[#141413] mb-6">
            我们不是 Character.AI
          </h2>
          <p className="text-[#5e5d59] text-base mb-10">
            Character.AI 上的 Elon Musk 第一句话是
            <br />
            <span className="text-[#87867f] italic">
              &ldquo;You&apos;re wasting my time. I literally rule the world.&rdquo;
            </span>
            <br /><br />
            真实的 Musk 绝不会这样说。
            <br />
            我们的每一个智囊，都基于数十年公开记录严格研究提炼，
            <br />
            <strong className="text-[#141413] font-medium">
              不是用户想象，不是角色扮演，是真正的思维框架复现。
            </strong>
          </p>
          <Link href="/skills">
            <Button size="xl">体验真正的智囊</Button>
          </Link>
        </div>
      </section>

    </div>
  )
}
