import { useState } from 'react'
import { Download, Languages } from 'lucide-react'
import { exportAllTranslations } from '@/i18n/export-translations'
import { LANGUAGES, useI18n, type LangCode } from '@/lib/i18n'

export function LanguageSelector() {
  const { lang, setLang } = useI18n()
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const canExport = typeof window !== 'undefined' && 'claude' in window
  return (
    <div data-notranslate className="flex items-center gap-1.5">
    <label className="relative flex items-center">
      <span className="sr-only">Language / भाषा</span>
      <Languages className="pointer-events-none absolute start-2.5 h-4 w-4 text-mist-500" aria-hidden="true" />
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as LangCode)}
        aria-label="Language"
        className="h-9 max-w-[11rem] cursor-pointer rounded-md border border-line-700 bg-ink-900 ps-8 pe-2 text-xs font-medium text-mist-300 hover:bg-ink-600 focus:outline-none focus:ring-2 focus:ring-evidence-400"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.code === 'en' ? 'English' : `${l.english} – ${l.native}`}
          </option>
        ))}
      </select>
    </label>
      {canExport && (
        <button
          type="button"
          disabled={busy}
          title="Generate and download offline translations for all 12 languages (translations.json)"
          onClick={async () => { setBusy(true); try { await exportAllTranslations(setMsg) } finally { setBusy(false) } }}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-line-700 bg-ink-900 text-mist-300 hover:bg-ink-600 disabled:opacity-50"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
      {msg && <span data-notranslate className="max-w-[14rem] truncate text-[10px] text-mist-500">{msg}</span>}
    </div>
  )
}
