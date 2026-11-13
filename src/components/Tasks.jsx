import { useState } from 'react'
import { useCol } from '../lib/store.js'
import { addDays, dow, fmtBR, fmtShort, todayISO, weekStart } from '../lib/dates.js'
import { STATUS_CLS } from '../lib/constants.js'
import { StatusPill } from './ServiceChips.jsx'
import { isLiberado } from '../lib/liberado.js'

// Visão da mão de obra (somente leitura, atualiza em tempo real).
export default function Tasks({ user }) {
  const eqs = useCol('equipamentos')
  const users = useCol('users')
  const [day, setDay] = useState(todayISO())
  const [mine, setMine] = useState(user.role === 'tecnico')
  const nome = (u) => users.find((x) => x.username === u)?.nome || u
  const ws = weekStart(day)
  const days = [0, 1, 2, 3, 4, 5].map((i) => addDays(ws, i))
  const list = eqs.filter((e) => e.ativo && e.dia === day).map((e) => ({
    ...e, servicos: (e.servicos || []).filter((s) => !mine || s.resp?.includes(user.username)),
  })).filter((e) => !mine || e.servicos.length)
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-2 flex items-center gap-1 overflow-x-auto">
        <button onClick={() => setDay(addDays(day, -7))} className="rounded bg-panel px-2 py-1 shadow">←</button>
        {days.map((d) => (
          <button key={d} onClick={() => setDay(d)} className={`rounded px-3 py-1 text-sm shadow ${d === day ? 'bg-brand text-white' : 'bg-panel'} ${d === todayISO() ? 'ring-2 ring-amber-400' : ''}`}>
            {dow(d)}<br /><span className="text-[11px]">{fmtShort(d)}</span>
          </button>
        ))}
        <button onClick={() => setDay(addDays(day, 7))} className="rounded bg-panel px-2 py-1 shadow">→</button>
      </div>
      <label className="mb-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={mine} onChange={(e) => setMine(e.target.checked)} /> Só as minhas tarefas</label>
      <h2 className="mb-2 font-semibold">{dow(day)} {fmtBR(day)} · {list.length} equipamento(s)</h2>
      {list.length === 0 && <p className="rounded bg-panel p-4 text-mute">Nada programado para este dia.</p>}
      <div key={day} className="stagger space-y-3">
        {list.map((e) => (
          <article key={e.id} className={`rounded-xl p-3 shadow ${isLiberado(e) ? 'bg-green-500/10 ring-1 ring-green-500' : 'bg-panel'}`}>
            <div className="flex items-center justify-between"><b className="tagid text-lg">{e.tag}{isLiberado(e) && <span className="ml-2 text-sm text-green-400">✔ Liberado</span>}</b>
              <span className={`rounded px-2 text-xs ${STATUS_CLS[e.status] || 'bg-panel2'}`}>{e.status}</span></div>
            <p className="text-sm text-mute">{e.modelo} · {e.dias ?? '?'} dias no status</p>
            {e.obs && <p className="mt-1 rounded bg-panel2 p-1 text-sm">📝 {e.obs}</p>}
            <ul className="mt-2 space-y-2">
              {e.servicos.map((s) => (
                <li key={s.id} className="rounded border p-2">
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
    </div>
  )
}
