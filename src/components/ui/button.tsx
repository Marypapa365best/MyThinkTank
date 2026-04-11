import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Anthropic/Claude design system buttons
// Signature: ring-based shadows, warm palette, generous radius
const buttonVariants = cva(
  // Base: shared across all variants
  "group/button inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all duration-150 outline-none select-none focus-visible:ring-2 focus-visible:ring-[#c96442]/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-2 aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // ── Terracotta: primary CTA — the only chromatic button
        default:
          "bg-[#c96442] text-[#faf9f5] hover:bg-[#d97757] [box-shadow:0px_0px_0px_0px_#c96442,0px_0px_0px_1px_#b85a3a] hover:[box-shadow:0px_0px_0px_0px_#d97757,0px_0px_0px_1px_#c96442]",

        // ── Warm Sand: secondary workhorse — warm, unassuming
        secondary:
          "bg-[#e8e6dc] text-[#4d4c48] hover:bg-[#dddbd0] [box-shadow:0px_0px_0px_0px_#e8e6dc,0px_0px_0px_1px_#d1cfc5] hover:[box-shadow:0px_0px_0px_0px_#dddbd0,0px_0px_0px_1px_#c2c0b6]",

        // ── Cream outline: border-only, elevated on hover
        outline:
          "border border-[#e8e6dc] bg-[#faf9f5] text-[#4d4c48] hover:bg-[#f0eee6] hover:border-[#d1cfc5] [box-shadow:0px_0px_0px_0px_#faf9f5,0px_0px_0px_1px_#e8e6dc] hover:[box-shadow:0px_0px_0px_0px_#f0eee6,0px_0px_0px_1px_#d1cfc5]",

        // ── Ghost: transparent, subtle warm hover
        ghost:
          "text-[#5e5d59] hover:bg-[#f0eee6] hover:text-[#141413]",

        // ── Dark Charcoal: inverted, for use on light sections needing dark button
        dark:
          "bg-[#141413] text-[#b0aea5] hover:bg-[#30302e] border border-[#30302e] [box-shadow:0px_0px_0px_0px_#141413,0px_0px_0px_1px_#30302e]",

        // ── Destructive: warm red
        destructive:
          "bg-[#b53333]/10 text-[#b53333] hover:bg-[#b53333]/20 border border-[#b53333]/20",

        // ── Link: terracotta underline
        link: "text-[#c96442] underline-offset-4 hover:underline",
      },
      size: {
        xs:      "h-6 gap-1 rounded-lg px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm:      "h-8 gap-1 rounded-lg px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        default: "h-9 px-3",
        lg:      "h-11 gap-2 px-5 text-base rounded-xl",
        xl:      "h-12 gap-2 px-7 text-base rounded-xl",
        icon:    "size-9",
        "icon-sm": "size-8 rounded-lg",
        "icon-xs": "size-6 rounded-lg [&_svg:not([class*='size-'])]:size-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
