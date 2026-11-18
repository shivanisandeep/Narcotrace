import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, Circle } from 'lucide-react'

const stages = [
  'Image captured',
  'Reference card detected',
  'Lighting normalized',
  'Test region detected',
  'Analyzing chemical reaction',
  'Generating forensic result',
]

export function AnalysisProgress({ onComplete }: { onComplete: () => void }) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (activeIndex >= stages.length) {
      const t = setTimeout(onComplete, 500)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setActiveIndex((i) => i + 1), 650)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex])

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-line-700">
        <div className="absolute inset-2 overflow-hidden rounded-full bg-ink-950">
          <div className="absolute inset-x-0 top-0 h-full w-full bg-gradient-to-b from-transparent via-evidence-500/25 to-transparent animate-scanline" />
        </div>
        <span className="relative text-xs font-medium text-mist-300">
          {activeIndex >= stages.length ? '100%' : `${Math.round((activeIndex / stages.length) * 100)}%`}
        </span>
      </div>

      <p className="text-sm font-semibold text-mist-100">AI analysis in progress</p>

      <ul className="w-full max-w-sm space-y-2.5">
        {stages.map((stage, i) => {
          const done = i < activeIndex
          const active = i === activeIndex
          return (
            <li key={stage} className="flex items-center gap-2.5 text-sm">
              {done ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-verified-400" />
              ) : active ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-signal-400" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-mist-700" />
              )}
              <span className={done ? 'text-mist-300' : active ? 'text-mist-100' : 'text-mist-700'}>{stage}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
