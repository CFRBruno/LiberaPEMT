import { useState } from 'react'
import { useCol, useStore } from '../lib/store.js'

export default function Users() {
  const store = useStore()
  const users = useCol('users')
  const [f, setF] = useState({ username: '', nome: '', role: 'tecnico', password: '' })
  const [msg, setMsg] = useState('')
  const add = async (e) => {
    e.preventDefault(); setMsg('')
    try { await store.auth.createUser(f); setF({ ...f, username: '', nome: '', password: '' }); setMsg('Usuário criado.') } catch (x) { setMsg(x.message) }
  }
  const inp = 'rounded border p-2 text-sm'
  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <form onSubmit={add} className="grid gap-2 rounded-xl bg-white p-3 shadow sm:grid-cols-2">
        <input required placeholder="Usuário (login)" autoCapitalize="none" value={f.username} onChange={(e) => setF({ ...f, username: e.target.value.replace(/[^a-zA-Z0-9._-]/g, '') })} className={inp} />
        <input required placeholder="Nome" value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} className={inp} />
        <input required minLength={6} type="text" placeholder="Senha (mín. 6)" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} className={inp} />
        <select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} className={inp}>
          <option value="tecnico">Mão de obra (leitor)</option><option value="pcm">PCM (editor)</option>
        </select>
        <button className="rounded bg-slate-900 p-2 text-white sm:col-span-2">Criar usuário</button>
        {msg && <p className="text-sm sm:col-span-2">{msg}</p>}
      </form>
      <div className="rounded-xl bg-white p-3 shadow">
        {users.map((u) => <div key={u.id} className="flex justify-between border-t py-1 text-sm first:border-0"><span>{u.nome} <span className="text-slate-400">({u.username})</span></span><b>{u.role === 'pcm' ? 'PCM' : 'Mão de obra'}</b></div>)}
      </div>
    </div>
  )
}
