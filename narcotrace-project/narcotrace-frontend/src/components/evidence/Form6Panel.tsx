import { useRef, useState } from 'react'
import { CheckCircle2, Download, FilePenLine, FileText, Printer, Save, ShieldCheck, History, Copy } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useI18n, type TKey } from '@/lib/i18n'
import { currentOfficer } from '@/lib/store'
import { formatDateTime } from '@/lib/utils'
import type { EvidenceRecord, Form6Editable, Form6Record } from '@/types'

const now = () => new Date().toISOString()

export function newForm6(ev: EvidenceRecord, revision = 1, prev?: Form6Record): Form6Record {
  const by = `${currentOfficer.name} (${currentOfficer.officerId})`
  const base: Form6Editable = prev
    ? { ...prev.fields }
    : {
        sampleDescription: ev.sampleType,
        place: ev.location,
        observations: `${ev.reactionColor}; image quality ${ev.imageQuality}; calibration ${ev.calibrationAccuracy.toFixed(1)}%.${ev.inconclusiveReasons ? ' Reasons: ' + ev.inconclusiveReasons.join(', ') + '.' : ''}`,
        quantity: '',
        witness: '',
        remarks: '',
      }
  const history = [...(prev?.history ?? []), { at: now(), by, action: revision > 1 ? 'revision_created' : 'generated', detail: revision > 1 ? `Revision ${revision} created from R${revision - 1}` : 'Draft auto-generated from test result' }]
  return { id: `F6-${ev.id}-R${revision}`, evidenceId: ev.id, caseId: ev.caseId, revision, status: 'draft', generatedAt: now(), generatedBy: by, fields: base, history }
}

export function Form6Panel({ record, form, onForm, onConfirm }: {
  record: EvidenceRecord
  form: Form6Record
  onForm: (f: Form6Record) => void
  onConfirm: (f: Form6Record) => void
}) {
  const { t } = useI18n()
  const sheetRef = useRef<HTMLDivElement>(null)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Form6Editable>(form.fields)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const confirmed = form.status === 'confirmed'
  const by = `${currentOfficer.name} (${currentOfficer.officerId})`

  const saveEdits = () => {
    const changed = (Object.keys(draft) as (keyof Form6Editable)[]).filter((k) => draft[k] !== form.fields[k])
    if (changed.length) onForm({ ...form, fields: draft, history: [...form.history, { at: now(), by, action: 'edited', detail: `Changed: ${changed.join(', ')}` }] })
    setEditing(false)
  }
  const confirm = () => {
    const f: Form6Record = { ...form, status: 'confirmed', confirmedAt: now(), confirmedBy: by, history: [...form.history, { at: now(), by, action: 'confirmed', detail: 'Reviewed and confirmed by officer' }] }
    onConfirm(f)
  }

  const exportPdf = async () => {
    if (!sheetRef.current) return
    setBusy(true); setMsg('')
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas-pro'), import('jspdf')])
      const canvas = await html2canvas(sheetRef.current, { scale: 2, backgroundColor: '#ffffff' })
      const pdf = new jsPDF('p', 'mm', 'a4')
      const w = pdf.internal.pageSize.getWidth(), h = pdf.internal.pageSize.getHeight()
      const imgH = (canvas.height * w) / canvas.width
      let off = 0
      while (off < imgH) {
        if (off > 0) pdf.addPage()
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, -off, w, imgH)
        off += h
      }
      const filename = `${form.id}${confirmed ? '' : '-DRAFT'}.pdf`
      const blob = pdf.output('blob')
      const claude = (window as unknown as { claude?: { use: (n: string) => Promise<{ save: (a: { filename: string; data: Blob }) => Promise<unknown> } | null> } }).claude
      const dl = claude ? await claude.use('downloads').catch(() => null) : null
      if (dl) await dl.save({ filename, data: blob })
      else {
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click()
        setTimeout(() => URL.revokeObjectURL(a.href), 2000)
      }
    } catch (e) {
      setMsg(`PDF export failed${e instanceof Error ? ': ' + e.message : ''}`)
    } finally { setBusy(false) }
  }

  const rows: [TKey, string, 'auto' | 'edit', (keyof Form6Editable)?][] = [
    ['f6.evidenceId', record.id, 'auto'], ['f6.caseId', record.caseId, 'auto'],
    ['f6.officer', `${record.officerName} (${record.officerId})`, 'auto'],
    ['f6.dateTime', formatDateTime(record.timestamp), 'auto'],
    ['f6.place', form.fields.place ? `${form.fields.place} (${record.lat.toFixed(5)}, ${record.lng.toFixed(5)})` : '', 'edit', 'place'],
    ['f6.sample', form.fields.sampleDescription, 'edit', 'sampleDescription'],
    ['f6.quantity', form.fields.quantity, 'edit', 'quantity'],
    ['f6.kit', record.testKitId, 'auto'], ['f6.reaction', record.reactionColor, 'auto'],
    ['f6.result', `${record.verdict.toUpperCase()} – ${record.substance} (presumptive only)`, 'auto'],
    ['f6.ai', `${record.modelVersion}, ${record.confidence.toFixed(1)}%`, 'auto'],
    ['f6.observations', form.fields.observations, 'edit', 'observations'],
    ['f6.hash', record.sha256.slice(0, 32) + '…', 'auto'],
    ['f6.witness', form.fields.witness, 'edit', 'witness'],
    ['f6.remarks', form.fields.remarks, 'edit', 'remarks'],
  ]

  return (
    <section className="space-y-3 rounded-xl border border-line-800 bg-ink-800 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-verified-400"><CheckCircle2 className="h-4 w-4" />{t('f6.generated')}</p>
          <h3 className="mt-0.5 text-sm font-semibold text-mist-100">{t('f6.title')}</h3>
        </div>
        <span className={`rounded px-2 py-0.5 text-[10px] font-semibold ${confirmed ? 'bg-verified-500/15 text-verified-400' : 'bg-caution-500/15 text-caution-400'}`}>
          {confirmed ? t('f6.confirmed') : 'DRAFT'} · R{form.revision}
        </span>
      </div>

      {/* Official-style sheet (also the print/PDF source) */}
      <div className="overflow-x-auto rounded-md bg-neutral-300 p-2">
        <div id="form6-sheet" ref={sheetRef} className="mx-auto min-w-[520px] max-w-[794px] bg-white p-7 text-neutral-900">
          <div className="border-b-2 border-neutral-900 pb-2 text-center">
            <p className="text-base font-bold tracking-wide">FORM-6 — TEST MEMO</p>
            <p className="text-[10px] text-neutral-600">Layout per project template · official NDPS Rules 2022 wording to be verified</p>
            {!confirmed && <p className="mt-1 text-[11px] font-bold text-red-700">{t('f6.draft')}</p>}
          </div>
          <table className="mt-3 w-full border-collapse text-xs">
            <tbody>
              {rows.map(([k, v, kind, fk]) => {
                const pending = !v
                return (
                  <tr key={k} className="border border-neutral-400 align-top">
                    <td className="w-2/5 bg-neutral-100 p-1.5 font-semibold">{t(k)}</td>
                    <td className={`p-1.5 ${pending ? 'border-2 border-dashed border-amber-500 bg-amber-50 italic text-amber-800' : kind === 'auto' ? 'bg-emerald-50' : ''}`}>
                      {editing && fk ? (
                        <input value={draft[fk]} onChange={(e) => setDraft({ ...draft, [fk]: e.target.value })} placeholder={t('f6.pending')}
                          className="w-full rounded border border-neutral-400 bg-white px-1.5 py-1 text-xs text-neutral-900" />
                      ) : pending ? t('f6.pending') : (
                        <span className={k === 'f6.evidenceId' || k === 'f6.hash' || k === 'f6.caseId' ? 'font-mono' : ''}>{v}</span>
                      )}
                      {!editing && kind === 'auto' && <span className="ms-1.5 rounded bg-emerald-200 px-1 text-[9px] font-semibold text-emerald-900">{t('f6.auto')}</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="mt-6 grid grid-cols-2 gap-6 text-xs">
            <div className="border-t border-neutral-500 pt-1">{t('f6.sig')} <span className="text-neutral-500">({t('f6.pending')})</span></div>
            <div className="border-t border-neutral-500 pt-1">{t('f6.witness')} <span className="text-neutral-500">({form.fields.witness || t('f6.pending')})</span></div>
          </div>
          <p className="mt-4 text-[10px] italic text-neutral-600">{t('f6.note')}</p>
          <p className="mt-2 text-[10px] text-neutral-500">
            {form.id} · Generated {formatDateTime(form.generatedAt)} by {form.generatedBy}
            {confirmed && form.confirmedAt ? ` · Confirmed ${formatDateTime(form.confirmedAt)} by ${form.confirmedBy}` : ''}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {!confirmed && !editing && <Button variant="outline" onClick={() => { setDraft(form.fields); setEditing(true) }}><FilePenLine className="h-4 w-4" />{t('f6.edit')}</Button>}
        {editing && <Button variant="outline" onClick={saveEdits}><Save className="h-4 w-4" />{t('f6.saveChanges')}</Button>}
        {!confirmed && <Button onClick={confirm} disabled={editing}><ShieldCheck className="h-4 w-4" />{t('f6.confirm')}</Button>}
        {confirmed && <Button variant="outline" onClick={() => onForm(newForm6(record, form.revision + 1, form))}><Copy className="h-4 w-4" />{t('f6.revise')}</Button>}
        <Button variant="outline" onClick={exportPdf} disabled={busy}><Download className="h-4 w-4" />{busy ? '…' : t('f6.pdf')}</Button>
        <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" />{t('f6.print')}</Button>
      </div>
      {msg && <p className="text-xs text-caution-400">{msg}</p>}

      <details className="text-xs text-mist-500">
        <summary className="flex cursor-pointer items-center gap-1.5"><History className="h-3.5 w-3.5" />{t('f6.history')} ({form.history.length})</summary>
        <ul className="mt-1.5 space-y-1">
          {form.history.map((h, i) => <li key={i}><span className="font-mono text-mist-700">{formatDateTime(h.at)}</span> · {h.by} · {h.action} — {h.detail}</li>)}
        </ul>
      </details>
    </section>
  )
}

export function GenerateForm6Button({ onClick }: { onClick: () => void }) {
  const { t } = useI18n()
  return <Button variant="outline" onClick={onClick}><FileText className="h-4 w-4" />{t('f6.generate')}</Button>
}
