import { CheckCircle2 } from 'lucide-react'

export function SecurityRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-line-800 py-3 last:border-0">
      <span className="text-sm text-mist-300">{label}</span>
      <span className="flex items-center gap-1.5 text-sm font-medium text-verified-400">
        <CheckCircle2 className="h-4 w-4" />
        {value}
      </span>
    </div>
  )
}

export function SecurityScoreGauge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 54
  const offset = circumference - (score / 100) * circumference
  return (
    <div className="relative flex h-40 w-40 items-center justify-center">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
        <circle cx="64" cy="64" r="54" fill="none" stroke="var(--color-line-800)" strokeWidth="10" />
        <circle
          cx="64"
          cy="64"
          r="54"
          fill="none"
          stroke="var(--color-verified-500)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-semibold tabular text-mist-100">{score}</span>
        <span className="text-xs text-mist-500">/ 100</span>
      </div>
    </div>
  )
}
