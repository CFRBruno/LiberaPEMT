import { useState } from 'react'
import { useCol } from '../lib/store.js'
import { fmtBR } from '../lib/dates.js'
import { STATUS_CLS } from '../lib/constants.js'
import { dataLiberacao } from '../lib/liberado.js'

export default function History() {
  const snaps = useCol('snapshots').sort((a, b) => b.stamp.localeCompare(a.stamp))
  const eqs = useCol('equipamentos')
  const [open, setOpen] = useState(null)
  const liberados = eqs.map((e) => ({ ...e, quando: dataLiberacao(e) || e.liberadoEm })).filter((e) => e.quando).sort((a, b) => b.quando.localeCompare(a.quando))
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <section className="rounded-xl bg-white p-3 shadow">
        <h2 className="mb-2 font-semibold">Importações anteriores</h2>
        {!snaps.length && <p className="text-sm text-slate-500">Nenhuma importação ainda.</p>}
        {snaps.map((s) => (
          <div key={s.id} className="border-t py-1">
            <button onClick={() => setOpen(open === s.id ? null : s.id)} className="flex w-full justify-between text-left text-sm">
              <b>{fmtBR(s.data)} <span className="font-normal text-slate-400">{s.stamp.slice(11)}</span></b>
              <span>{s.total} equip. · +{s.novos?.length || 0} · −{s.liberados?.length || 0}</span>
            </button>
            {open === s.id && (
              <table className="mt-1 w-full text-left text-xs">
                <tbody>{s.itens.map((i) => <tr key={i.tag} className="border-t"><td className="p-0.5 font-medium">{i.tag}</td><td>{i.modelo}</td><td><span className={`rounded px-1 ${STATUS_CLS[i.status] || ''}`}>{i.status}</span></td><td>{i.dias}d</td></tr>)}</tbody>
              </table>
            )}
          </div>
        ))}
      </section>
      <section className="rounded-xl bg-white p-3 shadow">
        <h2 className="mb-2 font-semibold">Equipamentos liberados</h2>
        {!liberados.length && <p className="text-sm text-slate-500">Nenhum ainda.</p>}
        {liberados.map((e) => (
          <div key={e.id} className="flex justify-between border-t py-1 text-sm"><span><b>{e.tag}</b> <span className="text-slate-500">{e.modelo}</span></span><span>{fmtBR(e.quando)}</span></div>
        ))}
      </section>
    </div>
  )
}
