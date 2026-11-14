// MODO DEMONSTRAÇÃO: tudo no localStorage do navegador (sem tempo real entre pessoas).
const K = (c) => 'lpemt:' + c
const read = (c) => { try { return JSON.parse(localStorage.getItem(K(c))) || {} } catch { return {} } }
const subs = {}
const emit = (c) => (subs[c] || []).forEach((f) => f(Object.entries(read(c)).map(([id, v]) => ({ id, ...v }))))
const write = (c, o) => { localStorage.setItem(K(c), JSON.stringify(o)); emit(c) }

if (!localStorage.getItem(K('users'))) {
  write('users', {
    pcm: { username: 'pcm', nome: 'PCM Demo', role: 'pcm', admin: true, senha: 'pcm123' },
    tecnico: { username: 'tecnico', nome: 'Técnico Demo', role: 'tecnico', setor: 'manutencao', senha: 'tecnico123' },
  })
}
// garante admin no usuário demo mesmo em dados antigos
{ const u = read('users'); if (u.pcm && u.pcm.admin == null) { u.pcm.admin = true; write('users', u) } }
let session = (() => { try { return JSON.parse(sessionStorage.getItem('lpemt:session')) } catch { return null } })()
// Sessão antiga (salva antes de existir 'admin') é recarregada a partir do cadastro atual
if (session) { const u = read('users')[session.username]; session = u && u.ativo !== false ? { uid: u.username, username: u.username, nome: u.nome, role: u.role, setor: u.setor, admin: !!u.admin } : null }
const authSubs = []
const setSession = (u) => { session = u; sessionStorage.setItem('lpemt:session', JSON.stringify(u)); authSubs.forEach((f) => f(u)) }

export const demo = true
export const auth = {
  onChange(cb) { authSubs.push(cb); cb(session); return () => authSubs.splice(authSubs.indexOf(cb), 1) },
  async signIn(username, senha) {
    const u = read('users')[username.trim().toLowerCase()]
    if (!u || u.senha !== senha) throw new Error('Usuário ou senha inválidos.')
    if (u.ativo === false) throw new Error('Usuário desativado.')
    setSession({ uid: u.username, username: u.username, nome: u.nome, role: u.role, setor: u.setor, admin: !!u.admin })
  },
  async signOut() { setSession(null) },
  async createUser({ username, nome, role, setor, password, admin }) {
    const id = username.trim().toLowerCase()
    const u = read('users')
    if (u[id]) throw new Error('Usuário já existe.')
    u[id] = { username: id, nome, role, setor: setor || null, admin: !!admin, ativo: true, senha: password }
    write('users', u)
  },
}
export const presenca = (id, data) => { const o = read('presenca'); o[id] = { ...(o[id] || {}), ...data, ts: Date.now() }; write('presenca', o) }
export const subscribe = (c, cb) => { (subs[c] ||= []).push(cb); emit(c); return () => subs[c].splice(subs[c].indexOf(cb), 1) }
export async function batch(ops) {
  const cache = {}
  for (const { col, id, data, merge, del } of ops) {
    const o = (cache[col] ||= read(col))
    if (del) delete o[id]
    else o[id] = merge ? { ...(o[id] || {}), ...data } : data
  }
  Object.entries(cache).forEach(([c, o]) => write(c, o))
}
