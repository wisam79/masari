export function formatCurrency(amount?: number | null, currency: string = 'IQD'): string {
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat('ar-IQ', {
      style: 'currency',
      currency,
    }).format(safeAmount);
  } catch {
    return new Intl.NumberFormat('ar-IQ', {
      style: 'currency',
      currency: 'IQD',
    }).format(safeAmount);
  }
}

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
  } catch {
    return parsedDate.toLocaleDateString();
  }
}
