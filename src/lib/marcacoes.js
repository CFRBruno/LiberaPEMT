import { useMemo } from 'react'
import { useCol, useStore } from './store.js'
import { iso } from './dates.js'

// Marcações dos colaboradores (Realizado / Adiado) valem sobre o resultado salvo pelo PCM,
// desde que mais recentes que a última alteração do PCM naquele serviço.
export function mergeMarcacoes(eqs, marcs) {
  if (!marcs.length) return eqs
  const ultima = {}
  for (const m of marcs) { const k = `${m.eqId}:${m.svcId}`; if (!ultima[k] || (m.em || 0) > (ultima[k].em || 0)) ultima[k] = m }
  return eqs.map((e) => {
    if (!e.servicos?.length) return e
    let mudou = false
    const servicos = e.servicos.map((s) => {
      const m = ultima[`${e.id}:${s.id}`]
      if (!m || (m.em || 0) <= (s.resultadoEm ? Date.parse(s.resultadoEm) : 0)) return s
      mudou = true
      return { ...s, resultado: m.acao, dataRealizacao: m.acao === 'realizado' ? iso(new Date(m.em)) : s.dataRealizacao || null,
        _marca: { acao: m.acao, por: m.por, nome: m.nome, em: m.em, obs: m.obs || '' } }
    })
    return mudou ? { ...e, servicos } : e
  })
}

// Equipamentos já com as marcações aplicadas
export function useEquip() {
  const eqs = useCol('equipamentos')
  const marcs = useCol('marcacoes')
  return useMemo(() => mergeMarcacoes(eqs, marcs), [eqs, marcs])
}

// Registra a marcação de um colaborador
export function useMarcar(user) {
  const store = useStore()
  return (eq, s, acao, obs = '') => store.batch([{ col: 'marcacoes', id: `${Date.now().toString(36)}-${user.username}`,
    data: { eqId: eq.id, tag: eq.tag, svcId: s.id, tipo: s.tipo, acao, por: user.username, nome: user.nome, setor: user.setor || null, obs: obs.trim(), em: store.agora() } }])
}
