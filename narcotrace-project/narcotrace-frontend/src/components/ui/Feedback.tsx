import type { LucideIcon } from 'lucide-react'
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon
  title: string
  body: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-line-700 px-6 py-14 text-center">
      <Icon className="h-8 w-8 text-mist-700" />
      <p className="mt-3 text-sm font-semibold text-mist-100">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-mist-500">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// --- Toasts ---

interface ToastItem {
  id: number
  message: string
  variant: 'success' | 'error' | 'info'
}

interface ToastContextValue {
  push: (message: string, variant?: ToastItem['variant']) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const push = useCallback((message: string, variant: ToastItem['variant'] = 'info') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, variant }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3200)
  }, [])

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id))

  const icons = { success: CheckCircle2, error: XCircle, info: Info }
  const colors = {
    success: 'border-verified-500/40 text-verified-400',
    error: 'border-evidence-500/40 text-evidence-400',
    info: 'border-signal-500/40 text-signal-400',
  }

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed bottom-20 left-1/2 z-50 flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4 md:bottom-6">
        {toasts.map((t) => {
          const Icon = icons[t.variant]
          return (
            <div
              key={t.id}
              className={cn(
                'pointer-events-auto flex items-center gap-2 rounded-lg border bg-ink-700/95 px-4 py-3 text-sm text-mist-100 shadow-lg backdrop-blur animate-fade-in-up',
                colors[t.variant]
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{t.message}</span>
              <button onClick={() => dismiss(t.id)} className="text-mist-700 hover:text-mist-300">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
