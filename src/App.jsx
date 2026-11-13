import { useEffect, useState } from 'react'
import { loadStore, StoreCtx } from './lib/store.js'
import Login from './components/Login.jsx'
import Kanban from './components/Kanban.jsx'
import Tasks from './components/Tasks.jsx'
import ImportView from './components/ImportView.jsx'
import Evolution from './components/Evolution.jsx'
import History from './components/History.jsx'
import Users from './components/Users.jsx'
import Brand from './components/Brand.jsx'
import Frota from './components/Frota.jsx'
import TaxaPill from './components/TaxaPill.jsx'
import { categoria, tipoUsuario } from './lib/constants.js'

const PCM_TABS = [['plan', 'Planejamento'], ['tasks', 'Tarefas do dia'], ['import', 'Importar'], ['frota', 'Frota'], ['chart', 'Evolução'], ['hist', 'Histórico'], ['users', 'Usuários']]
const TEC_TABS = [['tasks', 'Tarefas do dia']] // leitores: tela única, sem abas

export default function App() {
  const [store, setStore] = useState(null)
  const [user, setUser] = useState(undefined)
  const [tab, setTab] = useState(null)
  useEffect(() => { loadStore().then(setStore) }, [])
  useEffect(() => (store ? store.auth.onChange(setUser) : undefined), [store])

  // Atalho no PC: ← / → alternam entre as abas (ignorado ao digitar ou com janela aberta)
  useEffect(() => {
    const onKey = (e) => {
      if (!user || e.altKey || e.ctrlKey || e.metaKey) return
      if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return
      if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName) || document.querySelector('[data-modal]')) return
      const list = (user.role === 'pcm' ? PCM_TABS : TEC_TABS).map(([k]) => k)
      setTab((t) => {
        const i = Math.max(0, list.indexOf(t ?? list[0]))
        return list[(i + (e.key === 'ArrowRight' ? 1 : -1) + list.length) % list.length]
      })
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [user])

  if (!store || user === undefined) return <p className="p-8 text-mute">Carregando…</p>
  if (!user) return <StoreCtx.Provider value={store}><Login /></StoreCtx.Provider>

  const pcm = user.role === 'pcm'
  const tabs = pcm ? PCM_TABS : TEC_TABS
  const cur = tabs.some(([k]) => k === tab) ? tab : tabs[0][0]
  return (
    <StoreCtx.Provider value={store}>
      <header className="sticky top-0 z-20 border-b border-brand/40 bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-3 py-2">
          <Brand />
          <div className="ml-auto"><TaxaPill onClick={() => pcm && setTab('frota')} /></div>
          {pcm && <span className="label hidden lg:block" title="Use as setas ← → para trocar de aba">{user.nome} · {tipoUsuario(user)} · {categoria(user)}</span>}
          <button onClick={() => store.auth.signOut()} className="rounded-lg border px-3 py-1.5 text-sm">Sair</button>
        </div>
        {!pcm && <div className="label mx-auto max-w-[1600px] truncate px-3 pb-2">{user.nome} · {tipoUsuario(user)}</div>}
        {tabs.length > 1 && <nav className="mx-auto flex max-w-[1600px] gap-1 overflow-x-auto px-2">
          {tabs.map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`navtab whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors duration-300 ${cur === k ? 'on text-brand [text-shadow:0_0_10px_rgb(239_128_36/.5)]' : 'text-mute hover:text-ink'}`}>{l}</button>
          ))}
        </nav>}
        {store.demo && <div className="truncate bg-brand/90 px-3 py-1 text-center text-xs font-medium text-black">Modo demonstração · dados só neste navegador</div>}
      </header>
      <main key={cur} className="tab-enter mx-auto max-w-[1600px] p-3">
        {cur === 'plan' && <Kanban user={user} onFrota={() => setTab('frota')} />}
        {cur === 'tasks' && <Tasks user={user} />}
        {cur === 'import' && <ImportView />}
        {cur === 'chart' && <Evolution />}
        {cur === 'hist' && <History />}
        {cur === 'users' && <Users />}
        {cur === 'frota' && <Frota user={user} />}
      </main>
    </StoreCtx.Provider>
  )
}
