import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AlertBox } from '../components/AlertBox'
import { ExternalUniversityCard } from '../components/ExternalUniversityCard'
import carrerasExternasData from '../data/carrerasExternas.json'
import type { ExternalCareer } from '../types'

const carrerasExternas = carrerasExternasData as ExternalCareer[]

export const ExternalCareersPage = () => {
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim().toLowerCase()
  const filtered = useMemo(
    () =>
      normalizedQuery
        ? carrerasExternas.filter((item) => item.carrera.toLowerCase().includes(normalizedQuery))
        : carrerasExternas,
    [normalizedQuery],
  )

  return (
    <div className="page-shell">
      <div className="max-w-3xl">
        <p className="eyebrow">Carreras no ofertadas por la UD</p>
        <h1 className="mt-2 text-3xl font-black text-zinc-950 sm:text-4xl">Explora intereses que no aparecen en la oferta oficial consultada</h1>
        <p className="mt-3 leading-7 text-zinc-700">
          Si una carrera no aparece en la oferta oficial de pregrado de la Universidad Distrital, la aplicación lo indica y solo muestra alternativas externas cuando estén verificadas con fuentes oficiales.
        </p>
      </div>

      <label className="mt-8 block max-w-xl">
        <span className="text-sm font-semibold text-zinc-900">Buscar carrera</span>
        <span className="mt-2 flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2">
          <Search className="h-5 w-5 text-zinc-500" aria-hidden="true" />
          <input
            className="w-full border-0 bg-transparent py-1 text-zinc-950 outline-none"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Medicina, Derecho, Psicología..."
            type="search"
            value={query}
          />
        </span>
      </label>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        {filtered.map((career) => (
          <article className="focus-card p-5" key={career.carrera}>
            <h2 className="text-xl font-bold text-zinc-950">{career.carrera}</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-700">
              Esta carrera no aparece dentro de la oferta oficial de pregrado consultada de la Universidad Distrital. Sin embargo, puedes revisar otras universidades públicas de Colombia donde podría estar disponible.
            </p>
            {career.notaVerificacion ? <p className="mt-3 text-sm font-semibold text-zinc-800">{career.notaVerificacion}</p> : null}

            {career.universidadesPublicas.length > 0 ? (
              <div className="mt-4 grid gap-3">
                {career.universidadesPublicas.map((university) => (
                  <ExternalUniversityCard key={`${career.carrera}-${university.nombre}`} university={university} />
                ))}
              </div>
            ) : (
              <div className="mt-4">
                <AlertBox title="Alternativas externas pendientes" tone="info">
                  No se muestran universidades externas porque aún no hay enlaces oficiales verificados cargados para esta carrera.
                </AlertBox>
              </div>
            )}
          </article>
        ))}
      </section>

      {filtered.length === 0 ? (
        <div className="mt-6">
          <AlertBox title="Sin coincidencias" tone="info">
            No hay una carrera externa precargada con ese nombre. Revisa la fuente oficial de pregrado UD y agrega la carrera al archivo de datos si necesitas hacer seguimiento.
          </AlertBox>
        </div>
      ) : null}
    </div>
  )
}
