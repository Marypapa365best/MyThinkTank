import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 flex items-center justify-center px-4">
      <SignUp
        appearance={{
          elements: {
            card: 'bg-[#111] border border-white/10 shadow-none',
            headerTitle: 'text-white',
            headerSubtitle: 'text-[#56423c]',
            socialButtonsBlockButton: 'border-white/10 text-[#1b1c18] hover:bg-white/5',
            dividerLine: 'bg-white/10',
            dividerText: 'text-[#89726b]',
            formFieldLabel: 'text-[#56423c]',
            formFieldInput: 'bg-white/5 border-white/10 text-white',
            formButtonPrimary: 'bg-white text-black hover:bg-white/90',
            footerActionLink: 'text-[#56423c] hover:text-white',
          },
        }}
      />
    </div>
  )
}
