import { useEffect, useRef, useState } from 'react'
import { useStore } from '../lib/store.js'
import { fmtHora } from './QuemMarcou.jsx'

// Só PCM: avisa quando um colaborador marca um serviço (balão na tela + notificação do computador)
function bip() {
  try {
    const c = new (window.AudioContext || window.webkitAudioContext)(); const o = c.createOscillator(); const g = c.createGain()
    o.connect(g); g.connect(c.destination); o.frequency.value = 880; g.gain.setValueAtTime(0.0001, c.currentTime); g.gain.exponentialRampToValueAtTime(0.15, c.currentTime + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.35)
    o.start(); o.stop(c.currentTime + 0.4)
  } catch { /* sem áudio */ }
}

export function useAvisosPCM(ativo) {
  const store = useStore()
  const [toasts, setToasts] = useState([])
  const vistos = useRef(null)
  useEffect(() => {
    if (!ativo) return
    vistos.current = null
    return store.subscribe('marcacoes', (rows) => {
      if (!vistos.current) { vistos.current = new Set(rows.map((r) => r.id)); return } // 1ª carga = linha de base
      for (const m of rows) {
        if (vistos.current.has(m.id)) continue
        vistos.current.add(m.id)
        const titulo = m.acao === 'realizado' ? `✔ ${m.tipo} realizado` : `⏳ ${m.tipo} adiado`
        const corpo = `${m.nome} · ${m.tag}${m.obs ? ` · “${m.obs}”` : ''}`
        setToasts((l) => [...l, { id: m.id, titulo, corpo, hora: fmtHora(m.em || Date.now()), acao: m.acao }])
        setTimeout(() => setToasts((l) => l.filter((t) => t.id !== m.id)), 12000)
        if (m.acao === 'realizado') {
          bip()
          try { if (window.Notification?.permission === 'granted') new Notification(titulo, { body: corpo, tag: m.id, icon: '/favicon.png' }) } catch { /* ok */ }
        }
      }
    })
  }, [ativo, store])
  return { toasts, fechar: (id) => setToasts((l) => l.filter((t) => t.id !== id)) }
}

export function Toasts({ toasts, fechar }) {
  return (
    <div className="pointer-events-none fixed right-3 top-16 z-[60] flex w-[min(92vw,340px)] flex-col gap-2">
      {toasts.map((t) => (
        <button key={t.id} onClick={() => fechar(t.id)} className={`pointer-events-auto rounded-xl border bg-panel p-3 text-left shadow-2xl [animation:popIn_.35s_both] ${t.acao === 'realizado' ? 'border-green-500/60' : 'border-yellow-400/60'}`}>
          <b className={t.acao === 'realizado' ? 'text-green-300' : 'text-yellow-300'}>{t.titulo}</b>
          <span className="block truncate text-sm">{t.corpo}</span>
          <span className="block text-[11px] text-mute">{t.hora}</span>
        </button>
      ))}
    </div>
  )
}

// Botão para liberar as notificações do navegador (precisa de um clique do usuário)
export function BotaoNotificar() {
  const [perm, setPerm] = useState(() => (window.Notification ? Notification.permission : 'denied'))
  if (perm !== 'default') return null
  return <button onClick={async () => setPerm(await Notification.requestPermission())} title="Ativar avisos do computador quando um colaborador marcar um serviço" className="rounded-lg border border-brand/60 px-2.5 py-1 text-xs text-brand">🔔 Ativar avisos</button>
}
