import { useCol } from './store.js'
import { useEquip } from './marcacoes.js'
import { isLiberado } from './liberado.js'

export const fmtPct = (x) => (x == null ? '—' : `${x.toFixed(1).replace('.', ',')}%`)
// verde dentro da meta, âmbar até 1,5x a meta, vermelho acima
export const nivel = (taxa, meta) => (taxa == null ? 'none' : taxa <= meta ? 'ok' : taxa <= meta * 1.5 ? 'warn' : 'bad')
export const NIVEL_CLS = { ok: 'text-green-400', warn: 'text-yellow-300', bad: 'text-red-400', none: 'text-mute' }
export const NIVEL_BAR = { ok: 'bg-green-500', warn: 'bg-yellow-400', bad: 'bg-red-500', none: 'bg-slate-500' }

// Taxa de indisponibilidade = indisponíveis / frota total
export function useFrota() {
  const eqs = useEquip()
  const regs = [...useCol('frota')].sort((a, b) => b.stamp.localeCompare(a.stamp))
  const cfg = useCol('config').find((c) => c.id === 'geral')
  const meta = cfg?.meta ?? 5
  const indisp = eqs.filter((e) => e.ativo && !isLiberado(e)).length
  const total = regs[0]?.total ?? null
  const taxa = total ? (indisp / total) * 100 : null
  // frota vigente numa data (último registro com data <= dia); se for anterior ao 1º registro, usa o 1º
  const frotaEm = (dia) => (regs.find((r) => r.data <= dia) || regs[regs.length - 1])?.total ?? null
  // quantos precisam sair da indisponibilidade para atingir a meta
  const faltam = total ? Math.max(0, indisp - Math.floor((meta / 100) * total)) : null
  return { indisp, total, taxa, meta, regs, frotaEm, faltam }
}
