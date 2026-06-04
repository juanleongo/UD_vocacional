import { ExternalLink, GraduationCap } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ProgramaUD } from '../types'
import { officialFallback } from '../utils/display'
import { SourceBadge } from './SourceBadge'

interface CareerCardProps {
  programa: ProgramaUD
}

export const CareerCard = ({ programa }: CareerCardProps) => (
  <article className="focus-card flex h-full flex-col p-5">
    <div className="flex items-start gap-3">
      <div className="rounded-md bg-red-700 p-2 text-white">
        <GraduationCap className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-zinc-950">{programa.nombre}</h3>
        <p className="mt-1 text-sm text-zinc-600">{officialFallback(programa.facultad)}</p>
      </div>
    </div>

    <dl className="mt-4 grid gap-3 text-sm">
      <div>
        <dt className="font-semibold text-zinc-900">Título</dt>
        <dd className="text-zinc-600">{officialFallback(programa.titulo)}</dd>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <dt className="font-semibold text-zinc-900">Modalidad</dt>
          <dd className="text-zinc-600">{officialFallback(programa.modalidad)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-zinc-900">Jornada</dt>
          <dd className="text-zinc-600">{officialFallback(programa.jornada)}</dd>
        </div>
      </div>
    </dl>

    <p className="mt-4 text-sm leading-6 text-zinc-700">{officialFallback(programa.descripcionResumen)}</p>

    <div className="mt-5 flex flex-wrap gap-2">
      <SourceBadge date={programa.fechaConsulta} source={programa.fuente} />
    </div>

    <div className="mt-auto flex flex-col gap-3 pt-5 sm:flex-row">
      <Link
        className="inline-flex items-center justify-center gap-2 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
        to={`/carreras/${programa.id}`}
      >
        Ver detalles
        <GraduationCap className="h-4 w-4" aria-hidden="true" />
      </Link>
      <a
        className="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 hover:border-red-300 hover:text-red-800"
        href={programa.enlaceOficial}
        rel="noreferrer"
        target="_blank"
      >
        Fuente oficial
        <ExternalLink className="h-4 w-4" aria-hidden="true" />
      </a>
    </div>
  </article>
)
