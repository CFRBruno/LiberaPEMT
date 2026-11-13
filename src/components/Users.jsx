import { useState } from 'react'
import { useCol, useStore } from '../lib/store.js'
import { categoria, tipoUsuario } from '../lib/constants.js'

export default function Users() {
  const store = useStore()
  const users = useCol('users')
  const [f, setF] = useState({ username: '', nome: '', tipo: 'manutencao', password: '' })
  const [msg, setMsg] = useState('')
  const add = async (e) => {
    e.preventDefault(); setMsg('')
    try { await store.auth.createUser({ ...f, role: f.tipo === 'pcm' ? 'pcm' : 'tecnico', setor: f.tipo === 'pcm' ? null : f.tipo }); setF({ ...f, username: '', nome: '', password: '' }); setMsg('Usuário criado.') } catch (x) { setMsg(x.message) }
  }
  const inp = 'rounded-lg border p-2 text-sm'
  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <form onSubmit={add} className="grid gap-2 rounded-xl bg-panel p-3 shadow sm:grid-cols-2">
        <input required placeholder="Usuário (login)" autoCapitalize="none" value={f.username} onChange={(e) => setF({ ...f, username: e.target.value.replace(/[^a-zA-Z0-9._-]/g, '') })} className={inp} />
        <input required placeholder="Nome" value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} className={inp} />
        <input required minLength={6} type="text" placeholder="Senha (mín. 6)" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} className={inp} />
        <select value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value })} className={inp}>
          <option value="manutencao">Manutenção (Leitor)</option><option value="pintura">Pintura (Leitor)</option>
          <option value="lavagem">Lavagem (Leitor)</option><option value="pcm">PCM (Editor)</option>
        </select>
        <button className="rounded-lg bg-brand p-2 text-white sm:col-span-2">Criar usuário</button>
        {msg && <p className="text-sm sm:col-span-2">{msg}</p>}
      </form>
      <div className="rounded-xl bg-panel p-3 shadow">
        {users.map((u) => <div key={u.id} className="flex justify-between border-t py-1 text-sm first:border-0"><span>{u.nome} <span className="text-mute">({u.username})</span></span><b>{tipoUsuario(u)} <span className="font-normal text-mute">· {categoria(u)}</span></b></div>)}
      </div>
    </div>
  )
}
