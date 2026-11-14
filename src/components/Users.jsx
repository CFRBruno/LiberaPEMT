import { useState } from 'react'
import Portal from './Portal.jsx'
import { useCol, useStore } from '../lib/store.js'
import { categoria, tipoUsuario } from '../lib/constants.js'

const TIPOS = [['manutencao', 'Manutenção (Leitor)'], ['pintura', 'Pintura (Leitor)'], ['lavagem', 'Lavagem (Leitor)'], ['pcm', 'PCM (Editor)']]
const tipoDe = (u) => (u.role === 'pcm' ? 'pcm' : u.setor || 'manutencao')
const inp = 'rounded-lg border p-2 text-sm'

// Gestão de membros: só administradores (Bruno e Claudio)
export default function Users({ me }) {
  const store = useStore()
  const users = useCol('users').sort((a, b) => a.nome.localeCompare(b.nome))
  const eqs = useCol('equipamentos')
  const [erro, setErro] = useState('')
  const [f, setF] = useState({ username: '', nome: '', tipo: 'manutencao', password: '' })
  const [msg, setMsg] = useState('')
  const [edit, setEdit] = useState(null)

  const add = async (e) => {
    e.preventDefault(); setMsg('')
    try {
      await store.auth.createUser({ ...f, role: f.tipo === 'pcm' ? 'pcm' : 'tecnico', setor: f.tipo === 'pcm' ? null : f.tipo })
      setF({ ...f, username: '', nome: '', password: '' }); setMsg('Usuário criado.')
    } catch (x) { setMsg(x.message) }
  }
  const salvar = async () => {
    setErro('')
    const eu = edit.id === me.uid
    const novo = edit.username.trim().toLowerCase()
    const mudou = novo !== edit.orig
    if (!novo) return setErro('Informe o usuário.')
    if (mudou && users.some((x) => x.id !== edit.id && x.username === novo)) return setErro('Usuário já existe.')
    const data = { nome: edit.nome.trim(), username: novo, role: edit.tipo === 'pcm' ? 'pcm' : 'tecnico', setor: edit.tipo === 'pcm' ? null : edit.tipo,
      admin: edit.tipo === 'pcm' ? !!edit.admin : false, ativo: eu ? true : edit.ativo !== false }
    if (store.demo && edit.senha) data.senha = edit.senha
    if (eu) { data.admin = true; data.role = 'pcm'; data.setor = null } // não permite se rebaixar
    const antigo = users.find((x) => x.id === edit.id)
    const ops = []
    if (store.demo && mudou) { // no modo demo o login é a própria chave do cadastro
      ops.push({ col: 'users', id: edit.id, del: true }, { col: 'users', id: novo, data: { ...Object.fromEntries(Object.entries(antigo).filter(([k]) => k !== 'id')), ...data } })
    } else {
      ops.push({ col: 'users', id: edit.id, merge: true, data })
      if (mudou) {
        const email = store.authEmailOf(antigo)
        ops.push({ col: 'users', id: edit.id, merge: true, data: { authEmail: email } }, { col: 'logins', id: edit.orig, del: true }, { col: 'logins', id: novo, data: { email } })
      }
    }
    if (mudou) // mantém os serviços atribuídos a esse membro
      eqs.filter((e) => e.servicos?.some((s) => s.resp?.includes(edit.orig))).forEach((e) =>
        ops.push({ col: 'equipamentos', id: e.id, merge: true, data: { servicos: e.servicos.map((s) => ({ ...s, resp: (s.resp || []).map((r) => (r === edit.orig ? novo : r)) })) } }))
    await store.batch(ops)
    setEdit(null)
    if (store.demo && mudou && eu) store.auth.signOut()
  }
  const abrir = (u) => { setErro(''); setEdit({ id: u.id, orig: u.username, nome: u.nome, username: u.username, tipo: tipoDe(u), admin: !!u.admin, ativo: u.ativo !== false, senha: '' }) }

  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <form data-tour="membros" onSubmit={add} className="grid gap-2 rounded-xl border bg-panel p-3 sm:grid-cols-2">
        <h3 className="label sm:col-span-2">Novo membro</h3>
        <input required placeholder="Usuário (login)" autoCapitalize="none" value={f.username} onChange={(e) => setF({ ...f, username: e.target.value.replace(/[^a-zA-Z0-9._-]/g, '') })} className={inp} />
        <input required placeholder="Nome" value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} className={inp} />
        <input required placeholder="Senha" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} className={inp} />
        <select value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value })} className={inp}>{TIPOS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        <button className="bg-brand rounded-lg p-2 sm:col-span-2">Criar membro</button>
        {msg && <p className="text-sm sm:col-span-2">{msg}</p>}
      </form>

      <div className="rounded-xl border bg-panel p-3">
        <h3 className="label mb-1">Membros ({users.length})</h3>
        {users.map((u) => (
          <div key={u.id} className={`flex items-center justify-between gap-2 border-t py-2 text-sm first:border-0 ${u.ativo === false ? 'opacity-50' : ''}`}>
            <span className="min-w-0 truncate">{u.nome} <span className="text-mute">({u.username})</span>{u.admin && <span className="ml-1 rounded bg-brand/15 px-1.5 text-xs text-brand">admin</span>}{u.ativo === false && <span className="ml-1 rounded bg-red-500/15 px-1.5 text-xs text-red-300">desativado</span>}</span>
            <span className="flex shrink-0 items-center gap-2"><span className="hidden whitespace-nowrap sm:block">{tipoUsuario(u)} <span className="text-mute">· {categoria(u)}</span></span>
              <button onClick={() => abrir(u)} className="rounded-lg border px-3 py-1">Editar</button></span>
          </div>
        ))}
      </div>

      {edit && (
        <Portal><div data-modal className="fixed inset-0 z-30 flex items-end justify-center bg-black/50 sm:items-center">
          <div className="w-full max-w-md space-y-3 rounded-t-2xl border bg-panel p-4 sm:rounded-2xl">
            <h2 className="text-lg font-bold">Editar membro</h2>
            <label className="block text-sm">Usuário (login)<input autoCapitalize="none" value={edit.username} onChange={(e) => setEdit({ ...edit, username: e.target.value.replace(/[^a-zA-Z0-9._-]/g, '') })} className={`${inp} mt-1 w-full`} /></label>
            <label className="block text-sm">Nome<input value={edit.nome} onChange={(e) => setEdit({ ...edit, nome: e.target.value })} className={`${inp} mt-1 w-full`} /></label>
            <label className="block text-sm">Tipo
              <select value={edit.tipo} disabled={edit.id === me.uid} onChange={(e) => setEdit({ ...edit, tipo: e.target.value })} className={`${inp} mt-1 w-full`}>{TIPOS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
            </label>
            {edit.tipo === 'pcm' && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={edit.admin} disabled={edit.id === me.uid} onChange={(e) => setEdit({ ...edit, admin: e.target.checked })} /> Administrador (pode gerenciar membros)</label>}
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={edit.ativo} disabled={edit.id === me.uid} onChange={(e) => setEdit({ ...edit, ativo: e.target.checked })} /> Acesso ativo</label>
            {store.demo
              ? <label className="block text-sm">Nova senha (opcional)<input value={edit.senha} onChange={(e) => setEdit({ ...edit, senha: e.target.value })} className={`${inp} mt-1 w-full`} /></label>
              : <p className="text-xs text-mute">Troca de senha: não disponível aqui (exige função de servidor).</p>}
            {erro && <p className="text-sm text-red-400">{erro}</p>}
            <div className="flex justify-end gap-2">
              <button onClick={() => setEdit(null)} className="rounded-lg border px-4 py-2">Cancelar</button>
              <button onClick={salvar} className="bg-brand rounded-lg px-4 py-2">Salvar</button>
            </div>
          </div>
        </div></Portal>
      )}
    </div>
  )
}
