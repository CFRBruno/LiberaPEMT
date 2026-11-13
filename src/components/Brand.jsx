import { useState } from 'react'
// Coloque o logo em public/logo.png (fundo transparente). Sem arquivo, mostra o nome em texto.
export default function Brand({ big }) {
  const [semLogo, setSemLogo] = useState(false)
  return (
    <div className={`flex items-center justify-center gap-3 ${big ? 'flex-col py-2' : ''}`}>
      {!semLogo && <img src="/logo.png" alt="Tecnogera" onError={() => setSemLogo(true)} className={big ? 'h-12' : 'h-7'} />}
      {!semLogo && !big && <span className="hidden h-6 w-px bg-line sm:block" />}
      <div className={`font-bold leading-none tracking-wide ${big ? 'text-2xl' : `text-base ${semLogo ? '' : 'hidden sm:block'}`}`}>
        LIBERA<span className="text-brand [text-shadow:0_0_12px_rgb(239_128_36/.7)]">PEMT</span>
        {semLogo && <div className="label !text-[.6rem]">Tecnogera</div>}
      </div>
    </div>
  )
}
