import { useEffect, useState } from 'react'
import Portal from './Portal.jsx'
import { usePresencas } from '../lib/presenca.js'
import { tipoUsuario } from '../lib/constants.js'

const ESTADO = { ativo: ['bg-green-500', 'Online'], fundo: ['bg-yellow-400', 'Em segundo plano'], off: ['bg-slate-500', 'Offline'] }
const quando = (ms) => { const m = Math.round(ms / 60000); return m < 1 ? 'agora' : m < 60 ? `há ${m} min` : m < 1440 ? `há ${Math.round(m / 60)} h` : 'há dias' }

// Indicador "quem está online" — só para PCM
export default function PresencaPill() {
  const { lista, ativos, fundo } = usePresencas()
  const [aberto, setAberto] = useState(false)
  const [, tick] = useState(0)
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 30000); return () => clearInterval(t) }, [])
  return (
    <>
      <button onClick={() => setAberto(true)} title="Quem está online" className="flex items-center gap-1.5 rounded-lg border bg-panel px-2.5 py-1.5 text-sm">
        <span className={`h-2 w-2 rounded-full ${ativos ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-slate-500'}`} />
        <b className="tagid">{ativos}</b><span className="hidden text-mute sm:inline">online</span>
      </button>
      {aberto && (
        <Portal>
          <div data-modal className="fixed inset-0 z-40 flex items-start justify-end bg-black/50 p-3 pt-16" onClick={() => setAberto(false)}>
            <div className="w-full max-w-sm overflow-hidden rounded-2xl border bg-panel shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <header className="flex items-center justify-between border-b px-4 py-3">
                <div><h2 className="font-bold">Quem está no site</h2><p className="text-xs text-mute">{ativos} online · {fundo} em segundo plano</p></div>
                <button onClick={() => setAberto(false)} aria-label="Fechar" className="text-2xl leading-none text-mute">×</button>
              </header>
              <ul className="max-h-[60dvh] overflow-y-auto p-2">
                {!lista.length && <li className="p-4 text-sm text-mute">Ninguém registrou presença ainda.</li>}
                {lista.map((p) => (
                  <li key={p.id} className={`flex items-center gap-3 rounded-lg px-2 py-2 ${p.estado === 'off' ? 'opacity-50' : ''}`}>
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${ESTADO[p.estado][0]}`} title={ESTADO[p.estado][1]} />
                    <span className="min-w-0 flex-1"><b className="block truncate text-sm">{p.nome}</b>
                      <span className="block truncate text-xs text-mute">{tipoUsuario(p)} · {p.aparelho}{p.estado !== 'off' && p.tela ? ` · ${p.tela}` : ''}</span></span>
                    <span className="shrink-0 whitespace-nowrap text-xs text-mute">{p.estado === 'ativo' ? 'agora' : quando(p.idade)}</span>
                  </li>
                ))}
              </ul>
              <p className="border-t px-4 py-2 text-[11px] text-mute">Só aparecem quem já entrou desde esta versão. "Em segundo plano" = site aberto, mas fora da tela.</p>
            </div>
          </div>
        </Portal>
      )}
    </>
  )
}
