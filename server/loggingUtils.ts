/**
 * Logging utilities for safe data handling
 * Prevents sensitive data and long strings from appearing in logs
 */

// Function to truncate sensitive data in logs
export function truncateSensitiveData(str: string, maxLength: number = 500): string {
  if (!str || typeof str !== 'string') {
    return String(str);
  }
  
  // Truncate very long strings
  if (str.length > maxLength) {
    return str.slice(0, Math.floor(maxLength * 0.4)) + "...[TRUNCATED]..." + str.slice(-Math.floor(maxLength * 0.2));
  }
  
  // Replace common sensitive patterns
  const sensitivePatterns = [
    // JWT tokens (starts with eyJ)
    { pattern: /eyJ[A-Za-z0-9_-]{100,}/g, replacement: '[JWT_TOKEN]' },
    // Long API keys
    { pattern: /[A-Za-z0-9]{32,}/g, replacement: '[API_KEY]' },
    // Long base64 strings
    { pattern: /[A-Za-z0-9+/]{50,}={0,2}/g, replacement: '[BASE64_DATA]' },
    // Email addresses
    { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, replacement: '[EMAIL]' },
    // Long URLs
    { pattern: /https?:\/\/[^\s]{50,}/g, replacement: '[URL]' },
    // Long hex strings
    { pattern: /[0-9a-fA-F]{40,}/g, replacement: '[HEX_DATA]' },
    // Long alphanumeric strings that might be tokens
    { pattern: /[A-Za-z0-9]{50,}/g, replacement: '[LONG_TOKEN]' }
  ];
  
  let result = str;
  for (const { pattern, replacement } of sensitivePatterns) {
    result = result.replace(pattern, replacement);
  }
  
  return result;
}

// Safe logging function that automatically truncates sensitive data
export function safeLog(message: string, data?: any): void {
  const truncatedMessage = truncateSensitiveData(message);
  if (data !== undefined) {
    const truncatedData = typeof data === 'string' 
      ? truncateSensitiveData(data)
      : truncateSensitiveData(JSON.stringify(data));
    console.log(truncatedMessage, truncatedData);
  } else {
    console.log(truncatedMessage);
  }
}

// Safe error logging
export function safeErrorLog(message: string, error?: any): void {
  const truncatedMessage = truncateSensitiveData(message);
  if (error) {
    const errorStr = error instanceof Error ? error.message : String(error);
    const truncatedError = truncateSensitiveData(errorStr);
    console.error(truncatedMessage, truncatedError);
  } else {
    console.error(truncatedMessage);
  }
}

// Safe warning logging
export function safeWarnLog(message: string, data?: any): void {
  const truncatedMessage = truncateSensitiveData(message);
  if (data !== undefined) {
    const truncatedData = typeof data === 'string' 
      ? truncateSensitiveData(data)
      : truncateSensitiveData(JSON.stringify(data));
    console.warn(truncatedMessage, truncatedData);
  } else {
    console.warn(truncatedMessage);
  }
}
