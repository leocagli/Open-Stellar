/**
 * Shared utility functions for response handling
 */

/**
 * Transform error messages from the gateway to be more user-friendly.
 * 
 * @param message - The error message from the gateway
 * @param host - The host to include in transformed messages
 * @returns The transformed error message
 */
export function transformErrorMessage(message: string, host: string): string {
  if (message.includes('gateway token missing') || message.includes('gateway token mismatch')) {
    return `Invalid or missing token. Visit https://${host}?token={REPLACE_WITH_YOUR_TOKEN}`;
  }
  
  if (message.includes('pairing required')) {
    return `Pairing required. Visit https://${host}/_admin/`;
  }
  
  return message;
}
