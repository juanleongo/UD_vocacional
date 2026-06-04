import { ExternalLink, MapPin } from 'lucide-react'
import type { ExternalUniversity } from '../types'
import { officialFallback } from '../utils/display'

interface ExternalUniversityCardProps {
  university: ExternalUniversity
}

export const ExternalUniversityCard = ({ university }: ExternalUniversityCardProps) => (
  <article className="focus-card p-4">
    <h3 className="font-bold text-zinc-950">{university.nombre}</h3>
    <p className="mt-1 text-sm text-zinc-700">{officialFallback(university.programa)}</p>
    <p className="mt-2 inline-flex items-center gap-2 text-sm text-zinc-600">
      <MapPin className="h-4 w-4" aria-hidden="true" />
      {officialFallback(university.ciudad)}
    </p>
    {university.enlaceOficial ? (
      <a
        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-red-700 hover:text-red-900"
        href={university.enlaceOficial}
        rel="noreferrer"
        target="_blank"
      >
        Ver fuente oficial
        <ExternalLink className="h-4 w-4" aria-hidden="true" />
      </a>
    ) : null}
  </article>
)
