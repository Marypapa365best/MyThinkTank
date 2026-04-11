import { notFound } from 'next/navigation'
import { getSkillById } from '@/lib/skills-registry'
import ChatInterface from '@/components/ChatInterface'
import { Badge } from '@/components/ui/badge'

export default async function SkillChatPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const skill = getSkillById(id)
  if (!skill) notFound()

  return (
    <div className="flex flex-col h-screen pt-16">
      {/* Skill Header Bar */}
      <div className="flex-none border-b border-[#30302e] bg-[#141413] px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{skill.emoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-sans font-semibold text-sm text-[#f5f4ed]">{skill.name}</h1>
                <Badge
                  variant="outline-dark"
                  className={
                    skill.tier === 'free' ? 'text-emerald-400 border-emerald-800' :
                    skill.tier === 'pro' ? 'text-[#d97757] border-[#c96442]/40' :
                    'text-amber-400 border-amber-800'
                  }
                >
                  {skill.tier === 'free' ? '免费' : skill.tier === 'pro' ? 'Pro' : 'Elite'}
                </Badge>
              </div>
              <p className="text-xs text-[#87867f]">{skill.tagline}</p>
            </div>
          </div>
          <div className="text-xs text-[#5e5d59] text-right hidden sm:block">
            <div>📚 {skill.sourcesCount}+ 来源</div>
            <div>截止 {skill.knowledgeCutoff}</div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex-none bg-[#1e1e1c] border-b border-[#30302e] px-4 py-2">
        <p className="max-w-3xl mx-auto text-xs text-[#5e5d59] text-center">
          以下内容基于公开资料推断，代表思维框架而非本人观点，不构成投资/法律/医疗建议。
        </p>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface skillId={skill.id} skillName={skill.name} skillEmoji={skill.emoji} />
      </div>
    </div>
  )
}
