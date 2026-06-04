import { ArrowLeft, ArrowRight, RotateCcw, Send } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertBox } from '../components/AlertBox'
import { ProgressBar } from '../components/ProgressBar'
import { QuestionCard } from '../components/QuestionCard'
import preguntasData from '../data/preguntasVocacionales.json'
import { useVocational } from '../hooks/useVocational'
import type { PreguntaVocacional } from '../types'

const preguntas = preguntasData as PreguntaVocacional[]

export const QuestionnairePage = () => {
  const { answers, setAnswer, resetAnswers } = useVocational()
  const navigate = useNavigate()
  const firstPendingIndex = useMemo(
    () => preguntas.findIndex((question) => !answers[question.id]),
    [answers],
  )
  const [currentIndex, setCurrentIndex] = useState(firstPendingIndex >= 0 ? firstPendingIndex : 0)
  const [showValidation, setShowValidation] = useState(false)
  const currentQuestion = preguntas[currentIndex]
  const selectedOption = answers[currentQuestion.id]
  const isLastQuestion = currentIndex === preguntas.length - 1

  const goNext = () => {
    if (!selectedOption) {
      setShowValidation(true)
      return
    }

    setShowValidation(false)
    if (isLastQuestion) {
      navigate('/resultados')
      return
    }

    setCurrentIndex((value) => Math.min(value + 1, preguntas.length - 1))
  }

  const restart = () => {
    resetAnswers()
    setCurrentIndex(0)
    setShowValidation(false)
  }

  return (
    <div className="page-shell">
      <div className="max-w-3xl">
        <p className="eyebrow">Cuestionario vocacional</p>
        <h1 className="mt-2 text-3xl font-black text-zinc-950 sm:text-4xl">Responde con calma: no hay respuestas correctas o incorrectas</h1>
        <p className="mt-3 leading-7 text-zinc-700">
          Cada respuesta suma puntos a etiquetas vocacionales. Al finalizar, el sistema compara esas etiquetas con los programas oficiales cargados.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="grid gap-4">
          <ProgressBar current={currentIndex + 1} total={preguntas.length} />
          {showValidation ? (
            <AlertBox title="Selecciona una respuesta" tone="info">
              Debes elegir una opción para avanzar a la siguiente pregunta.
            </AlertBox>
          ) : null}
          <QuestionCard
            onSelect={(optionId) => {
              setAnswer(currentQuestion.id, optionId)
              setShowValidation(false)
            }}
            question={currentQuestion}
            selectedOptionId={selectedOption}
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              className="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-300 px-4 py-3 font-semibold text-zinc-800 hover:border-red-300 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((value) => Math.max(value - 1, 0))}
              type="button"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              Atrás
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-md bg-red-700 px-4 py-3 font-semibold text-white hover:bg-red-800"
              onClick={goNext}
              type="button"
            >
              {isLastQuestion ? 'Ver resultados' : 'Siguiente'}
              {isLastQuestion ? <Send className="h-5 w-5" aria-hidden="true" /> : <ArrowRight className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        <aside className="focus-card h-fit p-5">
          <h2 className="text-lg font-bold text-zinc-950">Tu avance</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-700">
            Tus respuestas se guardan temporalmente en este navegador para que puedas continuar si cambias de vista.
          </p>
          <p className="mt-4 text-sm font-semibold text-zinc-900">
            Respondidas: {Object.keys(answers).length} de {preguntas.length}
          </p>
          <button
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md border border-red-200 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-50"
            onClick={restart}
            type="button"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reiniciar cuestionario
          </button>
        </aside>
      </div>
    </div>
  )
}
