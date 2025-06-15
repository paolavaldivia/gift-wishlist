import { error } from '@sveltejs/kit';

/**
 * Handles common API errors with consistent error responses
 * @param err The caught error
 * @param defaultMessage Default error message if not a known error
 * @param logPrefix Optional prefix for error logging
 */
export function handleApiError(err: unknown, defaultMessage: string, logPrefix = ''): never {
  // Check for known error types with status
  if (err && typeof err === 'object' && 'status' in err) {
    // Pass through 400 and 404 errors
    if (err.status === 400 || err.status === 404) {
      throw err;
    }
  }
  
  // Log the error with optional prefix
  console.error(logPrefix ? `${logPrefix}:` : '', err);
  
  // Return a generic 500 error
  throw error(500, defaultMessage);
}