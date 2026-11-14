import { useEffect, useRef } from 'react'
import { useCol, useStore } from './store.js'

export const INTERVALO = 60_000 // batimento a cada 60 s
const ATIVO = 150_000 // visível e batimento recente
const FUNDO = 600_000 // em segundo plano até 10 min

export const aparelho = () => (/Android|iPhone|iPad|Mobi/i.test(navigator.userAgent) ? 'celular' : 'PC')

// Envia "estou aqui" enquanto o site está aberto (todos os usuários)
export function useBatimento(user, tela) {
  const store = useStore()
  const ref = useRef({ user, tela })
  ref.current = { user, tela }
  useEffect(() => {
    if (!user) return
    const enviar = (extra = {}) => {
      const { user: u, tela: t } = ref.current
      store.presenca?.(u.uid, { username: u.username, nome: u.nome, role: u.role, setor: u.setor || null, tela: t, aparelho: aparelho(), visivel: document.visibilityState === 'visible', ...extra })
    }
    enviar()
    const iv = setInterval(() => { if (document.visibilityState === 'visible') enviar() }, INTERVALO)
    const vis = () => enviar()
    document.addEventListener('visibilitychange', vis)
    return () => { clearInterval(iv); document.removeEventListener('visibilitychange', vis); store.presenca?.(user.uid, { visivel: false, tela: 'saiu' }) }
  }, [user?.uid, store]) // eslint-disable-line
  useEffect(() => { if (user) store.presenca?.(user.uid, { tela, visivel: document.visibilityState === 'visible' }) }, [tela]) // eslint-disable-line
}

// Lista de quem está online (para PCM)
export function usePresencas() {
  const rows = useCol('presenca')
  const agora = Date.now()
  const lista = rows.map((r) => {
    const idade = agora - (r.ts || 0)
    const estado = r.tela === 'saiu' ? 'off' : r.visivel && idade < ATIVO ? 'ativo' : idade < FUNDO ? 'fundo' : 'off'
    return { ...r, estado, idade }
  })
  return { lista: lista.sort((a, b) => ({ ativo: 0, fundo: 1, off: 2 }[a.estado] - { ativo: 0, fundo: 1, off: 2 }[b.estado]) || a.nome.localeCompare(b.nome)), ativos: lista.filter((x) => x.estado === 'ativo').length, fundo: lista.filter((x) => x.estado === 'fundo').length }
}
