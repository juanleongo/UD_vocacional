import { ArrowRight, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { CareerRecommendation } from '../types'
import { officialFallback } from '../utils/display'
import { SourceBadge } from './SourceBadge'

interface ResultCardProps {
  recommendation: CareerRecommendation
}

export const ResultCard = ({ recommendation }: ResultCardProps) => {
  const { programa, compatibilidad, razones } = recommendation

  return (
    <article className="focus-card flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-red-700">{programa.facultad}</p>
          <h3 className="mt-1 text-xl font-bold text-zinc-950">{programa.nombre}</h3>
        </div>
        <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-center">
          <p className="text-2xl font-bold text-zinc-950">{compatibilidad}%</p>
          <p className="text-xs font-semibold text-zinc-600">compatibilidad</p>
        </div>
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-zinc-900">Título otorgado</dt>
          <dd className="text-zinc-600">{officialFallback(programa.titulo)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-zinc-900">Modalidad</dt>
          <dd className="text-zinc-600">{officialFallback(programa.modalidad)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-zinc-900">Jornada</dt>
          <dd className="text-zinc-600">{officialFallback(programa.jornada)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-zinc-900">Sede</dt>
          <dd className="text-zinc-600">{officialFallback(programa.sede)}</dd>
        </div>
      </dl>

      <div className="mt-4">
        <h4 className="text-sm font-bold text-zinc-950">Razones principales</h4>
        <ul className="mt-2 space-y-2 text-sm text-zinc-700">
          {razones.map((reason) => (
            <li className="flex gap-2" key={reason}>
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-md bg-red-700" aria-hidden="true" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 text-sm leading-6 text-zinc-700">{officialFallback(programa.descripcionResumen)}</p>
      <div className="mt-4">
        <SourceBadge date={programa.fechaConsulta} source={programa.fuente} />
      </div>

      <div className="mt-auto flex flex-col gap-3 pt-5 sm:flex-row">
        <Link
          className="inline-flex items-center justify-center gap-2 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
          to={`/carreras/${programa.id}`}
        >
          Ver detalles de la carrera
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <a
          className="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 hover:border-red-300 hover:text-red-800"
          href={programa.enlaceOficial}
          rel="noreferrer"
          target="_blank"
        >
          Enlace oficial
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </article>
  )
}
