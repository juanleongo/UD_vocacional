import { ArrowRight, BookOpen, ExternalLink, SearchCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AlertBox } from '../components/AlertBox'
import programasData from '../data/programasUD.enriched.json'
import type { ProgramaUD } from '../types'

const programas = programasData as ProgramaUD[]

export const HomePage = () => (
  <div>
    <section className="border-b border-zinc-200 bg-white">
      <div className="page-shell grid gap-8 py-10 md:grid-cols-[1.15fr_0.85fr] md:items-center">
        <div>
          <p className="eyebrow">Orientación para aspirantes universitarios</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight text-zinc-950 sm:text-5xl">
            Descubre carreras de pregrado de la Universidad Distrital según tu perfil
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-700">
            Responde un cuestionario vocacional sobre intereses, habilidades y preferencias personales. Al finalizar recibirás tres programas de la oferta oficial de pregrado UD con mayor compatibilidad.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-md bg-red-700 px-5 py-3 font-semibold text-white hover:bg-red-800"
              to="/cuestionario"
            >
              Iniciar cuestionario
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-300 px-5 py-3 font-semibold text-zinc-800 hover:border-red-300 hover:text-red-800"
              to="/fuentes"
            >
              Ver fuentes oficiales
              <SearchCheck className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="focus-card p-6">
          <img
            alt="Logo Universidad Distrital Francisco José de Caldas"
            className="h-20 w-auto"
            src="https://www.udistrital.edu.co/admisiones/themes/custom/versh/logo.png"
          />
          <div className="mt-6 grid grid-cols-2 gap-3 border-y border-zinc-200 py-4">
            <div className="border-r border-zinc-200 pr-4">
              <p className="text-3xl font-black text-red-700">{programas.length}</p>
              <p className="mt-1 text-sm font-semibold text-zinc-700">programas oficiales cargados</p>
            </div>
            <div className="pl-4">
              <p className="text-3xl font-black text-zinc-950">15</p>
              <p className="mt-1 text-sm font-semibold text-zinc-700">preguntas vocacionales</p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-6 text-zinc-700">
            La Universidad Distrital Francisco José de Caldas es la fuente oficial usada para la oferta de pregrado, enlaces y datos académicos visibles en esta aplicación.
          </p>
          <a
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-red-700 hover:text-red-900"
            href="https://www.udistrital.edu.co/admisiones/index.php/oferta/pregrado"
            rel="noreferrer"
            target="_blank"
          >
            Consultar oferta oficial
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>

    <section className="page-shell grid gap-6 md:grid-cols-3">
      {[
        {
          title: 'Cuestionario claro',
          text: 'Preguntas sobre intereses académicos, habilidades, estilos de trabajo y áreas del conocimiento.',
          icon: BookOpen,
        },
        {
          title: 'Recomendación explicable',
          text: 'El puntaje se calcula con tags vocacionales visibles en el código, sin IA externa ni servicios pagos.',
          icon: SearchCheck,
        },
        {
          title: 'Trazabilidad oficial',
          text: 'Los programas, enlaces y registros se cargan desde fuentes oficiales o se marcan como no disponibles.',
          icon: ExternalLink,
        },
      ].map(({ title, text, icon: Icon }) => (
        <article className="focus-card p-5" key={title}>
          <div className="inline-flex rounded-md bg-red-700 p-2 text-white">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-zinc-950">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-700">{text}</p>
        </article>
      ))}
    </section>

    <section className="page-shell pt-0">
      <AlertBox title="Aviso importante">
        Este resultado es orientativo y no reemplaza asesoría vocacional profesional ni la consulta directa de las fuentes oficiales.
      </AlertBox>
    </section>
  </div>
)
