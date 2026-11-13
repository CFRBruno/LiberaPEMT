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
    ops.push({ col: 'snapshots', id: stamp.replace(':', '-'), data: { data, stamp, total: rows.length, itens: rows, novos: novos.map((r) => r.tag), liberados: sairam.map((e) => e.id) } })
    await store.batch(ops)
    setMsg(`Importação gravada: ${rows.length} equipamentos, ${novos.length} novos, ${sairam.length} liberados.`)
    setRows(null); setText('')
  }

  return (
    <div className="mx-auto max-w-4xl space-y-3">
      <p className="rounded bg-blue-50 p-2 text-sm text-blue-900">Cada importação grava um <b>retrato datado</b> e atualiza o estado atual por TAG. Nada é apagado: equipamentos que não vieram na lista são marcados como <b>liberados</b> na data informada, e serviços/dias já programados são mantidos.</p>
      <div className="rounded-xl bg-white p-3 shadow">
        <label className="text-sm font-medium">Arquivo (Excel .xls/.xlsx ou texto .txt/.csv)
          <input type="file" accept=".xls,.xlsx,.txt,.csv,.tsv" onChange={(e) => e.target.files[0] && run(() => parseFile(e.target.files[0]))} className="mt-1 block w-full text-sm" />
        </label>
        <p className="my-2 text-center text-xs text-slate-400">ou cole o texto copiado do sistema</p>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder="Patrimônio⇥Equipamento⇥Status⇥…" className="w-full rounded border p-2 font-mono text-xs" />
        <button disabled={!text.trim()} onClick={() => run(() => parseText(text))} className="mt-1 rounded bg-slate-800 px-3 py-1 text-white disabled:opacity-40">Ler texto</button>
      </div>
      {err && <p className="rounded bg-red-100 p-2 text-red-800">{err}</p>}
      {msg && <p className="rounded bg-green-100 p-2 text-green-800">{msg}</p>}
      {rows && (
        <div className="rounded-xl bg-white p-3 shadow">
          <div className="flex flex-wrap items-center gap-3">
            <b>{rows.length} equipamentos lidos</b>
            <span className="text-green-700">+{novos.length} novos/retornaram</span>
            <span className="text-orange-700">{sairam.length} saíram da lista (liberados)</span>
            <label className="ml-auto text-sm">Data da importação <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="rounded border p-1" /></label>
          </div>
          {sairam.length > 0 && <p className="mt-1 text-xs text-orange-800">Liberados: {sairam.map((e) => e.id).join(', ')}</p>}
          <div className="mt-2 max-h-72 overflow-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-100"><tr><th className="p-1">TAG</th><th>Modelo</th><th>Status</th><th>Dias</th><th>Últ. mod.</th><th></th></tr></thead>
              <tbody>{rows.map((r) => (
                <tr key={r.tag} className="border-t"><td className="p-1 font-medium">{r.tag}</td><td>{r.modelo}</td><td>{r.status}</td><td>{r.dias}</td><td>{fmtBR(r.ultMov)}</td><td>{novos.includes(r) ? '🆕' : ''}</td></tr>
              ))}</tbody>
            </table>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => setRows(null)} className="rounded border px-3 py-1">Cancelar</button>
            <button onClick={confirm} className="rounded bg-green-600 px-4 py-1 font-medium text-white">Confirmar importação</button>
          </div>
        </div>
      )}
    </div>
  )
}
