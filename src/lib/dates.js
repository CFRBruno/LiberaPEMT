const p = (n) => String(n).padStart(2, '0')
export const iso = (d) => `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
export const todayISO = () => iso(new Date())
export const parseISO = (s) => { const [y, m, d] = s.slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d) }
export const addDays = (s, n) => { const d = parseISO(s); d.setDate(d.getDate() + n); return iso(d) }
export const weekStart = (s) => { const d = parseISO(s); const k = (d.getDay() + 6) % 7; d.setDate(d.getDate() - k); return iso(d) }
export const fmtBR = (s) => (s ? `${s.slice(8, 10)}/${s.slice(5, 7)}/${s.slice(0, 4)}` : '—')
export const fmtBRtime = (s) => (s ? `${fmtBR(s)}${s.length > 10 ? ' ' + s.slice(11, 16) : ''}` : '—')
export const fmtShort = (s) => `${s.slice(8, 10)}/${s.slice(5, 7)}`
export const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
export const dow = (s) => DIAS[parseISO(s).getDay()]
export const nowStamp = () => { const d = new Date(); return `${iso(d)}T${p(d.getHours())}:${p(d.getMinutes())}` }
// Sáb/Dom -> próxima segunda (a semana de trabalho é Seg–Sex)
export const proxDiaUtil = (s) => { const k = parseISO(s).getDay(); return k === 6 ? addDays(s, 2) : k === 0 ? addDays(s, 1) : s }
// Dias úteis (Seg–Sex) de um mês 'YYYY-MM', agrupados por semana: [{ ws, dias: [iso|null x5] }]
export const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
export const addMes = (ym, n) => { const d = new Date(+ym.slice(0, 4), +ym.slice(5, 7) - 1 + n, 1); return `${d.getFullYear()}-${p(d.getMonth() + 1)}` }
export const semanasUteis = (ym) => {
  const ultimo = new Date(+ym.slice(0, 4), +ym.slice(5, 7), 0).getDate()
  const semanas = {}
  for (let i = 1; i <= ultimo; i++) {
    const d = `${ym}-${p(i)}`; const k = parseISO(d).getDay()
    if (k === 0 || k === 6) continue
    const ws = weekStart(d); (semanas[ws] ||= [null, null, null, null, null])[k - 1] = d
  }
  return Object.entries(semanas).map(([ws, dias]) => ({ ws, dias }))
}
