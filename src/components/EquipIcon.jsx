import { equipInfo, MARCAS, TIPOS_EQ } from '../lib/equip.js'

// Silhueta miniatura: a FORMA indica o tipo (tesoura/articulada) e a COR indica a marca.
// Discreta de propósito (sem brilho, sem fundo): o verde não deve parecer "serviço realizado".
const D = {
  tesoura: <><path d="M10 14V3h44v11M10 8.5h44M32 3v11" /><rect x="7" y="14" width="50" height="4.5" rx="1.5" /><path d="M16 18.5 48 25M48 18.5 16 25M16 25l32 6.5M48 25 16 31.5M16 31.5 48 38M48 31.5 16 38" /><rect x="7" y="38" width="50" height="8.5" rx="2.5" /><circle cx="18" cy="51" r="4.6" /><circle cx="46" cy="51" r="4.6" /></>,
  articulada: <><rect x="34" y="42" width="38" height="5.5" rx="2.2" /><circle cx="42" cy="51" r="5" /><circle cx="65" cy="51" r="5" /><path d="M44 42v-4.5a3 3 0 0 1 3-3h20a3 3 0 0 1 3 3V42M50 34.5 38 11M57 34.5 42.5 13M37.5 10.5 17 7.5M17 7.5V12M7 12h20v13H7zM5 25h24v3.6H5z" /></>,
  telescopica: <><rect x="34" y="42" width="38" height="5.5" rx="2.2" /><circle cx="42" cy="51" r="5" /><circle cx="65" cy="51" r="5" /><path d="M44 42v-4.5a3 3 0 0 1 3-3h20a3 3 0 0 1 3 3V42M52 34.5 20 9M17 9V13M7 13h20v13H7zM5 26h24v3.6H5z" /></>,
}

export function EquipIcon({ e, marca, tipo, size = 18 }) {
  const info = e ? equipInfo(e) : { marca, tipo }
  if (!info.tipo) return null
  const cor = info.marca ? MARCAS[info.marca].cor : '#8593a8'
  const w = size * (info.tipo === 'tesoura' ? 1.14 : 1.36)
  return (
    <svg viewBox={info.tipo === 'tesoura' ? '0 0 64 56' : '0 0 76 56'} width={w} height={size} fill="none" stroke={cor} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"
      className="shrink-0 opacity-90" role="img" aria-label={`${TIPOS_EQ[info.tipo]}${info.marca ? ' ' + MARCAS[info.marca].nome : ''}`}>
      <title>{`${TIPOS_EQ[info.tipo]}${info.marca ? ' ' + MARCAS[info.marca].nome : ''}`}</title>
      {D[info.tipo]}
    </svg>
  )
}

// Texto explícito (para quem lê no celular): "Tesoura · Zoomlion"
export const equipTexto = (e) => { const i = equipInfo(e); return [i.tipo && TIPOS_EQ[i.tipo], i.marca && MARCAS[i.marca].nome].filter(Boolean).join(' · ') }

// Legenda curta (Planejamento)
export function Legenda() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 whitespace-nowrap text-xs text-mute">
      {Object.entries(MARCAS).map(([k, m]) => (
        <span key={k} className="flex items-center gap-1.5"><EquipIcon marca={k} tipo="tesoura" size={13} /><EquipIcon marca={k} tipo="articulada" size={13} />{m.nome}</span>
      ))}
      <span className="opacity-70">forma = tipo · cor = marca</span>
    </div>
  )
}
