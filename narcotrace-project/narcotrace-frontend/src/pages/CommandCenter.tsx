import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts'
import { AppShell } from '@/components/layout/AppShell'
import { StatCard } from '@/components/ui/StatCard'
import { ChartCard } from '@/components/evidence/ChartCard'
import { MapPanel } from '@/components/evidence/MapPanel'
import { useAppData } from '@/lib/store'

const COLORS = { positive: '#c4392b', negative: '#2e9b6b', inconclusive: '#c98a2e' }

export default function CommandCenter() {
  const { evidence } = useAppData()

  const positive = evidence.filter((e) => e.verdict === 'positive').length
  const negative = evidence.filter((e) => e.verdict === 'negative').length
  const inconclusive = evidence.filter((e) => e.verdict === 'inconclusive').length
  const pendingSync = evidence.filter((e) => e.syncStatus === 'pending' || e.syncStatus === 'failed').length
  const officers = new Set(evidence.map((e) => e.officerId)).size

  const pieData = [
    { name: 'Positive', value: positive, color: COLORS.positive },
    { name: 'Negative', value: negative, color: COLORS.negative },
    { name: 'Inconclusive', value: inconclusive, color: COLORS.inconclusive },
  ]

  const byDay = new Map<string, number>()
  evidence.forEach((e) => {
    const day = new Date(e.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
    byDay.set(day, (byDay.get(day) ?? 0) + 1)
  })
  const lineData = Array.from(byDay.entries()).map(([day, count]) => ({ day, count })).reverse()

  const byRegion = new Map<string, number>()
  evidence.forEach((e) => {
    const region = e.location.split(',')[0]
    byRegion.set(region, (byRegion.get(region) ?? 0) + 1)
  })
  const regionData = Array.from(byRegion.entries()).map(([region, count]) => ({ region, count }))

  const confidenceBuckets = [
    { bucket: '50–70%', count: evidence.filter((e) => e.confidence >= 50 && e.confidence < 70).length },
    { bucket: '70–85%', count: evidence.filter((e) => e.confidence >= 70 && e.confidence < 85).length },
    { bucket: '85–95%', count: evidence.filter((e) => e.confidence >= 85 && e.confidence < 95).length },
    { bucket: '95–100%', count: evidence.filter((e) => e.confidence >= 95).length },
  ]

  return (
    <AppShell title="Command center" subtitle="Regional forensic intelligence overview">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Total tests" value={evidence.length} />
          <StatCard label="Positive" value={positive} tone="evidence" />
          <StatCard label="Negative" value={negative} tone="verified" />
          <StatCard label="Inconclusive" value={inconclusive} tone="caution" />
          <StatCard label="Pending sync" value={pendingSync} />
          <StatCard label="Active officers" value={officers} />
        </div>

        <ChartCard title="Live field map" sub="Recent evidence locations across Bengaluru">
          <MapPanel records={evidence} />
        </ChartCard>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard title="Test results distribution">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#121a24', border: '1px solid #263440', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex justify-center gap-4 text-xs text-mist-500">
              {pieData.map((d) => (
                <span key={d.name} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                  {d.name} ({d.value})
                </span>
              ))}
            </div>
          </ChartCard>

          <ChartCard title="Tests over time">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2732" vertical={false} />
                <XAxis dataKey="day" stroke="#5c6b78" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#5c6b78" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#121a24', border: '1px solid #263440', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="count" stroke="#4f7fa6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Regional activity">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={regionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2732" vertical={false} />
                <XAxis dataKey="region" stroke="#5c6b78" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#5c6b78" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#121a24', border: '1px solid #263440', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="#4f7fa6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="AI confidence distribution">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={confidenceBuckets}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2732" vertical={false} />
                <XAxis dataKey="bucket" stroke="#5c6b78" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#5c6b78" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#121a24', border: '1px solid #263440', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="#c98a2e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </AppShell>
  )
}
