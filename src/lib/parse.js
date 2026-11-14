// Lê texto colado (tabulado) OU planilha Excel e devolve linhas normalizadas:
// { tag, descricao, modelo, status, dias, ultMov }
const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const p = (n) => String(n).padStart(2, '0')

function toStamp(v) {
  if (v == null || v === '') return null
  if (v instanceof Date) return `${v.getFullYear()}-${p(v.getMonth() + 1)}-${p(v.getDate())}T${p(v.getHours())}:${p(v.getMinutes())}`
  if (typeof v === 'number') {
    // serial do Excel
    const d = new Date(Math.round((v - 25569) * 86400000))
    return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}T${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`
  }
  const m = String(v).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/)
  if (m) return `${m[3]}-${p(m[2])}-${p(m[1])}T${p(m[4] ?? 0)}:${p(m[5] ?? 0)}`
  const m2 = String(v).trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/)
  if (m2) return `${m2[1]}-${m2[2]}-${m2[3]}T${m2[4] ?? '00'}:${m2[5] ?? '00'}`
  return null
}

const FIELDS = {
  tag: ['patrimonio', 'tag'],
  descricao: ['equipamento', 'descricao'],
  status: ['status'],
  modelo: ['modelo'],
  marca: ['marca'],
  dias: ['dias st atual', 'dias no status', 'dias status atual', 'dias'],
  ultMov: ['ultima mov', 'ultima movimentacao', 'ultima modificacao', 'data ult modificacao'],
}

// rows: array de arrays (primeira linha com cabeçalho)
export function rowsToEquipamentos(rows) {
  const hi = rows.findIndex((r) => r.some((c) => norm(c) === 'patrimonio' || norm(c) === 'tag'))
  if (hi < 0) throw new Error('Cabeçalho não encontrado. A planilha/texto precisa ter a coluna "Patrimônio".')
  const idx = {}
  rows[hi].forEach((c, i) => {
    const n = norm(c)
    for (const [k, names] of Object.entries(FIELDS)) if (idx[k] == null && names.includes(n)) idx[k] = i
  })
  for (const k of ['tag', 'status']) if (idx[k] == null) throw new Error(`Coluna obrigatória ausente: ${k === 'tag' ? 'Patrimônio' : 'Status'}`)
  const out = []
  for (const r of rows.slice(hi + 1)) {
    const tag = String(r[idx.tag] ?? '').trim().toUpperCase()
    if (!tag) continue
    const dias = parseInt(r[idx.dias], 10)
    out.push({
      tag,
      descricao: String(r[idx.descricao] ?? '').trim(),
      modelo: String(r[idx.modelo] ?? '').trim(),
      marca: String(r[idx.marca] ?? '').trim(),
      status: String(r[idx.status] ?? '').trim(),
      dias: Number.isNaN(dias) ? null : dias,
      ultMov: toStamp(r[idx.ultMov]),
    })
  }
  if (!out.length) throw new Error('Nenhum equipamento encontrado.')
  return out
}

export function parseText(text) {
  const lines = text.replace(/\r/g, '').split('\n').filter((l) => l.trim())
  const sep = ['\t', ';', ','].find((s) => (lines[0] || '').includes(s)) || '\t'
  return rowsToEquipamentos(lines.map((l) => l.split(sep).map((c) => c.trim())))
}

export async function parseFile(file) {
  if (/\.(txt|csv|tsv)$/i.test(file.name)) return parseText(await file.text())
  const XLSX = await import('xlsx')
  const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' })
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: true, defval: null })
  return rowsToEquipamentos(rows)
}
