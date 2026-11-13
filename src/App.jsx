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

const PCM_TABS = [['plan', 'Planejamento'], ['tasks', 'Tarefas do dia'], ['import', 'Importar'], ['chart', 'Evolução'], ['hist', 'Histórico'], ['users', 'Usuários']]
const TEC_TABS = [['tasks', 'Tarefas do dia'], ['chart', 'Evolução']]

export default function App() {
  const [store, setStore] = useState(null)
  const [user, setUser] = useState(undefined)
  const [tab, setTab] = useState(null)
  useEffect(() => { loadStore().then(setStore) }, [])
  useEffect(() => (store ? store.auth.onChange(setUser) : undefined), [store])

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
          <span className="label ml-auto hidden sm:block">{user.nome} · {pcm ? 'PCM' : 'Mão de obra'}</span>
          <button onClick={() => store.auth.signOut()} className="ml-auto rounded-lg border px-3 py-1.5 text-sm sm:ml-0">Sair</button>
        </div>
        <nav className="mx-auto flex max-w-[1600px] gap-1 overflow-x-auto px-2">
          {tabs.map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`navtab whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors duration-300 ${cur === k ? 'on text-brand [text-shadow:0_0_10px_rgb(239_128_36/.5)]' : 'text-mute hover:text-ink'}`}>{l}</button>
          ))}
        </nav>
        {store.demo && <div className="bg-brand/90 px-3 py-1 text-center text-xs font-medium text-black">Modo demonstração: dados salvos só neste navegador. Configure o Firebase (.env) para uso real.</div>}
      </header>
      <main key={cur} className="tab-enter mx-auto max-w-[1600px] p-3">
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
