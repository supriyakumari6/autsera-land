/**
 * escape.js — makes user-supplied text safe to put inside innerHTML
 * Usage: `<span>${esc(user.name)}</span>`
 */
function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));
}
