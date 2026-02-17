import { useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'

export function usePersistedForm<T extends Record<string, any>>(
  form: UseFormReturn<T>,
  key: string
) {
  // Load saved data
  useEffect(() => {
    const savedData = localStorage.getItem(key)
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        form.reset(parsed)
        localStorage.removeItem(key)
      } catch (e) {
        console.error('Error parsing saved form data', e)
      }
    }
  }, [form, key])

  const saveForm = (data: T) => {
    localStorage.setItem(key, JSON.stringify(data))
  }

  return { saveForm }
}
