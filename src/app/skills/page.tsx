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
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-3">智囊库</h1>
          <p className="text-white/40">
            每一位智囊均基于数十个一手资料严格提炼，通过三重验证。
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-sm transition-all border ${
                activeCategory === cat.value
                  ? 'bg-white text-black border-white'
                  : 'border-white/20 text-white/50 hover:text-white hover:border-white/40'
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
              className="group p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all flex flex-col"
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{skill.emoji}</span>
                <div className="flex flex-col items-end gap-1">
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
              </div>

              {/* Name & tagline */}
              <h3 className="font-semibold text-lg mb-1 group-hover:text-white transition-colors">
                {skill.name}
              </h3>
              <p className="text-xs text-white/50 mb-1">{skill.nameEn}</p>
              <p className="text-sm text-white/40 mb-4 leading-relaxed flex-1">
                {skill.tagline}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {skill.tags.slice(0, 3).map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-white/25 pt-3 border-t border-white/10">
                <span>📚 {skill.sourcesCount}+ 来源</span>
                <span>截止 {skill.knowledgeCutoff}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Coming Soon placeholder */}
        <div className="mt-8 p-6 rounded-xl border border-dashed border-white/10 text-center">
          <p className="text-white/30 text-sm">
            🔜 更多智囊陆续上线 · 专业律师、医生、会计师即将加入
          </p>
        </div>
      </div>
    </div>
  )
}
