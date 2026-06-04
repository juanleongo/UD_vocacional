import { AlertTriangle, Info } from 'lucide-react'
import type { ReactNode } from 'react'

interface AlertBoxProps {
  title: string
  children: ReactNode
  tone?: 'warning' | 'info'
}

export const AlertBox = ({ title, children, tone = 'warning' }: AlertBoxProps) => {
  const Icon = tone === 'warning' ? AlertTriangle : Info
  const styles =
    tone === 'warning'
      ? 'border-amber-300 bg-amber-50 text-amber-950'
      : 'border-red-200 bg-red-50 text-red-950'

  return (
    <div className={`rounded-lg border p-4 ${styles}`} role="note">
      <div className="flex gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-semibold">{title}</p>
          <div className="mt-1 text-sm leading-6">{children}</div>
        </div>
      </div>
    </div>
  )
}
