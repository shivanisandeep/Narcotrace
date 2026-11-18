import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/Button'
import { Form6Panel, newForm6 } from '@/components/evidence/Form6Panel'
import type { Form6Record } from '@/types'
import { CameraScanner } from '@/components/evidence/CameraScanner'
import { CalibrationPanel } from '@/components/evidence/CalibrationPanel'
import { AnalysisProgress } from '@/components/evidence/AnalysisProgress'
import { ResultCard } from '@/components/evidence/ResultCard'
import { useAppData, currentOfficer } from '@/lib/store'
import { useToast } from '@/components/ui/Feedback'
import { generateHash, nextEvidenceId, substanceReactionMap } from '@/lib/mock-data'
import type { EvidenceRecord, ResultVerdict } from '@/types'
import { cn } from '@/lib/utils'

type Step = 'identify' | 'capture' | 'calibrate' | 'analyze' | 'result'
const stepOrder: Step[] = ['identify', 'capture', 'calibrate', 'analyze', 'result']
const stepLabels: Record<Step, string> = {
  identify: 'Identify',
  capture: 'Capture',
  calibrate: 'Calibrate',
  analyze: 'Analyze',
  result: 'Verify & save',
}

function pickVerdict(): ResultVerdict {
  const r = Math.random()
  if (r < 0.15) return 'inconclusive'
  if (r < 0.55) return 'positive'
  return 'negative'
}

export default function NewTest() {
  const navigate = useNavigate()
  const { addEvidence, saveForm6 } = useAppData()
  const { push } = useToast()

  const [step, setStep] = useState<Step>('identify')
  const [caseId, setCaseId] = useState('')
  const [testKitId, setTestKitId] = useState(substanceReactionMap[0].kit)
  const [sampleType, setSampleType] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [pendingRecord, setPendingRecord] = useState<EvidenceRecord | null>(null)
  const [form6, setForm6] = useState<Form6Record | null>(null)

  const goto = (s: Step) => setStep(s)
  const idx = stepOrder.indexOf(step)

  const handleAnalysisComplete = () => {
    const kitInfo = substanceReactionMap.find((s) => s.kit === testKitId) ?? substanceReactionMap[0]
    const verdict = pickVerdict()
    const id = nextEvidenceId()
    const timestamp = new Date().toISOString()
    const confidence =
      verdict === 'inconclusive' ? 45 + Math.random() * 25 : verdict === 'positive' ? 88 + Math.random() * 11 : 85 + Math.random() * 13

    const record: EvidenceRecord = {
      id,
      caseId: caseId || `CASE-${Math.floor(1000 + Math.random() * 9000)}`,
      officerId: currentOfficer.officerId,
      officerName: currentOfficer.name,
      testKitId,
      sampleType: sampleType || 'Unspecified sample',
      verdict,
      substance: verdict === 'positive' ? kitInfo.substance : verdict === 'negative' ? 'No controlled substance detected' : 'Undetermined',
      confidence,
      reactionColor: verdict === 'positive' ? kitInfo.color : verdict === 'negative' ? 'No color change' : 'Partial reaction',
      imageQuality: image ? 'Excellent' : 'Good',
      calibrationAccuracy: 94 + Math.random() * 5,
      modelVersion: 'VIGIL-CV v2.1',
      timestamp,
      location: 'Whitefield, Bengaluru',
      lat: 12.9698 + (Math.random() - 0.5) * 0.01,
      lng: 77.75 + (Math.random() - 0.5) * 0.01,
      temperatureC: 27 + Math.round(Math.random() * 4),
      lightingLux: 400 + Math.round(Math.random() * 60),
      deviceId: currentOfficer.device,
      sha256: generateHash(id + timestamp),
      syncStatus: 'pending',
      custody: [
        { id: `${id}-C1`, label: 'Evidence Captured', timestamp, actor: currentOfficer.name, location: 'Whitefield, Bengaluru', gpsVerified: true, hashVerified: true },
        { id: `${id}-C2`, label: 'AI Analysis Completed', timestamp: new Date(Date.now() + 60000).toISOString(), actor: 'VIGIL-CV v2.1', location: 'Whitefield, Bengaluru', gpsVerified: true, hashVerified: true },
      ],
      inconclusiveReasons: verdict === 'inconclusive' ? ['Poor lighting at capture', 'Strip partially obscured', 'Insufficient reaction visibility'] : undefined,
    }
    setPendingRecord(record)
    setForm6(newForm6(record))
    goto('result')
  }

  const handleSave = () => {
    if (!pendingRecord) return
    addEvidence(pendingRecord)
    if (form6) saveForm6(form6)
    push(`Evidence ${pendingRecord.id} saved and sealed`, 'success')
    navigate(`/evidence/${pendingRecord.id}`)
  }

  return (
    <AppShell title="New test" subtitle="Capture → Analyze → Verify → Save">
      <div className="mx-auto max-w-xl">
        <div className="mb-5 flex items-center gap-1.5">
          {stepOrder.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-1.5">
              <div
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold',
                  i < idx ? 'bg-verified-500 text-white' : i === idx ? 'bg-evidence-500 text-white' : 'bg-ink-600 text-mist-700'
                )}
              >
                {i < idx ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              {i < stepOrder.length - 1 && <div className={cn('h-0.5 flex-1', i < idx ? 'bg-verified-500' : 'bg-ink-600')} />}
            </div>
          ))}
        </div>
        <p className="mb-4 text-xs font-medium text-mist-500">{stepLabels[step]}</p>

        {step === 'identify' && (
          <div className="space-y-3 rounded-xl border border-line-800 bg-ink-800 p-5">
            <Field label="Case ID">
              <input value={caseId} onChange={(e) => setCaseId(e.target.value)} placeholder="CASE-8821" className={inputClass} />
            </Field>
            <Field label="Evidence ID">
              <input value={nextEvidenceId()} disabled className={cn(inputClass, 'font-mono opacity-70')} />
            </Field>
            <Field label="Officer ID">
              <input value={currentOfficer.officerId} disabled className={cn(inputClass, 'opacity-70')} />
            </Field>
            <Field label="Test kit ID">
              <select value={testKitId} onChange={(e) => setTestKitId(e.target.value)} className={inputClass}>
                {substanceReactionMap.map((s) => (
                  <option key={s.kit} value={s.kit}>{s.kit} — {s.substance}</option>
                ))}
              </select>
            </Field>
            <Field label="Sample type">
              <input value={sampleType} onChange={(e) => setSampleType(e.target.value)} placeholder="White crystalline powder" className={inputClass} />
            </Field>
            <Button size="lg" className="w-full" onClick={() => goto('capture')}>Continue</Button>
          </div>
        )}

        {step === 'capture' && (
          <div className="space-y-4">
            <CameraScanner onCapture={(img) => { setImage(img); goto('calibrate') }} />
            <BackLink onClick={() => goto('identify')} />
          </div>
        )}

        {step === 'calibrate' && (
          <div className="space-y-4">
            <CalibrationPanel image={image} />
            <Button size="lg" className="w-full" onClick={() => goto('analyze')}>Run AI analysis</Button>
            <BackLink onClick={() => goto('capture')} />
          </div>
        )}

        {step === 'analyze' && <AnalysisProgress onComplete={handleAnalysisComplete} />}

        {step === 'result' && pendingRecord && (
          <div className="space-y-4">
            <ResultCard record={pendingRecord} />
            {form6 && (
              <Form6Panel
                record={pendingRecord}
                form={form6}
                onForm={setForm6}
                onConfirm={(f) => {
                  addEvidence(pendingRecord)
                  saveForm6(f)
                  push(`Form 6 confirmed and saved with evidence ${pendingRecord.id}`, 'success')
                  navigate(`/evidence/${pendingRecord.id}`)
                }}
              />
            )}
            <div className="flex gap-2">
              <Button size="lg" variant="outline" className="flex-1" onClick={() => goto('capture')}>Retake test</Button>
              <Button size="lg" className="flex-1" onClick={handleSave}>Save evidence</Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}

const inputClass = 'w-full rounded-md border border-line-700 bg-ink-900 px-3 py-2.5 text-sm text-mist-100 outline-none focus:border-signal-500'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-mist-500">{label}</label>
      {children}
    </div>
  )
}

function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 text-xs font-medium text-mist-500 hover:text-mist-300">
      <ArrowLeft className="h-3.5 w-3.5" />
      Back
    </button>
  )
}
