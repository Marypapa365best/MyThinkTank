import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2.5 py-0.5 text-xs font-medium tracking-[0.06em] whitespace-nowrap transition-all [&>svg]:size-3!",
  {
    variants: {
      variant: {
        // Brick red — high signal
        default:
          "bg-[#9a4021] text-white",

        // Warm surface — neutral
        secondary:
          "bg-[#efeee7] text-[#56423c]",

        // Blush outline — most common on light
        outline:
          "border border-[#dcc1b8] bg-[#ffffff] text-[#56423c]",

        // On dark sections
        "outline-dark":
          "border border-[#3d3e39] bg-transparent text-[#dcc1b8]",

        // Very subtle — on surface-low
        ghost:
          "bg-[#f5f4ed] text-[#89726b]",

        destructive:
          "bg-[#ba1a1a]/10 text-[#ba1a1a] border border-[#ba1a1a]/20",

        link: "text-[#9a4021] underline-offset-4 hover:underline",
      },
    },
    defaultVariants: { variant: "default" },
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
