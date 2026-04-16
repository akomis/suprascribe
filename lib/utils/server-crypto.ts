import { randomBytes, createCipheriv, createDecipheriv, scryptSync } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32
const IV_LENGTH = 16
const TAG_LENGTH = 16

function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET
  if (!secret) {
    throw new Error('ENCRYPTION_SECRET environment variable is not set')
  }
  return scryptSync(secret, 'suprascribe-salt', KEY_LENGTH)
}

export function encryptApiKey(plaintext: string): string {
  const key = getEncryptionKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(plaintext, 'utf8', 'base64')
  encrypted += cipher.final('base64')

  const tag = cipher.getAuthTag()

  return Buffer.concat([iv, tag, Buffer.from(encrypted, 'base64')]).toString('base64')
}

export function decryptApiKey(encryptedData: string): string {
  const key = getEncryptionKey()
  const data = Buffer.from(encryptedData, 'base64')

  const iv = data.subarray(0, IV_LENGTH)
  const tag = data.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH)
  const encrypted = data.subarray(IV_LENGTH + TAG_LENGTH)

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)

  let decrypted = decipher.update(encrypted, undefined, 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

export function getKeyHint(apiKey: string): string {
  if (apiKey.length <= 4) {
    return '...' + '*'.repeat(apiKey.length)
  }
  return '...' + apiKey.slice(-4)
}
