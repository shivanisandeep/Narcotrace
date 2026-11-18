// Whole-interface translation layer. Translates every visible English string (text, placeholders,
// titles, aria-labels), including dynamic content, via the host's Claude `sample` capability, and
// caches results per language in localStorage. Evidence data/IDs/numbers/timestamps are never touched.
type Rec = { en: string; tr: string }
type Status = 'idle' | 'busy' | 'unavailable'
type Sample = { json: (input: string, opts?: object) => Promise<unknown> }

const ATTRS = ['placeholder', 'title', 'aria-label']
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'CODE', 'TEXTAREA', 'NOSCRIPT', 'OPTION', 'INPUT'])
const NON_LATIN = /[^\u0000-\u024F\u2000-\u206F\u2190-\u2BFF]/
export const LANG_NAMES: Record<string, string> = {
  hi: 'Hindi', kn: 'Kannada', ta: 'Tamil', te: 'Telugu', ml: 'Malayalam', mr: 'Marathi', bn: 'Bengali',
  gu: 'Gujarati', pa: 'Punjabi (Gurmukhi)', or: 'Odia', as: 'Assamese', ur: 'Urdu',
}
import STATIC from '@/i18n/translations.json'
const track = new WeakMap<object, Record<string, Rec>>()

export const STATIC_DICT = STATIC as Record<string, Record<string, string>>
export function loadCache(lang: string): Record<string, string> {
  let local: Record<string, string> = {}
  try { local = JSON.parse(localStorage.getItem(`narcotrace.tr.${lang}`) || '{}') } catch { /* ignore */ }
  return { ...(STATIC_DICT[lang] ?? {}), ...local }
}
export function saveCache(lang: string, c: Record<string, string>) {
  try { localStorage.setItem(`narcotrace.tr.${lang}`, JSON.stringify(c)) } catch { /* ignore */ }
}
export function seenKeys(): string[] {
  try { return JSON.parse(localStorage.getItem('narcotrace.seen') || '[]') } catch { return [] }
}
const seen = new Set<string>(seenKeys())
function markSeen(k: string) {
  if (seen.has(k)) return
  seen.add(k)
  try { localStorage.setItem('narcotrace.seen', JSON.stringify(Array.from(seen))) } catch { /* ignore */ }
}
export async function translateBatch(sample: Sample, lang: string, batch: string[]): Promise<(string | null)[]> {
  const out = await sample.json(
    `Translate each English UI string in this JSON array into ${LANG_NAMES[lang]}. This is a forensic narcotics field-testing app used by Indian law-enforcement officers: use accurate, formal forensic/legal terminology. NEVER translate or alter: chemical/substance names, scientific abbreviations (AI, GPS, DNA, THC, MDMA, FSL, SHA-256, NDPS), kit/evidence/case/officer IDs, numbers, units, timestamps, person names, place names, product names (NARCOTRACE, VIGIL). Keep punctuation, symbols and any {placeholders}. Return ONLY a JSON array of exactly ${batch.length} translated strings in the same order.\n\n${JSON.stringify(batch)}`,
    { modelTier: 'quick' },
  )
  return Array.isArray(out) && out.length === batch.length ? out.map((x) => (typeof x === 'string' && x ? x : null)) : batch.map(() => null)
}
export async function getSample(): Promise<Sample | null> {
  const c = (window as unknown as { claude?: { use: (n: string) => Promise<Sample | null> } }).claude
  return c ? await c.use('sample').catch(() => null) : null
}
export function eligibleKey(s: string) { return eligible(null, s) }

function eligible(el: Element | null, s: string) {
  if (!/[A-Za-z]{2}/.test(s) || NON_LATIN.test(s)) return false // nothing to translate / already translated
  if (/\d{1,2}:\d{2}|\b20\d\d\b/.test(s)) return false // timestamps
  if (/^[A-Z0-9][A-Z0-9\-_.:/ ]*$/.test(s) && /\d/.test(s)) return false // IDs (OFF-1042, NT-2026-00142)
  for (let e = el; e; e = e.parentElement) {
    if (SKIP_TAGS.has(e.tagName) || e.hasAttribute('data-notranslate') || e.classList.contains('font-mono')) return false
  }
  return true
}

export function startAutoTranslate(lang: string, onStatus: (s: Status) => void) {
  const cache = loadCache(lang)
  const pending = new Set<string>()
  const failed = new Set<string>()
  const waiting: [Node, string][] = []
  let timer: number | undefined
  let stopped = false
  let running = false

  const read = (o: Node, slot: string) => (slot === '#t' ? o.nodeValue ?? '' : (o as Element).getAttribute(slot) ?? '')
  const write = (o: Node, slot: string, v: string) => { if (slot === '#t') o.nodeValue = v; else (o as Element).setAttribute(slot, v) }
  const recOf = (o: Node, slot: string) => { let r = track.get(o); if (!r) track.set(o, (r = {})); return r[slot] as Rec | undefined }
  const setRec = (o: Node, slot: string, rec: Rec) => { (track.get(o) as Record<string, Rec>)[slot] = rec }

  const restore = (root: Node) => each(root, (o, slot) => {
    const rec = recOf(o, slot)
    if (rec?.tr && read(o, slot) === rec.tr) { write(o, slot, rec.en); rec.tr = '' }
  })

  function each(root: Node, fn: (o: Node, slot: string) => void) {
    if (root.nodeType === 3) return fn(root, '#t')
    if (root.nodeType !== 1) return
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    for (let n = tw.nextNode(); n; n = tw.nextNode()) fn(n, '#t')
    const els = [root as Element, ...Array.from((root as Element).querySelectorAll('[placeholder],[title],[aria-label]'))]
    for (const e of els) for (const a of ATTRS) if (e.hasAttribute(a)) fn(e, a)
  }

  function process(o: Node, slot: string) {
    const cur = read(o, slot)
    let rec = recOf(o, slot)
    if (rec && rec.tr && cur === rec.tr) return // our own write
    if (!rec || cur !== rec.en) { rec = { en: cur, tr: '' }; setRec(o, slot, rec) }
    const key = cur.trim()
    if (key && /[A-Za-z]{3}/.test(key) && !NON_LATIN.test(key)) markSeen(key)
    const el = o.nodeType === 1 ? (o as Element) : o.parentElement
    if (!key || !eligible(el, key)) return
    const tr = cache[key]
    if (tr) { rec.tr = cur.replace(key, () => tr); write(o, slot, rec.tr) }
    else if (!failed.has(key)) { pending.add(key); waiting.push([o, slot]); schedule() }
  }

  function schedule() { if (timer == null) timer = window.setTimeout(flush, 250) }

  async function flush() {
    timer = undefined
    if (stopped || running || !pending.size) return
    running = true
    onStatus('busy')
    const sample = await getSample()
    if (!sample) { pending.clear(); waiting.length = 0; running = false; onStatus('unavailable'); return }
    while (!stopped && pending.size) {
      const batch = Array.from(pending).slice(0, 40)
      try {
        const out = await translateBatch(sample, lang, batch)
        batch.forEach((k, i) => { if (out[i]) cache[k] = out[i] as string; else failed.add(k) })
      } catch (e) {
        batch.forEach((k) => failed.add(k))
        if ((e as { code?: string })?.code === 'not_granted') { pending.clear(); onStatus('unavailable'); running = false; return }
      }
      batch.forEach((k) => pending.delete(k))
      saveCache(lang, cache)
      const todo = waiting.splice(0)
      todo.forEach(([o, s]) => process(o, s))
    }
    running = false
    onStatus('idle')
  }

  restore(document.body)
  if (lang === 'en') { onStatus('idle'); return () => { stopped = true } }
  each(document.body, process)
  const mo = new MutationObserver((muts) => {
    for (const m of muts) {
      if (m.type === 'characterData') process(m.target, '#t')
      else if (m.type === 'attributes') process(m.target, m.attributeName!)
      else m.addedNodes.forEach((n) => each(n, process))
    }
  })
  mo.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS })
  return () => { stopped = true; mo.disconnect(); if (timer) clearTimeout(timer) }
}
