import { useState } from 'react'
import { useStore } from '../lib/store.js'
import Brand from './Brand.jsx'

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
      <form onSubmit={go} className="corners w-full max-w-xs space-y-3 rounded-xl border bg-panel p-6">
        <Brand big />
        <input autoFocus autoCapitalize="none" placeholder="Usuário" value={u} onChange={(e) => setU(e.target.value)} className="w-full rounded border p-2" />
        <input type="password" placeholder="Senha" value={p} onChange={(e) => setP(e.target.value)} className="w-full rounded border p-2" />
        {err && <p className="text-sm text-red-400">{err}</p>}
        <button disabled={busy} className="w-full rounded bg-brand p-2 text-white disabled:opacity-50">Entrar</button>
        {s.demo && <p className="text-xs text-mute">Demo: pcm / pcm123 · tecnico / tecnico123</p>}
      </form>
    </div>
  )
}
