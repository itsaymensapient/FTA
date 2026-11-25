import * as React from 'react'
import { Input as InputPrimitive } from '@base-ui/react/input'
import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        'h-12 w-full min-w-0 rounded-lg border border-input bg-card/40 px-4 text-[0.9375rem] leading-none text-foreground transition-colors outline-none',
        'placeholder:text-muted-foreground/80',
        'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/35',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20',
        'dark:bg-card/60',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
