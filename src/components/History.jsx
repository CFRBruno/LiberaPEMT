import { useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useCol } from '../lib/store.js'
import { fmtBR, fmtShort } from '../lib/dates.js'
import { STATUS_CLS } from '../lib/constants.js'
import { dataLiberacao, isLiberado } from '../lib/liberado.js'

const Card = ({ title, children, className = '' }) => (
  <section className={`corners rounded-xl border bg-panel p-4 ${className}`}>
    <h2 className="label mb-3">{title}</h2>{children}
  </section>
)
const Kpi = ({ label, value, sub, cls = '' }) => (
  <div className="rounded-xl border bg-panel p-3">
    <div className="label">{label}</div>
    <div className={`tagid mt-1 text-2xl font-bold ${cls}`}>{value}</div>
    <div className="mt-0.5 truncate text-xs text-mute">{sub}</div>
  </div>
)
// Ilustração leve para estados vazios (gráfico fantasma)
const Vazio = ({ texto }) => (
  <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-mute">
    <svg width="120" height="56" viewBox="0 0 120 56" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 5" className="opacity-60">
      <path d="M4 50h112M4 50V6" strokeDasharray="0" opacity=".5" /><path d="M10 40c14-4 20-24 34-20s20 18 34 6 22-22 38-18" stroke="var(--color-brand)" />
    </svg>
    {texto}
  </div>
)

export default function History() {
  const snaps = useCol('snapshots').sort((a, b) => a.stamp.localeCompare(b.stamp))
  const eqs = useCol('equipamentos')
  const [open, setOpen] = useState(null)
  const recentes = [...snaps].reverse()
  const ultimo = snaps[snaps.length - 1], anterior = snaps[snaps.length - 2]
  const delta = ultimo && anterior ? ultimo.total - anterior.total : null
  const liberados = eqs.map((e) => ({ ...e, quando: dataLiberacao(e) || (!e.ativo && e.liberadoEm) })).filter((e) => e.quando).sort((a, b) => b.quando.localeCompare(a.quando))
  const maisTempo = eqs.filter((e) => e.ativo && !isLiberado(e) && e.dias != null).sort((a, b) => b.dias - a.dias).slice(0, 6)
  const maxDias = Math.max(1, ...maisTempo.map((e) => e.dias))
  const serie = snaps.map((s) => ({ d: fmtShort(s.data), total: s.total }))
  const cor = (d) => (d > 90 ? 'bg-red-500' : d > 30 ? 'bg-yellow-400' : 'bg-green-500')

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Importações" value={snaps.length} sub={ultimo ? `última em ${fmtBR(ultimo.data)}` : 'nenhuma ainda'} />
        <Kpi label="Indisponíveis na última" value={ultimo?.total ?? '—'} sub={delta == null ? 'sem comparação' : delta === 0 ? 'igual à anterior' : `${delta > 0 ? '▲ +' : '▼ '}${delta} vs. anterior`} cls={delta > 0 ? 'text-red-400' : delta < 0 ? 'text-green-400' : ''} />
        <Kpi label="Equipamentos liberados" value={liberados.length} sub="desde o início" cls="text-green-400" />
        <Kpi label="Maior tempo parado" value={maisTempo[0] ? `${maisTempo[0].dias}d` : '—'} sub={maisTempo[0]?.tag || 'sem dados'} cls="text-brand" />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card title="Indisponíveis a cada importação">
          {serie.length < 2 ? <Vazio texto={serie.length ? 'Faça mais uma importação para ver a evolução.' : 'Importe a primeira lista para começar o histórico.'} /> : (
            <div className="h-48">
              <ResponsiveContainer>
                <AreaChart data={serie}>
                  <defs><linearGradient id="gH" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef8024" stopOpacity=".5" /><stop offset="100%" stopColor="#ef8024" stopOpacity="0" /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="d" fontSize={11} /><YAxis allowDecimals={false} fontSize={11} width={28} /><Tooltip />
                  <Area type="monotone" dataKey="total" name="Indisponíveis" stroke="#ef8024" strokeWidth={2} fill="url(#gH)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>)}
        </Card>

        <Card title="Maior tempo no status atual">
          {!maisTempo.length ? <Vazio texto="Sem equipamentos indisponíveis no momento." /> : (
            <ul className="space-y-2">
              {maisTempo.map((e) => (
                <li key={e.id} className="text-sm">
                  <div className="flex items-center justify-between"><span><b className="tagid">{e.tag}</b> <span className="text-mute">{e.modelo}</span></span><b className="tagid">{e.dias}d</b></div>
                  <div className="mt-1 h-1.5 rounded-full bg-black/40"><div className={`h-full rounded-full ${cor(e.dias)}`} style={{ width: `${(e.dias / maxDias) * 100}%` }} /></div>
                </li>
              ))}
            </ul>)}
        </Card>

        <Card title="Importações anteriores">
          {!recentes.length ? <Vazio texto="Nenhuma importação registrada." /> : (
            <ol className="relative ml-2 space-y-3 border-l border-line pl-4">
              {recentes.map((s) => (
                <li key={s.id} className="relative">
                  <span className="absolute -left-[1.4rem] top-1 h-2.5 w-2.5 rounded-full bg-brand shadow-[0_0_8px_var(--color-brand)]" />
                  <button onClick={() => setOpen(open === s.id ? null : s.id)} className="flex w-full items-center justify-between gap-2 text-left text-sm">
                    <b>{fmtBR(s.data)} <span className="font-normal text-mute">{s.stamp.slice(11)}</span></b>
                    <span className="flex gap-1.5 whitespace-nowrap text-xs"><span className="rounded-full border px-2">{s.total} equip.</span><span className="rounded-full bg-orange-500/15 px-2 text-orange-300">+{s.novos?.length || 0}</span><span className="rounded-full bg-green-500/15 px-2 text-green-300">−{s.liberados?.length || 0}</span></span>
                  </button>
                  {open === s.id && (
                    <table className="mt-2 w-full text-left text-xs"><tbody>
                      {s.itens.map((i) => <tr key={i.tag} className="border-t"><td className="py-0.5 font-medium"><span className="tagid">{i.tag}</span></td><td className="truncate">{i.modelo}</td><td><span className={`rounded px-1 ${STATUS_CLS[i.status] || ''}`}>{i.status}</span></td><td>{i.dias}d</td></tr>)}
                    </tbody></table>)}
                </li>
              ))}
            </ol>)}
        </Card>

        <Card title="Equipamentos liberados">
          {!liberados.length ? <Vazio texto="Quando uma Liberação for marcada como realizada, o equipamento aparece aqui." /> : (
            <ol className="relative ml-2 space-y-2 border-l border-line pl-4">
              {liberados.map((e) => (
                <li key={e.id} className="relative flex items-center justify-between gap-2 text-sm">
                  <span className="absolute -left-[1.4rem] top-1.5 h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                  <span className="min-w-0 truncate"><b className="tagid">{e.tag}</b> <span className="text-mute">{e.modelo}</span></span>
                  <span className="shrink-0 whitespace-nowrap text-xs text-green-300">✔ {fmtBR(e.quando)}</span>
                </li>
              ))}
            </ol>)}
        </Card>
      </div>
    </div>
  )
}
