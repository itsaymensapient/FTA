import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-[2px] border px-1.5 py-0.5 text-[0.6875rem] font-medium whitespace-nowrap shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] backdrop-blur-md transition-[color,background-color,border-color,box-shadow,opacity] duration-150 ease-[var(--ease-out)] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default:
          "border-primary/35 bg-primary/18 text-primary [a]:hover:bg-primary/28",
        secondary:
          "border-border/70 bg-secondary/55 text-secondary-foreground [a]:hover:bg-secondary/70",
        destructive:
          "border-destructive/35 bg-destructive/15 text-destructive focus-visible:ring-destructive/20 [a]:hover:bg-destructive/25",
        outline:
          "border-border/80 bg-background/35 text-foreground [a]:hover:bg-muted/50 [a]:hover:text-muted-foreground",
        ghost:
          "border-transparent bg-transparent shadow-none backdrop-blur-none hover:border-border/60 hover:bg-muted/40 hover:text-muted-foreground",
        link: "border-transparent bg-transparent text-primary shadow-none backdrop-blur-none underline-offset-4 hover:underline",
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
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
