import Portal from './Portal.jsx'
import Teclas from './Teclas.jsx'
import { useEffect } from 'react'
import { diasTxt, respEfetivos, STATUS_CLS } from '../lib/constants.js'
import { dow, fmtBR, fmtBRtime, fmtShort } from '../lib/dates.js'
import { isLiberado } from '../lib/liberado.js'
import { EquipIcon, equipTexto } from './EquipIcon.jsx'
import { StatusPill } from './ServiceChips.jsx'
import MarcarBotoes from './MarcarBotoes.jsx'
import { fmtMarca } from './QuemMarcou.jsx'

// Detalhe somente leitura: os serviços (meus primeiro) vêm antes dos dados do equipamento.
// Só fecha pelo X / botões (clique fora NÃO fecha), e "Entendi" marca os avisos como vistos.
export default function EquipView({ eq, users, user, novoKeys = new Set(), onVisto, onClose }) {
  useEffect(() => { // trava a rolagem da página de trás enquanto a janela está aberta
    const o = document.body.style.overflow; document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = o }
  }, [])
  if (!eq) return null
  const nome = (u) => users.find((x) => x.username === u)?.nome || u
  const servicos = (eq.servicos || []).map((s) => ({ ...s, _resp: respEfetivos(s, users) }))
  const meu = (s) => s._resp.includes(user?.username)
  const ordenados = [...servicos].sort((a, b) => meu(b) - meu(a))
  const pendentes = servicos.filter((s) => (s.resultado || 'pendente') !== 'realizado').length
  const novosAqui = servicos.filter((s) => novoKeys.has(`${eq.id}:${s.id}`)).map((s) => `${eq.id}:${s.id}`)

  return (
    <Portal><div data-modal className="fixed inset-0 z-30 flex items-end justify-center bg-black/60 sm:items-center">
      <Teclas onEnter={() => { if (novosAqui.length) onVisto?.(novosAqui); onClose() }} onEsc={onClose} />
      <div className="flex max-h-[88dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border bg-panel sm:rounded-2xl">
        <header className="flex items-start justify-between gap-3 border-b px-4 py-3">
          <div className="min-w-0">
            <h2 className="tagid flex flex-wrap items-center gap-2 text-xl font-bold">{eq.tag}
              <span className={`rounded-md px-2 py-0.5 font-sans text-xs font-medium ${STATUS_CLS[eq.status] || 'bg-panel2'}`}>{eq.status}</span>
              {isLiberado(eq) && <span className="rounded-md bg-green-500/15 px-2 py-0.5 font-sans text-xs font-semibold text-green-300">✔ Liberado</span>}</h2>
            <p className="mt-0.5 flex items-center gap-2 text-sm text-mute"><EquipIcon e={eq} size={18} /><span className="truncate">{eq.modelo}</span></p>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="-mr-1 px-1 text-3xl leading-none text-mute">×</button>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          <section>
            <h3 className="label mb-2">Serviços {servicos.length ? `· ${pendentes} pendente(s)` : ''}</h3>
            {!servicos.length && <p className="rounded-lg border border-dashed p-3 text-sm text-mute">Serviços ainda não definidos pelo PCM.</p>}
            <ul className="space-y-2">
              {ordenados.map((s) => (
                <li key={s.id} className={`rounded-lg border p-2.5 ${meu(s) ? 'border-brand/60 bg-brand/5' : ''}`}>
                  <div className="flex items-center justify-between gap-2">
                    <b className="flex items-center gap-1.5">{s.tipo}
                      {novoKeys.has(`${eq.id}:${s.id}`) && <span className="rounded bg-brand px-1.5 text-[10px] font-bold text-black">NOVO</span>}
                      {meu(s) && <span className="rounded border border-brand/60 px-1.5 text-[10px] font-semibold text-brand">SEU</span>}</b>
                    <StatusPill r={s.resultado} />
                  </div>
                  <p className="mt-0.5 text-xs text-mute">Resp.: {s._resp.length ? s._resp.map(nome).join(', ') : 'não definido'}{s.resultado === 'realizado' && s.dataRealizacao ? ` · realizado em ${fmtBR(s.dataRealizacao)}` : ''}</p>
                  {s.obs && <p className="mt-1 text-sm">📝 {s.obs}</p>}
                  {s._marca && user?.role === 'pcm' && <p className="mt-1 text-xs text-brand">{fmtMarca(s._marca)}</p>}
                  {meu(s) && <MarcarBotoes eq={eq} s={s} user={user} />}
                </li>
              ))}
            </ul>
            {eq.obs && <p className="mt-2 rounded-lg bg-panel2 p-2 text-sm">📝 {eq.obs}</p>}
          </section>

          <section className="rounded-lg border bg-black/20 p-3 text-xs text-mute">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <span>{eq.dia ? <>Programado: <b className="text-ink">{dow(eq.dia)} {fmtShort(eq.dia)}</b></> : 'Sem previsão'}</span>
              <span>{diasTxt(eq)}</span>
              {equipTexto(eq) && <span>{equipTexto(eq)}</span>}
            </div>
            <p className="mt-1">Últ. movimentação: {fmtBRtime(eq.ultMov)}</p>
          </section>
        </div>

        <footer className="flex gap-2 border-t bg-panel px-4 py-3">
          {novosAqui.length > 0 && <button onClick={() => { onVisto?.(novosAqui); onClose() }} className="bg-brand flex-1 rounded-lg py-2.5">Entendi ✓</button>}
          <button onClick={onClose} className={`rounded-lg border py-2.5 ${novosAqui.length ? 'px-5' : 'flex-1'}`}>Fechar</button>
        </footer>
      </div>
    </div></Portal>
  )
}
