/**
 * Formats a phone number string into a standard format.
 * Returns the original string if it cannot be formatted.
 * Handles null, undefined, or non-string inputs safely.
 *
 * @param {string | null | undefined} phone - The phone number to format.
 * @returns {string} The formatted phone number or the original/empty string if invalid.
 */
export function formatPhoneNumber(phone?: string | null): string {
  if (!phone || typeof phone !== 'string') return '';
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]}`;
  }
  return phone;
}

/**
 * Formats a numeric amount as currency.
 * Handles NaN or invalid amounts gracefully by defaulting to 0.
 *
 * @param {number | null | undefined} amount - The amount to format.
 * @param {string} [currency='IQD'] - The currency code (e.g., 'IQD', 'USD'). Defaults to 'IQD'.
 * @returns {string} The formatted currency string.
 */
export function formatCurrency(amount?: number | null, currency: string = 'IQD'): string {
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat('ar-IQ', {
      style: 'currency',
      currency,
    }).format(safeAmount);
  } catch (e) {
    // Fallback if currency is invalid
    return new Intl.NumberFormat('ar-IQ', {
      style: 'currency',
      currency: 'IQD',
    }).format(safeAmount);
  }
}

/**
 * Formats a date string or Date object into a readable date string.
 *
 * @param {string | Date | null | undefined} date - The date to format.
 * @returns {string} The formatted date, or an empty string if the date is invalid.
 */
export function formatDate(date?: string | Date | null): string {
  if (!date) return '';
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return '';
  
  try {
    return new Intl.DateTimeFormat('ar-IQ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(parsedDate);
  } catch (e) {
    return parsedDate.toLocaleDateString();
  }
}

/**
 * Formats a date string or Date object into a readable date and time string.
 *
 * @param {string | Date | null | undefined} date - The date and time to format.
 * @returns {string} The formatted date and time, or an empty string if the date is invalid.
 */
export function formatDateTime(date?: string | Date | null): string {
  if (!date) return '';
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return '';
  
  try {
    return new Intl.DateTimeFormat('ar-IQ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(parsedDate);
  } catch (e) {
    return parsedDate.toLocaleString();
  }
}
