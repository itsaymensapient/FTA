import * as React from 'react'
import { Input as InputPrimitive } from '@base-ui/react/input'
import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        'h-10 w-full min-w-0 rounded-md border border-input bg-card/40 px-3 text-[0.875rem] leading-none text-foreground transition-[color,background-color,border-color,box-shadow] duration-150 ease-[var(--ease-out)] outline-none',
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
