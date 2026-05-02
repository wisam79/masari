/**
 * Validates whether a given string is a plausible phone number.
 * Allows 10 to 15 digits after removing non-numeric characters.
 *
 * @param {string | null | undefined} phone - The phone number to validate.
 * @returns {boolean} True if the phone number is valid, false otherwise.
 */
export function validatePhoneNumber(phone?: string | null): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
}

/**
 * Validates an OTP (One Time Password).
 * Ensures it contains only 4 to 6 numeric digits.
 *
 * @param {string | null | undefined} otp - The OTP to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
export function validateOTP(otp?: string | null): boolean {
  if (!otp || typeof otp !== 'string') return false;
  return otp.length >= 4 && otp.length <= 6 && /^\d+$/.test(otp);
}

/**
 * Validates a user's name.
 * Ensures the name has at least 2 characters after trimming whitespace.
 *
 * @param {string | null | undefined} name - The name to validate.
 * @returns {boolean} True if the name is valid, false otherwise.
 */
export function validateName(name?: string | null): boolean {
  if (!name || typeof name !== 'string') return false;
  return name.trim().length >= 2;
}

/**
 * Validates a monetary amount.
 * Ensures the amount is a positive number and within a reasonable limit (e.g., <= 1,000,000).
 *
 * @param {number | null | undefined} amount - The amount to validate.
 * @returns {boolean} True if the amount is valid, false otherwise.
 */
export function validateAmount(amount?: number | null): boolean {
  if (typeof amount !== 'number' || isNaN(amount)) return false;
  return amount > 0 && amount <= 1000000;
}

/**
 * Validates an email address format.
 *
 * @param {string | null | undefined} email - The email to validate.
 * @returns {boolean} True if the email format is valid, false otherwise.
 */
export function validateEmail(email?: string | null): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates a password.
 * Ensures the password has a minimum length of 6 characters.
 *
 * @param {string | null | undefined} password - The password to validate.
 * @returns {boolean} True if the password is valid, false otherwise.
 */
export function validatePassword(password?: string | null): boolean {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 6;
}
