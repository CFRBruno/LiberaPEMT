import { useState } from 'react'
import { useStore } from '../lib/store.js'
import { fmtPct, nivel, NIVEL_BAR, NIVEL_CLS, useFrota } from '../lib/frota.js'
import { fmtBR, nowStamp } from '../lib/dates.js'

export default function Frota({ user }) {
  const store = useStore()
  const { indisp, total, taxa, meta, regs, faltam } = useFrota()
  const [novo, setNovo] = useState('')
  const [data, setData] = useState(nowStamp().slice(0, 10))
  const [obs, setObs] = useState('')
  const [metaNova, setMetaNova] = useState('')
  const n = nivel(taxa, meta)
  const escala = Math.max(meta * 3, taxa ?? 0, 1)

  const salvar = async (e) => {
    e.preventDefault()
    const t = parseInt(novo, 10)
    if (!(t > 0)) return
    const stamp = `${data}T${nowStamp().slice(11)}`
    await store.batch([{ col: 'frota', id: stamp.replace(':', '-'), data: { stamp, data, total: t, obs, por: user.nome } }])
    setNovo(''); setObs('')
  }
  const salvarMeta = async (e) => {
    e.preventDefault()
    const m = parseFloat(String(metaNova).replace(',', '.'))
    if (!(m > 0 && m < 100)) return
    await store.batch([{ col: 'config', id: 'geral', merge: true, data: { meta: m } }])
    setMetaNova('')
  }
  const kpi = (label, v, cls = '') => (
    <div className="rounded-lg border bg-black/25 p-3"><div className="label">{label}</div><div className={`tagid mt-1 text-2xl font-bold ${cls}`}>{v}</div></div>
  )
  return (
    <div className="mx-auto grid max-w-5xl gap-3 lg:grid-cols-2">
      <section className="corners rounded-xl border bg-panel p-4 lg:col-span-2">
        <h2 className="label mb-2">Taxa de indisponibilidade</h2>
        <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
          <div className={`tagid text-5xl font-bold ${NIVEL_CLS[n]} [text-shadow:0_0_18px_currentColor]`}>{fmtPct(taxa)}</div>
          <div className="pb-1 text-sm text-mute">{indisp} indisponíveis ÷ {total ?? '?'} de frota · meta {meta}%</div>
        </div>
        {/* barra com marcador da meta */}
        <div className="relative mt-4 h-3 rounded-full bg-black/40">
          <div className={`h-full rounded-full transition-all duration-700 ${NIVEL_BAR[n]}`} style={{ width: `${Math.min(100, ((taxa ?? 0) / escala) * 100)}%` }} />
          <div className="absolute -top-1 h-5 w-0.5 bg-brand shadow-[0_0_8px_var(--color-brand)]" style={{ left: `${(meta / escala) * 100}%` }} title={`Meta ${meta}%`} />
        </div>
        <div className="mt-1 flex justify-between text-[11px] text-mute"><span>0%</span><span className="text-brand">meta {meta}%</span><span>{escala.toFixed(0)}%</span></div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {kpi('Indisponíveis', indisp)}
          {kpi('Frota total', total ?? '—')}
          {kpi('Meta', `${meta}%`, 'text-brand')}
          {kpi(faltam ? 'Faltam liberar' : 'Situação', total == null ? '—' : faltam ? faltam : 'Na meta ✓', faltam ? 'text-red-400' : 'text-green-400')}
        </div>
      </section>

      <div className="rounded-xl border bg-panel p-4">
        <h3 className="label mb-2">Atualizar frota total</h3>
        <form onSubmit={salvar} className="grid grid-cols-2 gap-2">
          <input required type="number" min="1" inputMode="numeric" placeholder={`Nova frota (atual: ${total ?? '—'})`} value={novo} onChange={(e) => setNovo(e.target.value)} className="p-2" />
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="p-2" />
          <input placeholder="Motivo (ex.: 3 máquinas novas)" value={obs} onChange={(e) => setObs(e.target.value)} className="col-span-2 p-2" />
          <button className="bg-brand col-span-2 rounded-lg p-2">Salvar frota</button>
        </form>
        <form onSubmit={salvarMeta} className="mt-4 flex gap-2 border-t pt-3">
          <input placeholder={`Meta (%) — atual ${meta}`} value={metaNova} onChange={(e) => setMetaNova(e.target.value)} inputMode="decimal" className="flex-1 p-2" />
          <button className="rounded-lg border px-3">Alterar meta</button>
        </form>
      </div>

      <section className="rounded-xl border bg-panel p-4">
        <h3 className="label mb-2">Histórico da frota</h3>
        {!regs.length && <p className="text-sm text-mute">Defina a frota total para calcular a taxa.</p>}
        <div className="max-h-64 overflow-y-auto">
          {regs.map((r, i) => (
            <div key={r.id} className="flex items-center justify-between gap-2 border-t py-1.5 text-sm first:border-0">
              <span><b className="tagid">{r.total}</b> {i === 0 && <span className="rounded bg-brand/15 px-1.5 text-xs text-brand">atual</span>}<span className="block text-xs text-mute">{r.obs}</span></span>
              <span className="text-right text-xs text-mute">{fmtBR(r.data)}<br />{r.por}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
