export const SERVICOS = ['Pintura', 'Serralheria', 'Aguardando peças', 'Liberação', 'Preventiva', 'Lavagem']
export const RESULTADOS = {
  pendente: { label: 'Pendente', cls: 'bg-slate-200 text-slate-700 border-slate-300', dot: 'bg-slate-400' },
  realizado: { label: 'Realizado', cls: 'bg-green-100 text-green-800 border-green-400', dot: 'bg-green-500' },
  adiado: { label: 'Adiado', cls: 'bg-yellow-100 text-yellow-800 border-yellow-400', dot: 'bg-yellow-400' },
  fora_prazo: { label: 'Fora do prazo', cls: 'bg-orange-100 text-orange-800 border-orange-400', dot: 'bg-orange-500' },
  nao_realizado: { label: 'Não realizado', cls: 'bg-red-100 text-red-800 border-red-400', dot: 'bg-red-500' },
}
export const STATUS_CLS = {
  Manutenção: 'bg-amber-100 text-amber-900',
  Inspeção: 'bg-sky-100 text-sky-900',
}
