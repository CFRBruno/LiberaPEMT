import { dow, fmtShort, semanasUteis, todayISO } from '../lib/dates.js'
import { isLiberado } from '../lib/liberado.js'
import { STATUS_CLS } from '../lib/constants.js'

// Visão mensal: calendário só com dias úteis (Seg–Sex). No celular vira lista vertical.
export default function Mensal({ mes, ativos, semData, move, onOpen, card }) {
  const semanas = semanasUteis(mes)
  const uteis = semanas.flatMap((s) => s.dias.filter(Boolean))
  const hoje = todayISO()
  const restantes = uteis.filter((d) => d >= hoje).length
  const noMes = ativos.filter((e) => e.dia?.startsWith(mes)).length
  const drop = (e, dia) => { e.preventDefault(); const t = e.dataTransfer.getData('text/plain'); if (t) move(t, dia) }
  const mini = (e) => (
    <div key={e.id} draggable onDragStart={(ev) => ev.dataTransfer.setData('text/plain', e.id)} onClick={() => onOpen(e.id)}
      className={`glow cursor-pointer rounded-md border px-1.5 py-1 text-xs ${isLiberado(e) ? 'border-green-500 bg-green-500/10' : 'bg-panel'}`}>
      <div className="flex items-center justify-between gap-1">
        <b className="tagid truncate">{e.tag}</b>
        <span className={`h-2 w-2 shrink-0 rounded-full ${isLiberado(e) ? 'bg-green-500' : e.status === 'Manutenção' ? 'bg-brand' : 'bg-sky-400'}`} title={e.status} />
      </div>
      <div className="truncate text-[10px] text-mute">{e.modelo}</div>
      {!!e.servicos?.length && <div className="mt-0.5 flex flex-wrap gap-0.5">{e.servicos.map((s) => <span key={s.id} className={`rounded px-1 text-[9px] ${s.resultado === 'realizado' ? 'bg-green-500/20 text-green-300' : 'bg-slate-500/20 text-slate-300'}`}>{s.tipo}</span>)}</div>}
    </div>
  )
  const alerta = semData.length > 0
  return (
    <div>
      <p className="mb-2 text-sm text-mute"><b className="text-ink">{uteis.length} dias úteis</b> no mês · {restantes} restantes · {noMes} equipamento(s) programado(s) no mês{restantes > 0 && noMes > 0 ? ` (≈ ${(noMes / uteis.length).toFixed(1).replace('.', ',')} por dia útil)` : ''}</p>
      <div className="grid gap-3 lg:grid-cols-[15rem_1fr] lg:items-start">
        {/* Sem previsão */}
        <div className="lg:sticky lg:top-40">
        <section onDragOver={(e) => e.preventDefault()} onDrop={(e) => drop(e, null)}
          className={`corners rounded-xl border border-dashed p-2 ${alerta ? 'border-red-400/60 bg-red-500/5' : 'bg-black/25'}`}>
          <h3 className="label mb-2 flex items-center justify-between !text-ink">
            <span><span className={alerta ? 'text-red-400' : 'text-green-400'}>{alerta ? '⚠' : '✓'}</span> Sem previsão</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${alerta ? 'alert-pulse bg-red-500 text-white' : 'bg-green-500/15 text-green-300'}`}>{alerta ? semData.length : 'ok'}</span>
          </h3>
          <div className="max-h-[60dvh] space-y-2 overflow-y-auto lg:max-h-[calc(100dvh-16rem)]">{semData.map(card)}</div>
        </section>
        </div>

        {/* Calendário */}
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-5">
          {['Seg', 'Ter', 'Qua', 'Qui', 'Sex'].map((d) => <div key={d} className="label hidden text-center lg:block">{d}</div>)}
          {semanas.map((s) => (
            <div key={s.ws} className="contents">
              <div className="label col-span-full mt-1 border-b pb-0.5 lg:hidden">Semana de {fmtShort(s.ws)}</div>
              {s.dias.map((d, i) => d ? (
                <section key={d} onDragOver={(e) => e.preventDefault()} onDrop={(e) => drop(e, d)}
                  className={`min-h-24 min-w-0 rounded-xl border p-1.5 ${d === hoje ? 'bg-brand/10 ring-2 ring-brand/60' : 'bg-black/25'} ${d < hoje ? 'opacity-70' : ''}`}>
                  <div className="mb-1 flex items-center justify-between text-xs"><b className={d === hoje ? 'text-brand' : ''}>{fmtShort(d)} <span className="font-normal text-mute">{dow(d)}</span></b>
                    <span className="text-mute">{ativos.filter((e) => e.dia === d).length || ''}</span></div>
                  <div className="space-y-1">{ativos.filter((e) => e.dia === d).map(mini)}</div>
                </section>
              ) : <div key={s.ws + i} className="hidden lg:block" />)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
