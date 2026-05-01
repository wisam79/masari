export function validatePhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
}

export function validateOTP(otp: string): boolean {
  return otp.length >= 4 && otp.length <= 6 && /^\d+$/.test(otp);
}

export function validateName(name: string): boolean {
  return name.trim().length >= 2;
}

export function validateAmount(amount: number): boolean {
  return amount > 0 && amount <= 1000000;
}