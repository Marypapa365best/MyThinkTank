import Image from 'next/image'

interface SkillAvatarProps {
  name: string
  emoji: string
  avatar?: string
  size?: number          // px, default 48
  className?: string
}

/**
 * Displays a skill's avatar:
 * - If `avatar` is set → real photo in a circle (Next.js <Image>)
 * - Otherwise → emoji in a warm-toned circle fallback
 */
export default function SkillAvatar({
  name,
  emoji,
  avatar,
  size = 48,
  className = '',
}: SkillAvatarProps) {
  const base = `rounded-full overflow-hidden flex-none ${className}`

  if (avatar) {
    return (
      <div
        className={`${base} [box-shadow:rgba(0,0,0,0.12)_0px_4px_12px]`}
        style={{ width: size, height: size }}
      >
        <Image
          src={avatar}
          alt={name}
          width={size * 3}
          height={size * 3}
          className="w-full h-full object-cover object-center"
        />
      </div>
    )
  }

  // Emoji fallback
  return (
    <div
      className={`${base} bg-[#e3dfd6] flex items-center justify-center flex-none`}
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      {emoji}
    </div>
  )
}
