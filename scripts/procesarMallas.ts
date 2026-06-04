import { createCanvas } from '@napi-rs/canvas'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { basename, extname, join, resolve } from 'node:path'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'
import tesseract from 'tesseract.js'

type ConfianzaAsociacion = 'alta' | 'media' | 'baja'
type MetodoExtraccion = 'texto_pdf' | 'ocr' | 'mixto'
type TipoFuente = 'pdf_malla' | 'inferido_desde_malla'

interface ProgramaUD {
  id: string
  nombre: string
  facultad: string
  duracion?: string
  creditos?: string
  perfilAspirante?: unknown
  areasConocimiento?: unknown
  habilidadesRelacionadas?: unknown
  interesesRelacionados?: unknown
  salidasProfesionales?: unknown
  [key: string]: unknown
}

interface AsignaturaMalla {
  nombre: string
  creditos?: number
  naturaleza?: string
}

interface PeriodoAcademico {
  periodo: string
  asignaturas: AsignaturaMalla[]
  totalCreditos?: number
}

interface CampoInferido {
  texto?: string
  valores?: string[]
  tipoFuente: 'inferido_desde_malla'
  base: string[]
}

interface Asociacion {
  programaId?: string
  programaNombre?: string
  confianzaAsociacion: ConfianzaAsociacion
  puntaje: number
  motivos: string[]
  candidatos: Array<{
    programaId: string
    programaNombre: string
    puntaje: number
  }>
}

interface ExtraccionMalla {
  archivoPdf: string
  rutaPdf: string
  textoExtraidoPath: string
  paginas: number
  metodoExtraccion: MetodoExtraccion
  caracteresTextoDirecto: number
  caracteresTextoFinal: number
  ocrAplicado: boolean
  programaDetectado?: string
  facultadDetectada?: string
  resolucion?: string
  fechaResolucion?: string
  creditos?: number
  duracion?: string
  periodosAcademicos: PeriodoAcademico[]
  asignaturasDestacadas: string[]
  areasFormacion: string[]
  fuenteMalla: {
    archivoPdf: string
    rutaPdf: string
    textoExtraidoPath: string
    metodoExtraccion: MetodoExtraccion
    paginas: number
    tipoFuente: TipoFuente
  }
  observacionesFuente: string[]
  camposInferidos: {
    perfilAspirante?: CampoInferido
    queAprendera?: CampoInferido
    areasConocimiento?: CampoInferido
    habilidadesRelacionadas?: CampoInferido
    interesesRelacionados?: CampoInferido
  }
  asociacion: Asociacion
}

interface PdfTextResult {
  text: string
  pages: number
}

interface CanvasAndContext {
  canvas: ReturnType<typeof createCanvas>
  context: ReturnType<ReturnType<typeof createCanvas>['getContext']>
}

const ROOT_DIR = process.cwd()
const MALLAS_DIR = join(ROOT_DIR, 'mallas curriculares')
const PROGRAMAS_PATH = join(ROOT_DIR, 'src', 'data', 'programasUD.json')
const EXTRACTED_DIR = join(ROOT_DIR, 'src', 'data', 'extracted')
const TEXT_OUTPUT_DIR = join(EXTRACTED_DIR, 'mallas-texto')
const EXTRAIDAS_PATH = join(EXTRACTED_DIR, 'mallas-extraidas.json')
const NO_ASOCIADAS_PATH = join(EXTRACTED_DIR, 'mallas-no-asociadas.json')
const ENRICHED_PATH = join(ROOT_DIR, 'src', 'data', 'programasUD.enriched.json')

const MIN_TEXT_CHARS = Number(process.env.MALLAS_MIN_TEXT_CHARS ?? 500)
const MIN_ALPHA_WORDS = Number(process.env.MALLAS_MIN_ALPHA_WORDS ?? 80)
const DISABLE_OCR = process.env.MALLAS_DISABLE_OCR === '1'
const MAX_OCR_PAGES = Number(process.env.MALLAS_MAX_OCR_PAGES ?? 0)
const OCR_SCALE = Number(process.env.MALLAS_OCR_SCALE ?? 1.6)

const STOPWORDS = new Set([
  'academicos',
  'academico',
  'acreditacion',
  'alta',
  'calidad',
  'ciclos',
  'con',
  'de',
  'del',
  'el',
  'en',
  'estudios',
  'facultad',
  'ingenieria',
  'licenciatura',
  'por',
  'programa',
  'propedeuticos',
  'tecnologia',
  'universidad',
])

const FILE_ALIAS_BY_PROGRAM: Record<string, string[]> = {
  'licenciatura-en-quimica': ['pclq', 'licenciatura quimica', 'licenciatura en quimica'],
  'licenciatura-en-matematicas': ['lema', 'licenciatura matematicas'],
  'archivistica-y-gestion-de-la-informacion-digital': ['pagid'],
  'administracion-ambiental': ['administracion ambiental', 'plan de estudios numero 345'],
  'tecnologia-en-saneamiento-ambiental': ['tsa', 'pe tsa'],
}

const PERIODOS = [
  ['primer', 'Primer periodo'],
  ['primero', 'Primer periodo'],
  ['segundo', 'Segundo periodo'],
  ['tercer', 'Tercer periodo'],
  ['tercero', 'Tercer periodo'],
  ['cuarto', 'Cuarto periodo'],
  ['quinto', 'Quinto periodo'],
  ['sexto', 'Sexto periodo'],
  ['septimo', 'Séptimo periodo'],
  ['séptimo', 'Séptimo periodo'],
  ['octavo', 'Octavo periodo'],
  ['noveno', 'Noveno periodo'],
  ['decimo', 'Décimo periodo'],
  ['décimo', 'Décimo periodo'],
  ['undecimo', 'Undécimo periodo'],
  ['undécimo', 'Undécimo periodo'],
  ['duodecimo', 'Duodécimo periodo'],
  ['duodécimo', 'Duodécimo periodo'],
] as const

const ROMAN_PERIODS = new Map([
  ['i', 'Primer periodo'],
  ['ii', 'Segundo periodo'],
  ['iii', 'Tercer periodo'],
  ['iv', 'Cuarto periodo'],
  ['v', 'Quinto periodo'],
  ['vi', 'Sexto periodo'],
  ['vii', 'Séptimo periodo'],
  ['viii', 'Octavo periodo'],
  ['ix', 'Noveno periodo'],
  ['x', 'Décimo periodo'],
])

class NodeCanvasFactory {
  create(width: number, height: number): CanvasAndContext {
    const canvas = createCanvas(width, height)
    return { canvas, context: canvas.getContext('2d') }
  }

  reset(canvasAndContext: CanvasAndContext, width: number, height: number) {
    canvasAndContext.canvas.width = width
    canvasAndContext.canvas.height = height
  }

  destroy(canvasAndContext: CanvasAndContext) {
    canvasAndContext.canvas.width = 0
    canvasAndContext.canvas.height = 0
  }
}

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const slug = (value: string) =>
  normalize(value)
    .replace(/\s+/g, '-')
    .replace(/^-|-$/g, '') || 'archivo'

const unique = <T>(items: T[]) => [...new Set(items)]

const containsNormalizedPhrase = (text: string, phrase: string) => {
  const normalizedText = ` ${normalize(text)} `
  const normalizedPhrase = normalize(phrase)
  return normalizedPhrase.length > 0 && normalizedText.includes(` ${normalizedPhrase} `)
}

const repairTextEncoding = (value: string) =>
  value
    .replace(/Ã¡/g, 'á')
    .replace(/Ã©/g, 'é')
    .replace(/Ã­/g, 'í')
    .replace(/Ã³/g, 'ó')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã/g, 'Á')
    .replace(/Ã‰/g, 'É')
    .replace(/Ã/g, 'Í')
    .replace(/Ã“/g, 'Ó')
    .replace(/Ãš/g, 'Ú')
    .replace(/Ã±/g, 'ñ')
    .replace(/Ã‘/g, 'Ñ')
    .replace(/Ã¼/g, 'ü')
    .replace(/Ãœ/g, 'Ü')
    .replace(/Â°/g, '°')
    .replace(/â€“|â€”/g, '-')
    .replace(/â€œ|â€/g, '"')
    .replace(/â€™/g, "'")

const isUnavailable = (value: unknown) => {
  if (value === undefined || value === null) return true
  if (Array.isArray(value)) return value.length === 0
  if (typeof value !== 'string') return false
  const normalized = normalize(value)
  return (
    normalized === '' ||
    normalized.includes('no disponible') ||
    normalized.includes('informacion no disponible') ||
    normalized.includes('no se encontro informacion suficiente')
  )
}

const alphaWordCount = (text: string) =>
  (text.match(/\b[a-záéíóúüñ]{3,}\b/gi) ?? []).length

const hasUsefulText = (text: string) =>
  text.trim().length >= MIN_TEXT_CHARS && alphaWordCount(text) >= MIN_ALPHA_WORDS

const readPrograms = async () =>
  JSON.parse(await readFile(PROGRAMAS_PATH, 'utf8')) as ProgramaUD[]

const listPdfFiles = async () => {
  const files = await readdir(MALLAS_DIR)
  return files
    .filter((file) => extname(file).toLowerCase() === '.pdf')
    .map((file) => join(MALLAS_DIR, file))
    .sort((a, b) => basename(a).localeCompare(basename(b), 'es'))
}

const getPdfDocument = async (pdfPath: string) => {
  const data = new Uint8Array(await readFile(pdfPath))
  return pdfjsLib.getDocument({
    data,
    disableFontFace: true,
    isEvalSupported: false,
    useWorkerFetch: false,
  }).promise
}

const extractDirectText = async (pdfPath: string): Promise<PdfTextResult> => {
  const doc = await getPdfDocument(pdfPath)
  const pageTexts: string[] = []

  for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
    const page = await doc.getPage(pageNumber)
    const textContent = await page.getTextContent()
    const rows = new Map<number, Array<{ x: number; text: string }>>()

    for (const item of textContent.items) {
      if (!('str' in item) || item.str.trim() === '') continue
      const transform = item.transform
      const x = Math.round(transform[4])
      const y = Math.round(transform[5] / 2) * 2
      const current = rows.get(y) ?? []
      current.push({ x, text: item.str.trim() })
      rows.set(y, current)
    }

    const pageText = [...rows.entries()]
      .sort(([yA], [yB]) => yB - yA)
      .map(([, row]) =>
        row
          .sort((a, b) => a.x - b.x)
          .map((item) => item.text)
          .join(' '),
      )
      .join('\n')

    pageTexts.push(`\n\n--- Página ${pageNumber} ---\n${pageText}`)
  }

  return { text: repairTextEncoding(pageTexts.join('\n')), pages: doc.numPages }
}

const extractOcrText = async (pdfPath: string, pages: number) => {
  const doc = await getPdfDocument(pdfPath)
  const factory = new NodeCanvasFactory()
  const worker = await tesseract.createWorker('spa')
  const limit = MAX_OCR_PAGES > 0 ? Math.min(MAX_OCR_PAGES, pages) : pages
  const pageTexts: string[] = []

  try {
    for (let pageNumber = 1; pageNumber <= limit; pageNumber += 1) {
      const page = await doc.getPage(pageNumber)
      const viewport = page.getViewport({ scale: OCR_SCALE })
      const { canvas, context } = factory.create(
        Math.floor(viewport.width),
        Math.floor(viewport.height),
      )

      await page.render({ canvasContext: context, viewport, canvasFactory: factory }).promise
      const image = canvas.toBuffer('image/png')
      const result = await worker.recognize(image)
      pageTexts.push(`\n\n--- Página ${pageNumber} OCR ---\n${repairTextEncoding(result.data.text.trim())}`)
      factory.destroy({ canvas, context })
    }
  } finally {
    await worker.terminate()
  }

  if (limit < pages) {
    pageTexts.push(
      `\n\n--- OCR parcial ---\nOCR limitado a ${limit} de ${pages} páginas por MALLAS_MAX_OCR_PAGES.`,
    )
  }

  return pageTexts.join('\n')
}

const detectProgramPhrase = (text: string) => {
  const curricular = text.match(
    /Proyecto\s+Curricular\s+de\s+([A-ZÁÉÍÓÚÜÑa-záéíóúüñ0-9\s]+?)(?:,|\.|\n|programa|adscrito|de\s+la\s+Facultad)/i,
  )
  if (curricular) return curricular[1]?.replace(/\s+/g, ' ').trim()

  const program = text.match(
    /(?:plan\s+de\s+estudio\s*[-–]\s*)?programa\s+de\s+([A-ZÁÉÍÓÚÜÑa-záéíóúüñ0-9\s]+?)(?:,|\.|\n|c[oó]digo|facultad)/i,
  )
  return program?.[1]?.replace(/\s+/g, ' ').trim()
}

const detectFaculty = (text: string) => {
  const match = text.match(/Facultad\s+(?:de|del)\s+([A-ZÁÉÍÓÚÜÑa-záéíóúüñ\s&]+?)(?:,|\.|\n|”|"|')/i)
  return match ? `Facultad ${match[0].replace(/\s+/g, ' ').trim().replace(/[,.]"?$/, '')}` : undefined
}

const detectResolution = (text: string) => {
  const match = text.match(/Resoluci[oó]n\s*(?:No\.?|N[°º*]?\s*)?\s*[-:]?\s*\d{1,6}[^\n,)]*/i)
  return match?.[0]?.replace(/\s+/g, ' ').trim()
}

const detectResolutionDate = (text: string) => {
  const month =
    'enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre'
  const explicit = text.match(new RegExp(`\\d{1,2}\\s+de\\s+(?:${month})\\s+de\\s+\\d{4}`, 'i'))
  if (explicit) return explicit[0].replace(/\s+/g, ' ').trim()

  const parenthetical = text.match(new RegExp(`(?:${month})\\s+\\d{1,2}\\s+de\\s+\\d{4}`, 'i'))
  return parenthetical?.[0]?.replace(/\s+/g, ' ').trim()
}

const detectCredits = (text: string) => {
  const normalizedText = text.replace(/\s+/g, ' ')
  const candidates: Array<{ value: number; score: number }> = []
  const patterns = [
    /(?:n[uú]mero\s+total\s+de|establece\s+con\s+un\s+n[uú]mero\s+total\s+de)[^.;:]{0,90}?\((\d{2,3})\)\s*cr[eé]ditos(?:\s+acad[eé]micos)?/gi,
    /(?:n[uú]mero\s+total\s+de|total\s+(?:de\s+)?cr[eé]ditos(?:\s+acad[eé]micos)?)[^\d]{0,60}(\d{2,3})/gi,
    /(\d{2,3})\s*cr[eé]ditos(?:\s+acad[eé]micos)?/gi,
    /\((\d{2,3})\)\s*cr[eé]ditos(?:\s+acad[eé]micos)?/gi,
  ]

  for (const pattern of patterns) {
    for (const match of normalizedText.matchAll(pattern)) {
      const value = Number(match[1])
      if (value < 20 || value > 240) continue

      const index = match.index ?? 0
      const window = normalizedText.slice(Math.max(0, index - 120), index + 120)
      let score = 10
      if (/n[uú]mero\s+total|total\s+(?:de\s+)?cr[eé]ditos|establece\s+con\s+un\s+n[uú]mero\s+total/i.test(window)) {
        score += 80
      }
      if (/cr[eé]ditos\s+acad[eé]micos/i.test(window)) score += 20
      if (/rango\s+de\s+cr[eé]ditos|entre\s+[a-záéíóúüñ\s]*\(\d{2,3}\)\s+y/i.test(window)) {
        score -= 60
      }

      candidates.push({ value, score })
    }
  }

  return candidates.sort((a, b) => b.score - a.score)[0]?.value
}

const periodFromLine = (line: string) => {
  const normalizedLine = normalize(line)
  for (const [term, label] of PERIODOS) {
    if (normalizedLine.includes(`${normalize(term)} periodo`)) return label
    if (normalizedLine.includes(`${normalize(term)} semestre`)) {
      return label.replace('periodo', 'semestre')
    }
  }

  const romanMatch = normalizedLine.match(/\b(i|ii|iii|iv|v|vi|vii|viii|ix|x)\s+(periodo|semestre)\b/)
  if (!romanMatch) return undefined

  const base = ROMAN_PERIODS.get(romanMatch[1])
  if (!base) return undefined
  return romanMatch?.[2] === 'periodo' ? base : base.replace('periodo', 'semestre')
}

const detectDuration = (text: string, periodos: PeriodoAcademico[]) => {
  const explicit = text.match(/(\d{1,2})\s+(semestres|periodos\s+acad[eé]micos|periodos|semestres\s+acad[eé]micos)/i)
  if (explicit) {
    const label = explicit[2].toLowerCase().includes('semestre')
      ? 'semestres'
      : 'periodos académicos'
    return `${Number(explicit[1])} ${label}`
  }

  const count = periodos.length
  if (count === 0) return undefined
  if (count < 4) return undefined
  const hasSemester = periodos.some((periodo) => normalize(periodo.periodo).includes('semestre'))
  return `${count} ${hasSemester ? 'semestres' : 'periodos académicos'}`
}

const ignoredCourseLine = (line: string) => {
  const normalizedLine = normalize(line)
  if (normalizedLine.length < 5 || normalizedLine.length > 140) return true
  if (!/[a-záéíóúüñ]{4,}/i.test(line)) return true
  return [
    'acuerdo',
    'codigo',
    'considerando',
    'consejo',
    'creditos academicos',
    'espacio academico',
    'facultad',
    'horas',
    'modalidad',
    'naturaleza',
    'pagina',
    'periodo',
    'resolucion',
    'semestre',
    'total',
    'universidad',
  ].some((term) => normalizedLine.includes(term))
}

const parseCourse = (line: string): AsignaturaMalla | undefined => {
  const compact = line.replace(/\s+/g, ' ').trim()
  if (ignoredCourseLine(compact)) return undefined

  const natureMatch = compact.match(
    /\b(obligatoria|electiva|b[aá]sica|complementaria|intr[ií]nseca|extr[ií]nseca|fundamental|profesional)\b/i,
  )
  const numbers = [...compact.matchAll(/\b([1-9])\b/g)].map((match) => Number(match[1]))
  const creditos = numbers.findLast((value) => value >= 1 && value <= 8)
  const name = compact
    .replace(/\b(obligatoria|electiva|b[aá]sica|complementaria|intr[ií]nseca|extr[ií]nseca|fundamental|profesional)\b/gi, '')
    .replace(/\b\d+\b/g, ' ')
    .replace(/\b(hta|htc|htd|total|creditos|cr[eé]ditos|naturaleza|pl|pd|pa)\b/gi, ' ')
    .replace(/[^\p{L}\s-]/gu, ' ')
    .replace(/\b[\p{L}]\b/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (ignoredCourseLine(name)) return undefined
  const tokens = name.split(/\s+/)
  if (tokens.length < 2 && !(creditos && name.length >= 6)) return undefined

  return {
    nombre: name,
    ...(creditos ? { creditos } : {}),
    ...(natureMatch ? { naturaleza: natureMatch[1] } : {}),
  }
}

const extractPeriods = (text: string) => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  const periods: PeriodoAcademico[] = []
  let current: PeriodoAcademico | undefined
  const seenByPeriod = new Map<string, Set<string>>()

  for (const line of lines) {
    const period = periodFromLine(line)
    if (period) {
      current = periods.find((item) => normalize(item.periodo) === normalize(period))
      if (!current) {
        current = { periodo: period, asignaturas: [] }
        periods.push(current)
        seenByPeriod.set(current.periodo, new Set())
      }
      continue
    }

    if (!current) continue
    const course = parseCourse(line)
    if (!course) continue

    const seen = seenByPeriod.get(current.periodo)
    const key = normalize(course.nombre)
    if (seen?.has(key)) continue
    seen?.add(key)
    current.asignaturas.push(course)
  }

  const parsedPeriods = periods
    .filter((period) => period.asignaturas.length > 0)
    .map((period) => {
      const creditos = period.asignaturas
        .map((course) => course.creditos ?? 0)
        .reduce((sum, value) => sum + value, 0)

      return {
        ...period,
        ...(creditos > 0 ? { totalCreditos: creditos } : {}),
      }
    })

  if (parsedPeriods.length > 0) return parsedPeriods

  return extractRomanSemesterRows(text)
}

const extractRomanSemesterRows = (text: string) => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  const periods: PeriodoAcademico[] = []

  for (const line of lines) {
    const normalizedLine = normalize(line)
    const match = normalizedLine.match(/^(i|ii|iii|iv|v|vi|vii|viii|ix|x)\b.*\b(\d{1,2})$/)
    if (!match) continue

    const totalCreditos = Number(match[2])
    if (totalCreditos < 8 || totalCreditos > 30) continue

    const label = ROMAN_PERIODS.get(match[1])?.replace('periodo', 'semestre')
    if (!label) continue

    const cleaned = line
      .replace(/^(I|II|III|IV|V|VI|VII|VIII|IX|X)\b/i, '')
      .replace(/\b\d{1,2}\b\s*$/, '')
      .replace(/\s+/g, ' ')
      .trim()
    const subjects = cleaned
      .split(/\s{2,}|;|\|/)
      .map((subject) =>
        subject
          .replace(/[^\p{L}\s:-]/gu, ' ')
          .replace(/\b[\p{L}]\b/gu, ' ')
          .replace(/\s+/g, ' ')
          .trim(),
      )
      .filter((subject) => subject.length >= 8)
      .slice(0, 6)

    periods.push({
      periodo: label,
      asignaturas: subjects.map((nombre) => ({ nombre })),
      totalCreditos,
    })
  }

  return periods
}

const detectAreasFormacion = (text: string) => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  return unique(
    lines
      .filter((line) => /(?:área|area|componente|campo)\s+de\s+formaci[oó]n/i.test(line))
      .map((line) => line.replace(/^\W+/, '').slice(0, 120)),
  ).slice(0, 12)
}

const extractHighlightedSubjects = (periods: PeriodoAcademico[]) =>
  unique(periods.flatMap((period) => period.asignaturas.map((course) => course.nombre)))
    .filter((name) => alphaWordCount(name) >= 1)
    .slice(0, 16)

const detectExplicitSection = (text: string, labels: string[]) => {
  const lines = text.split(/\r?\n/)

  for (let index = 0; index < lines.length; index += 1) {
    const normalizedLine = normalize(lines[index])
    if (!labels.some((label) => normalizedLine.includes(normalize(label)))) continue

    const body = lines
      .slice(index + 1, index + 7)
      .map((line) => line.trim())
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()

    if (body.length >= 80) return body.slice(0, 900)
  }

  return undefined
}

const inferVocabulary = (subjects: string[]) => {
  const corpus = normalize(subjects.join(' '))
  const areas = new Set<string>()
  const habilidades = new Set<string>()
  const intereses = new Set<string>()

  const add = (area: string, skill: string, interest: string) => {
    areas.add(area)
    habilidades.add(skill)
    intereses.add(interest)
  }

  if (/calculo|algebra|matematic|geometri|ecuacion|estadistica|probabilidad/.test(corpus)) {
    add('Matemáticas', 'Razonamiento lógico', 'Resolución de problemas')
  }
  if (/programacion|software|datos|base|sistema|algorit/.test(corpus)) {
    add('Tecnología y datos', 'Pensamiento computacional', 'Programación')
  }
  if (/fisica|mecanica|electronica|circuit|electric/.test(corpus)) {
    add('Ciencias físicas y tecnología', 'Análisis técnico', 'Sistemas físicos')
  }
  if (/quimica|biologia|celular|botanica|zoologia|ecologia/.test(corpus)) {
    add('Ciencias naturales', 'Observación científica', 'Investigación')
  }
  if (/ambiente|ambiental|forestal|saneamiento|agua|suelo|ecologia/.test(corpus)) {
    add('Ambiente y sostenibilidad', 'Análisis territorial', 'Naturaleza')
  }
  if (/pedagog|didactica|educacion|infancia|aprendizaje/.test(corpus)) {
    add('Educación', 'Comunicación pedagógica', 'Enseñanza')
  }
  if (/lengua|literatura|lectura|ingles|linguistica|comunicacion|periodismo/.test(corpus)) {
    add('Lenguaje y comunicación', 'Lectura crítica', 'Comunicación')
  }
  if (/arte|dibujo|musica|escena|danza|visual|plastica|creacion/.test(corpus)) {
    add('Artes y creación', 'Creatividad', 'Expresión artística')
  }
  if (/gestion|administracion|proyecto|produccion|organizacion/.test(corpus)) {
    add('Gestión y proyectos', 'Organización', 'Gestión de procesos')
  }
  if (/topograf|geodes|cartograf|territorio|catastro|geografia/.test(corpus)) {
    add('Territorio y medición espacial', 'Interpretación cartográfica', 'Trabajo de campo')
  }

  return {
    areas: [...areas],
    habilidades: [...habilidades],
    intereses: [...intereses],
  }
}

const buildInferredFields = (subjects: string[]) => {
  const base = subjects.slice(0, 10)
  if (base.length < 4) return {}

  const vocabulary = inferVocabulary(base)
  const focus = vocabulary.areas.length > 0 ? vocabulary.areas.join(', ') : 'las áreas de la malla'

  return {
    perfilAspirante: {
      texto: `Persona con interés por ${focus.toLowerCase()}, con disposición para estudiar asignaturas como ${base.slice(0, 4).join(', ')}.`,
      tipoFuente: 'inferido_desde_malla',
      base,
    },
    queAprendera: {
      texto: `La malla sugiere formación en ${focus.toLowerCase()} a partir de espacios académicos como ${base.slice(0, 6).join(', ')}.`,
      tipoFuente: 'inferido_desde_malla',
      base,
    },
    areasConocimiento: {
      valores: vocabulary.areas,
      tipoFuente: 'inferido_desde_malla',
      base,
    },
    habilidadesRelacionadas: {
      valores: vocabulary.habilidades,
      tipoFuente: 'inferido_desde_malla',
      base,
    },
    interesesRelacionados: {
      valores: vocabulary.intereses,
      tipoFuente: 'inferido_desde_malla',
      base,
    },
  } satisfies ExtraccionMalla['camposInferidos']
}

const significantTokens = (value: string) =>
  normalize(value)
    .split(' ')
    .filter((token) => token.length >= 4 && !STOPWORDS.has(token))

const programVariants = (program: ProgramaUD) => {
  const cleanName = String(program.nombre).replace(/\([^)]*\)/g, '')
  const withoutDegree = cleanName
    .replace(/^ingenier[ií]a\s+(?:de|en)?\s*/i, '')
    .replace(/^licenciatura\s+en\s*/i, '')
    .replace(/^tecnolog[ií]a\s+en\s*/i, '')
    .trim()

  return unique([cleanName, withoutDegree, String(program.nombre)].map(normalize).filter(Boolean))
}

const associatePdf = (
  pdfName: string,
  text: string,
  programs: ProgramaUD[],
  detectedProgram?: string,
): Asociacion => {
  const fileNorm = normalize(pdfName)
  const textNorm = normalize(text.slice(0, 50000))
  const detectedNorm = detectedProgram ? normalize(detectedProgram) : ''

  const scored = programs.map((program) => {
    const variants = programVariants(program)
    const tokens = significantTokens(program.nombre)
    let score = 0
    const reasons: string[] = []
    const aliases = FILE_ALIAS_BY_PROGRAM[program.id] ?? []

    for (const variant of variants) {
      if (variant.length >= 4 && fileNorm.includes(variant)) {
        score += 65
        reasons.push(`El nombre del archivo contiene "${variant}".`)
      }
      if (variant.length >= 4 && textNorm.includes(variant)) {
        score += 70
        reasons.push(`El texto extraído contiene "${variant}".`)
      }
      if (detectedNorm && (detectedNorm.includes(variant) || variant.includes(detectedNorm))) {
        score += 55
        reasons.push(`La frase "Proyecto Curricular de..." coincide con "${variant}".`)
      }
    }

    for (const alias of aliases) {
      const aliasNorm = normalize(alias)
      if (containsNormalizedPhrase(fileNorm, aliasNorm)) {
        score += 90
        reasons.push(`El nombre del archivo contiene el alias "${alias}".`)
      }
      if (containsNormalizedPhrase(textNorm, aliasNorm)) {
        score += 65
        reasons.push(`El texto contiene el alias "${alias}".`)
      }
    }

    const fileTokenMatches = tokens.filter((token) => fileNorm.includes(token)).length
    const textTokenMatches = tokens.filter((token) => textNorm.includes(token)).length
    if (tokens.length > 0) {
      score += Math.round((fileTokenMatches / tokens.length) * 35)
      score += Math.round((textTokenMatches / tokens.length) * 25)
    }

    const facultyNorm = normalize(program.facultad)
    if (facultyNorm && textNorm.includes(facultyNorm)) {
      score += 45
      reasons.push('La facultad coincide en el texto.')
    }
    const knownFaculties = unique(programs.map((item) => normalize(item.facultad)).filter(Boolean))
    const otherFacultyMentioned = knownFaculties.some(
      (faculty) => faculty !== facultyNorm && textNorm.includes(faculty),
    )
    if (otherFacultyMentioned && !textNorm.includes(facultyNorm)) {
      score -= 35
      reasons.push('El texto menciona otra facultad oficial.')
    }

    return {
      programaId: program.id,
      programaNombre: program.nombre,
      puntaje: score,
      motivos: unique(reasons),
    }
  })

  const candidatos = scored
    .sort((a, b) => b.puntaje - a.puntaje)
    .slice(0, 5)
    .map(({ programaId, programaNombre, puntaje }) => ({ programaId, programaNombre, puntaje }))

  const best = scored[0]
  const second = scored[1]
  const margin = best.puntaje - (second?.puntaje ?? 0)
  let confianzaAsociacion: ConfianzaAsociacion = 'baja'

  if (best.puntaje >= 90 && margin >= 18) confianzaAsociacion = 'alta'
  else if (best.puntaje >= 60 && margin >= 12) confianzaAsociacion = 'media'

  return {
    ...(best.puntaje > 0 ? { programaId: best.programaId, programaNombre: best.programaNombre } : {}),
    confianzaAsociacion,
    puntaje: best.puntaje,
    motivos: best.motivos,
    candidatos,
  }
}

const enrichPrograms = (programs: ProgramaUD[], extractions: ExtraccionMalla[]) => {
  const enriched = structuredClone(programs) as ProgramaUD[]
  const accepted = extractions.filter((item) =>
    ['alta', 'media'].includes(item.asociacion.confianzaAsociacion),
  )

  for (const extraction of accepted) {
    const index = enriched.findIndex((program) => program.id === extraction.asociacion.programaId)
    if (index < 0) continue

    const program = enriched[index]
    const fieldTrace: Record<string, unknown> = {
      ...(typeof program.trazabilidadCamposMalla === 'object' && program.trazabilidadCamposMalla
        ? (program.trazabilidadCamposMalla as Record<string, unknown>)
        : {}),
    }

    if (extraction.creditos) {
      program.creditos = `${extraction.creditos} créditos académicos`
      fieldTrace.creditos = { tipoFuente: 'pdf_malla', fuenteMalla: extraction.archivoPdf }
    }

    if (extraction.duracion) {
      program.duracion = extraction.duracion
      fieldTrace.duracion = { tipoFuente: 'pdf_malla', fuenteMalla: extraction.archivoPdf }
    }

    if (extraction.periodosAcademicos.length > 0) {
      program.periodosAcademicos = extraction.periodosAcademicos
      fieldTrace.periodosAcademicos = { tipoFuente: 'pdf_malla', fuenteMalla: extraction.archivoPdf }
    }

    if (extraction.asignaturasDestacadas.length > 0) {
      program.asignaturasDestacadas = extraction.asignaturasDestacadas
      fieldTrace.asignaturasDestacadas = { tipoFuente: 'pdf_malla', fuenteMalla: extraction.archivoPdf }
    }

    if (extraction.resolucion || extraction.fechaResolucion) {
      program.documentoBaseMalla = {
        resolucion: extraction.resolucion,
        fechaResolucion: extraction.fechaResolucion,
        tipoFuente: 'pdf_malla',
      }
    }

    if (isUnavailable(program.perfilAspirante) && extraction.camposInferidos.perfilAspirante) {
      program.perfilAspirante = extraction.camposInferidos.perfilAspirante
      fieldTrace.perfilAspirante = { tipoFuente: 'inferido_desde_malla', fuenteMalla: extraction.archivoPdf }
    }

    if (extraction.camposInferidos.queAprendera) {
      program.queAprendera = extraction.camposInferidos.queAprendera
      fieldTrace.queAprendera = { tipoFuente: 'inferido_desde_malla', fuenteMalla: extraction.archivoPdf }
    }

    for (const field of [
      'areasConocimiento',
      'habilidadesRelacionadas',
      'interesesRelacionados',
    ] as const) {
      const inferred = extraction.camposInferidos[field]
      if (!inferred?.valores || inferred.valores.length === 0 || !isUnavailable(program[field])) {
        continue
      }

      program[field] = inferred.valores
      fieldTrace[field] = {
        tipoFuente: 'inferido_desde_malla',
        base: inferred.base,
        fuenteMalla: extraction.archivoPdf,
      }
    }

    if (isUnavailable(program.salidasProfesionales)) {
      const explicitWork = detectExplicitSection(extractionToTextCache.get(extraction.archivoPdf) ?? '', [
        'perfil profesional',
        'campo laboral',
        'campos laborales',
        'desempeño profesional',
      ])
      if (explicitWork) {
        program.salidasProfesionales = [explicitWork]
        fieldTrace.salidasProfesionales = { tipoFuente: 'pdf_malla', fuenteMalla: extraction.archivoPdf }
      }
    }

    program.fuenteMalla = extraction.fuenteMalla
    program.observacionesFuente = extraction.observacionesFuente
    program.confianzaAsociacionMalla = extraction.asociacion.confianzaAsociacion
    program.trazabilidadCamposMalla = fieldTrace
  }

  return enriched
}

const extractionToTextCache = new Map<string, string>()

const processPdf = async (pdfPath: string, programs: ProgramaUD[]): Promise<ExtraccionMalla> => {
  const fileName = basename(pdfPath)
  console.log(`Procesando ${fileName}`)
  const direct = await extractDirectText(pdfPath)
  let finalText = direct.text
  let method: MetodoExtraccion = 'texto_pdf'
  let ocrApplied = false
  const observations: string[] = []

  if (!hasUsefulText(direct.text)) {
    observations.push('El texto directo fue vacío o insuficiente; se intentó OCR.')

    if (!DISABLE_OCR) {
      const ocrText = await extractOcrText(pdfPath, direct.pages)
      finalText = [direct.text, ocrText].filter(Boolean).join('\n')
      method = direct.text.trim().length > 0 ? 'mixto' : 'ocr'
      ocrApplied = true
    } else {
      observations.push('OCR desactivado por MALLAS_DISABLE_OCR=1.')
    }
  }

  if (!hasUsefulText(finalText)) {
    observations.push('No se encontró información suficiente en la malla curricular disponible.')
  }

  const programPhrase = detectProgramPhrase(finalText)
  const periods = extractPeriods(finalText)
  const subjects = extractHighlightedSubjects(periods)
  const association = associatePdf(fileName, finalText, programs, programPhrase)
  const textFileName = `${slug(fileName.replace(extname(fileName), ''))}.txt`
  const textPath = join(TEXT_OUTPUT_DIR, textFileName)
  const relativeTextPath = textPath.replace(ROOT_DIR, '').replace(/^[/\\]/, '').replace(/\\/g, '/')
  const explicitCredits = detectCredits(finalText)
  const periodCreditSum = periods
    .map((period) => period.totalCreditos ?? 0)
    .reduce((sum, value) => sum + value, 0)
  const detectedCredits =
    explicitCredits ?? (periods.length >= 4 && periodCreditSum >= 80 ? periodCreditSum : undefined)
  const duration = detectDuration(finalText, periods)
  const inferredFields = buildInferredFields(subjects)

  if (!detectedCredits) observations.push('No se detectó total de créditos con confianza suficiente.')
  if (!duration) observations.push('No se detectó duración o número de periodos con confianza suficiente.')
  if (periods.length === 0) observations.push('No se detectó una malla por periodos académicos.')
  if (association.confianzaAsociacion === 'baja') {
    observations.push('Asociación con programa en confianza baja; requiere revisión manual.')
  }
  if (Object.keys(inferredFields).length > 0) {
    observations.push('Algunos campos se infirieron desde asignaturas y están marcados como inferido_desde_malla.')
  }

  await writeFile(textPath, finalText, 'utf8')
  extractionToTextCache.set(fileName, finalText)

  return {
    archivoPdf: fileName,
    rutaPdf: resolve(pdfPath),
    textoExtraidoPath: relativeTextPath,
    paginas: direct.pages,
    metodoExtraccion: method,
    caracteresTextoDirecto: direct.text.trim().length,
    caracteresTextoFinal: finalText.trim().length,
    ocrAplicado: ocrApplied,
    ...(programPhrase ? { programaDetectado: programPhrase } : {}),
    ...(detectFaculty(finalText) ? { facultadDetectada: detectFaculty(finalText) } : {}),
    ...(detectResolution(finalText) ? { resolucion: detectResolution(finalText) } : {}),
    ...(detectResolutionDate(finalText) ? { fechaResolucion: detectResolutionDate(finalText) } : {}),
    ...(detectedCredits ? { creditos: detectedCredits } : {}),
    ...(duration ? { duracion: duration } : {}),
    periodosAcademicos: periods,
    asignaturasDestacadas: subjects,
    areasFormacion: detectAreasFormacion(finalText),
    fuenteMalla: {
      archivoPdf: fileName,
      rutaPdf: resolve(pdfPath),
      textoExtraidoPath: relativeTextPath,
      metodoExtraccion: method,
      paginas: direct.pages,
      tipoFuente: 'pdf_malla',
    },
    observacionesFuente: unique(observations),
    camposInferidos: inferredFields,
    asociacion: association,
  }
}

const main = async () => {
  await mkdir(TEXT_OUTPUT_DIR, { recursive: true })
  const programs = await readPrograms()
  const pdfFiles = await listPdfFiles()
  const extractions: ExtraccionMalla[] = []

  for (const pdfPath of pdfFiles) {
    try {
      extractions.push(await processPdf(pdfPath, programs))
    } catch (error) {
      const fileName = basename(pdfPath)
      const message = error instanceof Error ? error.message : String(error)
      console.error(`Error procesando ${fileName}: ${message}`)
      extractions.push({
        archivoPdf: fileName,
        rutaPdf: resolve(pdfPath),
        textoExtraidoPath: '',
        paginas: 0,
        metodoExtraccion: 'texto_pdf',
        caracteresTextoDirecto: 0,
        caracteresTextoFinal: 0,
        ocrAplicado: false,
        periodosAcademicos: [],
        asignaturasDestacadas: [],
        areasFormacion: [],
        fuenteMalla: {
          archivoPdf: fileName,
          rutaPdf: resolve(pdfPath),
          textoExtraidoPath: '',
          metodoExtraccion: 'texto_pdf',
          paginas: 0,
          tipoFuente: 'pdf_malla',
        },
        observacionesFuente: [`Error de procesamiento: ${message}`],
        camposInferidos: {},
        asociacion: {
          confianzaAsociacion: 'baja',
          puntaje: 0,
          motivos: [],
          candidatos: [],
        },
      })
    }
  }

  const notAssociated = extractions.filter(
    (item) => item.asociacion.confianzaAsociacion === 'baja',
  )
  const enriched = enrichPrograms(programs, extractions)

  await writeFile(EXTRAIDAS_PATH, `${JSON.stringify(extractions, null, 2)}\n`, 'utf8')
  await writeFile(NO_ASOCIADAS_PATH, `${JSON.stringify(notAssociated, null, 2)}\n`, 'utf8')
  await writeFile(ENRICHED_PATH, `${JSON.stringify(enriched, null, 2)}\n`, 'utf8')

  const resumen = {
    pdfsProcesados: extractions.length,
    asociacionesAlta: extractions.filter((item) => item.asociacion.confianzaAsociacion === 'alta')
      .length,
    asociacionesMedia: extractions.filter((item) => item.asociacion.confianzaAsociacion === 'media')
      .length,
    asociacionesBaja: notAssociated.length,
    conOCR: extractions.filter((item) => item.ocrAplicado).length,
    archivoExtraidas: EXTRAIDAS_PATH,
    archivoNoAsociadas: NO_ASOCIADAS_PATH,
    archivoEnriquecido: ENRICHED_PATH,
  }

  console.log(JSON.stringify(resumen, null, 2))
}

await main()
