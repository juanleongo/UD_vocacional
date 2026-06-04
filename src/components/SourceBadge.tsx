import { ShieldCheck } from 'lucide-react'

interface SourceBadgeProps {
  source?: string
  date?: string
}

export const SourceBadge = ({ source = 'Universidad Distrital Francisco José de Caldas', date }: SourceBadgeProps) => (
  <div className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-800">
    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
    <span>{source}</span>
    {date ? <span className="text-red-700">Consulta: {date}</span> : null}
  </div>
)
