import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size = 'sm' | 'md' | 'lg'

const variantClasses: Record<Variant, string> = {
  primary: 'bg-evidence-500 text-white hover:bg-evidence-400 border border-evidence-500',
  secondary: 'bg-ink-600 text-mist-100 hover:bg-line-700 border border-line-700',
  outline: 'bg-transparent text-mist-100 hover:bg-ink-600 border border-line-700',
  ghost: 'bg-transparent text-mist-300 hover:bg-ink-600 border border-transparent',
  danger: 'bg-evidence-950 text-evidence-400 hover:bg-evidence-950/70 border border-evidence-500/40',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-11 px-4 text-sm',
  lg: 'h-14 px-6 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
}
