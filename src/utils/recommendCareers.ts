import programasData from '../data/programasUD.enriched.json'
import preguntasData from '../data/preguntasVocacionales.json'
import type {
  AnswerRecord,
  CareerRecommendation,
  PreguntaVocacional,
  ProgramaUD,
} from '../types'
import { formatTag } from './display'

const programas = programasData as ProgramaUD[]
const preguntas = preguntasData as PreguntaVocacional[]

const reasonByTag: Record<string, string> = {
  ambiental: 'Interés por ambiente, sostenibilidad o naturaleza',
  analisis: 'Afinidad con análisis y lectura de patrones',
  arte: 'Gusto por creación y expresión artística',
  campo: 'Preferencia por trabajo de campo o territorio',
  ciencia: 'Interés por pensamiento científico',
  comunicacion: 'Fortaleza en comunicación y lectura de contextos',
  creatividad: 'Alta afinidad con procesos creativos',
  datos: 'Interés por información, datos y organización',
  diseno: 'Preferencia por diseñar soluciones o piezas visuales',
  educacion: 'Interés por enseñar y acompañar aprendizajes',
  ensenanza: 'Gusto por explicar y orientar a otras personas',
  gestion: 'Afinidad con gestión, organización y toma de decisiones',
  investigacion: 'Interés por investigar y formular preguntas',
  logica: 'Preferencia por pensamiento lógico',
  matematicas: 'Gusto por matemáticas y razonamiento cuantitativo',
  naturaleza: 'Interés por recursos naturales y vida',
  programacion: 'Afinidad con programación y tecnología',
  social: 'Interés por comunidades y fenómenos sociales',
  tecnologia: 'Alta afinidad con tecnología',
  territorio: 'Interés por territorio, ciudad o medición espacial',
}

export const getSelectedTags = (
  answers: AnswerRecord,
  questionList: PreguntaVocacional[] = preguntas,
) =>
  questionList.flatMap((question) => {
    const option = question.opciones.find((item) => item.id === answers[question.id])
    return option?.tags ?? []
  })

export const countTags = (tags: string[]) =>
  tags.reduce<Record<string, number>>((acc, tag) => {
    acc[tag] = (acc[tag] ?? 0) + 1
    return acc
  }, {})

export const scoreProgram = (
  programa: ProgramaUD,
  answers: AnswerRecord,
): CareerRecommendation => {
  const tagCounts = countTags(getSelectedTags(answers))
  const totalWeight = Object.values(tagCounts).reduce((sum, count) => sum + count, 0)
  const programTags = new Set(programa.tagsVocacionales)
  const matchedEntries = Object.entries(tagCounts).filter(([tag]) => programTags.has(tag))
  const matchedWeight = matchedEntries.reduce((sum, [, count]) => sum + count, 0)

  if (totalWeight === 0 || programa.tagsVocacionales.length === 0) {
    return {
      programa,
      compatibilidad: 0,
      razones: ['Completa el cuestionario para calcular compatibilidad.'],
      matchedTags: [],
    }
  }

  const userAffinity = matchedWeight / totalWeight
  const programCoverage = matchedEntries.length / programa.tagsVocacionales.length
  const compatibility = Math.round(Math.min(100, (userAffinity * 0.7 + programCoverage * 0.3) * 100))
  const matchedTags = matchedEntries
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'es'))
    .map(([tag]) => tag)

  const razones = matchedTags
    .slice(0, 3)
    .map((tag) => reasonByTag[tag] ?? `Afinidad con ${formatTag(tag).toLowerCase()}`)

  return {
    programa,
    compatibilidad: compatibility,
    razones: razones.length > 0 ? razones : ['Coincidencia general con tus respuestas seleccionadas.'],
    matchedTags,
  }
}

export const recommendCareers = (answers: AnswerRecord): CareerRecommendation[] =>
  programas
    .map((programa) => scoreProgram(programa, answers))
    .sort((a, b) => {
      if (b.compatibilidad !== a.compatibilidad) return b.compatibilidad - a.compatibilidad
      return a.programa.nombre.localeCompare(b.programa.nombre, 'es')
    })
    .slice(0, 3)
