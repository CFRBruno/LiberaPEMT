import { useEffect, useState } from 'react'
import { useCol } from './store.js'
import { autoResp, respEfetivos } from './constants.js'

// Serviços NOVOS atribuídos ao usuário (ainda não vistos neste aparelho).
// "Visto" fica no próprio aparelho (localStorage); na 1ª vez, o que já existe conta como visto.
const K = (u) => 'lpemt:visto:' + u
const load = (u) => {
  try { const o = JSON.parse(localStorage.getItem(K(u))); if (o) return o } catch { /* sem dados */ }
  const o = { base: new Date().toISOString(), seen: {} }
  try { localStorage.setItem(K(u), JSON.stringify(o)) } catch { /* sem armazenamento */ }
  return o
}
const subs = new Set()
const save = (u, o) => { try { localStorage.setItem(K(u), JSON.stringify(o)) } catch { /* ok */ } subs.forEach((f) => f()) }

export function useNovos(user) {
  const eqs = useCol('equipamentos')
  const users = useCol('users')
  const [, tick] = useState(0)
  useEffect(() => { const f = () => tick((n) => n + 1); subs.add(f); return () => subs.delete(f) }, [])
  if (!user || user.role === 'pcm') return { novos: [], marcar() {}, marcarTodos() {} }
  const st = load(user.username)
  const novos = []
  for (const e of eqs) {
    if (!e.ativo) continue
    for (const s of e.servicos || []) {
      if ((s.resultado || 'pendente') === 'realizado') continue
      if (!respEfetivos(s, users).includes(user.username)) continue
      const auto = autoResp(s, users).includes(user.username)
      const t = s.atribuicoes?.[user.username] || (auto || (s.resp || []).includes(user.username) ? s.criadoEm : null)
      if (!t) continue
      const key = `${e.id}:${s.id}`
      if (t > (st.seen[key] || st.base)) novos.push({ eq: e, s, key, t })
    }
  }
  novos.sort((a, b) => b.t.localeCompare(a.t))
  const marcar = (keys) => { const o = load(user.username); keys.forEach((k) => { o.seen[k] = new Date().toISOString() }); save(user.username, o) }
  return { novos, marcar, marcarTodos: () => marcar(novos.map((n) => n.key)) }
}
