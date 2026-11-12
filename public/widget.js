/*!
 * Kamila chat widget. Drop on any website:
 *   <script src="https://YOUR-KAMILA-HOST/widget.js" data-key="wpk_..." defer></script>
 * Options (data-*): key (required), api (defaults to this script's origin),
 * position ("right" | "left"), open ("true" to start open).
 * The page's origin must be listed under the project's Allowed origins.
 */
(function () {
  'use strict';
  var script = document.currentScript || document.querySelector('script[src*="widget.js"][data-key]');
  if (!script || window.__kamilaWidget) return;
  window.__kamilaWidget = true;

  var KEY = script.getAttribute('data-key') || '';
  var API = (script.getAttribute('data-api') || new URL(script.src).origin).replace(/\/+$/, '');
  var LEFT = script.getAttribute('data-position') === 'left';
  var START_OPEN = script.getAttribute('data-open') === 'true';
  var STORE = 'kamila_widget_' + KEY.slice(4, 16);

  function load() { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { return {}; } }
  function save(s) { try { localStorage.setItem(STORE, JSON.stringify(s)); } catch (e) { /* private mode */ } }
  var state = load();
  if (!state.visitor) {
    var a = new Uint8Array(16);
    (window.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : a.forEach(function (_, i) { a[i] = Math.random() * 256; });
    state.visitor = Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  }
  state.messages = Array.isArray(state.messages) ? state.messages.slice(-40) : [];

  var host = document.createElement('div');
  host.style.cssText = 'position:fixed;z-index:2147483000;bottom:20px;' + (LEFT ? 'left' : 'right') + ':20px';
  var root = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;

  root.innerHTML = '<style>' +
    ':host{all:initial}*{box-sizing:border-box;margin:0;padding:0;font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +
    '.k-btn{width:56px;height:56px;border-radius:50%;border:0;cursor:pointer;background:var(--k);color:#fff;display:grid;place-items:center;box-shadow:0 8px 24px rgba(0,0,0,.25);transition:transform .15s}' +
    '.k-btn:hover{transform:scale(1.05)}.k-btn svg{width:26px;height:26px}' +
    '.k-panel{position:absolute;bottom:72px;' + (LEFT ? 'left' : 'right') + ':0;width:370px;max-width:calc(100vw - 32px);height:560px;max-height:calc(100vh - 110px);background:#fff;color:#171717;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.25),0 0 0 1px rgba(0,0,0,.06);display:none;flex-direction:column;overflow:hidden}' +
    '.k-panel.open{display:flex;animation:k-in .18s ease-out}@keyframes k-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}' +
    '.k-head{background:var(--k);color:#fff;padding:16px 18px;display:flex;align-items:center;gap:10px}' +
    '.k-av{width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.2);display:grid;place-items:center;font-weight:700}' +
    '.k-title{font-weight:600;font-size:15px;line-height:1.2}.k-sub{font-size:12px;opacity:.8}' +
    '.k-x{margin-left:auto;background:none;border:0;color:#fff;cursor:pointer;font-size:20px;opacity:.8;width:32px;height:32px;border-radius:8px}.k-x:hover{opacity:1;background:rgba(255,255,255,.15)}' +
    '.k-body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:8px;background:#fafafa}' +
    '.k-msg{max-width:82%;padding:9px 13px;border-radius:14px;font-size:14px;line-height:1.45;white-space:pre-wrap;word-wrap:break-word}' +
    '.k-bot{background:#fff;border:1px solid #ececec;align-self:flex-start;border-bottom-left-radius:4px}' +
    '.k-me{background:var(--k);color:#fff;align-self:flex-end;border-bottom-right-radius:4px}' +
    '.k-err{background:#fff1f1;color:#b42318;border:1px solid #fecdca;align-self:center;font-size:13px}' +
    '.k-typing{display:flex;gap:4px;padding:12px 14px}.k-typing i{width:6px;height:6px;border-radius:50%;background:#999;animation:k-b 1s infinite}' +
    '.k-typing i:nth-child(2){animation-delay:.15s}.k-typing i:nth-child(3){animation-delay:.3s}@keyframes k-b{0%,100%{opacity:.3}50%{opacity:1}}' +
    '.k-form{display:flex;gap:8px;padding:12px;border-top:1px solid #eee;background:#fff}' +
    '.k-in{flex:1;border:1px solid #e5e5e5;border-radius:10px;padding:10px 12px;font-size:14px;outline:none;color:#171717;background:#fff}.k-in:focus{border-color:var(--k)}' +
    '.k-send{border:0;border-radius:10px;background:var(--k);color:#fff;padding:0 14px;font-size:14px;font-weight:600;cursor:pointer}.k-send:disabled{opacity:.5;cursor:default}' +
    '.k-foot{text-align:center;font-size:11px;color:#999;padding:0 0 8px;background:#fff}' +
    '@media (max-width:480px){.k-panel{position:fixed;inset:0;width:auto;max-width:none;height:auto;max-height:none;border-radius:0;bottom:0}}' +
    '</style>' +
    '<div class="k-panel" role="dialog" aria-label="Chat"><div class="k-head"><div class="k-av" aria-hidden="true"></div><div><div class="k-title"></div><div class="k-sub">Typically replies instantly</div></div>' +
    '<button class="k-x" aria-label="Close chat">×</button></div><div class="k-body" aria-live="polite"></div>' +
    '<form class="k-form"><input class="k-in" placeholder="Type your message…" maxlength="1000" aria-label="Message"><button class="k-send" type="submit">Send</button></form>' +
    '<div class="k-foot">Powered by Kamila</div></div>' +
    '<button class="k-btn" aria-label="Open chat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></button>';

  var $ = function (s) { return root.querySelector(s); };
  var panel = $('.k-panel'), body = $('.k-body'), input = $('.k-in'), send = $('.k-send');
  var config = null;

  function render() {
    body.innerHTML = '';
    var list = state.messages.length ? state.messages : (config ? [{ r: 'bot', t: config.greeting }] : []);
    list.forEach(function (m) { add(m.r, m.t, true); });
  }
  function add(role, text, silent) {
    var el = document.createElement('div');
    el.className = 'k-msg ' + (role === 'me' ? 'k-me' : role === 'err' ? 'k-err' : 'k-bot');
    el.textContent = text;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    if (!silent && role !== 'err') { state.messages.push({ r: role, t: text }); state.messages = state.messages.slice(-40); save(state); }
  }
  function toggle(open) {
    panel.classList.toggle('open', open);
    if (open) { render(); setTimeout(function () { input.focus(); }, 50); }
  }

  fetch(API + '/v1/widget/config?key=' + encodeURIComponent(KEY))
    .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || 'Chat unavailable'); return j; }); })
    .then(function (c) {
      config = c;
      host.style.setProperty('--k', c.color || '#111');
      $('.k-title').textContent = c.title;
      $('.k-av').textContent = (c.title || 'K').trim().charAt(0).toUpperCase();
      document.body.appendChild(host);
      if (START_OPEN) toggle(true);
    })
    .catch(function (e) { if (window.console) console.warn('[Kamila widget]', e.message || e); });

  $('.k-btn').onclick = function () { toggle(!panel.classList.contains('open')); };
  $('.k-x').onclick = function () { toggle(false); };
  $('.k-form').onsubmit = function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text || send.disabled) return;
    if (!state.messages.length && config) state.messages.push({ r: 'bot', t: config.greeting });
    add('me', text);
    input.value = '';
    send.disabled = true;
    var typing = document.createElement('div');
    typing.className = 'k-msg k-bot k-typing';
    typing.innerHTML = '<i></i><i></i><i></i>';
    body.appendChild(typing);
    body.scrollTop = body.scrollHeight;
    // text/plain keeps this a "simple" CORS request (no preflight).
    fetch(API + '/v1/widget/chat', { method: 'POST', body: JSON.stringify({ key: KEY, visitor: state.visitor, message: text }) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw new Error(j.error || 'Something went wrong'); return j; }); })
      .then(function (j) { typing.remove(); add('bot', j.reply || "Sorry, I don't have an answer for that."); })
      .catch(function (err) { typing.remove(); add('err', err.message || 'Could not send. Please try again.'); })
      .then(function () { send.disabled = false; input.focus(); });
  };
})();
