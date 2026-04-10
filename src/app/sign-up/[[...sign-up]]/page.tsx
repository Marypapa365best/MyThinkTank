import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 flex items-center justify-center px-4">
      <SignUp
        appearance={{
          elements: {
            card: 'bg-[#111] border border-white/10 shadow-none',
            headerTitle: 'text-white',
            headerSubtitle: 'text-white/50',
            socialButtonsBlockButton: 'border-white/10 text-white hover:bg-white/5',
            dividerLine: 'bg-white/10',
            dividerText: 'text-white/30',
            formFieldLabel: 'text-white/60',
            formFieldInput: 'bg-white/5 border-white/10 text-white',
            formButtonPrimary: 'bg-white text-black hover:bg-white/90',
            footerActionLink: 'text-white/60 hover:text-white',
          },
        }}
      />
    </div>
  )
}
