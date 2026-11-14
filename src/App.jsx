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
import { useNovos } from './lib/novos.js'
import { useBatimento } from './lib/presenca.js'
import PresencaPill from './components/PresencaPill.jsx'
import Tour, { passosTour } from './components/Tour.jsx'
import { categoria, tipoUsuario } from './lib/constants.js'

const PCM_TABS = [['plan', 'Planejamento'], ['tasks', 'Tarefas do dia'], ['chart', 'Evolução'], ['frota', 'Frota'], ['hist', 'Histórico'], ['import', 'Importar'], ['users', 'Membros']]
const TEC_TABS = [['tasks', 'Tarefas do dia']] // leitores: tela única, sem abas

// Envia a presença (todos) — componente sem aparência
function Batimento({ user, tela }) { useBatimento(user, tela); return null }

// Sino de avisos (só leitores): serviços novos atribuídos a mim
function Sino({ user }) {
  const { novos } = useNovos(user)
  const n = novos.length
  useEffect(() => { document.title = n ? `(${n}) LiberaPEMT` : 'LiberaPEMT' }, [n])
  useEffect(() => { if (n) navigator.vibrate?.([120, 60, 120]) }, [n])
  if (!n) return null
  return (
    <button data-tour="sino" onClick={() => document.getElementById('novos')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} aria-label={`${n} serviços novos`}
      className="alert-pulse flex shrink-0 items-center gap-1.5 rounded-lg bg-brand px-2.5 py-1.5 text-sm">🔔 <b className="tagid">{n}</b></button>
  )
}

// Chevron fino que indica o atalho ← / → (só em telas grandes)
const Seta = ({ dir, on, onClick }) => (
  <button tabIndex={-1} data-tour={dir > 0 ? 'setas' : undefined} onClick={onClick} title={dir < 0 ? 'Aba anterior (←)' : 'Próxima aba (→)'} aria-label={dir < 0 ? 'Aba anterior' : 'Próxima aba'}
    className={`hidden shrink-0 items-center gap-1 rounded-md px-1.5 py-1 transition-all duration-200 lg:flex ${on ? 'scale-110 text-brand' : 'text-mute/60 hover:text-ink'}`}>
    {dir > 0 && <kbd className="rounded border px-1 text-[10px] leading-4">→</kbd>}
    <svg width="9" height="16" viewBox="0 0 9 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d={dir < 0 ? 'M7.5 1 1.5 8l6 7' : 'M1.5 1l6 7-6 7'} /></svg>
    {dir < 0 && <kbd className="rounded border px-1 text-[10px] leading-4">←</kbd>}
  </button>
)

export default function App() {
  const [store, setStore] = useState(null)
  const [user, setUser] = useState(undefined)
  const [tab, setTab] = useState(null)
  useEffect(() => { loadStore().then(setStore) }, [])
  useEffect(() => (store ? store.auth.onChange(setUser) : undefined), [store])

  // Atalhos no PC: ← / → alternam entre as abas. Esc tira o foco do campo atual (sem apagar o texto),
  // e então as setas voltam a navegar. Ignorado com janela aberta.
  const [flash, setFlash] = useState(null)
  const [tour, setTour] = useState(false)
  const chaveTour = user ? `lpemt:tour:${user.username}` : null
  useEffect(() => { // abre sozinho na primeira vez de cada pessoa neste aparelho
    if (!chaveTour) return
    let visto = false; try { visto = localStorage.getItem(chaveTour) === 'ok' } catch { /* ok */ }
    if (!visto) { const t = setTimeout(() => setTour(true), 900); return () => clearTimeout(t) }
  }, [chaveTour])
  const fechaTour = () => { setTour(false); try { localStorage.setItem(chaveTour, 'ok') } catch { /* ok */ } }
  const lista = user ? (user.role === 'pcm' ? PCM_TABS.filter(([k]) => k !== 'users' || user.admin) : TEC_TABS).map(([k]) => k) : []
  const mover = (dir) => setTab((t) => { const i = Math.max(0, lista.indexOf(t ?? lista[0])); return lista[(i + dir + lista.length) % lista.length] })
  const ping = (dir) => { setFlash(dir); setTimeout(() => setFlash(null), 260) }
  useEffect(() => {
    const onKey = (e) => {
      if (!user || e.altKey || e.ctrlKey || e.metaKey) return
      const campo = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)
      if (e.key === 'Escape') { if (campo) { document.activeElement.blur(); e.preventDefault() } return }
      if (!['ArrowLeft', 'ArrowRight'].includes(e.key) || lista.length < 2) return
      if (campo || document.querySelector('[data-modal]')) return
      const dir = e.key === 'ArrowRight' ? 1 : -1
      mover(dir); ping(dir); e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [user]) // eslint-disable-line

  if (!store || user === undefined) return <p className="p-8 text-mute">Carregando…</p>
  if (!user) return <StoreCtx.Provider value={store}><Login /></StoreCtx.Provider>

  const pcm = user.role === 'pcm'
  const tabs = pcm ? PCM_TABS.filter(([k]) => k !== 'users' || user.admin) : TEC_TABS
  const cur = tabs.some(([k]) => k === tab) ? tab : tabs[0][0]
  return (
    <StoreCtx.Provider value={store}>
      <header className="sticky top-0 z-20 border-b border-brand/40 bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-3 py-2">
          <Brand />
          <div className="ml-auto flex items-center gap-2">{!pcm && <Sino user={user} />}{pcm && <PresencaPill />}<TaxaPill onClick={() => pcm && setTab('frota')} /></div>
          {pcm && <span className="label hidden lg:block" title="Use as setas ← → para trocar de aba">{user.nome} · {tipoUsuario(user)} · {categoria(user)}</span>}
          <button onClick={() => setTour(true)} aria-label="Tutorial" title="Tutorial" className="rounded-full border px-2.5 py-1 text-sm text-mute hover:text-brand">?</button>
          <button onClick={() => store.auth.signOut()} className="rounded-lg border px-3 py-1.5 text-sm">Sair</button>
        </div>
        {!pcm && <div className="label mx-auto max-w-[1600px] truncate px-3 pb-2">{user.nome} · {tipoUsuario(user)}</div>}
        {tabs.length > 1 && (
          <div className="mx-auto flex max-w-[1600px] items-center gap-1 px-2">
            <Seta dir={-1} on={flash === -1} onClick={() => { mover(-1); ping(-1) }} />
            <nav className="flex min-w-0 gap-1 overflow-x-auto">
              {tabs.map(([k, l]) => (
                <button key={k} data-tour={`tab-${k}`} tabIndex={-1} onClick={() => setTab(k)} className={`navtab whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors duration-300 ${cur === k ? 'on text-brand [text-shadow:0_0_10px_rgb(239_128_36/.5)]' : 'text-mute hover:text-ink'}`}>{l}</button>
              ))}
            </nav>
            <Seta dir={1} on={flash === 1} onClick={() => { mover(1); ping(1) }} />
          </div>
        )}
        {store.demo && <div className="truncate bg-brand/90 px-3 py-1 text-center text-xs font-medium text-black">Modo demonstração · dados só neste navegador</div>}
      </header>
      <main key={cur} className="tab-enter mx-auto max-w-[1600px] p-3">
        {cur === 'plan' && <Kanban user={user} onFrota={() => setTab('frota')} />}
        {cur === 'tasks' && <Tasks user={user} />}
        {cur === 'import' && <ImportView />}
        {cur === 'chart' && <Evolution />}
        {cur === 'hist' && <History />}
        {cur === 'users' && user.admin && <Users me={user} />}
        {cur === 'frota' && <Frota user={user} />}
      </main>
      <Batimento user={user} tela={(tabs.find(([k]) => k === cur) || [])[1] || ''} />
      {tour && <Tour steps={passosTour(user)} tab={cur} setTab={setTab} onClose={fechaTour} />}
    </StoreCtx.Provider>
  )
}
