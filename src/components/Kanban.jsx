import { useMemo, useState } from 'react'
import { useCol, useStore } from '../lib/store.js'
import { addDays, dow, fmtShort, todayISO, weekStart } from '../lib/dates.js'
import { STATUS_CLS } from '../lib/constants.js'
import { ServiceChip } from './ServiceChips.jsx'
import { isLiberado } from '../lib/liberado.js'
import EquipModal from './EquipModal.jsx'

export default function Kanban({ user }) {
  const store = useStore()
  const eqs = useCol('equipamentos')
  const users = useCol('users')
  const [ws, setWs] = useState(weekStart(todayISO()))
  const [open, setOpen] = useState(null)
  const [filter, setFilter] = useState('')
  const ativos = useMemo(() => eqs.filter((e) => e.ativo).filter((e) => !filter || `${e.tag} ${e.modelo} ${e.descricao}`.toLowerCase().includes(filter.toLowerCase())), [eqs, filter])
  const days = [0, 1, 2, 3, 4, 5].map((i) => addDays(ws, i))
  // Itens com data fora da semana exibida ficam contados à parte.
  const semData = ativos.filter((e) => !e.dia)
  const foraSemana = ativos.filter((e) => e.dia && (e.dia < ws || e.dia > addDays(ws, 6))).length
  const move = (tag, dia) => store.batch([{ col: 'equipamentos', id: tag, data: { dia: dia || null }, merge: true }])
  const drop = (e, dia) => { e.preventDefault(); const t = e.dataTransfer.getData('text/plain'); if (t) move(t, dia) }

  const Card = ({ e }) => (
    <div draggable onDragStart={(ev) => ev.dataTransfer.setData('text/plain', e.id)} onClick={() => setOpen(e.id)}
      className={`cursor-pointer rounded-lg border p-2 shadow-sm glow ${isLiberado(e) ? 'border-green-500 bg-green-500/10' : 'bg-panel'}`}>
      <div className="flex items-center justify-between gap-1">
        <b className="tagid text-sm">{e.tag}{isLiberado(e) && <span className="ml-1 text-green-400">✔ Liberado</span>}</b>
        <span className={`rounded px-1.5 text-[10px] ${STATUS_CLS[e.status] || 'bg-panel2'}`}>{e.status}</span>
      </div>
      <div className="truncate text-xs text-mute">{e.modelo}</div>
      <div className="mt-0.5 text-[11px] text-mute">{e.dias ?? '?'} dias no status</div>
      {!!e.servicos?.length && <div className="mt-1 flex flex-wrap gap-1">{e.servicos.map((s) => <ServiceChip key={s.id} s={s} />)}</div>}
      {e.status === 'Manutenção' && !isLiberado(e) && !e.servicos?.length && <div className="mt-1 text-[11px] text-red-400">⚠ sem serviços definidos</div>}
    </div>
  )
  const Column = ({ title, sub, k, items, today }) => (
    <section onDragOver={(e) => e.preventDefault()} onDrop={(e) => drop(e, k === 'sem' ? null : k)}
      className={`w-64 shrink-0 corners rounded-xl border p-2 ${today ? 'bg-brand/10 ring-2 ring-brand/60' : 'bg-black/25'}`}>
      <h3 className="label mb-2 flex justify-between !text-ink">{title}<span className="font-normal text-mute">{sub} · {items.length}</span></h3>
      <div className="space-y-2">{[...items].sort((a, b) => isLiberado(a) - isLiberado(b)).map((e) => <Card key={e.id} e={e} />)}</div>
    </section>
  )

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button onClick={() => setWs(addDays(ws, -7))} className="rounded bg-panel px-3 py-1 shadow">←</button>
        <b>Semana {fmtShort(ws)} – {fmtShort(addDays(ws, 5))}</b>
        <button onClick={() => setWs(addDays(ws, 7))} className="rounded bg-panel px-3 py-1 shadow">→</button>
        <button onClick={() => setWs(weekStart(todayISO()))} className="rounded bg-panel px-3 py-1 text-sm shadow">Hoje</button>
        <input placeholder="Buscar TAG/modelo…" value={filter} onChange={(e) => setFilter(e.target.value)} className="ml-auto rounded border px-2 py-1 text-sm" />
      </div>
      {foraSemana > 0 && <p className="mb-2 text-xs text-mute">{foraSemana} equipamento(s) planejado(s) em outras semanas.</p>}
      <p className="mb-2 text-xs text-mute">Arraste os cartões entre as colunas (no celular: abra o cartão e use “Dia”).</p>
      <div className="stagger flex gap-3 overflow-x-auto pb-4">
        <Column title="Sem previsão" k="sem" items={semData} />
        {days.map((d) => <Column key={d} k={d} title={dow(d)} sub={fmtShort(d)} items={ativos.filter((e) => e.dia === d)} today={d === todayISO()} />)}
      </div>
      {open && <EquipModal eq={eqs.find((e) => e.id === open)} users={users} onClose={() => setOpen(null)} weekStartISO={ws} />}
    </div>
  )
}
