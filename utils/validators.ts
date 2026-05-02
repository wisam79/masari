export function validateEmail(email?: string | null): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password?: string | null): boolean {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 6;
}
