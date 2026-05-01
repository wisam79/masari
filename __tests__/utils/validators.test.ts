// __tests__/utils/validators.test.ts
import { validateEmail, validatePassword, validatePhoneNumber, validateOTP, validateName } from '../../utils/validators';

describe('Validators', () => {
  describe('validateEmail', () => {
    it('should validate correct email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user@domain.co')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('noatsign.com')).toBe(false);
      expect(validateEmail('@nodomain')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should accept passwords with 6+ characters', () => {
      expect(validatePassword('123456')).toBe(true);
      expect(validatePassword('abcdefg')).toBe(true);
    });

    it('should reject short passwords', () => {
      expect(validatePassword('12345')).toBe(false);
      expect(validatePassword('')).toBe(false);
    });
  });

  describe('validatePhoneNumber', () => {
    it('should accept valid phone numbers', () => {
      expect(validatePhoneNumber('1234567890')).toBe(true);
      expect(validatePhoneNumber('+9641234567890')).toBe(true);
      expect(validatePhoneNumber('123-456-7890')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhoneNumber('123')).toBe(false);
      expect(validatePhoneNumber('1234567890123456')).toBe(false);
    });
  });

  describe('validateOTP', () => {
    it('should accept 4-6 digit OTPs', () => {
      expect(validateOTP('1234')).toBe(true);
      expect(validateOTP('123456')).toBe(true);
    });

    it('should reject invalid OTPs', () => {
      expect(validateOTP('123')).toBe(false);
      expect(validateOTP('1234567')).toBe(false);
      expect(validateOTP('12ab')).toBe(false);
    });
  });

  describe('validateName', () => {
    it('should accept names with 2+ characters', () => {
      expect(validateName('Ali')).toBe(true);
      expect(validateName('AB')).toBe(true);
    });

    it('should reject short names', () => {
      expect(validateName('A')).toBe(false);
      expect(validateName('')).toBe(false);
      expect(validateName('   ')).toBe(false);
    });
  });
});