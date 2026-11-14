import { diasTxt, RESULTADOS, respEfetivos, STATUS_CLS } from '../lib/constants.js'
import { dow, fmtBR, fmtBRtime, fmtShort } from '../lib/dates.js'
import { isLiberado } from '../lib/liberado.js'
import { EquipIcon, equipTexto } from './EquipIcon.jsx'
import { StatusPill } from './ServiceChips.jsx'

// Visão somente leitura de um equipamento: todos os serviços, responsáveis e observações.
export default function EquipView({ eq, users, onClose }) {
  if (!eq) return null
  const nome = (u) => users.find((x) => x.username === u)?.nome || u
  const falta = (eq.servicos || []).filter((s) => (s.resultado || 'pendente') !== 'realizado').length
  return (
    <div data-modal className="fixed inset-0 z-30 flex items-end justify-center bg-black/60 sm:items-center" onClick={onClose}>
      <div className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl border bg-panel p-4 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="tagid flex flex-wrap items-center gap-2 text-xl font-bold">{eq.tag}
              {isLiberado(eq) && <span className="rounded-md bg-green-500/15 px-2 py-0.5 font-sans text-xs font-semibold text-green-300">✔ Liberado</span>}</h2>
            <p className="mt-1 flex items-center gap-2 text-sm text-mute"><EquipIcon e={eq} size={20} /><span className="truncate">{eq.modelo}</span></p>
            {equipTexto(eq) && <p className="label mt-1 !text-[.65rem]">{equipTexto(eq)}</p>}
          </div>
          <button onClick={onClose} aria-label="Fechar" className="text-2xl leading-none text-mute">×</button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className={`rounded-md px-2 py-1 ${STATUS_CLS[eq.status] || 'bg-panel2'}`}>{eq.status}</span>
          <span className="rounded-md border px-2 py-1 text-mute">{diasTxt(eq)}</span>
          <span className="rounded-md border px-2 py-1 text-mute">{eq.dia ? `Programado: ${dow(eq.dia)} ${fmtShort(eq.dia)}` : 'Sem previsão'}</span>
        </div>
        <p className="mt-2 text-xs text-mute">Últ. movimentação: {fmtBRtime(eq.ultMov)}</p>

        <h3 className="label mt-4 mb-2">Serviços {eq.servicos?.length ? `· ${falta} pendente(s)` : ''}</h3>
        {!eq.servicos?.length && <p className="rounded-lg border border-dashed p-3 text-sm text-mute">Serviços ainda não definidos pelo PCM.</p>}
        <ul className="space-y-2">
          {(eq.servicos || []).map((s) => {
            const resp = respEfetivos(s, users)
            return (
              <li key={s.id} className="rounded-lg border p-2.5">
                <div className="flex items-center justify-between gap-2"><b>{s.tipo}</b><StatusPill r={s.resultado} /></div>
                <p className="mt-0.5 text-xs text-mute">Resp.: {resp.length ? resp.map(nome).join(', ') : 'não definido'}{s.resultado === 'realizado' && s.dataRealizacao ? ` · realizado em ${fmtBR(s.dataRealizacao)}` : ''}</p>
                {s.obs && <p className="mt-1 text-sm">📝 {s.obs}</p>}
              </li>
            )
          })}
        </ul>
        {eq.obs && <p className="mt-3 rounded-lg bg-panel2 p-2 text-sm">📝 {eq.obs}</p>}
        <button onClick={onClose} className="mt-4 w-full rounded-lg border py-2.5">Fechar</button>
      </div>
    </div>
  )
}
