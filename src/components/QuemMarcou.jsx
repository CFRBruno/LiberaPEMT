import { fmtBR } from '../lib/dates.js'
import { iso } from '../lib/dates.js'

// "✔ Realizado por Pedro em 14/11/2026 às 15:32"
export const fmtHora = (ms) => { const d = new Date(ms); return `${fmtBR(iso(d))} às ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` }
export const fmtMarca = (m) => `${m.acao === 'realizado' ? '✔ Realizado' : '⏳ Adiado'} por ${m.nome} em ${fmtHora(m.em)}${m.obs ? ` · “${m.obs}”` : ''}`
