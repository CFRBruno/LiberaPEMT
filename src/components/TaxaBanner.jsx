import { fmtPct, nivel, NIVEL_BAR, NIVEL_CLS, useFrota } from '../lib/frota.js'

// Faixa de destaque: taxa de indisponibilidade + máquinas que faltam para atingir a meta
export default function TaxaBanner({ onFrota }) {
  const { indisp, total, taxa, meta, faltam } = useFrota()
  const n = nivel(taxa, meta)
  const escala = Math.max(meta * 3, taxa ?? 0, 1)
  if (total == null) return (
    <button data-tour="taxa" onClick={onFrota} className="corners mb-3 w-full rounded-xl border border-dashed bg-panel p-3 truncate text-left text-sm text-mute">
      Defina a <b className="text-brand">frota total</b> para ver a taxa →
    </button>
  )
  return (
    <div data-tour="taxa" className="corners mb-3 grid grid-cols-[1fr_auto] items-center sm:grid-cols-[auto_1fr_auto] gap-x-4 gap-y-1 rounded-xl border bg-panel px-4 py-2">
      <div>
        <div className="label !text-[.6rem]"><span className="sm:hidden">Indisponibilidade</span><span className="hidden sm:inline">Taxa de indisponibilidade</span></div>
        <div className={`tagid text-3xl font-bold leading-tight sm:text-4xl ${NIVEL_CLS[n]} [text-shadow:0_0_16px_currentColor]`}>{fmtPct(taxa)}</div>
      </div>
      <div className="order-last col-span-2 min-w-0 sm:order-none sm:col-span-1">
        <div className="relative h-2.5 rounded-full bg-black/40">
          <div className={`h-full rounded-full transition-all duration-700 ${NIVEL_BAR[n]}`} style={{ width: `${Math.min(100, ((taxa ?? 0) / escala) * 100)}%` }} />
          <div className="absolute -top-1 h-4.5 w-0.5 bg-brand shadow-[0_0_8px_var(--color-brand)]" style={{ left: `${(meta / escala) * 100}%`, height: '1.1rem' }} />
        </div>
        <div className="mt-1 truncate text-xs text-mute">{indisp} indisponíveis ÷ {total} de frota · meta <b className="text-brand">{meta}%</b></div>
      </div>
      <div className={`rounded-lg border px-3 py-1 text-center ${faltam ? 'border-red-400/50 bg-red-500/10' : 'border-green-400/50 bg-green-500/10'}`}>
        <div className="label !text-[.6rem]">{faltam ? 'Faltam liberar' : 'Meta atingida'}</div>
        <div className={`tagid text-2xl font-bold leading-tight ${faltam ? 'text-red-400' : 'text-green-400'}`}>{faltam ? faltam : '✓'}</div>
      </div>
    </div>
  )
}
