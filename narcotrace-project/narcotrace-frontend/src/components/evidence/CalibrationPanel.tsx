import { CheckCircle2 } from 'lucide-react'

export function CalibrationPanel({ image }: { image: string | null }) {
  const rows = [
    { label: 'Reference card', value: 'Detected' },
    { label: 'Ambient light', value: '420 lux' },
    { label: 'White balance', value: 'Calibrated' },
    { label: 'Color accuracy', value: '96.4%' },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Raw image', filter: 'saturate-75 brightness-90' },
          { label: 'Calibrated image', filter: 'saturate-125 brightness-105' },
        ].map((v) => (
          <div key={v.label}>
            <div className="aspect-square overflow-hidden rounded-lg border border-line-700 bg-ink-950">
              {image ? (
                <img src={image} alt={v.label} className={`h-full w-full object-cover ${v.filter}`} />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_center,_var(--color-ink-700),_var(--color-ink-950))] text-xs text-mist-700">
                  Sample preview
                </div>
              )}
            </div>
            <p className="mt-1.5 text-center text-xs font-medium text-mist-500">{v.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-line-800 bg-ink-700/50 p-4">
        <p className="text-sm font-semibold text-mist-100">Lighting &amp; color calibration</p>
        <div className="mt-2 divide-y divide-line-800">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between py-2 text-sm">
              <span className="text-mist-500">{r.label}</span>
              <span className="flex items-center gap-1.5 font-medium text-verified-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {r.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
