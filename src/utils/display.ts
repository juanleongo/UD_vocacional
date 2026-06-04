const unavailableText = 'No disponible en la fuente oficial'

export const officialFallback = (value?: string) => {
  if (!value || value.trim() === '' || value === unavailableText) {
    return 'Información no disponible en la fuente oficial'
  }

  return value
}

export const formatTag = (tag: string) =>
  tag
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
