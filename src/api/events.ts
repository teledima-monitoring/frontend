import { BASE_URL } from '@/api//core'

export const listenEvents = () => new EventSource(`${BASE_URL}/sse/listen`)
