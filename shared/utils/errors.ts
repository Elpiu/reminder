/**
 * Errore mostrabile all'utente: `code` è una chiave di traduzione sotto `errors.`,
 * `params` i valori da interpolare. Il messaggio resta il codice, utile nei log e nei test.
 */
export class AppError extends Error {
  constructor(public code: string, public params: Record<string, string> = {}) {
    super(code)
    this.name = 'AppError'
  }
}
