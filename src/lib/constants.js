export const SERVICOS = ['Pintura', 'Serralheria', 'Aguardando peças', 'Liberação', 'Preventiva', 'Lavagem']
export const RESULTADOS = {
  pendente: { label: 'Pendente', cls: 'bg-slate-500/15 text-slate-300 border-slate-500/50', dot: 'bg-slate-400' },
  realizado: { label: 'Realizado', cls: 'bg-green-500/15 text-green-300 border-green-500/60', dot: 'bg-green-500' },
  adiado: { label: 'Adiado', cls: 'bg-yellow-400/15 text-yellow-300 border-yellow-400/60', dot: 'bg-yellow-400' },
  fora_prazo: { label: 'Fora do prazo', cls: 'bg-orange-500/15 text-orange-300 border-orange-500/60', dot: 'bg-orange-500' },
  nao_realizado: { label: 'Não realizado', cls: 'bg-red-500/15 text-red-300 border-red-500/60', dot: 'bg-red-500' },
}
export const STATUS_CLS = {
  Manutenção: 'bg-brand/15 text-orange-300 border border-brand/40',
  Inspeção: 'bg-sky-500/15 text-sky-300 border border-sky-500/40',
}

// Tipo de usuário (setor) e categoria de acesso
export const SETORES = { manutencao: 'Manutenção', pintura: 'Pintura', lavagem: 'Lavagem' }
export const tipoUsuario = (u) => (u.role === 'pcm' ? 'PCM' : SETORES[u.setor] || 'Manutenção')
export const categoria = (u) => (u.role === 'pcm' ? 'Editor' : 'Leitor')

// Atribuição automática: Pintura -> membros do setor Pintura; Lavagem -> membros do setor Lavagem.
// Soma-se aos responsáveis escolhidos manualmente e vale também para membros cadastrados depois.
export const SETOR_DO_SERVICO = { Pintura: 'pintura', Lavagem: 'lavagem' }
export const autoResp = (s, users) => {
  const setor = SETOR_DO_SERVICO[s.tipo]
  return setor ? users.filter((u) => u.role !== 'pcm' && u.setor === setor && u.ativo !== false).map((u) => u.username) : []
}
export const respEfetivos = (s, users) => [...new Set([...(s.resp || []), ...autoResp(s, users)])]

// "57 dias em manutenção" / "12 dias em inspeção"
export const diasTxt = (e) => `${e.dias ?? '?'} dias em ${(e.status || 'manutenção').toLowerCase()}`
