import { fmtPct, nivel, NIVEL_CLS, useFrota } from '../lib/frota.js'

// Indicador compacto no topo (visível para todos)
export default function TaxaPill({ onClick }) {
  const { taxa, meta, indisp, total } = useFrota()
  const n = nivel(taxa, meta)
  return (
    <button onClick={onClick} title={total ? `${indisp} indisponíveis de ${total} na frota · meta ${meta}%` : 'Frota total não definida'}
      className="flex items-center gap-2 rounded-lg border bg-panel px-2.5 py-1 text-left leading-tight">
      <span className="label !text-[.6rem]">Indisp.</span>
      <b className={`tagid text-base ${NIVEL_CLS[n]}`}>{fmtPct(taxa)}</b>
      <span className="label hidden !text-[.6rem] sm:block">meta {meta}%</span>
    </button>
  )
}
