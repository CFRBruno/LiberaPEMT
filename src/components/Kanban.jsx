import { useEffect, useMemo, useRef, useState } from 'react'
import { useCol, useStore } from '../lib/store.js'
import { addDays, addMes, dow, fmtShort, MESES, proxDiaUtil, todayISO, weekStart } from '../lib/dates.js'
import Mensal from './Mensal.jsx'
import TaxaBanner from './TaxaBanner.jsx'
import { EquipIcon, Legenda } from './EquipIcon.jsx'
import { diasTxt, STATUS_CLS } from '../lib/constants.js'
import { ServiceChip } from './ServiceChips.jsx'
import { isLiberado } from '../lib/liberado.js'
import EquipModal from './EquipModal.jsx'

export default function Kanban({ user, onFrota }) {
  const store = useStore()
  const eqs = useCol('equipamentos')
  const users = useCol('users')
  const [ws, setWs] = useState(weekStart(proxDiaUtil(todayISO())))
  const [open, setOpen] = useState(null)
  const [modo, setModo] = useState('semana')
  const [mes, setMes] = useState(proxDiaUtil(todayISO()).slice(0, 7))
  const [filter, setFilter] = useState('')
  const ativos = useMemo(() => eqs.filter((e) => e.ativo).filter((e) => !filter || `${e.tag} ${e.modelo} ${e.descricao}`.toLowerCase().includes(filter.toLowerCase())), [eqs, filter])
  const days = [0, 1, 2, 3, 4].map((i) => addDays(ws, i))
  // Itens com data fora da semana exibida ficam contados à parte.
  const semData = ativos.filter((e) => !e.dia)
  const foraSemana = ativos.filter((e) => e.dia && (e.dia < ws || e.dia > addDays(ws, 4))).length
  const move = (tag, dia) => store.batch([{ col: 'equipamentos', id: tag, data: { dia: dia || null }, merge: true }])
  const drop = (e, dia) => { e.preventDefault(); const t = e.dataTransfer.getData('text/plain'); if (t) move(t, dia) }

  const card = (e) => (
    <div key={e.id} draggable onDragStart={(ev) => ev.dataTransfer.setData('text/plain', e.id)} onClick={() => setOpen(e.id)}
      className={`cursor-pointer rounded-lg border p-2 shadow-sm glow ${isLiberado(e) ? 'border-green-500 bg-green-500/10' : 'bg-panel'}`}>
      <div className="flex flex-wrap items-center justify-between gap-x-1">
        <b className="tagid text-sm">{e.tag}{isLiberado(e) && <span className="ml-1 text-green-400">✔ Liberado</span>}</b>
        <span className={`rounded-lg px-1.5 text-[10px] ${STATUS_CLS[e.status] || 'bg-panel2'}`}>{e.status}</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-mute"><EquipIcon e={e} size={15} /><span className="truncate">{e.modelo}</span></div>
      <div className="mt-0.5 text-[11px] text-mute">{diasTxt(e)}</div>
      {!!e.servicos?.length && <div className="mt-1 flex flex-wrap gap-1">{e.servicos.map((s) => <ServiceChip key={s.id} s={s} />)}</div>}
      {e.status === 'Manutenção' && !isLiberado(e) && !e.servicos?.length && <div className="mt-1 text-[11px] text-red-400">⚠ sem serviços definidos</div>}
    </div>
  )
  // Em PC: 6 colunas na tela, cada uma com rolagem vertical própria.
  // Em celular/tablet: colunas em carrossel horizontal com "snap", abrindo no dia atual.
  const column = ({ title, sub, k, items, today }) => {
    const alerta = k === 'sem' && items.length > 0
    return (
    <section key={k} data-col={k} onDragOver={(e) => e.preventDefault()} onDrop={(e) => drop(e, k === 'sem' ? null : k)}
      className={`corners flex w-[84vw] max-w-sm shrink-0 snap-start flex-col rounded-xl border p-2 lg:h-full lg:min-h-0 lg:w-auto lg:max-w-none lg:min-w-0 ${k === 'sem' ? `sem-col ${alerta ? 'border-dashed border-red-400/60 bg-red-500/5' : 'border-dashed bg-black/25'}` : today ? 'bg-brand/10 ring-2 ring-brand/60' : 'bg-black/25'}`}>
      {k === 'sem' && <i className="sem-divider" />}
      <h3 className="label mb-2 flex shrink-0 items-center justify-between gap-2 !text-ink">
        <span className="flex items-center gap-1.5">{k === 'sem' && <span className={alerta ? 'text-red-400' : 'text-green-400'}>{alerta ? '⚠' : '✓'}</span>}{title}</span>
        {k === 'sem'
          ? <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${alerta ? 'alert-pulse bg-red-500 text-white' : 'bg-green-500/15 text-green-300'}`}>{alerta ? items.length : 'ok'}</span>
          : <span className="font-normal text-mute">{sub} · {items.length}</span>}
      </h3>
      {k === 'sem' && <p className={`-mt-1 mb-2 text-[11px] ${alerta ? 'text-red-300' : 'text-mute'}`}>{alerta ? 'Equipamentos sem dia definido' : 'Tudo programado'}</p>}
      <div className="min-h-0 flex-1 space-y-2 lg:overflow-y-auto lg:pr-0.5">{[...items].sort((a, b) => isLiberado(a) - isLiberado(b)).map(card)}</div>
    </section>
    )
  }
  const cols = [{ k: 'sem', title: 'Sem previsão', items: semData }, ...days.map((d) => ({ k: d, title: dow(d), sub: fmtShort(d), items: ativos.filter((e) => e.dia === d), today: d === todayISO() }))]

  const strip = useRef(null)
  const [ativa, setAtiva] = useState(null)
  const goTo = (k, smooth = true) => {
    const el = strip.current?.querySelector(`[data-col="${k}"]`)
    if (el && strip.current) strip.current.scrollTo({ left: el.offsetLeft - strip.current.offsetLeft - 4, behavior: smooth ? 'smooth' : 'auto' })
  }
  // ao abrir / trocar de semana: posiciona no dia atual (ou na segunda, se o dia atual não está na semana)
  useEffect(() => {
    const alvo = days.includes(todayISO()) ? todayISO() : days[0]
    setAtiva(alvo); goTo(alvo, false)
  }, [ws, modo]) // eslint-disable-line
  const onScroll = () => {
    const c = strip.current; if (!c) return
    const kids = [...c.querySelectorAll('[data-col]')]
    const x = c.scrollLeft + c.offsetLeft
    const near = kids.reduce((m, el) => (Math.abs(el.offsetLeft - x) < Math.abs(m.offsetLeft - x) ? el : m), kids[0])
    setAtiva(near?.dataset.col)
  }

  const seg = (m, l) => <button onClick={() => setModo(m)} className={`px-3 py-1 text-sm ${modo === m ? 'bg-brand' : 'text-mute'}`}>{l}</button>
  return (
    <div>
      <TaxaBanner onFrota={onFrota} />
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex overflow-hidden rounded-lg border">{seg('semana', 'Semana')}{seg('mes', 'Mês')}</div>
        {modo === 'semana' ? (<>
          <button onClick={() => setWs(addDays(ws, -7))} className="rounded-lg bg-panel px-3 py-1 shadow">←</button>
          <b>Semana {fmtShort(ws)} – {fmtShort(addDays(ws, 4))}</b>
          <button onClick={() => setWs(addDays(ws, 7))} className="rounded-lg bg-panel px-3 py-1 shadow">→</button>
          <button onClick={() => setWs(weekStart(proxDiaUtil(todayISO())))} className="rounded-lg bg-panel px-3 py-1 text-sm shadow">Hoje</button>
        </>) : (<>
          <button onClick={() => setMes(addMes(mes, -1))} className="rounded-lg bg-panel px-3 py-1 shadow">←</button>
          <b>{MESES[+mes.slice(5, 7) - 1]} {mes.slice(0, 4)}</b>
          <button onClick={() => setMes(addMes(mes, 1))} className="rounded-lg bg-panel px-3 py-1 shadow">→</button>
          <button onClick={() => setMes(proxDiaUtil(todayISO()).slice(0, 7))} className="rounded-lg bg-panel px-3 py-1 text-sm shadow">Hoje</button>
        </>)}
        <input placeholder="Buscar TAG/modelo…" value={filter} onChange={(e) => setFilter(e.target.value)} className="ml-auto rounded-lg border px-2 py-1 text-sm" />
      </div>
      {modo === 'mes' ? (
        <div className="tab-enter"><Mensal mes={mes} ativos={ativos} semData={semData} move={move} onOpen={setOpen} card={card} /></div>
      ) : (<>
      {foraSemana > 0 && <p className="mb-2 text-xs text-mute">{foraSemana} equipamento(s) planejado(s) em outras semanas.</p>}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-x-6 gap-y-1"><p className="hidden text-xs text-mute lg:block">Arraste os cartões entre as colunas. Setas ← → trocam de aba.</p><Legenda /></div>
      {/* atalhos de dia (só celular/tablet) */}
      <div className="mb-2 flex gap-1 overflow-x-auto lg:hidden">
        {cols.map((c) => (
          <button key={c.k} onClick={() => goTo(c.k)} className={`shrink-0 rounded-lg border px-3 py-1.5 text-sm ${c.k === 'sem' ? 'mr-2 border-dashed' : ''} ${ativa === c.k ? 'border-brand bg-brand/15 text-brand' : 'bg-panel text-mute'}`}>
            {c.k === 'sem' && c.items.length > 0 && <span className="alert-pulse mr-1 inline-block h-2 w-2 rounded-full bg-red-500" />}{c.k === 'sem' ? 'Sem prev.' : c.title} <span className="text-xs opacity-70">{c.items.length}</span>
          </button>
        ))}
      </div>
      <div ref={strip} onScroll={onScroll} className="stagger -mx-3 flex items-start snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-4 lg:mx-0 lg:grid lg:items-stretch lg:h-[calc(100dvh-20rem)] lg:min-h-[26rem] lg:grid-cols-[1.1fr_repeat(5,minmax(0,1fr))] lg:grid-rows-1 lg:overflow-visible lg:px-0 lg:pb-0">
        {cols.map(column)}
      </div>
      </>)}
      {open && <EquipModal eq={eqs.find((e) => e.id === open)} users={users} onClose={() => setOpen(null)} weekStartISO={ws} />}
    </div>
  )
}
