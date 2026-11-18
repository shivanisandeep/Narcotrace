export type ResultVerdict = 'positive' | 'negative' | 'inconclusive'
export type SyncStatus = 'synced' | 'pending' | 'uploading' | 'failed'

export interface CustodyEvent {
  id: string
  label: string
  timestamp: string
  actor: string
  location: string
  gpsVerified: boolean
  hashVerified: boolean
}

export interface EvidenceRecord {
  id: string // e.g. NT-2026-00142
  caseId: string
  officerId: string
  officerName: string
  testKitId: string
  sampleType: string
  verdict: ResultVerdict
  substance: string
  confidence: number // 0-100
  reactionColor: string
  imageQuality: 'Excellent' | 'Good' | 'Fair' | 'Poor'
  calibrationAccuracy: number
  modelVersion: string
  timestamp: string
  location: string
  lat: number
  lng: number
  temperatureC: number
  lightingLux: number
  deviceId: string
  sha256: string
  syncStatus: SyncStatus
  custody: CustodyEvent[]
  inconclusiveReasons?: string[]
}

export interface OfficerProfile {
  officerId: string
  name: string
  role: string
  department: string
  device: string
  station: string
}

export interface AlertItem {
  id: string
  severity: 'high' | 'medium' | 'low'
  title: string
  body: string
  timestamp: string
}

export interface Form6Editable {
  sampleDescription: string
  place: string
  observations: string
  quantity: string // '' = Pending Input
  witness: string // '' = Pending Input
  remarks: string
}
export interface Form6Audit { at: string; by: string; action: string; detail: string }
export interface Form6Record {
  id: string // F6-<evidenceId>-R<revision>
  evidenceId: string
  caseId: string
  revision: number
  status: 'draft' | 'confirmed'
  generatedAt: string
  generatedBy: string
  confirmedAt?: string
  confirmedBy?: string
  fields: Form6Editable
  history: Form6Audit[]
}
