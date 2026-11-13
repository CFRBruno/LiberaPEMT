// Equipamento é considerado LIBERADO quando o serviço "Liberação" está Realizado.
const lib = (e) => (e?.servicos || []).find((s) => s.tipo === 'Liberação' && s.resultado === 'realizado')
export const isLiberado = (e) => !!lib(e)
export const dataLiberacao = (e) => lib(e)?.dataRealizacao || null
