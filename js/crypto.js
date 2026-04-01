// ════════════════════════════════════════════
//  CRYPTO MODULE
//  AES-GCM token encryption + XOR obfuscation
// ════════════════════════════════════════════

const CRYPTO_KEY_STORE = 'bnb_enc_key';
const TOKEN_STORE      = 'bnb_github_token';
const HOST_TOKEN_STORE = 'bnb_host_publish_token';

// ── Key management ───────────────────────────

async function _getOrCreateKey() {
  try {
    const stored = localStorage.getItem(CRYPTO_KEY_STORE);
    if (stored) {
      const jwk = JSON.parse(stored);
      return await crypto.subtle.importKey('jwk', jwk, { name: 'AES-GCM' }, true, ['encrypt', 'decrypt']);
    }
  } catch (_) { /* generate fresh key */ }

  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  const jwk = await crypto.subtle.exportKey('jwk', key);
  localStorage.setItem(CRYPTO_KEY_STORE, JSON.stringify(jwk));
  return key;
}

// ── AES-GCM encrypt / decrypt ────────────────

async function encryptToken(plaintext) {
  if (!plaintext) return '';
  const key = await _getOrCreateKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plaintext));
  // Prepend IV to ciphertext, then Base64-encode the whole thing
  const combined = new Uint8Array(iv.byteLength + cipherBuf.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipherBuf), iv.byteLength);
  return btoa(String.fromCharCode(...combined));
}

async function decryptToken(ciphertext) {
  if (!ciphertext) return '';
  try {
    const key = await _getOrCreateKey();
    const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
    return new TextDecoder().decode(plainBuf);
  } catch (_) {
    return '';
  }
}

// ── WiFi password XOR obfuscation ────────────
// Simple XOR with a fixed key + Base64.  Not cryptographic, but prevents
// plain-text passwords being instantly readable in the source file.
// Values prefixed with _OBF_ are obfuscated; plain-text values are returned
// as-is to maintain backward compatibility with existing localStorage data.

const _XOR_KEY = 0x5A;
const _OBF_PREFIX = '_OBF_';

function obfuscate(str) {
  if (!str) return '';
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    bytes.push(str.charCodeAt(i) ^ _XOR_KEY);
  }
  return _OBF_PREFIX + btoa(String.fromCharCode(...bytes));
}

function deobfuscate(str) {
  if (!str) return '';
  if (!str.startsWith(_OBF_PREFIX)) return str; // plain-text (legacy or user-typed)
  try {
    const raw = atob(str.slice(_OBF_PREFIX.length));
    let s = '';
    for (let i = 0; i < raw.length; i++) {
      s += String.fromCharCode(raw.charCodeAt(i) ^ _XOR_KEY);
    }
    return s;
  } catch (_) {
    return str;
  }
}

// ── Hash obfuscation helpers (used by publishOnline) ──
// obfuscateHash expects a hex SHA-256 string and returns a Base64 string.
// deobfuscateHash reverses the process, returning the original hex string.

function obfuscateHash(hexHash) {
  return btoa(hexHash);
}

function deobfuscateHash(b64) {
  try { return atob(b64); } catch (_) { return b64; }
}
