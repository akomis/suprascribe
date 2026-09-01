export interface EmailData {
  subject: string
  body: string
  from: string
  date: string
  /**
   * Value of the RFC 2369 List-Unsubscribe header, when the sender set one.
   * An exact cancel/opt-out link straight from the envelope, so it beats
   * anything the model infers from body text.
   */
  listUnsubscribe?: string
}
