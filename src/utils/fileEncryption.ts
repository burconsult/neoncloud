/**
 * File encryption/decryption utilities using Web Crypto API
 * Provides real browser-based encryption for game files
 */

/**
 * Encrypt text content using AES-GCM (browser native encryption)
 */
export async function encryptContent(
  plaintext: string,
  password: string
): Promise<string> {
  try {
    // Generate a random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96 bits for GCM

    // Import password as key using PBKDF2
    const encoder = new TextEncoder();
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    // Derive AES-GCM key from password
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );

    // Encrypt the content
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encoder.encode(plaintext)
    );

    // Combine salt + iv + encrypted data and convert to base64
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);

    // Return as base64 string
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    // Fallback: return simple obfuscated text if encryption fails
    return obfuscateText(plaintext);
  }
}

/**
 * Decrypt content using AES-GCM
 */
export async function decryptContent(
  encryptedBase64: string,
  password: string
): Promise<string | null> {
  try {
    // Decode base64
    const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));

    // Extract salt, IV, and encrypted data
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encrypted = combined.slice(28);

    // Import password as key
    const encoder = new TextEncoder();
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    // Derive AES-GCM key from password
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    // Decrypt the content
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encrypted
    );

    // Convert decrypted bytes to string
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    // Decryption failed (wrong password or corrupted data)
    return null;
  }
}

/**
 * Generate realistic-looking encrypted gibberish
 * Used as fallback or for displaying encrypted files
 */
export function generateEncryptedGibberish(length: number = 200): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#$@%&!*^()_+-={}[]|~';
  const random = new Uint8Array(length);
  crypto.getRandomValues(random);
  
  return Array.from(random, byte => chars[byte % chars.length]).join('');
}

/**
 * Simple obfuscation fallback (for environments without crypto support)
 */
function obfuscateText(text: string): string {
  // Simple XOR obfuscation as fallback
  const key = 0x42;
  return Array.from(text)
    .map(char => String.fromCharCode(char.charCodeAt(0) ^ key))
    .join('');
}

/**
 * Check if a string looks like encrypted content (base64 + length check)
 */
export function isEncryptedContent(content: string): boolean {
  // Encrypted content will be base64 encoded
  // Check for base64 pattern and reasonable length
  const base64Pattern = /^[A-Za-z0-9+/=]+$/;
  return base64Pattern.test(content) && content.length > 50;
}

