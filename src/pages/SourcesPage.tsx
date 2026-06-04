import { ExternalLink, ShieldCheck } from 'lucide-react'
import { AlertBox } from '../components/AlertBox'

const sources = [
  {
    name: 'Página oficial de inicio',
    url: 'https://www.udistrital.edu.co/inicio',
  },
  {
    name: 'Página oficial de admisiones / oferta de pregrado',
    url: 'https://www.udistrital.edu.co/admisiones/index.php/oferta/pregrado',
  },
]

export const SourcesPage = () => (
  <div className="page-shell">
    <div className="max-w-3xl">
      <p className="eyebrow">Fuentes oficiales</p>
      <h1 className="mt-2 text-3xl font-black text-zinc-950 sm:text-4xl">Trazabilidad de la información académica</h1>
      <p className="mt-3 leading-7 text-zinc-700">
        Los programas cargados en esta versión se basan en la página oficial de admisiones de pregrado de la Universidad Distrital Francisco José de Caldas y en los endpoints oficiales enlazados desde esa página.
      </p>
    </div>

    <section className="mt-8 grid gap-4 md:grid-cols-2">
      {sources.map((source) => (
        <article className="focus-card p-5" key={source.url}>
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-red-700 p-2 text-white">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-950">{source.name}</h2>
              <p className="mt-1 text-sm text-zinc-600">Universidad Distrital Francisco José de Caldas</p>
            </div>
          </div>
          <a
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-red-700 hover:text-red-900"
            href={source.url}
            rel="noreferrer"
            target="_blank"
          >
            Abrir fuente oficial
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </article>
      ))}
    </section>

    <section className="mt-6 rounded-lg border border-zinc-200 bg-white p-5">
      <h2 className="text-lg font-bold text-zinc-950">Fecha de consulta</h2>
      <p className="mt-2 text-zinc-700">3 de junio de 2026</p>
      <p className="mt-3 text-sm leading-6 text-zinc-700">
        Algunos campos como duración, créditos, perfil profesional o salidas laborales no aparecen de forma consistente en la fuente oficial consultada. En esos casos se muestran como información no disponible o pendiente de verificación.
      </p>
    </section>

    <div className="mt-6">
      <AlertBox title="La oferta académica puede cambiar">
        Antes de tomar una decisión, consulta siempre la página oficial de admisiones de la Universidad Distrital.
      </AlertBox>
    </div>
  </div>
)
