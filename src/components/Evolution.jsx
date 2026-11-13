import { useMemo, useState } from 'react'
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useCol } from '../lib/store.js'
import { addDays, fmtShort, todayISO, weekStart } from '../lib/dates.js'

const TIPOS = [['Liberação', '#2563eb'], ['Pintura', '#7c3aed'], ['Lavagem', '#0d9488']]

// Semanas do mês (seg–dom). Base = nº de indisponíveis na 1ª importação do mês.
export default function Evolution() {
  const eqs = useCol('equipamentos')
  const snaps = useCol('snapshots')
  const [mes, setMes] = useState(todayISO().slice(0, 7))

  const { data, base } = useMemo(() => {
    const doMes = snaps.filter((s) => s.data.startsWith(mes)).sort((a, b) => a.stamp.localeCompare(b.stamp))
    const base = doMes[0]?.total ?? null
    const first = `${mes}-01`
    const last = addDays(`${mes}-01`.slice(0, 8) + '01', 0)
    const d = new Date(+mes.slice(0, 4), +mes.slice(5, 7), 0).getDate()
    const end = `${mes}-${String(d).padStart(2, '0')}`
    const rows = []
    for (let w = weekStart(first), i = 1; w <= end; w = addDays(w, 7), i++) {
      const we = addDays(w, 6)
      const row = { semana: `S${i} (${fmtShort(w)})` }
      TIPOS.forEach(([t]) => {
        row[t] = eqs.reduce((n, e) => n + (e.servicos || []).filter((s) => s.tipo === t && s.resultado === 'realizado' && s.dataRealizacao >= w && s.dataRealizacao <= we).length, 0)
      })
      const ate = doMes.filter((s) => s.data <= we)
      row.restantes = w > todayISO() ? null : (ate.length ? ate[ate.length - 1].total : base)
      rows.push(row)
    }
    return { data: rows, base }
  }, [eqs, snaps, mes])

  return (
    <div className="rounded-xl bg-white p-3 shadow">
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <h2 className="font-semibold">Evolução semanal</h2>
        <input type="month" value={mes} onChange={(e) => setMes(e.target.value)} className="rounded border p-1 text-sm" />
        <span className="text-sm text-slate-500">{base == null ? 'Sem importação neste mês.' : `Base: ${base} indisponíveis na 1ª importação do mês`}</span>
      </div>
      <div className="h-80">
        <ResponsiveContainer>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="semana" fontSize={12} />
            <YAxis allowDecimals={false} fontSize={12} />
            <Tooltip /><Legend />
            {base != null && <ReferenceLine y={base} stroke="#94a3b8" strokeDasharray="6 4" label={{ value: 'base', fontSize: 11 }} />}
            {TIPOS.map(([t, c]) => <Bar key={t} dataKey={t} name={`${t} (realizadas)`} fill={c} />)}
            <Line dataKey="restantes" name="Indisponíveis (fim da semana)" stroke="#0f172a" strokeWidth={2} connectNulls />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-slate-500">Barras: serviços marcados como “Realizado” na semana (pela data de realização). Linha: total de indisponíveis segundo a última importação de cada semana.</p>
    </div>
  )
}
