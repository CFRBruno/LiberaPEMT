import { dow, fmtShort, todayISO } from '../lib/dates.js'
import { isLiberado } from '../lib/liberado.js'
import { diasTxt, STATUS_CLS } from '../lib/constants.js'
import { EquipIcon } from './EquipIcon.jsx'
import { ServiceChip } from './ServiceChips.jsx'

// Visão da semana, somente leitura (celular e PC): um bloco por dia útil.
export default function Semanal({ dias, ativos, onOpen }) {
  const hoje = todayISO()
  return (
    <div className="grid gap-3 lg:grid-cols-5 lg:items-start">
      {dias.map((d) => {
        const lista = ativos.filter((e) => e.dia === d)
        return (
          <section key={d} className={`min-w-0 rounded-xl border p-2 ${d === hoje ? 'bg-brand/10 ring-2 ring-brand/60' : 'bg-black/25'}`}>
            <h3 className="label mb-2 flex justify-between !text-ink"><span className={d === hoje ? 'text-brand' : ''}>{dow(d)} {fmtShort(d)}</span><span className="font-normal text-mute">{lista.length}</span></h3>
            {!lista.length && <p className="px-1 pb-1 text-xs text-mute">Nada programado.</p>}
            <div className="space-y-2">
              {lista.map((e) => (
                <button key={e.id} onClick={() => onOpen(e.id)} className={`glow block w-full rounded-lg border p-2 text-left ${isLiberado(e) ? 'border-green-500 bg-green-500/10' : 'bg-panel'}`}>
                  <span className="flex items-center justify-between gap-2"><b className="tagid text-sm">{e.tag}{isLiberado(e) && <span className="ml-1 text-green-400">✔</span>}</b>
                    <span className={`rounded px-1.5 text-[10px] ${STATUS_CLS[e.status] || 'bg-panel2'}`}>{e.status}</span></span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-xs text-mute"><EquipIcon e={e} size={14} /><span className="truncate">{e.modelo}</span></span>
                  <span className="block text-[11px] text-mute">{diasTxt(e)}</span>
                  {!!e.servicos?.length && <span className="mt-1 flex flex-wrap gap-1">{e.servicos.map((s) => <ServiceChip key={s.id} s={s} />)}</span>}
                </button>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
