import type { AlertItem, EvidenceRecord, OfficerProfile } from '@/types'

export const officer: OfficerProfile = {
  officerId: 'OFF-1042',
  name: 'R. Deshmukh',
  role: 'Field Narcotics Officer',
  department: 'Narcotics Control Bureau — Bengaluru Zone',
  device: 'NCB-FIELD-TAB-0087',
  station: 'Whitefield Field Unit',
}

function hash(seed: string) {
  // deterministic fake sha256-looking string for demo purposes
  let h1 = 0xdeadbeef ^ seed.length
  for (let i = 0; i < seed.length; i++) {
    h1 = Math.imul(h1 ^ seed.charCodeAt(i), 2654435761)
    h1 ^= h1 >>> 15
  }
  const base = Math.abs(h1).toString(16).padStart(8, '0')
  return (base + base + base + base + base).slice(0, 64)
}

export function generateHash(seed: string) {
  return hash(seed)
}

function custodyFor(id: string, ts: string, location: string, officerName: string): EvidenceRecord['custody'] {
  const t0 = new Date(ts)
  const step = (mins: number) => new Date(t0.getTime() + mins * 60000).toISOString()
  return [
    { id: `${id}-C1`, label: 'Evidence Captured', timestamp: step(0), actor: officerName, location, gpsVerified: true, hashVerified: true },
    { id: `${id}-C2`, label: 'AI Analysis Completed', timestamp: step(2), actor: 'VIGIL-CV v2.1', location, gpsVerified: true, hashVerified: true },
    { id: `${id}-C3`, label: 'Evidence Sealed', timestamp: step(3), actor: officerName, location, gpsVerified: true, hashVerified: true },
    { id: `${id}-C4`, label: 'Transferred to Officer', timestamp: step(45), actor: 'OFF-1108 (Station Duty)', location: 'Whitefield Field Unit', gpsVerified: true, hashVerified: true },
    { id: `${id}-C5`, label: 'Transferred to Laboratory', timestamp: step(210), actor: 'Courier Unit 4', location: 'FSL Bengaluru', gpsVerified: false, hashVerified: true },
    { id: `${id}-C6`, label: 'Laboratory Received', timestamp: step(240), actor: 'Dr. K. Iyer, FSL', location: 'FSL Bengaluru', gpsVerified: true, hashVerified: true },
  ]
}

const rawEvidence: Omit<EvidenceRecord, 'custody' | 'sha256'>[] = [
  {
    id: 'NT-2026-00142', caseId: 'CASE-8821', officerId: 'OFF-1042', officerName: 'R. Deshmukh',
    testKitId: 'KIT-COC-04', sampleType: 'White crystalline powder', verdict: 'positive',
    substance: 'Suspected Cocaine', confidence: 97.8, reactionColor: 'Blue', imageQuality: 'Excellent',
    calibrationAccuracy: 96.4, modelVersion: 'VIGIL-CV v2.1', timestamp: '2026-09-09T14:32:18+05:30',
    location: 'Whitefield, Bengaluru', lat: 12.9698, lng: 77.7500, temperatureC: 29, lightingLux: 420,
    deviceId: 'NCB-FIELD-TAB-0087', syncStatus: 'synced',
  },
  {
    id: 'NT-2026-00141', caseId: 'CASE-8819', officerId: 'OFF-1042', officerName: 'R. Deshmukh',
    testKitId: 'KIT-THC-02', sampleType: 'Dried plant matter', verdict: 'negative',
    substance: 'No controlled substance detected', confidence: 94.1, reactionColor: 'No color change', imageQuality: 'Good',
    calibrationAccuracy: 93.2, modelVersion: 'VIGIL-CV v2.1', timestamp: '2026-09-09T12:08:51+05:30',
    location: 'HSR Layout, Bengaluru', lat: 12.9116, lng: 77.6412, temperatureC: 28, lightingLux: 380,
    deviceId: 'NCB-FIELD-TAB-0087', syncStatus: 'synced',
  },
  {
    id: 'NT-2026-00140', caseId: 'CASE-8815', officerId: 'OFF-1108', officerName: 'S. Nair',
    testKitId: 'KIT-OPI-01', sampleType: 'Brown tar substance', verdict: 'inconclusive',
    substance: 'Undetermined', confidence: 58.3, reactionColor: 'Partial reaction', imageQuality: 'Fair',
    calibrationAccuracy: 81.7, modelVersion: 'VIGIL-CV v2.1', timestamp: '2026-09-09T10:47:02+05:30',
    location: 'Indiranagar, Bengaluru', lat: 12.9784, lng: 77.6408, temperatureC: 27, lightingLux: 190,
    deviceId: 'NCB-FIELD-TAB-0091', syncStatus: 'pending',
    inconclusiveReasons: ['Poor lighting at capture', 'Reaction visibility below threshold'],
  },
  {
    id: 'NT-2026-00139', caseId: 'CASE-8810', officerId: 'OFF-1042', officerName: 'R. Deshmukh',
    testKitId: 'KIT-MDMA-03', sampleType: 'Pressed tablet', verdict: 'positive',
    substance: 'Suspected MDMA', confidence: 91.5, reactionColor: 'Purple-black', imageQuality: 'Excellent',
    calibrationAccuracy: 95.0, modelVersion: 'VIGIL-CV v2.0', timestamp: '2026-09-08T22:14:37+05:30',
    location: 'Koramangala, Bengaluru', lat: 12.9352, lng: 77.6245, temperatureC: 26, lightingLux: 410,
    deviceId: 'NCB-FIELD-TAB-0087', syncStatus: 'synced',
  },
  {
    id: 'NT-2026-00138', caseId: 'CASE-8804', officerId: 'OFF-1211', officerName: 'A. Khan',
    testKitId: 'KIT-COC-04', sampleType: 'White crystalline powder', verdict: 'negative',
    substance: 'No controlled substance detected', confidence: 88.9, reactionColor: 'No color change', imageQuality: 'Good',
    calibrationAccuracy: 90.1, modelVersion: 'VIGIL-CV v2.0', timestamp: '2026-09-08T18:02:11+05:30',
    location: 'Electronic City, Bengaluru', lat: 12.8452, lng: 77.6602, temperatureC: 30, lightingLux: 500,
    deviceId: 'NCB-FIELD-TAB-0064', syncStatus: 'failed',
  },
]

export const evidenceRecords: EvidenceRecord[] = rawEvidence.map((e) => ({
  ...e,
  sha256: generateHash(e.id + e.timestamp),
  custody: custodyFor(e.id, e.timestamp, e.location, e.officerName),
}))

export const alerts: AlertItem[] = [
  {
    id: 'AL-1', severity: 'high', title: 'High priority', body: 'Positive test detected on Evidence #NT-2026-00142. Location verified.',
    timestamp: '2026-09-09T14:33:00+05:30',
  },
  {
    id: 'AL-2', severity: 'medium', title: 'Sync warning', body: '3 evidence records are waiting for synchronization.',
    timestamp: '2026-09-09T13:50:00+05:30',
  },
  {
    id: 'AL-3', severity: 'low', title: 'System verified', body: 'Device integrity check completed on NCB-FIELD-TAB-0087.',
    timestamp: '2026-09-09T09:00:00+05:30',
  },
]

export const substanceReactionMap: { substance: string; color: string; kit: string }[] = [
  { substance: 'Suspected Cocaine', color: 'Blue', kit: 'KIT-COC-04' },
  { substance: 'Suspected Heroin / Opiates', color: 'Purple', kit: 'KIT-OPI-01' },
  { substance: 'Suspected MDMA', color: 'Purple-black', kit: 'KIT-MDMA-03' },
  { substance: 'Suspected Cannabis (THC)', color: 'Orange-brown', kit: 'KIT-THC-02' },
  { substance: 'Suspected Methamphetamine', color: 'Orange-red', kit: 'KIT-METH-05' },
]

export function nextEvidenceId() {
  const nums = evidenceRecords.map((e) => parseInt(e.id.split('-')[2], 10))
  const next = Math.max(...nums) + 1
  return `NT-2026-${String(next).padStart(5, '0')}`
}
