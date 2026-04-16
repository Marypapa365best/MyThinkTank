import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// M3 Warm Terracotta button system
// Primary: #f97316 (brick red — deeper, more sophisticated than orange)
// Ring-based shadows — no drop shadows
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-transparent text-sm font-medium whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:ring-2 focus-visible:ring-[#f97316]/40 active:translate-y-px disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Brick red — primary CTA
        default:
          "bg-[#f97316] text-[#1b1c18] hover:bg-[#b95837] [box-shadow:0px_0px_0px_1px_#7e2c0e] hover:[box-shadow:0px_0px_0px_1px_#f97316]",

        // Warm surface — secondary
        secondary:
          "bg-[#efeee7] text-[#1b1c18] hover:bg-[#e3e3dc] [box-shadow:0px_0px_0px_1px_#dcc1b8] hover:[box-shadow:0px_0px_0px_1px_#c9a898]",

        // Blush outline
        outline:
          "border border-[#dcc1b8] bg-[#ffffff] text-[#56423c] hover:bg-[#f5f4ed] hover:border-[#c9a898]",

        // Ghost warm
        ghost:
          "text-[#56423c] hover:bg-[#efeee7] hover:text-[#1b1c18]",

        // Dark — for light-section dark emphasis
        dark:
          "bg-[#30312c] text-[#f2f1ea] hover:bg-[#3d3e39] border border-[#3d3e39]",

        // Destructive
        destructive:
          "bg-[#ba1a1a]/10 text-[#ba1a1a] border border-[#ba1a1a]/20 hover:bg-[#ba1a1a]/15",

        link: "text-[#f97316] underline-offset-4 hover:underline",
      },
      size: {
        xs:      "h-6 gap-1 rounded px-2 text-xs",
        sm:      "h-8 gap-1 rounded-md px-3 text-xs",
        default: "h-9 px-4",
        lg:      "h-11 gap-2 rounded-xl px-5 text-base",
        xl:      "h-12 gap-2 rounded-xl px-7 text-base",
        icon:    "size-9",
        "icon-sm": "size-8 rounded-md",
        "icon-xs": "size-6 rounded [&_svg:not([class*='size-'])]:size-3",
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
