import { useContext } from 'react'
import { VocationalContext } from '../context/VocationalContext'

export const useVocational = () => {
  const context = useContext(VocationalContext)

  if (!context) {
    throw new Error('useVocational debe usarse dentro de VocationalProvider')
  }

  return context
}
