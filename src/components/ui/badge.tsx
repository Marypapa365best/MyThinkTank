import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Anthropic/Claude design system badges — warm palette
const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2.5 py-0.5 text-xs font-medium tracking-[0.12px] whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-[#c96442]/50 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        // Terracotta — highest signal, brand moments only
        default:
          "bg-[#c96442] text-[#faf9f5]",

        // Warm Sand — secondary, neutral labels
        secondary:
          "bg-[#e8e6dc] text-[#4d4c48]",

        // Cream outline — most common, subtle label on light bg
        outline:
          "border border-[#e8e6dc] bg-[#faf9f5] text-[#5e5d59]",

        // Dark outline — for use on dark section backgrounds
        "outline-dark":
          "border border-[#30302e] bg-transparent text-[#87867f]",

        // Ivory — very subtle on parchment
        ghost:
          "bg-[#f0eee6] text-[#87867f]",

        // Destructive
        destructive:
          "bg-[#b53333]/10 text-[#b53333] border border-[#b53333]/20",

        link: "text-[#c96442] underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      { className: cn(badgeVariants({ variant }), className) },
      props
    ),
    render,
    state: { slot: "badge", variant },
  })
}

export { Badge, badgeVariants }
