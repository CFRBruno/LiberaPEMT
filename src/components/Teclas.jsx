import { useEffect, useRef } from 'react'

// Atalhos de uma janela (pop-up) aberta: Enter confirma, Esc cancela.
// - Esc dentro de um campo só tira o foco dele (sem apagar o texto); um 2º Esc fecha a janela.
// - Enter em textarea (quebra de linha) ou em botão focado mantém o comportamento normal.
// Pilha de janelas abertas: só a de cima responde às teclas (ex.: confirmação sobre o detalhe)
const pilha = []
let seq = 0

export default function Teclas({ onEnter, onEsc }) {
  const ref = useRef({})
  ref.current = { onEnter, onEsc }
  useEffect(() => {
    // o botão que abriu a janela fica focado atrás dela: solta o foco para o Enter confirmar a janela
    const a0 = document.activeElement
    if (a0 && !a0.closest('[data-modal]')) a0.blur?.()
    const meu = ++seq
    pilha.push(meu)
    const k = (e) => {
      if (e.isComposing || pilha[pilha.length - 1] !== meu) return
      const a0 = document.activeElement
      const a = a0 && a0.closest('[data-modal]') ? a0 : null // só conta o foco dentro da janela
      const tag = a?.tagName
      if (e.key === 'Escape') {
        e.stopImmediatePropagation(); e.preventDefault()
        if (/INPUT|TEXTAREA|SELECT/.test(tag)) a.blur()
        else ref.current.onEsc?.()
      } else if (e.key === 'Enter' && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
        if (tag === 'TEXTAREA' || tag === 'BUTTON' || tag === 'A' || !ref.current.onEnter) return
        e.preventDefault(); e.stopImmediatePropagation(); ref.current.onEnter()
      }
    }
    window.addEventListener('keydown', k, true)
    return () => { window.removeEventListener('keydown', k, true); pilha.splice(pilha.indexOf(meu), 1) }
  }, [])
  return null
}
export const DicaTeclas = ({ confirmar = 'confirma' }) => <p className="hidden text-right text-[11px] text-mute sm:block">Enter {confirmar} · Esc cancela</p>
