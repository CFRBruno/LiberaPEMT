import Portal from './Portal.jsx'
import Teclas from './Teclas.jsx'
import { useEffect, useState } from 'react'
import { useStore } from '../lib/store.js'
import { autoResp, diasTxt, RESULTADOS, SERVICOS, SETORES, STATUS_CLS } from '../lib/constants.js'
import { addDays, dow, fmtBRtime, fmtShort, proxDiaUtil, todayISO, weekStart } from '../lib/dates.js'
import { isLiberado } from '../lib/liberado.js'
import { EquipIcon, equipTexto } from './EquipIcon.jsx'

const Secao = ({ titulo, extra, children }) => (
  <section className="mt-5">
    <div className="mb-2 flex items-center justify-between"><h3 className="label">{titulo}</h3>{extra}</div>
    {children}
  </section>
)

export default function EquipModal({ eq, users, onClose }) {
  const store = useStore()
  useEffect(() => { const o = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = o } }, [])
  const [dia, setDia] = useState(eq.dia || '')
  const [obs, setObs] = useState(eq.obs || '')
  const [servicos, setServicos] = useState(eq.servicos || [])
  const [base, setBase] = useState(weekStart(eq.dia || proxDiaUtil(todayISO())))
  const tecnicos = users.filter((u) => u.role !== 'pcm' && u.ativo !== false)
  const nome = (un) => users.find((u) => u.username === un)?.nome || un
  const upd = (id, patch) => setServicos((l) => l.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  const setRes = (s, r) => upd(s.id, { resultado: r, dataRealizacao: r === 'realizado' ? s.dataRealizacao || todayISO() : s.dataRealizacao || null })
  const addResp = (s, un) => un && upd(s.id, { resp: [...(s.resp || []), un], atribuicoes: { ...(s.atribuicoes || {}), [un]: new Date().toISOString() } })
  const rmResp = (s, un) => upd(s.id, { resp: (s.resp || []).filter((x) => x !== un) })
  const novo = (tipo) => setServicos((l) => [...l, { id: Math.random().toString(36).slice(2, 9), tipo, resultado: 'pendente', resp: [], obs: '', dataRealizacao: null, criadoEm: new Date().toISOString(), atribuicoes: {} }])
  const save = async () => {
    await store.batch([{ col: 'equipamentos', id: eq.id, merge: true, data: { dia: dia || null, obs, servicos } }])
    onClose()
  }
  const podeServicos = eq.status === 'Manutenção'
  const dias = [0, 1, 2, 3, 4].map((i) => addDays(base, i))
  const hoje = todayISO()

  return (
    <Portal><div data-modal className="fixed inset-0 z-30 flex items-end justify-center bg-black/60 sm:items-center">
      <Teclas onEnter={save} onEsc={onClose} />
      <div className="flex max-h-[94dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border bg-panel sm:rounded-2xl">
        {/* Cabeçalho */}
        <header className="flex items-start justify-between gap-3 border-b px-4 py-3">
          <div className="min-w-0">
            <h2 className="tagid flex flex-wrap items-center gap-2 text-xl font-bold">{eq.tag}
              {isLiberado(eq) && <span className="rounded-md bg-green-500/15 px-2 py-0.5 font-sans text-xs font-semibold text-green-300">✔ Liberado</span>}</h2>
            <p className="mt-0.5 flex items-center gap-2 text-sm text-mute"><EquipIcon e={eq} size={20} /><span className="truncate">{eq.modelo}</span>
              {equipTexto(eq) && <span className="label hidden !text-[.65rem] sm:inline">{equipTexto(eq)}</span>}</p>
            <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
              <span className={`rounded-md px-2 py-0.5 ${STATUS_CLS[eq.status] || 'bg-panel2'}`}>{eq.status}</span>
              <span className="rounded-md border px-2 py-0.5 text-mute">{diasTxt(eq)}</span>
              <span className="rounded-md border px-2 py-0.5 text-mute">últ. mov. {fmtBRtime(eq.ultMov)}</span>
            </div>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="text-2xl leading-none text-mute">×</button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          {/* Programação */}
          <Secao titulo="Dia programado">
            <div className="flex items-center gap-1">
              <button onClick={() => setBase(addDays(base, -7))} className="shrink-0 rounded-lg border px-2.5 py-2 text-mute" aria-label="Semana anterior">←</button>
              <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
                {dias.map((d) => (
                  <button key={d} onClick={() => setDia(d)} className={`flex-1 rounded-lg border px-2 py-1.5 text-center text-sm ${dia === d ? 'border-brand bg-brand/15 text-brand' : d === hoje ? 'border-brand/50' : 'text-mute'}`}>
                    {dow(d)}<span className="block text-[11px] opacity-70">{fmtShort(d)}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setBase(addDays(base, 7))} className="shrink-0 rounded-lg border px-2.5 py-2 text-mute" aria-label="Próxima semana">→</button>
            </div>
            <button onClick={() => setDia('')} className={`mt-1.5 rounded-lg border border-dashed px-3 py-1.5 text-sm ${!dia ? 'border-red-400/60 bg-red-500/10 text-red-300' : 'text-mute'}`}>Sem previsão</button>
            {dia && !dias.includes(dia) && <span className="ml-2 text-xs text-mute">Programado para {dow(dia)} {fmtShort(dia)} (outra semana)</span>}
          </Secao>

          {/* Serviços */}
          <Secao titulo={`Serviços${servicos.length ? ` · ${servicos.length}` : ''}`}>
            {!podeServicos && <p className="mb-2 rounded-lg border border-dashed p-2 text-xs text-mute">Serviços só são definidos para equipamentos em Manutenção.</p>}
            <div className="space-y-3">
              {servicos.map((s) => {
                const auto = autoResp(s, users)
                const manual = (s.resp || []).filter((x) => !auto.includes(x))
                const livres = tecnicos.filter((u) => !auto.includes(u.username) && !manual.includes(u.username))
                const res = RESULTADOS[s.resultado || 'pendente']
                return (
                  <article key={s.id} className="overflow-hidden rounded-xl border bg-black/20">
                    <div className="flex items-center justify-between gap-2 border-b bg-panel2/60 px-3 py-2">
                      <b className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${res.dot}`} />{s.tipo}</b>
                      <button onClick={() => setServicos((l) => l.filter((x) => x.id !== s.id))} className="text-xs text-red-400 hover:underline">remover</button>
                    </div>
                    <div className="space-y-3 p-3">
                      {/* Resultado */}
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(RESULTADOS).map(([k, v]) => (
                          <button key={k} onClick={() => setRes(s, k)} className={`rounded-lg border px-2.5 py-1 text-xs ${(s.resultado || 'pendente') === k ? v.cls + ' ring-2 ring-brand/70 ring-offset-1 ring-offset-panel' : 'text-mute'}`}>{v.label}</button>
                        ))}
                      </div>
                      {s.resultado === 'realizado' && (
                        <label className="flex items-center gap-2 text-xs text-mute">Realizado em <input type="date" value={s.dataRealizacao || ''} onChange={(e) => upd(s.id, { dataRealizacao: e.target.value })} className="p-1" /></label>
                      )}
                      {/* Responsáveis */}
                      <div>
                        <div className="label mb-1.5 !text-[.62rem]">Responsáveis</div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {auto.map((un) => <span key={un} title="Atribuído automaticamente pelo setor" className="flex items-center gap-1 rounded-full border border-dashed px-2.5 py-1 text-xs text-mute">🔒 {nome(un)}</span>)}
                          {manual.map((un) => (
                            <span key={un} className="flex items-center gap-1 rounded-full bg-brand/15 py-1 pl-2.5 pr-1.5 text-xs text-brand">{nome(un)}
                              <button onClick={() => rmResp(s, un)} aria-label={`Remover ${nome(un)}`} className="rounded-full px-1 leading-none hover:bg-brand/30">×</button></span>
                          ))}
                          {!auto.length && !manual.length && <span className="text-xs text-mute">ninguém atribuído</span>}
                          {livres.length > 0 && (
                            <select value="" onChange={(e) => addResp(s, e.target.value)} aria-label="Adicionar responsável" className="rounded-full border-dashed px-2.5 py-1 text-xs text-mute">
                              <option value="">+ responsável</option>
                              {Object.entries(SETORES).map(([k, l]) => { const g = livres.filter((u) => (u.setor || 'manutencao') === k); return g.length ? <optgroup key={k} label={l}>{g.map((u) => <option key={u.id} value={u.username}>{u.nome}</option>)}</optgroup> : null })}
                            </select>
                          )}
                        </div>
                        {auto.length > 0 && <p className="mt-1 text-[11px] text-mute">🔒 automático pelo setor</p>}
                      </div>
                      <textarea placeholder="Observação do serviço…" value={s.obs || ''} onChange={(e) => upd(s.id, { obs: e.target.value })} className="w-full p-2 text-sm" rows={2} />
                    </div>
                  </article>
                )
              })}
            </div>
            {podeServicos && (
              <div className="mt-3">
                <div className="label mb-1.5 !text-[.62rem]">Adicionar serviço</div>
                <div className="flex flex-wrap gap-1.5">{SERVICOS.map((t) => <button key={t} onClick={() => novo(t)} className="rounded-full border border-dashed px-3 py-1 text-sm text-mute hover:border-brand hover:text-brand">+ {t}</button>)}</div>
              </div>
            )}
          </Secao>

          <Secao titulo="Observação do equipamento">
            <textarea value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Ex.: aguardando liberação do cliente…" className="w-full p-2 text-sm" rows={2} />
          </Secao>
        </div>

        {/* Rodapé fixo */}
        <footer className="flex justify-end gap-2 border-t bg-panel px-4 py-3">
          <button onClick={onClose} className="rounded-lg border px-4 py-2">Cancelar</button>
          <button onClick={save} className="bg-brand rounded-lg px-5 py-2">Salvar</button>
        </footer>
      </div>
    </div></Portal>
  )
}
