import { useState } from 'react'
import { useCol } from '../lib/store.js'
import { addDays, addMes, dow, fmtBR, fmtShort, MESES, proxDiaUtil, todayISO, weekStart } from '../lib/dates.js'
import { diasTxt, RESULTADOS, respEfetivos, SERVICOS, SETOR_DO_SERVICO, STATUS_CLS } from '../lib/constants.js'
import { StatusPill } from './ServiceChips.jsx'
import { isLiberado } from '../lib/liberado.js'
import { EquipIcon, equipTexto } from './EquipIcon.jsx'
import EquipView from './EquipView.jsx'
import { useNovos } from '../lib/novos.js'
import Semanal from './Semanal.jsx'
import Mensal from './Mensal.jsx'

// Visão da mão de obra (somente leitura, em tempo real): Dia · Semana · Mês.
export default function Tasks({ user }) {
  const eqs = useCol('equipamentos')
  const users = useCol('users')
  const [modo, setModo] = useState('dia')
  const [day, setDay] = useState(proxDiaUtil(todayISO()))
  const [mes, setMes] = useState(proxDiaUtil(todayISO()).slice(0, 7))
  const [mine, setMine] = useState(user.role === 'tecnico')
  const [open, setOpen] = useState(null)
  const [svcs, setSvcs] = useState(() => [Object.entries(SETOR_DO_SERVICO).find(([, st]) => st === user.setor)?.[0] || SERVICOS[0]])
  const [filtro, setFiltro] = useState('todos')
  const [soMeus, setSoMeus] = useState(false)
  const { novos, marcar, marcarTodos } = useNovos(user)
  const novoKeys = new Set(novos.map((n) => n.key))
  const abrir = (id) => setOpen(id)
  const nome = (u) => users.find((x) => x.username === u)?.nome || u
  const ws = weekStart(day)
  const days = [0, 1, 2, 3, 4].map((i) => addDays(ws, i))
  const ativos = eqs.filter((e) => e.ativo)
  // Aba Serviços: equipamentos vinculados aos tipos de serviço selecionados (vários ao mesmo tempo; nenhum = todos)
  const pend = (r) => (r || 'pendente') !== 'realizado'
  const tipos = svcs.length ? svcs : SERVICOS
  const toggleSvc = (t) => setSvcs((l) => (l.includes(t) ? l.filter((x) => x !== t) : [...l, t]))
  const pendentesDe = (t) => ativos.reduce((n, e) => n + (e.servicos || []).filter((s) => s.tipo === t && pend(s.resultado)).length, 0)
  const doTipo = ativos.map((e) => ({ e, ss: (e.servicos || []).filter((s) => tipos.includes(s.tipo)).map((s) => ({ ...s, resp: respEfetivos(s, users) })) })).filter(({ ss }) => ss.length)
  const contFiltro = (k) => doTipo.reduce((n, { ss }) => n + ss.filter((s) => k === 'todos' || (s.resultado || 'pendente') === k).length, 0)
  const lista = doTipo.map(({ e, ss }) => ({ e, ss: ss.filter((s) => (filtro === 'todos' || (s.resultado || 'pendente') === filtro) && (!soMeus || s.resp.includes(user.username))) }))
    .filter(({ ss }) => ss.length)
    .sort((a, b) => (b.ss.some((s) => pend(s.resultado)) - a.ss.some((s) => pend(s.resultado))) || (a.e.dia || '9').localeCompare(b.e.dia || '9'))
  const list = ativos.filter((e) => e.dia === day).map((e) => ({
    ...e, servicos: (e.servicos || []).map((s) => ({ ...s, resp: respEfetivos(s, users) })).filter((s) => !mine || s.resp.includes(user.username)),
  })).filter((e) => !mine || e.servicos.length)
  const seg = (m, l) => <button onClick={() => setModo(m)} className={`flex-1 px-4 py-2 text-sm ${modo === m ? 'bg-brand' : 'text-mute'}`}>{l}</button>

  return (
    <div className={`mx-auto ${modo === 'dia' ? 'max-w-3xl lg:max-w-none' : ''}`}>
      {novos.length > 0 && (
        <section id="novos" className="corners mb-4 rounded-xl border border-brand/60 bg-brand/10 p-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 whitespace-nowrap font-semibold"><span className="alert-pulse inline-block whitespace-nowrap rounded-full bg-brand px-2.5 py-0.5 text-sm text-black">🔔 {novos.length}</span>{novos.length === 1 ? 'Novo para você' : 'Novos para você'}</h2>
            <button onClick={marcarTodos} className="shrink-0 rounded-lg border px-3 py-1 text-xs">Visto ✓</button>
          </div>
          <ul className="mt-2 space-y-1.5">
            {novos.map((n) => (
              <li key={n.key}><button onClick={() => abrir(n.eq.id)} className="flex w-full items-center justify-between gap-2 rounded-lg border bg-panel px-3 py-2 text-left">
                <span className="min-w-0 truncate"><b>{n.s.tipo}</b> <span className="tagid text-sm text-mute">{n.eq.tag}</span></span>
                <span className="shrink-0 whitespace-nowrap text-xs text-mute">{n.eq.dia ? `${dow(n.eq.dia)} ${fmtShort(n.eq.dia)}` : 'sem previsão'} ›</span>
              </button></li>
            ))}
          </ul>
        </section>
      )}
      <div className="mb-3 flex overflow-hidden rounded-lg border sm:inline-flex sm:w-auto">{seg('dia', 'Dia')}{seg('semana', 'Semana')}{seg('mes', 'Mês')}{seg('servicos', 'Serviços')}</div>

      {modo === 'servicos' ? (
        <section>
          <div className="mb-1 flex gap-1.5 overflow-x-auto pb-1">
            <button onClick={() => setSvcs([])} className={`shrink-0 rounded-lg border px-3 py-2 text-sm ${!svcs.length ? 'border-brand bg-brand/15 text-brand' : 'bg-panel text-mute'}`}>Todos</button>
            {SERVICOS.map((t) => { const n = pendentesDe(t); const on = svcs.includes(t)
              return <button key={t} onClick={() => toggleSvc(t)} aria-pressed={on} className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-sm ${on ? 'border-brand bg-brand/15 text-brand' : 'bg-panel text-mute'}`}>
                <span className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] leading-none ${on ? 'border-brand bg-brand text-black' : ''}`}>{on ? '✓' : ''}</span>{t}{n > 0 && <span className="rounded-full bg-brand px-1.5 text-[11px] font-bold text-black">{n}</span>}</button> })}
          </div>
          <p className="mb-2 text-xs text-mute">Toque para marcar um ou mais serviços.</p>
          <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
            {[['todos', 'Todos'], ...Object.entries(RESULTADOS).map(([k, v]) => [k, v.label])].map(([k, l]) => (
              <button key={k} onClick={() => setFiltro(k)} className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${filtro === k ? 'border-ink/60 bg-panel2 text-ink' : 'text-mute'}`}>
                {k !== 'todos' && <span className={`h-2 w-2 rounded-full ${RESULTADOS[k].dot}`} />}{l} <span className="opacity-60">{contFiltro(k)}</span></button>
            ))}
          </div>
          <label className="mb-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={soMeus} onChange={(e) => setSoMeus(e.target.checked)} /> Só os meus</label>
          <h2 className="mb-2 font-semibold">{svcs.length ? svcs.join(' + ') : 'Todos os serviços'} · {lista.length} equipamento(s)</h2>
          {!lista.length && <p className="rounded-lg bg-panel p-4 text-mute">Nenhum equipamento encontrado{filtro === 'todos' ? '' : ` com resultado "${RESULTADOS[filtro].label.toLowerCase()}"`}.</p>}
          <div className="grid items-start gap-3 lg:grid-cols-2 2xl:grid-cols-3">
            {lista.map(({ e, ss }) => (
              <button key={e.id} onClick={() => abrir(e.id)} className="glow block w-full rounded-xl border bg-panel p-3 text-left">
                <span className="flex items-center justify-between gap-2"><b className="tagid text-lg">{e.tag}</b>
                  <span className={`whitespace-nowrap rounded-md px-2 py-0.5 text-xs ${e.dia ? 'border border-brand/50 text-brand' : 'bg-red-500/15 text-red-300'}`}>{e.dia ? `${dow(e.dia)} ${fmtShort(e.dia)}` : 'sem previsão'}</span></span>
                <span className="mt-0.5 flex items-center gap-2 text-sm text-mute"><EquipIcon e={e} size={18} /><span className="truncate">{e.modelo}</span></span>
                <span className="mt-2 block space-y-1.5">
                  {ss.map((s) => (
                    <span key={s.id} className={`block rounded-lg border px-2.5 py-1.5 ${(s.resultado || 'pendente') === 'realizado' ? 'opacity-75' : ''}`}>
                      <span className="flex items-center justify-between gap-2"><b className="flex items-center gap-1.5">{s.tipo}{novoKeys.has(`${e.id}:${s.id}`) && <span className="rounded bg-brand px-1.5 text-[10px] font-bold text-black">NOVO</span>}</b><StatusPill r={s.resultado} /></span>
                      <span className="block truncate text-xs text-mute">Resp.: {s.resp.length ? s.resp.map(nome).join(', ') : 'não definido'}</span>
                      {s.obs && <span className="block truncate text-sm">📝 {s.obs}</span>}
                    </span>
                  ))}
                </span>
              </button>
            ))}
          </div>
        </section>
      ) : modo === 'mes' ? (<>
        <div className="mb-3 flex items-center gap-2">
          <button onClick={() => setMes(addMes(mes, -1))} className="rounded-lg bg-panel px-3 py-2 shadow">←</button>
          <b className="flex-1 text-center sm:flex-none">{MESES[+mes.slice(5, 7) - 1]} {mes.slice(0, 4)}</b>
          <button onClick={() => setMes(addMes(mes, 1))} className="rounded-lg bg-panel px-3 py-2 shadow">→</button>
        </div>
        <Mensal mes={mes} ativos={ativos} semData={[]} move={() => {}} onOpen={abrir} card={() => null} leitor />
      </>) : (<>
        <div className="mb-2 flex items-center gap-1 overflow-x-auto">
          <button onClick={() => setDay(addDays(day, -7))} className="shrink-0 rounded-lg bg-panel px-2 py-2 shadow">←</button>
          {modo === 'dia' ? days.map((d) => (
            <button key={d} onClick={() => setDay(d)} className={`min-w-[3.6rem] shrink-0 rounded-lg px-3 py-2 text-sm shadow ${d === day ? 'bg-brand' : 'bg-panel'} ${d === todayISO() ? 'ring-2 ring-brand/60' : ''}`}>
              {dow(d)}<br /><span className="text-[11px]">{fmtShort(d)}</span>
            </button>
          )) : <b className="flex-1 whitespace-nowrap px-2 text-center">Semana {fmtShort(ws)} – {fmtShort(addDays(ws, 4))}</b>}
          <button onClick={() => setDay(addDays(day, 7))} className="shrink-0 rounded-lg bg-panel px-2 py-2 shadow">→</button>
        </div>

        {modo === 'semana' ? <Semanal dias={days} ativos={ativos} onOpen={abrir} /> : (<>
          <label className="mb-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={mine} onChange={(e) => setMine(e.target.checked)} /> Só as minhas tarefas</label>
          <h2 className="mb-1 font-semibold">{dow(day)} {fmtBR(day)} · {list.length} equipamento(s)</h2>
          <p className="mb-2 text-xs text-mute">Toque no equipamento para ver todos os serviços.</p>
          {list.length === 0 && <p className="rounded-lg bg-panel p-4 text-mute">Nada programado para este dia.</p>}
          <div key={day} className="stagger grid items-start gap-3 lg:grid-cols-2 2xl:grid-cols-3">
            {list.map((e) => (
              <article key={e.id} onClick={() => abrir(e.id)} className={`glow cursor-pointer rounded-xl border p-3 ${isLiberado(e) ? 'border-green-500 bg-green-500/10' : 'bg-panel'}`}>
                <div className="flex items-center justify-between"><b className="tagid text-lg">{e.tag}{isLiberado(e) && <span className="ml-2 text-sm text-green-400">✔ Liberado</span>}</b>
                  <span className={`rounded-lg px-2 text-xs ${STATUS_CLS[e.status] || 'bg-panel2'}`}>{e.status}</span></div>
                <p className="flex items-center gap-2 text-sm text-mute"><EquipIcon e={e} size={20} /><span className="min-w-0 truncate">{e.modelo} · {diasTxt(e)}</span></p>
                {equipTexto(e) && <p className="label !text-[.65rem]">{equipTexto(e)}</p>}
                {e.obs && <p className="mt-1 rounded-lg bg-panel2 p-1 text-sm">📝 {e.obs}</p>}
                <ul className="mt-2 space-y-2">
                  {e.servicos.map((s) => (
                    <li key={s.id} className="rounded-lg border p-2">
                      <div className="flex items-center justify-between gap-2"><b className="flex items-center gap-1.5">{s.tipo}{novoKeys.has(`${e.id}:${s.id}`) && <span className="rounded bg-brand px-1.5 text-[10px] font-bold text-black">NOVO</span>}</b><StatusPill r={s.resultado} /></div>
                      <p className="text-xs text-mute">Resp.: {s.resp?.length ? s.resp.map(nome).join(', ') : 'não definido'}{s.dataRealizacao && ` · realizado em ${fmtBR(s.dataRealizacao)}`}</p>
                      {s.obs && <p className="text-sm">📝 {s.obs}</p>}
                    </li>
                  ))}
                  {!e.servicos.length && <li className="text-sm text-mute">Serviços ainda não definidos pelo PCM.</li>}
                </ul>
              </article>
            ))}
          </div>
        </>)}
      </>)}
      {open && <EquipView eq={eqs.find((e) => e.id === open)} users={users} user={user} novoKeys={novoKeys} onVisto={marcar} onClose={() => setOpen(null)} />}
    </div>
  )
}
