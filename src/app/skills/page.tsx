'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SKILLS_REGISTRY } from '@/lib/skills-registry'
import { SkillCategory } from '@/types/skill'
import SkillAvatar from '@/components/SkillAvatar'

const CATEGORIES: { value: 'all' | SkillCategory; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'investment', label: '💰 投资决策' },
  { value: 'tech', label: '🚀 科技创业' },
  { value: 'philosophy', label: '🧠 思维哲学' },
  { value: 'education', label: '🎓 教育职业' },
  { value: 'expert', label: '⚖️ 专业顾问' },
  { value: 'cn-figure', label: '🌏 政商人物' },
]

// Rotate through surface levels for editorial depth
const SURFACES = ['#ffffff', '#f5f4ed', '#e9e8e1']

export default function SkillsPage() {
  const [activeCategory, setActiveCategory] = useState<'all' | SkillCategory>('all')

  const filtered = activeCategory === 'all'
    ? SKILLS_REGISTRY.filter(s => s.available)
    : SKILLS_REGISTRY.filter(s => s.category === activeCategory && s.available)

  return (
    <div className="min-h-screen">

      {/* ── Header — Surface ───────────────────────────────────────────────── */}
      <div className="bg-[#fbf9f2] pt-32 pb-12 px-8 border-b border-[#dcc1b8]/40">
        <div className="max-w-screen-xl mx-auto">
          <p className="label-overline text-[#9a4021] mb-4">智囊库</p>
          <h1 className="text-5xl text-[#1b1c18] mb-3">
            遇见真正的<em style={{ fontStyle: 'italic' }}>思维大师</em>
          </h1>
          <p className="text-[#56423c] text-lg max-w-lg">
            每一位智囊均基于数十个一手资料严格提炼，通过三重验证。
          </p>
        </div>
      </div>

      {/* ── Grid — Surface Container ───────────────────────────────────────── */}
      <div className="bg-[#efeee7] min-h-screen">
        <div className="max-w-screen-xl mx-auto px-8 py-12">

          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-10">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                  activeCategory === cat.value
                    ? 'bg-[#30312c] text-[#f2f1ea] border-[#30312c]'
                    : 'border-[#dcc1b8] text-[#56423c] bg-[#fbf9f2] hover:border-[#9a4021] hover:text-[#9a4021]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Skills grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((skill, i) => {
              const surface = SURFACES[i % SURFACES.length]
              return (
                <Link
                  key={skill.id}
                  href={`/skills/${skill.id}`}
                  className="group flex flex-col p-7 rounded-lg transition-all duration-300 hover:-translate-y-0.5 [box-shadow:0px_0px_0px_1px_rgba(220,193,184,0.5)] hover:[box-shadow:0px_0px_0px_1px_rgba(154,64,33,0.3),_0px_4px_20px_rgba(27,28,24,0.06)]"
                  style={{ backgroundColor: surface }}
                >
                  {/* Top */}
                  <div className="flex items-start justify-between mb-5">
                    <SkillAvatar name={skill.name} emoji={skill.emoji} avatar={skill.avatar} size={52} />
                    <span className={`label-overline text-[10px] mt-1 ${
                      skill.tier === 'free' ? 'text-emerald-700' :
                      skill.tier === 'pro' ? 'text-[#9a4021]' : 'text-amber-700'
                    }`}>
                      {skill.tier === 'free' ? 'Free' : skill.tier === 'pro' ? 'Pro' : 'Elite'}
                    </span>
                  </div>

                  <h3 className="text-lg text-[#1b1c18] mb-0.5 group-hover:text-[#9a4021] transition-colors">
                    {skill.name}
                  </h3>
                  <p className="text-xs text-[#89726b] mb-3">{skill.nameEn}</p>
                  <p className="text-sm text-[#56423c] leading-relaxed flex-1 mb-5">
                    {skill.tagline}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {skill.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs px-2.5 py-0.5 rounded-full bg-[#efeee7] text-[#89726b]">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between text-xs text-[#89726b] pt-4 border-t border-[#dcc1b8]/50">
                    <span>📚 {skill.sourcesCount}+ 来源</span>
                    <span>截止 {skill.knowledgeCutoff}</span>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Coming Soon */}
          <div className="mt-8 p-8 rounded-lg border border-dashed border-[#dcc1b8] text-center bg-[#fbf9f2]/60">
            <p className="text-[#89726b] text-sm">
              🔜 更多智囊陆续上线 · 专业律师、医生、会计师即将加入
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
