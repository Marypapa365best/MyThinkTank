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

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge
            variant="outline"
            className="mb-6 border-white/20 text-white/60 text-xs px-3 py-1"
          >
            严肃商业决策平台 · 拒绝娱乐化
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            你的口袋里
            <br />
            <span className="text-white/40">装着一整个</span>
            <br />
            智囊团
          </h1>
          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            巴菲特的投资框架、马斯克的第一性原理、芒格的多元思维——
            <br className="hidden md:block" />
            每一个智囊都基于数十年公开记录严格提炼，而非用户想象。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/skills">
              <Button size="lg" className="bg-white text-black hover:bg-white/90 px-8 h-12 text-base font-medium w-full">
                免费开始咨询
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="border-white/20 text-white/70 hover:text-white hover:border-white/40 px-8 h-12 text-base w-full">
                了解方法论
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 border-y border-white/10">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-white/40">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Skills */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">精选智囊</h2>
              <p className="text-white/40 text-sm">每一位都经过严格研究与质检</p>
            </div>
            <Link href="/skills" className="text-sm text-white/40 hover:text-white transition-colors">
              查看全部 →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURED_SKILLS.map((skill) => (
              <Link
                key={skill.id}
                href={`/skills/${skill.id}`}
                className="group p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{skill.emoji}</span>
                  <Badge
                    variant="outline"
                    className={`text-xs border-white/10 ${
                      skill.tier === 'free' ? 'text-green-400' :
                      skill.tier === 'pro' ? 'text-blue-400' : 'text-purple-400'
                    }`}
                  >
                    {skill.tier === 'free' ? '免费' : skill.tier === 'pro' ? 'Pro' : 'Elite'}
                  </Badge>
                </div>
                <h3 className="font-semibold mb-1 group-hover:text-white transition-colors">
                  {skill.name}
                </h3>
                <p className="text-xs text-white/40 mb-3 leading-relaxed">{skill.tagline}</p>
                <div className="flex items-center gap-3 text-xs text-white/30">
                  <span>📚 {skill.sourcesCount}+ 来源</span>
                  <span>·</span>
                  <span>截止 {skill.knowledgeCutoff}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">如何使用</h2>
          <p className="text-white/40 text-center text-sm mb-14">三步获得专业洞见，零技术门槛</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-5xl font-bold text-white/10 mb-4">{item.step}</div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VS Character.AI */}
      <section className="py-20 px-4 border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">我们不是 Character.AI</h2>
          <p className="text-white/50 text-base leading-relaxed mb-10">
            Character.AI 上的 Elon Musk 第一句话是
            <br />
            <span className="text-white/30 italic">&ldquo;You&apos;re wasting my time. I literally rule the world.&rdquo;</span>
            <br /><br />
            真实的 Musk 绝不会这样说。
            <br />
            我们的每一个智囊，都基于数十年公开记录严格研究提炼，
            <br />
            <strong className="text-white/80">不是用户想象，不是角色扮演，是真正的思维框架复现。</strong>
          </p>
          <Link href="/skills">
            <Button size="lg" className="bg-white text-black hover:bg-white/90 px-8 h-12 text-base">
              体验真正的智囊
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-10 px-4 border-t border-white/10 text-center text-sm text-white/30">
        <p>© 2026 我的智囊 · My Think Tank · All rights reserved</p>
        <p className="mt-1 text-xs text-white/20">
          所有智囊均基于公开资料研究提炼，不代表本人观点，不构成专业法律/投资/医疗建议。
        </p>
      </footer>
    </div>
  )
}
