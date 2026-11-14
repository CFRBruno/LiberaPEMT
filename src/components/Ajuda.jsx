import { useState } from 'react'
import Portal from './Portal.jsx'
import Teclas from './Teclas.jsx'

const FAQ_LEITOR = [
  ['Como marco um serviço como realizado?', 'Abra o equipamento (toque no cartão) e, no seu serviço, toque em ✔ Realizado. Confirme. O PCM é avisado com o seu nome, a data e o horário. Se não puder fazer agora, use ⏳ Adiar e escreva o motivo.'],
  ['Não estou vendo o meu serviço', 'Confira se "Só as minhas tarefas" está ligado e se o dia certo está selecionado. O serviço pode estar "sem previsão": veja na aba Serviços ou pelo painel "Novo para você". Se continuar faltando, avise o PCM.'],
  ['O que é o sino 🔔 e a etiqueta NOVO?', 'É um serviço novo atribuído a você. Toque nele para ver os detalhes e em "Entendi ✓" para marcar como visto.'],
  ['O que significam as cores dos resultados?', 'Verde = realizado · Amarelo = adiado · Laranja = fora do prazo · Vermelho = não realizado · Cinza = pendente.'],
  ['Como vejo os serviços dos colegas?', 'Na aba Serviços, marque um ou mais serviços (Pintura, Lavagem…) para ver todos os equipamentos ligados a eles. Desligue "Só os meus".'],
  ['Como deixo o site como aplicativo no celular?', 'No Chrome, toque nos três pontinhos ⋮ e em "Adicionar à tela inicial".'],
]
const FAQ_PCM = [
  ['Como importo a lista de equipamentos?', 'Aba Importar: arraste a planilha (.xls/.xlsx) ou cole o texto copiado do sistema, confira a prévia e confirme. Cada importação fica guardada no Histórico.'],
  ['Como defino serviços e responsáveis?', 'Clique no cartão do equipamento (em Manutenção), escolha o dia, adicione os serviços e os responsáveis e salve. Pintura e Lavagem vão sozinhas para o setor certo (🔒).'],
  ['Cometi um erro numa importação de teste', 'Histórico → importações anteriores → 🗑. Na mais recente, dá para marcar "Desfazer também na lista atual".'],
  ['Como atualizo a frota?', 'Aba Frota: informe o novo total. A taxa de indisponibilidade usa esse número. Dá para editar ou excluir atualizações antigas.'],
  ['Como sou avisado quando alguém conclui um serviço?', 'Balão no canto da tela e, se você tiver clicado em "🔔 Ativar avisos" no topo, notificação do computador. O Histórico mostra quem marcou, data e horário.'],
  ['Atalhos do teclado', '← → trocam de aba · Esc sai de um campo (o texto fica) e fecha janelas · Enter confirma janelas · no tutorial, → avança e ← volta.'],
]

// Central de ajuda: tutorial completo, tutorial da tela, perguntas frequentes e preferência
export default function Ajuda({ user, auto, onAuto, onCompleto, onTela, onClose }) {
  const faq = user.role === 'pcm' ? FAQ_PCM : FAQ_LEITOR
  const [aberta, setAberta] = useState(null)
  return (
    <Portal>
      <div data-modal className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 sm:items-center" onClick={onClose}>
        <Teclas onEsc={onClose} />
        <div className="flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border bg-panel sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
          <header className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="flex items-center gap-2 text-lg font-bold"><span className="flex h-7 w-7 items-center justify-center rounded-full border border-brand text-brand">?</span>Ajuda</h2>
            <button onClick={onClose} aria-label="Fechar" className="text-2xl leading-none text-mute">×</button>
          </header>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
            <section className="grid gap-2 sm:grid-cols-2">
              <button onClick={onCompleto} className="bg-brand rounded-lg px-4 py-3 text-left"><b className="block">▶ Ver o tutorial completo</b><span className="text-xs opacity-80">Passo a passo por todas as telas</span></button>
              <button onClick={onTela} className="rounded-lg border px-4 py-3 text-left"><b className="block">Tutorial desta tela</b><span className="text-xs text-mute">Só o que você está vendo agora</span></button>
            </section>
            <section>
              <h3 className="label mb-2">Perguntas frequentes</h3>
              <ul className="space-y-1.5">
                {faq.map(([p, r], i) => (
                  <li key={p} className="rounded-lg border">
                    <button onClick={() => setAberta(aberta === i ? null : i)} className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-medium"><span>{p}</span><span className="text-mute">{aberta === i ? '−' : '+'}</span></button>
                    {aberta === i && <p className="border-t px-3 py-2.5 text-sm leading-relaxed text-mute">{r}</p>}
                  </li>
                ))}
              </ul>
            </section>
            <label className="flex items-start gap-2 rounded-lg border bg-black/20 p-3 text-sm">
              <input type="checkbox" className="mt-1" checked={!auto} onChange={(e) => onAuto(!e.target.checked)} />
              <span><b>Não abrir o tutorial sozinho</b><span className="block text-xs text-mute">Vale só neste aparelho. Você continua podendo abrir o tutorial por aqui quando quiser.</span></span>
            </label>
          </div>
          <footer className="border-t px-4 py-3"><button onClick={onClose} className="w-full rounded-lg border py-2.5">Fechar</button></footer>
        </div>
      </div>
    </Portal>
  )
}
