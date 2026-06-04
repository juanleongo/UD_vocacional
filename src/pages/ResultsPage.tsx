import { BookOpen, RotateCcw } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertBox } from '../components/AlertBox'
import { ResultCard } from '../components/ResultCard'
import preguntasData from '../data/preguntasVocacionales.json'
import { useVocational } from '../hooks/useVocational'
import type { PreguntaVocacional } from '../types'
import { getSelectedTags, recommendCareers } from '../utils/recommendCareers'

const preguntas = preguntasData as PreguntaVocacional[]

export const ResultsPage = () => {
  const { answers, resetAnswers } = useVocational()
  const navigate = useNavigate()
  const selectedTags = getSelectedTags(answers, preguntas)
  const recommendations = recommendCareers(answers)
  const hasCompletedAny = selectedTags.length > 0

  return (
    <div className="page-shell">
      <div className="max-w-3xl">
        <p className="eyebrow">Resultados</p>
        <h1 className="mt-2 text-3xl font-black text-zinc-950 sm:text-4xl">Tus 3 carreras con mayor compatibilidad</h1>
        <p className="mt-3 leading-7 text-zinc-700">
          Este cálculo es aproximado y se basa en las respuestas guardadas del cuestionario. Úsalo como punto de partida para conversar, investigar y comparar fuentes oficiales.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          className="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-300 px-4 py-3 font-semibold text-zinc-800 hover:border-red-300 hover:text-red-800"
          to="/cuestionario"
        >
          <BookOpen className="h-5 w-5" aria-hidden="true" />
          Volver al cuestionario
        </Link>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-md border border-red-200 px-4 py-3 font-semibold text-red-700 hover:bg-red-50"
          onClick={() => {
            resetAnswers()
            navigate('/cuestionario')
          }}
          type="button"
        >
          <RotateCcw className="h-5 w-5" aria-hidden="true" />
          Repetir cuestionario
        </button>
      </div>

      {!hasCompletedAny ? (
        <div className="mt-8">
          <AlertBox title="Aún no hay respuestas suficientes" tone="info">
            Completa el cuestionario vocacional para ver tus tres recomendaciones principales.
          </AlertBox>
        </div>
      ) : (
        <>
          <section className="mt-8 rounded-lg border border-zinc-200 bg-white p-5">
            <h2 className="text-lg font-bold text-zinc-950">Lectura rápida de tu perfil</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-700">
              Tus respuestas muestran afinidades que el sistema comparó con los tags vocacionales internos de cada programa. Las tarjetas explican las coincidencias principales.
            </p>
          </section>

          <section className="mt-6 grid gap-5 lg:grid-cols-3">
            {recommendations.map((recommendation) => (
              <ResultCard key={recommendation.programa.id} recommendation={recommendation} />
            ))}
          </section>
        </>
      )}
    </div>
  )
}
