const ERROR_MAP: Record<string, string> = {
  'Invalid login credentials': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
  'Email already registered': 'هذا البريد الإلكتروني مسجل بالفعل',
  'User already registered': 'هذا البريد الإلكتروني مسجل بالفعل',
  'Email not confirmed': 'يرجى تأكيد بريدك الإلكتروني أولاً',
  'Invalid email': 'صيغة البريد الإلكتروني غير صحيحة',
  'Password should be at least 6 characters': 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل',
  'Signup not allowed': 'التسجيل غير مسموح حالياً',
  'Too many requests': 'طلبات كثيرة جداً، يرجى الانتظار قليلاً',
  'Network request failed': 'لا يوجد اتصال بالإنترنت',
  'Failed to fetch': 'لا يوجد اتصال بالإنترنت',
  'New password should be different from the old password': 'يجب أن تكون كلمة المرور الجديدة مختلفة عن القديمة',
  'Token has expired or is invalid': 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً',
  'JWT expired': 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً',
};

export function translateError(error: string): string {
  if (!error) return 'حدث خطأ غير متوقع';

  for (const [eng, ar] of Object.entries(ERROR_MAP)) {
    if (error.toLowerCase().includes(eng.toLowerCase())) {
      return ar;
    }
  }

  return error;
}
