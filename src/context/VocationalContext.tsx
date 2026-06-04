import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AnswerRecord } from '../types'

interface VocationalContextValue {
  answers: AnswerRecord
  setAnswer: (questionId: string, optionId: string) => void
  resetAnswers: () => void
  answeredCount: number
}

const STORAGE_KEY = 'apoyo-vocacional-respuestas'

const VocationalContext = createContext<VocationalContextValue | undefined>(undefined)

const readStoredAnswers = (): AnswerRecord => {
  if (typeof window === 'undefined') return {}

  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value ? (JSON.parse(value) as AnswerRecord) : {}
  } catch {
    return {}
  }
}

export const VocationalProvider = ({ children }: { children: ReactNode }) => {
  const [answers, setAnswers] = useState<AnswerRecord>(readStoredAnswers)

  useEffect(() => {
    if (Object.keys(answers).length === 0) {
      window.localStorage.removeItem(STORAGE_KEY)
      return
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(answers))
  }, [answers])

  const value = useMemo<VocationalContextValue>(
    () => ({
      answers,
      setAnswer: (questionId, optionId) => {
        setAnswers((current) => ({ ...current, [questionId]: optionId }))
      },
      resetAnswers: () => {
        window.localStorage.removeItem(STORAGE_KEY)
        setAnswers({})
      },
      answeredCount: Object.keys(answers).length,
    }),
    [answers],
  )

  return <VocationalContext.Provider value={value}>{children}</VocationalContext.Provider>
}

export { VocationalContext }
