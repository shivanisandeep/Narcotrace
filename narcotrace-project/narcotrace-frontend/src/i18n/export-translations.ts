import CATALOGUE from '@/i18n/catalogue.json'
import { LANG_NAMES, STATIC_DICT, eligibleKey, getSample, loadCache, saveCache, seenKeys, translateBatch } from '@/lib/auto-translate'

/** Translate every catalogue + seen string into all 12 languages and download one translations.json. */
export async function exportAllTranslations(onProgress: (msg: string) => void): Promise<boolean> {
  const sample = await getSample()
  if (!sample) { onProgress('Live translation is only available inside the Claude preview.'); return false }
  const keys = Array.from(new Set([...(CATALOGUE as string[]), ...seenKeys()])).filter(eligibleKey)
  const result: Record<string, Record<string, string>> = {}
  const langs = Object.keys(LANG_NAMES)
  for (const [li, lang] of langs.entries()) {
    const cache = loadCache(lang)
    const todo = keys.filter((k) => !cache[k])
    for (let i = 0; i < todo.length; i += 40) {
      onProgress(`${LANG_NAMES[lang]} (${li + 1}/${langs.length}): ${Math.min(i + 40, todo.length)}/${todo.length}`)
      const batch = todo.slice(i, i + 40)
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const out = await translateBatch(sample, lang, batch)
          batch.forEach((k, j) => { if (out[j]) cache[k] = out[j] as string })
          if (out.every(Boolean)) break
        } catch { /* retry once */ }
      }
      saveCache(lang, cache)
    }
    result[lang] = Object.fromEntries(Object.entries({ ...(STATIC_DICT[lang] ?? {}), ...cache }))
  }
  const blob = new Blob([JSON.stringify(result, null, 1)], { type: 'application/json' })
  const c = (window as unknown as { claude?: { use: (n: string) => Promise<{ save: (a: { filename: string; data: Blob }) => Promise<unknown> } | null> } }).claude
  const dl = c ? await c.use('downloads').catch(() => null) : null
  if (dl) await dl.save({ filename: 'translations.json', data: blob })
  else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'translations.json'; a.click() }
  onProgress('Done. Put translations.json at src/i18n/translations.json and rebuild.')
  return true
}
