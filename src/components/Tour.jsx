import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Portal from './Portal.jsx'

// Tutorial guiado: destaca um elemento (data-tour="...") e explica em passos. Troca de aba sozinho.
// Teclado: → / Enter avançam, ← voltam, Esc fecha.
export default function Tour({ steps, tab, setTab, onClose, onNever }) {
  const [i, setI] = useState(0)
  const [rect, setRect] = useState(null)
  const [alt, setAlt] = useState(0) // força recálculo ao rolar/redimensionar
  const card = useRef(null)
  const step = steps[i]
  const ultimo = i === steps.length - 1

  // troca de aba, espera renderizar e localiza o alvo
  useEffect(() => {
    if (step.tab && step.tab !== tab) setTab(step.tab)
    let t = setTimeout(function procurar(n = 0) {
      const el = step.alvo && document.querySelector(`[data-tour="${step.alvo}"]`)
      if (el) { el.scrollIntoView({ block: 'center', behavior: 'instant' }); setTimeout(() => setAlt((x) => x + 1), 60) }
      else if (n < 4 && step.alvo) t = setTimeout(() => procurar(n + 1), 120)
      else setRect(null)
    }, step.tab && step.tab !== tab ? 380 : 60)
    return () => clearTimeout(t)
  }, [i]) // eslint-disable-line

  useLayoutEffect(() => {
    const el = step.alvo && document.querySelector(`[data-tour="${step.alvo}"]`)
    const r = el?.getBoundingClientRect()
    setRect(r && r.width > 0 ? { top: r.top, left: r.left, width: r.width, height: r.height } : null)
  }, [i, alt, tab])
  useEffect(() => {
    const f = () => setAlt((x) => x + 1)
    window.addEventListener('resize', f); window.addEventListener('scroll', f, true)
    return () => { window.removeEventListener('resize', f); window.removeEventListener('scroll', f, true) }
  }, [])
  useEffect(() => {
    const k = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); ultimo ? onClose() : setI((x) => x + 1) }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); setI((x) => Math.max(0, x - 1)) }
    }
    window.addEventListener('keydown', k, true)
    return () => window.removeEventListener('keydown', k, true)
  }, [ultimo]) // eslint-disable-line

  const emBaixo = rect ? rect.top + rect.height / 2 > window.innerHeight / 2 : false
  const pad = 6
  return (
    <Portal>
      <div data-modal className="fixed inset-0 z-50" role="dialog" aria-label="Tutorial">
        {rect ? (
          <div className="pointer-events-none fixed rounded-xl ring-2 ring-brand transition-all duration-300"
            style={{ top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2, boxShadow: '0 0 0 9999px rgba(3,6,12,.78), 0 0 24px rgb(239 128 36 / .55)' }} />
        ) : <div className="fixed inset-0 bg-[rgba(3,6,12,.78)]" />}
        <div ref={card} className={`fixed left-1/2 w-[min(92vw,360px)] -translate-x-1/2 rounded-2xl border border-brand/50 bg-panel p-4 shadow-2xl ${rect ? (emBaixo ? 'top-3' : 'bottom-3') : 'top-1/2 -translate-y-1/2'}`}>
          <div className="mb-1 flex items-center justify-between"><span className="label !text-brand">Passo {i + 1} de {steps.length}</span>
            <span className="flex gap-3"><button onClick={onClose} className="text-xs text-mute underline">Pular</button>{onNever && <button onClick={onNever} className="text-xs text-mute underline">Não mostrar mais</button>}</span></div>
          <h3 className="text-lg font-bold">{step.titulo}</h3>
          <p className="mt-1 text-sm leading-relaxed text-mute">{step.texto}</p>
          <div className="mt-3 flex h-1 gap-0.5">{steps.map((_, k) => <span key={k} className={`h-full flex-1 rounded-full ${k <= i ? 'bg-brand' : 'bg-line'}`} />)}</div>
          <div className="mt-3 flex justify-between gap-2">
            <button onClick={() => setI((x) => x - 1)} disabled={i === 0} className="rounded-lg border px-4 py-2 text-sm disabled:opacity-30">Voltar</button>
            <button onClick={() => (ultimo ? onClose() : setI(i + 1))} className="bg-brand rounded-lg px-5 py-2 text-sm">{ultimo ? 'Concluir ✓' : 'Próximo →'}</button>
          </div>
        </div>
      </div>
    </Portal>
  )
}

const PCM = [
  { titulo: 'Bem-vindo ao LiberaPEMT 👋', texto: 'Vamos fazer um passeio rápido pelas telas. Você pode voltar, avançar com os botões ou com as setas ← →, e sair quando quiser. Para rever depois, use o botão ? no topo.' },
  { tab: 'plan', alvo: 'taxa', titulo: 'Taxa de indisponibilidade', texto: 'Indisponíveis ÷ frota total, comparada com a meta. A caixa "Faltam liberar" mostra quantos equipamentos precisam sair da indisponibilidade para atingir a meta.' },
  { tab: 'plan', alvo: 'modo-plan', titulo: 'Semana ou Mês', texto: 'Planeje por semana (Seg a Sex) ou veja o mês inteiro, só com dias úteis. As setas mudam o período e "Hoje" volta ao atual.' },
  { tab: 'plan', alvo: 'sem', titulo: 'Sem previsão ⚠', texto: 'Equipamentos sem dia definido ficam aqui, com alerta vermelho. Arraste cada cartão para o dia em que ele será atendido. Quando tudo estiver programado, vira ✓.' },
  { tab: 'plan', alvo: 'card', titulo: 'O cartão do equipamento', texto: 'Mostra TAG, status, dias parados e os serviços. O ícone indica o tipo (tesoura/articulada) e a cor, a marca. Clique para definir dia, serviços, responsáveis e resultados.' },
  { tab: 'tasks', alvo: 'modo-tasks', titulo: 'Tarefas do dia', texto: 'É a visão da equipe, em tempo real: Dia, Semana, Mês e Serviços (todos os equipamentos de cada tipo de serviço, com filtro por resultado). Os colaboradores só veem esta tela.' },
  { tab: 'chart', alvo: 'grafico', titulo: 'Evolução', texto: 'Serviços realizados por semana (Liberação, Pintura, Lavagem), indisponíveis restantes e a taxa contra a meta. A base é a primeira importação do mês.' },
  { tab: 'frota', alvo: 'frota-form', titulo: 'Frota', texto: 'Informe aqui a frota total sempre que ela mudar. A taxa de indisponibilidade usa esse número. Cada atualização fica no histórico, e a meta também pode ser alterada.' },
  { tab: 'hist', alvo: 'hist', titulo: 'Histórico', texto: 'Resumo das importações, maior tempo parado e equipamentos liberados. Nada é apagado: cada importação fica guardada com data.' },
  { tab: 'import', alvo: 'drop', titulo: 'Importar a lista', texto: 'Arraste a planilha (.xls/.xlsx) ou cole o texto copiado do sistema. Você vê uma prévia antes de confirmar. Quem sai da lista vira "liberado"; dias e serviços já programados são mantidos.' },
  { tab: 'users', alvo: 'membros', admin: true, titulo: 'Membros', texto: 'Só administradores veem esta aba. Crie e edite membros (PCM, Manutenção, Pintura, Lavagem). Pintura e Lavagem são atribuídas sozinhas ao setor certo.' },
  { tab: 'plan', alvo: 'setas', titulo: 'Atalhos de teclado', texto: 'No computador, as setas ← → trocam de aba. Dentro de um campo, aperte Esc para sair dele (o texto fica) e use as setas de novo.' },
  { alvo: 'ajuda', titulo: 'Precisa de ajuda?', texto: 'Toque em ? a qualquer hora para rever o tutorial completo, ver só o tutorial da tela em que você está ou consultar as perguntas frequentes.' },
  { titulo: 'Tudo pronto! ✅', texto: 'Rotina sugerida: à noite, importe a lista e confira a taxa; arraste os equipamentos para os dias; defina os serviços e responsáveis. Os colaboradores recebem os avisos no celular.' },
]
const LEITOR = [
  { titulo: 'Bem-vindo ao LiberaPEMT 👋', texto: 'Aqui você vê o que precisa ser feito. Vamos a um passeio rápido. Para rever depois, use o botão ? no topo.' },
  { tab: 'tasks', alvo: 'sino', titulo: 'Avisos', texto: 'Quando o PCM atribui um serviço a você, aparece o sino 🔔 com a quantidade e o painel "Novo para você". Toque num item para ver os detalhes e em "Entendi ✓" para marcar como visto.' },
  { tab: 'tasks', alvo: 'modo-tasks', titulo: 'Dia · Semana · Mês · Serviços', texto: 'Veja o que está programado por dia, semana ou mês. Em "Serviços" escolha um ou mais tipos (Pintura, Lavagem…) para ver todos os equipamentos ligados a eles.' },
  { tab: 'tasks', alvo: 'minhas', titulo: 'Só as minhas tarefas', texto: 'Ligue para ver apenas o que está atribuído a você. Desligue para acompanhar também o trabalho dos colegas.' },
  { tab: 'tasks', alvo: 'dias', titulo: 'Escolha o dia', texto: 'Toque num dia da semana para ver os equipamentos programados. As setas mudam de semana.' },
  { tab: 'tasks', alvo: 'cartao-tarefa', titulo: 'Toque no equipamento', texto: 'Abre todos os serviços dele: resultado em cores (verde = realizado, amarelo = adiado, laranja = fora do prazo, vermelho = não realizado), responsáveis e observações.' },
  { tab: 'tasks', alvo: 'taxa-pill', titulo: 'Indicador da frota', texto: 'Mostra a taxa de indisponibilidade da frota. Quanto menor, melhor: a meta é 5%.' },
  { alvo: 'ajuda', titulo: 'Precisa de ajuda?', texto: 'Toque em ? a qualquer hora para rever este tutorial completo, ver só o tutorial da tela em que você está ou consultar as perguntas frequentes.' },
  { titulo: 'Pronto! ✅', texto: 'Qualquer dúvida, é só tocar no ? no topo.' },
]
export const passosTour = (user) => (user.role === 'pcm' ? PCM.filter((p) => !p.admin || user.admin) : LEITOR)
