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
      <div className="flex-none border-b border-white/10 bg-[#0a0a0a] px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{skill.emoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-sm">{skill.name}</h1>
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
              <p className="text-xs text-white/40">{skill.tagline}</p>
            </div>
          </div>
          <div className="text-xs text-white/25 text-right hidden sm:block">
            <div>📚 {skill.sourcesCount}+ 来源</div>
            <div>截止 {skill.knowledgeCutoff}</div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex-none bg-white/[0.02] border-b border-white/10 px-4 py-2">
        <p className="max-w-3xl mx-auto text-xs text-white/30 text-center">
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
