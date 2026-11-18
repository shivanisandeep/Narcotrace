import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { EvidenceRecord, Form6Record } from '@/types'
import { evidenceRecords as seedEvidence, officer } from '@/lib/mock-data'

const STORAGE_KEY = 'vigil.evidence.v1'
const AUTH_KEY = 'vigil.auth.v1'
const FORM6_KEY = 'narcotrace.form6.v1'

interface AppDataContextValue {
  evidence: EvidenceRecord[]
  addEvidence: (record: EvidenceRecord) => void
  getEvidence: (id: string) => EvidenceRecord | undefined
  form6s: Form6Record[]
  saveForm6: (f: Form6Record) => void
  getForm6: (evidenceId: string) => Form6Record | undefined
  syncOne: (id: string) => void
  syncAll: () => void
  isSyncing: boolean
  isAuthenticated: boolean
  login: () => void
  logout: () => void
}

const AppDataContext = createContext<AppDataContextValue | null>(null)

function loadEvidence(): EvidenceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore parse errors, fall back to seed
  }
  return seedEvidence
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [evidence, setEvidence] = useState<EvidenceRecord[]>(() => loadEvidence())
  const [isSyncing, setIsSyncing] = useState(false)
  const [form6s, setForm6s] = useState<Form6Record[]>(() => {
    try { return JSON.parse(localStorage.getItem(FORM6_KEY) || '[]') } catch { return [] }
  })
  useEffect(() => {
    try { localStorage.setItem(FORM6_KEY, JSON.stringify(form6s)) } catch { /* storage unavailable */ }
  }, [form6s])
  const saveForm6 = (f: Form6Record) =>
    setForm6s((prev) => (prev.some((x) => x.id === f.id) ? prev.map((x) => (x.id === f.id ? f : x)) : [...prev, f]))
  const getForm6 = (evidenceId: string) =>
    form6s.filter((f) => f.evidenceId === evidenceId).sort((a, b) => b.revision - a.revision)[0]
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try { return localStorage.getItem(AUTH_KEY) === '1' } catch { return false }
  })

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(evidence)) } catch { /* storage unavailable */ }
  }, [evidence])

  const addEvidence = (record: EvidenceRecord) => {
    setEvidence((prev) => [record, ...prev])
  }

  const getEvidence = (id: string) => evidence.find((e) => e.id === id)

  const syncOne = (id: string) => {
    setEvidence((prev) => prev.map((e) => (e.id === id ? { ...e, syncStatus: 'synced' } : e)))
  }

  const syncAll = () => {
    setIsSyncing(true)
    setEvidence((prev) => prev.map((e) => (e.syncStatus === 'pending' || e.syncStatus === 'failed' ? { ...e, syncStatus: 'uploading' } : e)))
    setTimeout(() => {
      setEvidence((prev) => prev.map((e) => (e.syncStatus === 'uploading' ? { ...e, syncStatus: 'synced' } : e)))
      setIsSyncing(false)
    }, 1800)
  }

  const login = () => {
    try { localStorage.setItem(AUTH_KEY, '1') } catch { /* ignore */ }
    setIsAuthenticated(true)
  }
  const logout = () => {
    try { localStorage.removeItem(AUTH_KEY) } catch { /* ignore */ }
    setIsAuthenticated(false)
  }

  const value = useMemo(
    () => ({ evidence, addEvidence, getEvidence, form6s, saveForm6, getForm6, syncOne, syncAll, isSyncing, isAuthenticated, login, logout }),
    [evidence, form6s, isSyncing, isAuthenticated]
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider')
  return ctx
}

export const currentOfficer = officer
