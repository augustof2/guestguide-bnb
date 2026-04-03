// Crypto module: AES-GCM token/wifi encryption + XOR hash obfuscation

const CRYPTO_KEY_STORE    = 'bnb_enc_key';
const CRYPTO_IDB_DB       = 'bnb_crypto';
const CRYPTO_IDB_STORE    = 'keys';
const CRYPTO_IDB_KEY_NAME = 'aes_gcm_key';
const HOST_TOKEN_STORE = 'bnb_host_publish_token';

// ── Key management ───────────────────────────
// Keys are stored in IndexedDB as non-extractable CryptoKey objects.
// Falls back to localStorage (extractable JWK) when IndexedDB is unavailable
// (e.g. private browsing on some browsers) or during migration from older versions.

function _openKeyDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(CRYPTO_IDB_DB, 1);
    req.onupgradeneeded = e => e.target.result.createObjectStore(CRYPTO_IDB_STORE);
    req.onsuccess = e => resolve(e.target.result);
    req.onerror   = e => reject(e.target.error);
  });
}

async function _loadKeyFromIdb() {
  try {
    const db = await _openKeyDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(CRYPTO_IDB_STORE, 'readonly');
      const req = tx.objectStore(CRYPTO_IDB_STORE).get(CRYPTO_IDB_KEY_NAME);
      req.onsuccess = e => resolve(e.target.result || null);
      req.onerror   = e => reject(e.target.error);
    });
  } catch (_) {
    return null;
  }
}

async function _saveKeyToIdb(key) {
  const db = await _openKeyDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CRYPTO_IDB_STORE, 'readwrite');
    const req = tx.objectStore(CRYPTO_IDB_STORE).put(key, CRYPTO_IDB_KEY_NAME);
    req.onsuccess = () => resolve();
    req.onerror   = e => reject(e.target.error);
  });
}

async function _getOrCreateKey() {
  // 1. Try IndexedDB (non-extractable key — safest option)
  try {
    const idbKey = await _loadKeyFromIdb();
    if (idbKey) return idbKey;
  } catch (_) {
    /* fall through */
  }

  // 2. Try to migrate existing JWK from localStorage → IndexedDB
  try {
    const stored = localStorage.getItem(CRYPTO_KEY_STORE);
    if (stored) {
      const jwk = JSON.parse(stored);
      // Re-import as non-extractable so it cannot be exported again
      const migratedKey = await crypto.subtle.importKey(
        'jwk', jwk, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']
      );
      try {
        await _saveKeyToIdb(migratedKey);
        localStorage.removeItem(CRYPTO_KEY_STORE); // clean up extractable copy
      } catch (_) {
        /* IDB not available — keep localStorage copy for now */
      }
      return migratedKey;
    }
  } catch (_) {
    /* generate fresh key */
  }

  // 3. Generate a new non-extractable key
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
  );

  // 4. Persist: prefer IndexedDB; fall back to localStorage (extractable JWK)
  try {
    await _saveKeyToIdb(key);
  } catch (_) {
    // IndexedDB unavailable (e.g. private mode) — fall back to exportable localStorage
    const fallbackKey = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']
    );
    const jwk = await crypto.subtle.exportKey('jwk', fallbackKey);
    localStorage.setItem(CRYPTO_KEY_STORE, JSON.stringify(jwk));
    return fallbackKey;
  }
  return key;
}

// ── AES-GCM encrypt / decrypt ────────────────

async function _aesEncrypt(plaintext) {
  const key = await _getOrCreateKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipherBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, key, new TextEncoder().encode(plaintext)
  );
  const combined = new Uint8Array(iv.byteLength + cipherBuf.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipherBuf), iv.byteLength);
  return btoa(String.fromCharCode(...combined));
}

async function _aesDecrypt(b64) {
  const key = await _getOrCreateKey();
  const combined = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  return new TextDecoder().decode(plainBuf);
}

async function encryptToken(plaintext) {
  if (!plaintext) return '';
  return _aesEncrypt(plaintext);
}

async function decryptToken(ciphertext) {
  if (!ciphertext) return '';
  try {
    return await _aesDecrypt(ciphertext);
  } catch (err) {
    console.warn('[crypto] Token decryption failed:', err);
    return '';
  }
}

// ── WiFi password AES-GCM encryption ─────────
// WiFi passwords are encrypted with AES-GCM (same key as tokens) and stored
// with the prefix _AESGCM_. Existing _OBF_ (XOR) values are automatically
// migrated to AES-GCM on first boot via migrateWifiPasswords() in app.js.

const _WIFI_AES_PREFIX = '_AESGCM_';

async function encryptWifi(plaintext) {
  if (!plaintext) return '';
  return _WIFI_AES_PREFIX + await _aesEncrypt(plaintext);
}

async function decryptWifi(ciphertext) {
  if (!ciphertext) return '';
  // Handle legacy XOR-obfuscated values (migrated to AES-GCM on first boot)
  if (ciphertext.startsWith(_OBF_PREFIX)) return deobfuscate(ciphertext);
  if (!ciphertext.startsWith(_WIFI_AES_PREFIX)) return ciphertext; // plain-text fallback
  try {
    return await _aesDecrypt(ciphertext.slice(_WIFI_AES_PREFIX.length));
  } catch (err) {
    console.warn('[wifi] AES-GCM decryption failed:', err);
    return '';
  }
}

// XOR obfuscation (legacy — kept for backward-compatible migration of existing data)

const _XOR_KEY = 0x5A;
const _OBF_PREFIX = '_OBF_';

function _xorBase64Decode(b64) {
  const raw = atob(b64);
  let s = '';
  for (let i = 0; i < raw.length; i++) {
    s += String.fromCharCode(raw.charCodeAt(i) ^ _XOR_KEY);
  }
  return s;
}

function deobfuscate(str) {
  if (!str) return '';
  if (!str.startsWith(_OBF_PREFIX)) return str; // plain-text (legacy or user-typed)
  try {
    return _xorBase64Decode(str.slice(_OBF_PREFIX.length));
  } catch (_) {
    console.warn('[crypto] XOR deobfuscation failed:', _);
    return str;
  }
}

// ── Hash obfuscation helpers (used by publishOnline) ──
// obfuscateHash expects a hex SHA-256 string and returns a Base64 string.
// deobfuscateHash reverses the process, returning the original hex string.

function obfuscateHash(hexHash) {
  if (!hexHash) return '';
  const bytes = [];
  for (let i = 0; i < hexHash.length; i++) {
    bytes.push(hexHash.charCodeAt(i) ^ _XOR_KEY);
  }
  return btoa(String.fromCharCode(...bytes));
}

function deobfuscateHash(b64) {
  try {
    return _xorBase64Decode(b64);
  } catch (_) {
    console.warn('[crypto] Hash deobfuscation failed:', _);
    return b64;
  }
}
