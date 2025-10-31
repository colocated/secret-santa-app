import { nanoid } from "nanoid"

export function generateAuthCode(): string {
  // Generate a 6-digit code
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function generateSecureToken(): string {
  return nanoid(32)
}

export async function createAuthCode(participantId: string, expiryHours = 24) {
  const code = generateAuthCode()
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + expiryHours)

  return {
    code,
    expiresAt: expiresAt.toISOString(),
  }
}

export function isAuthCodeExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date()
}
