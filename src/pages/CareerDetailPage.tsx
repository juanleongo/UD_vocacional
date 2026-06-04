import { ArrowLeft, ExternalLink, FileText } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { AlertBox } from '../components/AlertBox'
import { SourceBadge } from '../components/SourceBadge'
import programasData from '../data/programasUD.enriched.json'
import { useVocational } from '../hooks/useVocational'
import type { CampoTextoFuente, ProgramaUD } from '../types'
import { officialFallback } from '../utils/display'
import { scoreProgram } from '../utils/recommendCareers'

const programas = programasData as ProgramaUD[]

const infoItems = (programa: ProgramaUD) => [
  ['Facultad', programa.facultad],
  ['Título que otorga', programa.titulo],
  ['Modalidad', programa.modalidad],
  ['Jornada', programa.jornada],
  ['Duración', programa.duracion],
  ['Créditos', programa.creditos],
  ['Registro calificado', programa.registroCalificado],
  ['Sede', programa.sede],
]

const isCampoTextoFuente = (value: unknown): value is CampoTextoFuente =>
  typeof value === 'object' && value !== null && 'texto' in value && 'tipoFuente' in value

const textFromField = (value: string | CampoTextoFuente | undefined) => {
  if (isCampoTextoFuente(value)) return value.texto
  return value
}

const sourcePill = (value: string | CampoTextoFuente | undefined) => {
  if (!isCampoTextoFuente(value)) return null
  const labelBySource = {
    inferido_desde_malla: 'Inferido desde malla curricular',
    inferido_desde_area_programa: 'Inferido desde área del programa',
    pdf_malla: 'Fuente PDF oficial',
  }

  return (
    <span className="mt-3 inline-flex rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-900">
      {labelBySource[value.tipoFuente]}
    </span>
  )
}

const sourceBase = (value: string | CampoTextoFuente | undefined) => {
  if (!isCampoTextoFuente(value) || !value.base || value.base.length === 0) return null

  return (
    <div className="mt-3">
      <p className="text-xs font-bold uppercase text-zinc-500">Base usada</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {value.base.slice(0, 6).map((item) => (
          <li className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-700" key={item}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

const laborFields = (programa: ProgramaUD) => {
  if (programa.salidasProfesionales.length > 0) return programa.salidasProfesionales.join(', ')
  return 'No se encontró información suficiente en la malla curricular disponible.'
}

const detailSections = (programa: ProgramaUD): Array<[string, string | CampoTextoFuente | undefined]> => [
  ['Perfil del aspirante', programa.perfilAspirante],
  ['Qué aprenderá el estudiante', programa.queAprendera ?? programa.descripcionResumen],
  ['Posibles campos laborales', laborFields(programa)],
]

export const CareerDetailPage = () => {
  const { careerId } = useParams()
  const { answers } = useVocational()
  const programa = programas.find((item) => item.id === careerId)

  if (!programa) {
    return (
      <div className="page-shell">
        <AlertBox title="Carrera no encontrada" tone="info">
          El programa solicitado no está en la base oficial cargada para esta versión.
        </AlertBox>
        <Link className="mt-5 inline-flex items-center gap-2 font-semibold text-red-700" to="/resultados">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver a resultados
        </Link>
      </div>
    )
  }

  const recommendation = scoreProgram(programa, answers)
  const hasMatch = recommendation.compatibilidad > 0

  return (
    <div className="page-shell">
      <Link className="inline-flex items-center gap-2 text-sm font-semibold text-red-700 hover:text-red-900" to="/resultados">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver a resultados
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section>
          <p className="eyebrow">{programa.facultad}</p>
          <h1 className="mt-2 text-3xl font-black text-zinc-950 sm:text-5xl">{programa.nombre}</h1>
          <div className="mt-4">
            <SourceBadge date={programa.fechaConsulta} source={programa.fuente} />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {infoItems(programa).map(([label, value]) => (
              <article className="focus-card p-4" key={label}>
                <h2 className="text-sm font-bold text-zinc-950">{label}</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-700">{officialFallback(value)}</p>
              </article>
            ))}
          </div>

          <section className="mt-6 grid gap-4">
            {detailSections(programa).map(([title, text]) => (
              <article className="focus-card p-5" key={title}>
                <h2 className="text-lg font-bold text-zinc-950">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-700">{officialFallback(textFromField(text))}</p>
                {sourcePill(text)}
                {sourceBase(text)}
              </article>
            ))}
          </section>

          {programa.asignaturasDestacadas && programa.asignaturasDestacadas.length > 0 ? (
            <section className="mt-6 focus-card p-5">
              <h2 className="text-lg font-bold text-zinc-950">Asignaturas destacadas extraídas del PDF</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {programa.asignaturasDestacadas.slice(0, 14).map((asignatura) => (
                  <li className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-900" key={asignatura}>
                    {asignatura}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {programa.periodosAcademicos && programa.periodosAcademicos.length > 0 ? (
            <section className="mt-6 focus-card p-5">
              <h2 className="text-lg font-bold text-zinc-950">Malla curricular resumida</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {programa.periodosAcademicos.map((periodo) => (
                  <article className="rounded-lg border border-zinc-200 p-4" key={periodo.periodo}>
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bold text-zinc-950">{periodo.periodo}</h3>
                      {periodo.totalCreditos ? (
                        <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-bold text-amber-900">
                          {periodo.totalCreditos} créditos
                        </span>
                      ) : null}
                    </div>
                    {periodo.asignaturas.length > 0 ? (
                      <ul className="mt-3 space-y-2 text-sm text-zinc-700">
                        {periodo.asignaturas.slice(0, 5).map((asignatura) => (
                          <li className="flex gap-2" key={`${periodo.periodo}-${asignatura.nombre}`}>
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-md bg-red-700" aria-hidden="true" />
                            <span>
                              {asignatura.nombre}
                              {asignatura.creditos ? ` (${asignatura.creditos} créditos)` : ''}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-zinc-600">Asignaturas pendientes de revisión OCR.</p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </section>

        <aside className="grid h-fit gap-4">
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-5">
            <p className="text-sm font-semibold text-zinc-700">Compatibilidad aproximada</p>
            <p className="mt-2 text-5xl font-black text-zinc-950">{recommendation.compatibilidad}%</p>
            {hasMatch ? (
              <ul className="mt-4 space-y-2 text-sm text-zinc-800">
                {recommendation.razones.map((reason) => (
                  <li className="flex gap-2" key={reason}>
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-md bg-red-700" aria-hidden="true" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm leading-6 text-zinc-700">Completa el cuestionario para ver razones personalizadas.</p>
            )}
          </div>

          <a
            className="inline-flex items-center justify-center gap-2 rounded-md bg-red-700 px-4 py-3 font-semibold text-white hover:bg-red-800"
            href={programa.enlaceOficial}
            rel="noreferrer"
            target="_blank"
          >
            Abrir página oficial
            <ExternalLink className="h-5 w-5" aria-hidden="true" />
          </a>

          {programa.fuenteMalla ? (
            <div className="focus-card p-5">
              <div className="flex items-start gap-3">
                <FileText className="mt-1 h-5 w-5 text-red-700" aria-hidden="true" />
                <div>
                  <h2 className="font-bold text-zinc-950">Fuente de malla</h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-700">{programa.fuenteMalla.archivoPdf}</p>
                  <p className="mt-1 text-xs font-semibold text-zinc-500">Método: {programa.fuenteMalla.metodoExtraccion}</p>
                  {programa.documentoBaseMalla?.resolucion ? (
                    <p className="mt-3 text-sm text-zinc-700">{programa.documentoBaseMalla.resolucion}</p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          <AlertBox title="Verificación">
            Antes de decidir, revisa el enlace oficial del programa, la página de admisiones y el PDF de malla curricular.
          </AlertBox>
        </aside>
      </div>
    </div>
  )
}
