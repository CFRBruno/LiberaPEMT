import { useEffect, useState } from 'react'
import { loadStore, StoreCtx } from './lib/store.js'
import Login from './components/Login.jsx'
import Kanban from './components/Kanban.jsx'
import Tasks from './components/Tasks.jsx'
import ImportView from './components/ImportView.jsx'
import Evolution from './components/Evolution.jsx'
import History from './components/History.jsx'
import Users from './components/Users.jsx'

const PCM_TABS = [['plan', 'Planejamento'], ['tasks', 'Tarefas do dia'], ['import', 'Importar'], ['chart', 'Evolução'], ['hist', 'Histórico'], ['users', 'Usuários']]
const TEC_TABS = [['tasks', 'Tarefas do dia'], ['chart', 'Evolução']]

export default function App() {
  const [store, setStore] = useState(null)
  const [user, setUser] = useState(undefined)
  const [tab, setTab] = useState(null)
  useEffect(() => { loadStore().then(setStore) }, [])
  useEffect(() => (store ? store.auth.onChange(setUser) : undefined), [store])

  if (!store || user === undefined) return <p className="p-8 text-slate-500">Carregando…</p>
  if (!user) return <StoreCtx.Provider value={store}><Login /></StoreCtx.Provider>

  const pcm = user.role === 'pcm'
  const tabs = pcm ? PCM_TABS : TEC_TABS
  const cur = tabs.some(([k]) => k === tab) ? tab : tabs[0][0]
  return (
    <StoreCtx.Provider value={store}>
      <header className="sticky top-0 z-20 bg-slate-900 text-white">
        <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-3 py-2">
          <b className="text-lg">Libera<span className="text-amber-400">PEMT</span></b>
          <span className="ml-auto text-xs text-slate-300">{user.nome} · {pcm ? 'PCM' : 'Mão de obra'}</span>
          <button onClick={() => store.auth.signOut()} className="rounded bg-slate-700 px-2 py-1 text-xs">Sair</button>
        </div>
        <nav className="mx-auto flex max-w-[1600px] gap-1 overflow-x-auto px-2">
          {tabs.map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm ${cur === k ? 'border-amber-400 text-white' : 'border-transparent text-slate-400'}`}>{l}</button>
          ))}
        </nav>
        {store.demo && <div className="bg-amber-500 px-3 py-1 text-center text-xs text-black">Modo demonstração: dados salvos só neste navegador. Configure o Firebase (.env) para uso real.</div>}
      </header>
      <main className="mx-auto max-w-[1600px] p-3">
        {cur === 'plan' && <Kanban user={user} />}
        {cur === 'tasks' && <Tasks user={user} />}
        {cur === 'import' && <ImportView />}
        {cur === 'chart' && <Evolution />}
        {cur === 'hist' && <History />}
        {cur === 'users' && <Users />}
      </main>
    </StoreCtx.Provider>
  )
}
