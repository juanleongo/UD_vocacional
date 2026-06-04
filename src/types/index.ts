export interface CampoTextoFuente {
  texto: string
  tipoFuente: 'pdf_malla' | 'inferido_desde_malla' | 'inferido_desde_area_programa'
  base?: string[]
  nota?: string
}

export interface AsignaturaMalla {
  nombre: string
  creditos?: number
  naturaleza?: string
}

export interface PeriodoAcademico {
  periodo: string
  asignaturas: AsignaturaMalla[]
  totalCreditos?: number
}

export interface FuenteMalla {
  archivoPdf: string
  rutaPdf: string
  textoExtraidoPath: string
  metodoExtraccion: 'texto_pdf' | 'ocr' | 'mixto'
  paginas: number
  tipoFuente: 'pdf_malla'
}

export interface ProgramaUD {
  id: string
  nombre: string
  facultad: string
  titulo: string
  modalidad: string
  jornada: string
  duracion: string
  creditos: string
  registroCalificado: string
  sede: string
  descripcionResumen: string
  perfilAspirante: string | CampoTextoFuente
  queAprendera?: string | CampoTextoFuente
  areasConocimiento: string[]
  habilidadesRelacionadas: string[]
  interesesRelacionados: string[]
  salidasProfesionales: string[]
  asignaturasDestacadas?: string[]
  periodosAcademicos?: PeriodoAcademico[]
  fuenteMalla?: FuenteMalla
  observacionesFuente?: string[]
  documentoBaseMalla?: {
    resolucion?: string
    fechaResolucion?: string
    tipoFuente: 'pdf_malla'
  }
  confianzaAsociacionMalla?: 'alta' | 'media' | 'baja'
  enlaceOficial: string
  fuente: string
  fechaConsulta: string
  tagsVocacionales: string[]
  trazabilidad?: {
    paginaOfertaPregrado: string
    endpointDatosPrograma: string
    claveFacultad: string
    clavePrograma: string
  }
}

export interface OpcionVocacional {
  id: string
  texto: string
  tags: string[]
}

export interface PreguntaVocacional {
  id: string
  texto: string
  apoyo?: string
  opciones: OpcionVocacional[]
}

export type AnswerRecord = Record<string, string>

export interface CareerRecommendation {
  programa: ProgramaUD
  compatibilidad: number
  razones: string[]
  matchedTags: string[]
}

export interface ExternalUniversity {
  nombre: string
  programa: string
  ciudad: string
  enlaceOficial: string
  fuente: string
  fechaConsulta: string
}

export interface ExternalCareer {
  carrera: string
  ofertadaPorUD: boolean
  universidadesPublicas: ExternalUniversity[]
  notaVerificacion?: string
  fechaConsulta: string
}
