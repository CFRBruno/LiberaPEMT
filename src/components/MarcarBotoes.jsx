import { useState } from 'react'
import Portal from './Portal.jsx'
import Teclas, { DicaTeclas } from './Teclas.jsx'
import { useMarcar } from '../lib/marcacoes.js'

// Botões do colaborador no próprio serviço: ✔ Realizado / ⏳ Adiar (sempre com confirmação)
export default function MarcarBotoes({ eq, s, user }) {
  const marcar = useMarcar(user)
  const [acao, setAcao] = useState(null)
  const [obs, setObs] = useState('')
  const [busy, setBusy] = useState(false)
  const r = s.resultado || 'pendente'
  if (user.role === 'pcm' || r === 'realizado') return null
  const parar = (e) => e.stopPropagation()
  const confirmar = async () => {
    if (busy) return
    setBusy(true)
    try { await marcar(eq, s, acao, obs); setAcao(null); setObs('') } finally { setBusy(false) }
  }
  const fechar = () => { setAcao(null); setObs('') }
  const txt = acao === 'realizado' ? { t: 'Marcar como realizado?', b: '✔ Confirmar', cls: 'bg-green-600 text-white' } : { t: 'Adiar este serviço?', b: '⏳ Adiar', cls: 'bg-yellow-400 text-black' }
  return (
    <div className="mt-2 flex gap-2" onClick={parar}>
      <button onClick={() => setAcao('realizado')} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-green-500/60 bg-green-500/10 px-3 py-2 text-sm font-semibold text-green-300">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs text-black">✓</span>Realizado</button>
      {r !== 'adiado' && <button onClick={() => setAcao('adiado')} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-yellow-400/60 bg-yellow-400/10 px-3 py-2 text-sm font-semibold text-yellow-300">
        <span aria-hidden>⏳</span>Adiar</button>}
      {acao && (
        <Portal>
          <div data-modal className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 sm:items-center" onClick={parar}>
            <Teclas onEnter={confirmar} onEsc={fechar} />
            <div className="w-full max-w-sm space-y-3 rounded-t-2xl border bg-panel p-4 sm:rounded-2xl">
              <h2 className="text-lg font-bold">{txt.t}</h2>
              <p className="text-sm text-mute"><b className="text-ink">{s.tipo}</b> · <span className="tagid">{eq.tag}</span><br />O PCM é avisado com o seu nome, a data e o horário.</p>
              <input value={obs} onChange={(e) => setObs(e.target.value)} placeholder={acao === 'adiado' ? 'Motivo (opcional)' : 'Observação (opcional)'} className="w-full p-2 text-sm" />
              <div className="flex justify-end gap-2">
                <button onClick={fechar} className="rounded-lg border px-4 py-2">Cancelar</button>
                <button onClick={confirmar} disabled={busy} className={`rounded-lg px-5 py-2 font-semibold disabled:opacity-50 ${txt.cls}`}>{txt.b}</button>
              </div>
              <DicaTeclas confirmar="confirma" />
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}
