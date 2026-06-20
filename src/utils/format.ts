import { APIError } from '@/services/error'

export function formatDate(dt: Date | string): string {
  if (!dt) return '—'

  const d = typeof dt === 'string' ? new Date(dt) : (dt as Date)

  const pad = (n: number) => String(n).padStart(2, '0')
  const year = d.getFullYear()
  const month = pad(d.getMonth() + 1)
  const day = pad(d.getDate())
  const hours = pad(d.getHours())
  const minutes = pad(d.getMinutes())
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function formatError(e: Error, defaultMessage: string = 'unknown error'): string {
  if (e instanceof APIError) {
    return e.responseBody.error || defaultMessage
  }

  return e.message
}
