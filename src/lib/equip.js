// Marca e tipo do equipamento. Usa a coluna "Marca" da importação; se faltar, deduz pelo modelo.
export const MARCAS = {
  zoomlion: { nome: 'Zoomlion', cor: '#8fd21f' },
  dingli: { nome: 'Dingli', cor: '#ef8024' },
  sinoboom: { nome: 'Sinoboom', cor: '#3f78e0' },
}
export const TIPOS_EQ = { tesoura: 'Tesoura', articulada: 'Articulada', telescopica: 'Telescópica' }

export function equipInfo(e) {
  const m = (e.marca || '').toLowerCase()
  const mod = (e.modelo || '').toUpperCase()
  let marca = Object.keys(MARCAS).find((k) => m.includes(k))
  if (!marca) marca = /^Z[SA]/.test(mod) ? 'zoomlion' : /^(GT|SB)/.test(mod) ? 'sinoboom' : /^(JCPT|BA|BT|S\d|DL)/.test(mod) ? 'dingli' : null
  const d = (e.descricao || '').toUpperCase()
  const tipo = d.includes('TESOURA') ? 'tesoura' : d.includes('ARTICULADA') ? 'articulada' : d.includes('TELESC') ? 'telescopica' : null
  return { marca, tipo }
}
