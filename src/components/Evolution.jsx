import { useMemo, useState } from 'react'
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useCol } from '../lib/store.js'
import { dataLiberacao } from '../lib/liberado.js'
import { addDays, fmtShort, todayISO, weekStart } from '../lib/dates.js'

const TIPOS = [['Liberação', '#ef8024'], ['Pintura', '#22d3ee'], ['Lavagem', '#a78bfa']]

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
      const ref = ate.length ? ate[ate.length - 1] : doMes[0]
      const porTag = Object.fromEntries(eqs.map((e) => [e.id, e]))
      // Indisponíveis = lista da última importação, menos os que já tiveram Liberação realizada até o fim da semana
      row.restantes = w > todayISO() || !ref ? null : ref.itens.filter((i) => { const d = dataLiberacao(porTag[i.tag]); return !(d && d <= we) }).length
      rows.push(row)
    }
    return { data: rows, base }
  }, [eqs, snaps, mes])

  return (
    <div className="corners rounded-xl border bg-panel p-3">
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <h2 className="font-semibold">Evolução semanal</h2>
        <input type="month" value={mes} onChange={(e) => setMes(e.target.value)} className="rounded-lg border p-1 text-sm" />
        <span className="text-sm text-mute">{base == null ? 'Sem importação neste mês.' : `Base: ${base} indisponíveis na 1ª importação do mês`}</span>
      </div>
      <div className="h-64 sm:h-80 xl:h-[26rem]">
        <ResponsiveContainer>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="semana" fontSize={12} />
            <YAxis allowDecimals={false} fontSize={12} />
            <Tooltip /><Legend />
            {base != null && <ReferenceLine y={base} stroke="#94a3b8" strokeDasharray="6 4" label={{ value: 'base', fontSize: 11 }} />}
            {TIPOS.map(([t, c]) => <Bar key={t} dataKey={t} name={`${t} (realizadas)`} fill={c} />)}
            <Line dataKey="restantes" name="Indisponíveis (fim da semana)" stroke="#e8edf5" strokeWidth={2} connectNulls />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-mute">Barras: serviços marcados como “Realizado” na semana (pela data de realização). Linha: indisponíveis ao fim da semana (última importação, descontados os equipamentos com Liberação realizada).</p>
    </div>
  )
}
