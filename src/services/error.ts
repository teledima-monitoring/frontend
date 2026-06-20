export class APIError extends Error {
  public readonly name = 'APIError'
  public readonly code: number
  public readonly responseBody: any

  constructor(code: number, responseBody: string | JSON, options?: ErrorOptions) {
    super(`API error ${code}: ${responseBody}`, options)

    this.code = code
    this.responseBody = responseBody
  }
}
