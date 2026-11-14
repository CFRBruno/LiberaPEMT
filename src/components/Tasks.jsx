import { useState } from 'react'
import { useCol } from '../lib/store.js'
import { addDays, addMes, dow, fmtBR, fmtShort, MESES, proxDiaUtil, todayISO, weekStart } from '../lib/dates.js'
import { diasTxt, respEfetivos, STATUS_CLS } from '../lib/constants.js'
import { StatusPill } from './ServiceChips.jsx'
import { isLiberado } from '../lib/liberado.js'
import { EquipIcon, equipTexto } from './EquipIcon.jsx'
import EquipView from './EquipView.jsx'
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
  const nome = (u) => users.find((x) => x.username === u)?.nome || u
  const ws = weekStart(day)
  const days = [0, 1, 2, 3, 4].map((i) => addDays(ws, i))
  const ativos = eqs.filter((e) => e.ativo)
  const list = ativos.filter((e) => e.dia === day).map((e) => ({
    ...e, servicos: (e.servicos || []).map((s) => ({ ...s, resp: respEfetivos(s, users) })).filter((s) => !mine || s.resp.includes(user.username)),
  })).filter((e) => !mine || e.servicos.length)
  const seg = (m, l) => <button onClick={() => setModo(m)} className={`flex-1 px-4 py-2 text-sm ${modo === m ? 'bg-brand' : 'text-mute'}`}>{l}</button>

  return (
    <div className={`mx-auto ${modo === 'dia' ? 'max-w-3xl lg:max-w-none' : ''}`}>
      <div className="mb-3 flex overflow-hidden rounded-lg border sm:inline-flex sm:w-auto">{seg('dia', 'Dia')}{seg('semana', 'Semana')}{seg('mes', 'Mês')}</div>

      {modo === 'mes' ? (<>
        <div className="mb-3 flex items-center gap-2">
          <button onClick={() => setMes(addMes(mes, -1))} className="rounded-lg bg-panel px-3 py-2 shadow">←</button>
          <b className="flex-1 text-center sm:flex-none">{MESES[+mes.slice(5, 7) - 1]} {mes.slice(0, 4)}</b>
          <button onClick={() => setMes(addMes(mes, 1))} className="rounded-lg bg-panel px-3 py-2 shadow">→</button>
        </div>
        <Mensal mes={mes} ativos={ativos} semData={[]} move={() => {}} onOpen={setOpen} card={() => null} leitor />
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

        {modo === 'semana' ? <Semanal dias={days} ativos={ativos} onOpen={setOpen} /> : (<>
          <label className="mb-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={mine} onChange={(e) => setMine(e.target.checked)} /> Só as minhas tarefas</label>
          <h2 className="mb-1 font-semibold">{dow(day)} {fmtBR(day)} · {list.length} equipamento(s)</h2>
          <p className="mb-2 text-xs text-mute">Toque no equipamento para ver todos os serviços.</p>
          {list.length === 0 && <p className="rounded-lg bg-panel p-4 text-mute">Nada programado para este dia.</p>}
          <div key={day} className="stagger grid items-start gap-3 lg:grid-cols-2 2xl:grid-cols-3">
            {list.map((e) => (
              <article key={e.id} onClick={() => setOpen(e.id)} className={`glow cursor-pointer rounded-xl border p-3 ${isLiberado(e) ? 'border-green-500 bg-green-500/10' : 'bg-panel'}`}>
                <div className="flex items-center justify-between"><b className="tagid text-lg">{e.tag}{isLiberado(e) && <span className="ml-2 text-sm text-green-400">✔ Liberado</span>}</b>
                  <span className={`rounded-lg px-2 text-xs ${STATUS_CLS[e.status] || 'bg-panel2'}`}>{e.status}</span></div>
                <p className="flex items-center gap-2 text-sm text-mute"><EquipIcon e={e} size={20} /><span className="min-w-0 truncate">{e.modelo} · {diasTxt(e)}</span></p>
                {equipTexto(e) && <p className="label !text-[.65rem]">{equipTexto(e)}</p>}
                {e.obs && <p className="mt-1 rounded-lg bg-panel2 p-1 text-sm">📝 {e.obs}</p>}
                <ul className="mt-2 space-y-2">
                  {e.servicos.map((s) => (
                    <li key={s.id} className="rounded-lg border p-2">
                      <div className="flex items-center justify-between gap-2"><b>{s.tipo}</b><StatusPill r={s.resultado} /></div>
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
      {open && <EquipView eq={eqs.find((e) => e.id === open)} users={users} onClose={() => setOpen(null)} />}
    </div>
  )
}
