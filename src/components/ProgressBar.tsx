interface ProgressBarProps {
  current: number
  total: number
}

export const ProgressBar = ({ current, total }: ProgressBarProps) => {
  const percentage = Math.round((current / total) * 100)

  return (
    <div aria-label={`Progreso del cuestionario: ${percentage}%`} aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100} role="progressbar">
      <div className="flex items-center justify-between text-sm font-medium text-zinc-700">
        <span>
          Pregunta {current} de {total}
        </span>
        <span>{percentage}%</span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-md bg-zinc-200">
        <div className="h-full rounded-md bg-red-700 transition-all" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}
