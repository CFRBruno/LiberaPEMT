import { useState } from 'react'
import { useStore } from '../lib/store.js'
import { RESULTADOS, SERVICOS } from '../lib/constants.js'
import { addDays, dow, fmtBRtime, fmtShort, todayISO, weekStart } from '../lib/dates.js'

export default function EquipModal({ eq, users, onClose }) {
  const store = useStore()
  const [dia, setDia] = useState(eq.dia || '')
  const [obs, setObs] = useState(eq.obs || '')
  const [servicos, setServicos] = useState(eq.servicos || [])
  const [novo, setNovo] = useState(SERVICOS[0])
  const tecnicos = users.filter((u) => u.role === 'tecnico')
  const base = weekStart(dia || todayISO())
  const upd = (id, patch) => setServicos((l) => l.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  const setRes = (s, r) => upd(s.id, { resultado: r, dataRealizacao: r === 'realizado' ? s.dataRealizacao || todayISO() : s.dataRealizacao || null })
  const toggleResp = (s, u) => upd(s.id, { resp: s.resp?.includes(u) ? s.resp.filter((x) => x !== u) : [...(s.resp || []), u] })
  const save = async () => {
    await store.batch([{ col: 'equipamentos', id: eq.id, merge: true, data: { dia: dia || null, obs, servicos } }])
    onClose()
  }
  const podeServicos = eq.status === 'Manutenção'
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-panel p-4 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div><h2 className="text-lg font-bold">{eq.tag}</h2><p className="text-sm text-mute">{eq.modelo} · {eq.descricao}</p>
            <p className="text-xs text-mute">{eq.status} · {eq.dias ?? '?'} dias · últ. mov. {fmtBRtime(eq.ultMov)}</p></div>
          <button onClick={onClose} className="text-2xl leading-none">×</button>
        </div>

        <label className="mt-3 block text-sm font-medium">Dia programado
          <select value={dia} onChange={(e) => setDia(e.target.value)} className="mt-1 w-full rounded border p-2">
            <option value="">Sem previsão</option>
            {[0, 1, 2, 3, 4, 5].map((i) => addDays(base, i)).map((d) => <option key={d} value={d}>{dow(d)} {fmtShort(d)}</option>)}
            {dia && !([0, 1, 2, 3, 4, 5].map((i) => addDays(base, i)).includes(dia)) && <option value={dia}>{dia}</option>}
          </select>
        </label>
        <div className="mt-1 flex gap-2 text-xs">
          <button className="text-sky-400 underline" onClick={() => setDia(addDays(dia || todayISO(), -7))}>−1 semana</button>
          <button className="text-sky-400 underline" onClick={() => setDia(addDays(dia || todayISO(), 7))}>+1 semana</button>
        </div>

        <h3 className="mt-4 font-semibold">Serviços</h3>
        {!podeServicos && <p className="text-xs text-mute">Serviços só são definidos para equipamentos em Manutenção.</p>}
        {servicos.map((s) => (
          <div key={s.id} className="mt-2 rounded-lg border p-2">
            <div className="flex items-center justify-between">
              <b>{s.tipo}</b>
              <button className="text-xs text-red-400" onClick={() => setServicos((l) => l.filter((x) => x.id !== s.id))}>remover</button>
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {Object.entries(RESULTADOS).map(([k, v]) => (
                <button key={k} onClick={() => setRes(s, k)} className={`rounded border px-2 py-1 text-xs ${(s.resultado || 'pendente') === k ? v.cls + ' ring-2 ring-offset-1 ring-brand' : 'bg-panel text-mute'}`}>{v.label}</button>
              ))}
            </div>
            {s.resultado === 'realizado' && (
              <label className="mt-1 block text-xs">Data de realização <input type="date" value={s.dataRealizacao || ''} onChange={(e) => upd(s.id, { dataRealizacao: e.target.value })} className="ml-1 rounded border p-1" /></label>
            )}
            <div className="mt-1 flex flex-wrap gap-1 text-xs">
              <span className="text-mute">Responsáveis:</span>
              {tecnicos.length === 0 && <i className="text-mute">cadastre técnicos na aba Usuários</i>}
              {tecnicos.map((u) => <button key={u.id} onClick={() => toggleResp(s, u.username)} className={`rounded-full border px-2 ${s.resp?.includes(u.username) ? 'bg-brand text-white' : 'bg-panel'}`}>{u.nome}</button>)}
            </div>
            <textarea placeholder="Observação do serviço…" value={s.obs || ''} onChange={(e) => upd(s.id, { obs: e.target.value })} className="mt-1 w-full rounded border p-1 text-sm" rows={2} />
          </div>
        ))}
        {podeServicos && (
          <div className="mt-2 flex gap-2">
            <select value={novo} onChange={(e) => setNovo(e.target.value)} className="flex-1 rounded border p-2">{SERVICOS.map((s) => <option key={s}>{s}</option>)}</select>
            <button onClick={() => setServicos((l) => [...l, { id: Math.random().toString(36).slice(2, 9), tipo: novo, resultado: 'pendente', resp: [], obs: '', dataRealizacao: null }])} className="rounded bg-brand px-3 text-white">+ Adicionar</button>
          </div>
        )}

        <label className="mt-4 block text-sm font-medium">Observação do equipamento
          <textarea value={obs} onChange={(e) => setObs(e.target.value)} className="mt-1 w-full rounded border p-2 text-sm" rows={2} />
        </label>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded border px-4 py-2">Cancelar</button>
          <button onClick={save} className="rounded bg-brand px-4 py-2 font-medium text-white">Salvar</button>
        </div>
      </div>
    </div>
  )
}
