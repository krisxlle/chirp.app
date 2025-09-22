// Secure random utilities to replace Math.random() for security-critical operations
import { randomBytes } from 'crypto';

/**
 * Generate a cryptographically secure random number between 0 and 1
 * @returns A secure random number between 0 and 1
 */
export function secureRandom(): number {
  const bytes = randomBytes(4);
  const uint32 = bytes.readUInt32BE(0);
  return uint32 / 0xffffffff;
}

/**
 * Generate a cryptographically secure random integer between min and max (inclusive)
 * @param min Minimum value (inclusive)
 * @param max Maximum value (inclusive)
 * @returns A secure random integer between min and max
 */
export function secureRandomInt(min: number, max: number): number {
  const range = max - min + 1;
  const randomValue = secureRandom();
  return Math.floor(randomValue * range) + min;
}

/**
 * Generate a cryptographically secure random float between min and max
 * @param min Minimum value (inclusive)
 * @param max Maximum value (inclusive)
 * @returns A secure random float between min and max
 */
export function secureRandomFloat(min: number, max: number): number {
  return secureRandom() * (max - min) + min;
}

/**
 * Generate a cryptographically secure random string
 * @param length Length of the string to generate
 * @returns A secure random string
 */
export function secureRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[secureRandomInt(0, chars.length - 1)];
  }
  return result;
}
