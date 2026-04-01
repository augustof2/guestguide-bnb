// ════════════════════════════════════════════
//  UTILS — Shared helper functions
// ════════════════════════════════════════════

// ── HTML escaping ────────────────────────────

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderRichText(text) {
  if (!text) return '';
  let s = escHtml(text);
  s = s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\n/g, '<br>');
  return s;
}

// ── PIN / credentials hashing ────────────────

async function hashPin(pin) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pin));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── UI feedback helpers ───────────────────────
// Single implementation replacing duplicate showErr/showOk definitions.

function showMsg(el, text, type) {
  if (!el) { alert((type === 'error' ? '❌ ' : '✅ ') + text); return; }
  el.style.color = type === 'error' ? 'var(--accent)' : 'var(--teal)';
  el.textContent = (type === 'error' ? '❌ ' : '✅ ') + text;
}

function showErr(el, text) { showMsg(el, text, 'error'); }
function showOk(el, text)  { showMsg(el, text, 'ok'); }
