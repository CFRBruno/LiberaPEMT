import { RESULTADOS } from '../lib/constants.js'
export const ServiceChip = ({ s }) => (
  <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] ${RESULTADOS[s.resultado || 'pendente'].cls}`}>
    {s.tipo}
  </span>
)
export const StatusPill = ({ r }) => (
  <span className={`rounded border px-2 py-0.5 text-xs font-medium ${RESULTADOS[r || 'pendente'].cls}`}>{RESULTADOS[r || 'pendente'].label}</span>
)
