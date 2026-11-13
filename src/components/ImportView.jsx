import { useState } from 'react'
import { useCol, useStore } from '../lib/store.js'
import { parseFile, parseText } from '../lib/parse.js'
import { nowStamp, fmtBR } from '../lib/dates.js'

export default function ImportView() {
  const store = useStore()
  const eqs = useCol('equipamentos')
  const [text, setText] = useState('')
  const [rows, setRows] = useState(null)
  const [err, setErr] = useState('')
  const [data, setData] = useState(nowStamp().slice(0, 10))
  const [msg, setMsg] = useState('')
  const [drag, setDrag] = useState(false)
  const [nome, setNome] = useState('')
  const pick = (f) => { if (!f) return; setNome(f.name); run(() => parseFile(f)) }

  const run = async (fn) => { setErr(''); setMsg(''); try { setRows(await fn()) } catch (e) { setRows(null); setErr(e.message) } }
  const byTag = Object.fromEntries(eqs.map((e) => [e.id, e]))
  const tags = new Set((rows || []).map((r) => r.tag))
  const novos = (rows || []).filter((r) => !byTag[r.tag]?.ativo)
  const sairam = eqs.filter((e) => e.ativo && !tags.has(e.id))

  const confirm = async () => {
    const stamp = `${data}T${nowStamp().slice(11)}`
    const ops = rows.map((r) => ({
      col: 'equipamentos', id: r.tag, merge: true,
      data: { ...r, ativo: true, liberadoEm: null, ultImport: stamp, ...(byTag[r.tag] ? {} : { dia: null, servicos: [], obs: '' }) },
    }))
    sairam.forEach((e) => ops.push({ col: 'equipamentos', id: e.id, merge: true, data: { ativo: false, liberadoEm: data } }))
    ops.push({ col: 'snapshots', id: `${stamp.replace(':', '-')}-${Date.now().toString(36)}`, data: { data, stamp, total: rows.length, itens: rows, novos: novos.map((r) => r.tag), liberados: sairam.map((e) => e.id) } })
    await store.batch(ops)
    setMsg(`Importação gravada: ${rows.length} equipamentos, ${novos.length} novos, ${sairam.length} liberados.`)
    setRows(null); setText('')
  }

  return (
    <div className="mx-auto max-w-4xl space-y-3">
      <p className="whitespace-nowrap rounded-lg bg-sky-500/10 p-2 text-sm text-sky-200" title="Cada importação grava um retrato datado; quem sai da lista vira liberado; serviços e dias já programados são mantidos.">Importações são acumulativas: <b>nada é apagado</b>.</p>
      <div className="rounded-xl bg-panel p-3 shadow">
        <label onDragOver={(e) => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]) }}
          className={`corners flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-all duration-200 ${drag ? 'scale-[1.01] border-brand bg-brand/10 shadow-[0_0_24px_rgb(239_128_36/.25)]' : 'border-line bg-black/20 hover:border-brand/60'}`}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_8px_rgb(239_128_36/.6)]">
            <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" /><path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
          </svg>
          <span className="font-medium">{drag ? 'Solte para importar' : 'Arraste a planilha aqui'}</span>
          <span className="label">.xls · .xlsx · .txt · .csv</span>
          <span className="bg-brand mt-1 rounded-lg px-4 py-2 text-sm">Escolher arquivo</span>
          {nome && <span className="tagid mt-1 max-w-full truncate text-xs text-mute">📄 {nome}</span>}
          <input type="file" accept=".xls,.xlsx,.txt,.csv,.tsv" onChange={(e) => pick(e.target.files[0])} className="hidden" />
        </label>
        <p className="my-2 text-center text-xs text-mute">ou cole o texto copiado do sistema</p>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder="Patrimônio⇥Equipamento⇥Status⇥…" className="w-full rounded-lg border p-2 font-mono text-xs" />
        <button disabled={!text.trim()} onClick={() => run(() => parseText(text))} className="mt-1 rounded-lg bg-brand px-3 py-1 text-white disabled:opacity-40">Ler texto</button>
      </div>
      {err && <p className="rounded-lg bg-red-500/15 p-2 text-red-300">{err}</p>}
      {msg && <p className="rounded-lg bg-green-500/15 p-2 text-green-300">{msg}</p>}
      {rows && (
        <div className="rounded-xl bg-panel p-3 shadow">
          <div className="flex flex-wrap items-center gap-3">
            <b>{rows.length} equipamentos lidos</b>
            <span className="text-green-400">+{novos.length} novos/retornaram</span>
            <span className="text-orange-300">{sairam.length} saíram da lista (liberados)</span>
            <label className="ml-auto text-sm">Data da importação <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="rounded-lg border p-1" /></label>
          </div>
          {sairam.length > 0 && <p className="mt-1 text-xs text-orange-300">Liberados: {sairam.map((e) => e.id).join(', ')}</p>}
          <div className="mt-2 max-h-72 overflow-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-panel2"><tr><th className="p-1">TAG</th><th>Modelo</th><th>Status</th><th>Dias</th><th>Últ. mod.</th><th></th></tr></thead>
              <tbody>{rows.map((r) => (
                <tr key={r.tag} className="border-t"><td className="p-1 font-medium">{r.tag}</td><td>{r.modelo}</td><td>{r.status}</td><td>{r.dias}</td><td>{fmtBR(r.ultMov)}</td><td>{novos.includes(r) ? '🆕' : ''}</td></tr>
              ))}</tbody>
            </table>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => setRows(null)} className="rounded-lg border px-3 py-1">Cancelar</button>
            <button onClick={confirm} className="rounded-lg bg-brand px-4 py-1 font-medium text-white">Confirmar importação</button>
          </div>
        </div>
      )}
    </div>
  )
}
