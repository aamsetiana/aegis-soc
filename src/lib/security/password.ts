import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 8) errors.push('Minimal 8 karakter')
  if (!/[A-Z]/.test(password)) errors.push('Harus ada huruf kapital')
  if (!/[a-z]/.test(password)) errors.push('Harus ada huruf kecil')
  if (!/[0-9]/.test(password)) errors.push('Harus ada angka')
  if (!/[@$!%*?&#^()_\-+=]/.test(password)) errors.push('Harus ada karakter khusus (@$!%*?&#^)')

  return { valid: errors.length === 0, errors }
}
