import { useState } from 'react'
import { useStore } from '../lib/store.js'

export default function Login() {
  const s = useStore()
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const go = async (e) => {
    e.preventDefault(); setBusy(true); setErr('')
    try { await s.auth.signIn(u, p) } catch (x) { setErr(x.message) } finally { setBusy(false) }
  }
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={go} className="w-full max-w-xs space-y-3 rounded-xl bg-white p-6 shadow">
        <h1 className="text-center text-2xl font-bold">Libera<span className="text-amber-500">PEMT</span></h1>
        <input autoFocus autoCapitalize="none" placeholder="Usuário" value={u} onChange={(e) => setU(e.target.value)} className="w-full rounded border p-2" />
        <input type="password" placeholder="Senha" value={p} onChange={(e) => setP(e.target.value)} className="w-full rounded border p-2" />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button disabled={busy} className="w-full rounded bg-slate-900 p-2 text-white disabled:opacity-50">Entrar</button>
        {s.demo && <p className="text-xs text-slate-500">Demo: pcm / pcm123 · tecnico / tecnico123</p>}
      </form>
    </div>
  )
}
