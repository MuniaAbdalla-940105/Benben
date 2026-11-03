/*
 * Prototype helpers (not product code).
 * 1. [data-pair] figures are cloned into a dark-theme copy placed right after the light one,
 *    so every main frame is shown light and dark side by side. ids are suffixed in the clone.
 * 2. A controls bar toggles: theme of the state cards, simulated reduced motion, Arabic-Indic digits.
 */
(function () {
  function suffixIds(root) {
    root.querySelectorAll('[id]').forEach(function (el) { el.id = el.id + '-dark'; });
    ['aria-labelledby', 'aria-describedby', 'for', 'aria-controls'].forEach(function (attr) {
      root.querySelectorAll('[' + attr + ']').forEach(function (el) {
        el.setAttribute(attr, el.getAttribute(attr).split(' ').map(function (x) { return x + '-dark'; }).join(' '));
      });
    });
    root.querySelectorAll('input[name]').forEach(function (el) { el.name = el.name + '-dark'; });
  }
  function pairThemes() {
    document.querySelectorAll('[data-pair]').forEach(function (fig) {
      var clone = fig.cloneNode(true);
      clone.removeAttribute('data-pair');
      clone.querySelectorAll('[data-theme="light"]').forEach(function (el) { el.setAttribute('data-theme', 'dark'); });
      if (clone.getAttribute('data-theme') === 'light') clone.setAttribute('data-theme', 'dark');
      var cap = clone.querySelector('.proto-cap .theme-name');
      if (cap) cap.textContent = 'Dark';
      suffixIds(clone);
      fig.parentNode.insertBefore(clone, fig.nextSibling);
    });
  }
  var AR = { '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤', '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩', ',': '٬', '.': '٫' };
  var LAT = {}; Object.keys(AR).forEach(function (k) { LAT[AR[k]] = k; });
  function mapDigits(map) {
    document.querySelectorAll('[lang="ar"] .ds-num, [lang="ar"] .c-timer__value, [lang="ar"] .c-money dd, [lang="ar"] .c-otp > span').forEach(function (el) {
      var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      var n; while ((n = walker.nextNode())) { n.nodeValue = n.nodeValue.replace(/[0-9,.٠-٩٬٫]/g, function (c) { return map[c] || c; }); }
    });
  }
  function controls() {
    var bar = document.createElement('div');
    bar.className = 'proto-controls';
    bar.innerHTML = '<div><a href="./index.html">All screens</a><span class="sp"></span>' +
      '<span>State cards:</span><button type="button" data-ctl="theme" aria-pressed="false">Dark</button>' +
      '<button type="button" data-ctl="motion" aria-pressed="false">Reduced motion</button>' +
      '<button type="button" data-ctl="digits" aria-pressed="false">Arabic-Indic digits</button></div>';
    document.body.insertBefore(bar, document.body.firstChild);
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', String(on));
      var ctl = b.getAttribute('data-ctl');
      if (ctl === 'theme') document.querySelectorAll('[data-states]').forEach(function (s) { s.setAttribute('data-theme', on ? 'dark' : 'light'); });
      if (ctl === 'motion') { if (on) document.body.setAttribute('data-motion', 'reduced'); else document.body.removeAttribute('data-motion'); }
      if (ctl === 'digits') mapDigits(on ? AR : LAT);
    });
  }
  document.addEventListener('DOMContentLoaded', function () { pairThemes(); controls(); });
})();
