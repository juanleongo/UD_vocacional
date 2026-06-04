import { CheckCircle } from 'lucide-react'
import type { PreguntaVocacional } from '../types'

interface QuestionCardProps {
  question: PreguntaVocacional
  selectedOptionId?: string
  onSelect: (optionId: string) => void
}

export const QuestionCard = ({ question, selectedOptionId, onSelect }: QuestionCardProps) => (
  <fieldset className="focus-card p-5 sm:p-6">
    <legend className="text-xl font-bold text-zinc-950">{question.texto}</legend>
    {question.apoyo ? <p className="mt-2 text-sm text-zinc-600">{question.apoyo}</p> : null}

    <div className="mt-5 grid gap-3">
      {question.opciones.map((option) => {
        const selected = selectedOptionId === option.id

        return (
          <label
            key={option.id}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition hover:border-red-300 hover:bg-red-50 ${
              selected ? 'border-red-700 bg-red-50 text-red-950' : 'border-zinc-200 bg-white text-zinc-800'
            }`}
          >
            <input
              checked={selected}
              className="mt-1 h-4 w-4 accent-red-700"
              name={question.id}
              onChange={() => onSelect(option.id)}
              type="radio"
              value={option.id}
            />
            <span className="flex-1 text-sm font-medium leading-6 sm:text-base">{option.texto}</span>
            {selected ? <CheckCircle className="h-5 w-5 shrink-0 text-red-700" aria-hidden="true" /> : null}
          </label>
        )
      })}
    </div>
  </fieldset>
)
