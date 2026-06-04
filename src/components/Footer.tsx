import { ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

export const Footer = () => (
  <footer className="border-t border-zinc-200 bg-zinc-950 text-zinc-100">
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-[1.5fr_1fr] lg:px-8">
      <div>
        <p className="text-lg font-bold">APOYO vocacional UD</p>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
          Herramienta orientativa basada en la oferta oficial de pregrado consultada de la Universidad Distrital Francisco José de Caldas.
        </p>
      </div>
      <div className="grid gap-2 text-sm">
        <Link className="font-semibold text-zinc-100 hover:text-amber-200" to="/fuentes">
          Fuentes oficiales
        </Link>
        <a
          className="inline-flex items-center gap-2 font-semibold text-zinc-100 hover:text-amber-200"
          href="https://www.udistrital.edu.co/admisiones/index.php/oferta/pregrado"
          rel="noreferrer"
          target="_blank"
        >
          Oferta de pregrado UD
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </div>
  </footer>
)
