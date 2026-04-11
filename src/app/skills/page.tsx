'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { SKILLS_REGISTRY } from '@/lib/skills-registry'
import { SkillCategory } from '@/types/skill'

const CATEGORIES: { value: 'all' | SkillCategory; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'investment', label: '💰 投资决策' },
  { value: 'tech', label: '🚀 科技创业' },
  { value: 'philosophy', label: '🧠 思维哲学' },
  { value: 'education', label: '🎓 教育职业' },
  { value: 'expert', label: '⚖️ 专业顾问' },
  { value: 'cn-figure', label: '🌏 政商人物' },
]

export default function SkillsPage() {
  const [activeCategory, setActiveCategory] = useState<'all' | SkillCategory>('all')

  const filtered = activeCategory === 'all'
    ? SKILLS_REGISTRY.filter(s => s.available)
    : SKILLS_REGISTRY.filter(s => s.category === activeCategory && s.available)

  return (
    <div className="min-h-screen bg-[#f5f4ed]">

      {/* ── Page Header — Parchment ─────────────────────────────────────────── */}
      <div className="bg-[#f5f4ed] pt-28 pb-10 px-4 border-b border-[#f0eee6]">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl text-[#141413] mb-2">智囊库</h1>
          <p className="text-[#5e5d59] text-base">
            每一位智囊均基于数十个一手资料严格提炼，通过三重验证。
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-4 py-1.5 rounded-full text-sm transition-all border font-medium ${
                activeCategory === cat.value
                  ? 'bg-[#141413] text-[#f5f4ed] border-[#141413]'
                  : 'border-[#e8e6dc] text-[#5e5d59] bg-[#faf9f5] hover:border-[#c96442] hover:text-[#c96442]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((skill) => (
            <Link
              key={skill.id}
              href={`/skills/${skill.id}`}
              className="group flex flex-col p-6 rounded-xl border border-[#f0eee6] bg-[#faf9f5] hover:border-[#e8e6dc] hover:[box-shadow:rgba(0,0,0,0.06)_0px_4px_24px] transition-all"
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{skill.emoji}</span>
                <Badge
                  variant="outline"
                  className={
                    skill.tier === 'free'
                      ? 'text-emerald-600 border-emerald-200 bg-emerald-50'
                      : skill.tier === 'pro'
                      ? 'text-[#c96442] border-[#e8c4b8] bg-[#fdf6f3]'
                      : 'text-amber-600 border-amber-200 bg-amber-50'
                  }
                >
                  {skill.tier === 'free' ? '免费' : skill.tier === 'pro' ? 'Pro' : 'Elite'}
                </Badge>
              </div>

              {/* Name & tagline — h3 auto-Lora */}
              <h3 className="text-lg text-[#141413] mb-0.5 group-hover:text-[#c96442] transition-colors">
                {skill.name}
              </h3>
              <p className="text-xs text-[#87867f] mb-1">{skill.nameEn}</p>
              <p className="text-sm text-[#5e5d59] mb-4 leading-relaxed flex-1">
                {skill.tagline}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {skill.tags.slice(0, 3).map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-0.5 rounded-full bg-[#f0eee6] text-[#87867f]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-[#b0aea5] pt-3 border-t border-[#f0eee6]">
                <span>📚 {skill.sourcesCount}+ 来源</span>
                <span>截止 {skill.knowledgeCutoff}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Coming Soon */}
        <div className="mt-8 p-6 rounded-xl border border-dashed border-[#e8e6dc] text-center bg-[#faf9f5]">
          <p className="text-[#87867f] text-sm">
            🔜 更多智囊陆续上线 · 专业律师、医生、会计师即将加入
          </p>
        </div>

      </div>
    </div>
  )
}
