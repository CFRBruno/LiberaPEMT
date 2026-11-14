import { createPortal } from 'react-dom'
// Renderiza fora do <main> (que tem animação/stacking context) para a janela cobrir a tela toda.
export default function Portal({ children }) { return createPortal(children, document.body) }
