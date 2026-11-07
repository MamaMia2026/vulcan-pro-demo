/* Vulcan Pro – machetă demo.
   „Deschis/Închis” din PROGRAM, banda sezonieră, tabelul de prețuri, programarea pe oră
   (preț + durată după serviciu, diametru, tip vehicul și extra-uri), asistentul de dimensiune,
   hotelul de anvelope și trimiterea prin Netlify Forms / WhatsApp.
   Test: ?acum=2026-11-08T10:00 simulează data și ora curentă. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var toMin = function (s) { var p = s.split(':'); return +p[0] * 60 + +p[1]; };
  var hhmm = function (m) { return pad(Math.floor(m / 60)) + ':' + pad(m % 60); };
  var lei = function (n) { return n === 0 ? 'gratuit' : n + ' lei'; };
  var ZILE = ['duminică', 'luni', 'marți', 'miercuri', 'joi', 'vineri', 'sâmbătă'];
  var ZILE_SC = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'];
  var LUNI = ['ian.', 'feb.', 'mar.', 'apr.', 'mai', 'iun.', 'iul.', 'aug.', 'sep.', 'oct.', 'nov.', 'dec.'];
  var DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- „acum”: ora din România sau parametrul de test ?acum=AAAA-LL-ZZTHH:MM ----------
  // Ora României fără Intl (Intl cu fus orar încarcă datele ICU și încetinește pagina pe mobil):
  // UTC+2, iar ora de vară UE (UTC+3) e între ultima duminică din martie și ultima din octombrie, la 01:00 UTC.
  function bucharestNow() {
    var now = Date.now(), y = new Date(now).getUTCFullYear();
    var lastSun = function (m) { var d = new Date(Date.UTC(y, m + 1, 0, 1)); d.setUTCDate(d.getUTCDate() - d.getUTCDay()); return d.getTime(); };
    var off = now >= lastSun(2) && now < lastSun(9) ? 3 : 2;
    var b = new Date(now + off * 3600000);
    return new Date(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate(), b.getUTCHours(), b.getUTCMinutes());
  }
  var testAcum = null;
  try { testAcum = new URLSearchParams(location.search).get('acum'); } catch (e) { /* fără parametru */ }
  var tm = testAcum && /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(testAcum);
  var ACUM = tm ? new Date(+tm[1], +tm[2] - 1, +tm[3], +tm[4], +tm[5]) : bucharestNow();
  var ACUM_MIN = ACUM.getHours() * 60 + ACUM.getMinutes();
  var addDays = function (d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); };
  if (tm) $('[data-test-note]').textContent = ' · test: acum = ' + ZILE[ACUM.getDay()] + ' ' + pad(ACUM.getDate()) + '.' + pad(ACUM.getMonth() + 1) + '.' + ACUM.getFullYear() + ' ' + hhmm(ACUM_MIN);

  function interval(date) {
    var p = PROGRAM[date.getDay()];
    return p ? { o: toMin(p[0]), c: toMin(p[1]), os: p[0], cs: p[1] } : null;
  }

  // ---------- Deschis / Închis ----------
  (function () {
    var iv = interval(ACUM), open = !!(iv && ACUM_MIN >= iv.o && ACUM_MIN < iv.c), text;
    if (open) text = 'Deschis · se închide la ' + iv.cs;
    else {
      for (var d = 0; d < 8; d++) {
        var x = addDays(ACUM, d), v = interval(x);
        if (!v || (d === 0 && ACUM_MIN >= v.o)) continue;
        text = 'Închis · deschidem ' + (d === 0 ? 'azi' : ZILE[x.getDay()]) + ' la ' + v.os; break;
      }
    }
    var el = $('[data-open-now]');
    el.classList.toggle('closed', !open);
    $('[data-open-text]').textContent = text || 'Închis';
  })();

  // ---------- program în pagină ----------
  (function () {
    var dl = $('[data-hours]'), openDays = 0;
    DAY_ORDER.forEach(function (d) {
      var p = PROGRAM[d], div = document.createElement('div');
      if (p) openDays++;
      if (d === ACUM.getDay()) div.className = 'today';
      div.innerHTML = '<dt>' + ZILE[d].charAt(0).toUpperCase() + ZILE[d].slice(1) + '</dt><dd>' + (p ? p[0] + '–' + p[1] : 'închis') + '</dd>';
      dl.appendChild(div);
    });
    $('[data-open-days]').textContent = 'Deschis ' + openDays + ' zile';
  })();

  // ---------- telefon, WhatsApp, valori din date ----------
  var waLink = function (text) { return 'https://wa.me/' + WHATSAPP_NUMBER + (text ? '?text=' + encodeURIComponent(text) : ''); };
  $$('[data-wa]').forEach(function (a) { a.href = waLink('Bună ziua! Am o întrebare pentru Vulcan Pro.'); });
  $$('[data-tel]').forEach(function (a) { a.href = 'tel:' + TELEFON.link; a.textContent = TELEFON.afisat; });
  $$('[data-tel-link]').forEach(function (a) { a.href = 'tel:' + TELEFON.link; });
  var row = function (r) { for (var i = 0; i < TARIFE.length; i++) if (TARIFE[i].r === r) return TARIFE[i]; return null; };
  var suvPrice = function (p) { return Math.round(p * (1 + SUV_PROCENT / 100) / 5) * 5; };
  var r16 = row(16);
  if (r16) $$('[data-r16-min]').forEach(function (e) { e.textContent = r16.min; });
  $$('[data-suv-pct]').forEach(function (e) { e.textContent = SUV_PROCENT; });
  $('[data-suv-sub]').textContent = '+' + SUV_PROCENT + '% · +' + SUV_MIN_EXTRA + ' min';
  $('[data-hotel-min]').textContent = Math.min.apply(null, TARIFE.map(function (t) { return t.hotel; }));
  $('[data-hotel-disc]').textContent = HOTEL.reducereAnProcent;
  $('[data-jante-extra]').textContent = '+' + HOTEL.cuJanteExtra + ' lei/sezon';
  var extraPrice = function (e) { return e.pretBuc ? e.pretBuc * e.buc : e.pret; };

  // ---------- banda sezonieră ----------
  (function () {
    var m = ACUM.getMonth(), t = null;
    if (m === 9 || m === 10) t = 'Sezonul de iarnă – programează-te din timp.';
    else if (m === 2 || m === 3) t = 'Sezonul de vară – programează-te din timp.';
    if (t) { $('[data-season-text]').textContent = t; $('[data-season]').hidden = false; }
  })();

  // ---------- tabel de prețuri + extra ----------
  (function () {
    var tb = $('[data-price-table]'), html = '';
    TARIFE.forEach(function (t) {
      html += '<tr><th scope="row">R' + t.r + (t.faraLevier ? '<em>fără levier</em>' : '') + '</th>' +
        '<td class="hl">' + t.schimb + '<small>lei</small></td>' +
        '<td>' + suvPrice(t.schimb) + '<small>lei</small></td>' +
        '<td>' + t.echilibrare + '<small>lei</small></td>' +
        '<td>' + t.min + '<small>min</small></td>' +
        '<td>' + t.hotel + '<small>lei</small></td></tr>';
    });
    tb.innerHTML = html;
    var fl = TARIFE.filter(function (t) { return t.faraLevier; });
    if (fl.length) $('[data-levier-note]').textContent = 'R' + fl[0].r + ' și peste: montaj fără levier, cu dispozitiv special pentru jante mari și anvelope cu profil jos – fără zgârieturi pe jantă. Durata la SUV / van: +' + SUV_MIN_EXTRA + ' min.';
    var tpms = EXTRA.filter(function (e) { return e.id === 'tpms'; })[0], valve = EXTRA.filter(function (e) { return e.id === 'valve'; })[0];
    var azot = EXTRA.filter(function (e) { return e.id === 'azot'; })[0], cur = EXTRA.filter(function (e) { return e.id === 'curatare'; })[0];
    var cards = [
      [SERVICII.pana.pret + ' lei', 'Reparație pană, o roată'],
      [valve.pretBuc + ' lei', 'Valvă nouă, bucata'],
      [lei(azot.pret), 'Azot și verificarea presiunii'],
      [tpms.pret + ' lei', 'Senzori TPMS, resetare'],
      [cur.pret + ' lei', 'Curățare jante, set de 4']
    ];
    $('[data-extra-cards]').innerHTML = cards.map(function (c) { return '<div><b>' + c[0] + '</b><span>' + c[1] + '</span></div>'; }).join('');
  })();

  // ---------- programarea (+ asistentul de dimensiune și hotelul, care o folosesc) ----------
  (function () {
    var form = $('[data-booking]');
    var st = { svc: 'schimb', veh: 'auto', r: 16, extra: {}, day: -1, slot: -1 };
    var days = [];
    for (var d = 0; d < ZILE_AFISATE; d++) days.push(addDays(ACUM, d));

    function calc() {
      var t = row(st.r), s = SERVICII[st.svc], suv = st.veh === 'suv';
      var base = s.coloana ? t[s.coloana] : s.pret;
      var dur = s.minute ? t[s.minute] : s.min;
      if (suv && s.suv) base = suvPrice(base);
      if (suv && st.svc !== 'pana') dur += SUV_MIN_EXTRA;
      var lines = [{ n: s.nume + ' R' + st.r + (suv && s.suv ? ' (SUV +' + SUV_PROCENT + '%)' : ''), p: base }];
      var total = base, names = [];
      EXTRA.forEach(function (e) {
        if (!st.extra[e.id]) return;
        var p = extraPrice(e);
        lines.push({ n: e.nume, p: p }); total += p; dur += e.min; names.push(e.nume);
      });
      return { dur: dur, total: total, lines: lines, extras: names };
    }

    // ocupări demonstrative deterministe: aceeași zi arată mereu aceleași sloturi ocupate
    function isBusy(date, i) {
      var x = (date.getFullYear() * 400 + (date.getMonth() + 1) * 32 + date.getDate()) * 31 + i * 7;
      x = Math.imul(x ^ (x >>> 15), 0x2c1b3c6d); x = Math.imul(x ^ (x >>> 12), 0x297a2d39); x ^= x >>> 15;
      return ((x >>> 0) % 100) < 30;
    }
    function slotsOf(di) {
      var iv = interval(days[di]), out = [];
      if (!iv) return out;
      for (var m = iv.o; m < iv.c; m += SLOT_MIN) out.push(m);
      return out;
    }
    // stare slot: free | busy | past | late (nu încape până la închidere)
    function slotState(di, i, dur) {
      var iv = interval(days[di]); if (!iv) return 'closed';
      var start = iv.o + i * SLOT_MIN, end = start + dur;
      if (di === 0 && start < ACUM_MIN + MARJA_AZI_MIN) return 'past';
      if (end > iv.c) return 'late';
      var last = Math.ceil((end - iv.o) / SLOT_MIN) - 1;
      for (var k = i; k <= last; k++) if (isBusy(days[di], k)) return 'busy';
      return 'free';
    }
    function dayFree(di, dur) {
      var n = slotsOf(di).length;
      for (var i = 0; i < n; i++) if (slotState(di, i, dur) === 'free') return true;
      return false;
    }

    var svcBox = $('[data-svcs]'), rimsBox = $('[data-rims]'), extBox = $('[data-extras]'), daysBox = $('[data-days]'), slotsBox = $('[data-slots]');
    Object.keys(SERVICII).forEach(function (k) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'opt'; b.setAttribute('data-svc', k);
      b.innerHTML = SERVICII[k].nume + '<small>' + SERVICII[k].sub + '</small>';
      svcBox.appendChild(b);
    });
    TARIFE.forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'opt' + (t.faraLevier ? ' flag' : ''); b.setAttribute('data-rim', t.r);
      b.textContent = 'R' + t.r;
      if (t.faraLevier) b.title = 'Montaj fără levier';
      rimsBox.appendChild(b);
    });
    EXTRA.forEach(function (e) {
      var l = document.createElement('label');
      l.className = 'ext-o';
      var p = extraPrice(e);
      l.innerHTML = '<input type="checkbox" data-ext="' + e.id + '"><span>' + e.nume + '<small>' + (p ? '+' + p + ' lei' : 'gratuit') + ' · +' + e.min + ' min</small></span>';
      extBox.appendChild(l);
    });
    days.forEach(function (date, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'opt'; b.setAttribute('data-day', i);
      b.innerHTML = '<small>' + (i === 0 ? 'Azi' : i === 1 ? 'Mâine' : ZILE_SC[date.getDay()]) + '</small><b>' + date.getDate() + '</b><small>' + LUNI[date.getMonth()] + '</small><span class="vh" data-day-st></span>';
      daysBox.appendChild(b);
    });

    var fmtDay = function (date) { return ZILE[date.getDay()] + ', ' + date.getDate() + ' ' + LUNI[date.getMonth()]; };
    var isoDay = function (date) { return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()); };

    function revalidate() {
      var c = calc();
      if (st.day < 0 || !dayFree(st.day, c.dur)) {
        st.day = -1; st.slot = -1;
        for (var i = 0; i < days.length; i++) if (dayFree(i, c.dur)) { st.day = i; break; }
      }
      if (st.slot >= 0 && slotState(st.day, st.slot, c.dur) !== 'free') st.slot = -1;
    }

    function render() {
      var c = calc();
      $$('[data-svc]', svcBox).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-svc') === st.svc)); });
      $$('[data-veh]', form).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-veh') === st.veh)); });
      $$('[data-rim]', rimsBox).forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-rim') === st.r)); });
      $$('[data-ext]', extBox).forEach(function (i) { var on = !!st.extra[i.getAttribute('data-ext')]; i.checked = on; i.parentNode.classList.toggle('on', on); });
      $$('[data-day]', daysBox).forEach(function (b) {
        var i = +b.getAttribute('data-day'), date = days[i], open = !!interval(date), free = open && dayFree(i, c.dur);
        b.disabled = !free;
        b.setAttribute('aria-pressed', String(i === st.day));
        var vs = ', ' + ZILE[date.getDay()] + (!open ? ', închis' : !free ? ', fără ore libere' : '');
        var sp = b.querySelector('[data-day-st]'); if (sp.textContent !== vs) sp.textContent = vs;
      });
      // nota pentru azi: deschis, dar serviciul nu mai încape până la închidere
      var note = $('[data-day-note]'), iv0 = interval(days[0]);
      if (iv0 && ACUM_MIN < iv0.c && !dayFree(0, c.dur)) {
        note.textContent = 'Azi nu mai încape un serviciu de ' + c.dur + ' min până la închidere (' + iv0.cs + '). Alegeți altă zi.';
        note.hidden = false;
      } else note.hidden = true;

      var slots = st.day >= 0 ? slotsOf(st.day) : [], html = '';
      slots.forEach(function (m, i) {
        var s = slotState(st.day, i, c.dur), lbl = hhmm(m);
        var why = s === 'busy' ? ', ocupat' : s === 'late' ? ', nu încape până la închidere' : s === 'past' ? ', trecut' : '';
        html += '<button class="opt' + (s === 'late' ? ' late' : '') + '" type="button" data-slot="' + i + '"' + (s !== 'free' ? ' disabled' : '') +
          ' aria-pressed="' + (i === st.slot) + '" aria-label="' + lbl + why + '">' + lbl + '</button>';
      });
      slotsBox.innerHTML = html || '<p class="day-note">Nu există ore libere în zilele afișate.</p>';

      var date = days[st.day], iv = date && interval(date);
      var start = st.slot >= 0 && iv ? iv.o + st.slot * SLOT_MIN : -1;
      var S = function (k, v) { $('[data-s="' + k + '"]').textContent = v; };
      S('svc', SERVICII[st.svc].nume);
      S('veh', st.veh === 'suv' ? 'SUV / van' : 'Autoturism');
      S('rim', 'R' + st.r + (row(st.r).faraLevier ? ' · fără levier' : ''));
      S('extra', c.extras.length ? c.extras.join(', ') : '—');
      S('day', date ? fmtDay(date) : '—');
      S('time', start >= 0 ? hhmm(start) + '–' + hhmm(start + c.dur) : 'alegeți ora');
      S('dur', c.dur + ' min');
      $('[data-s="lines"]').innerHTML = c.lines.length > 1 ? c.lines.map(function (l) { return '<li><span>' + l.n + '</span><span>' + lei(l.p) + '</span></li>'; }).join('') : '';
      $('[data-s="price"]').innerHTML = c.total + '<small>lei</small>';

      var H = function (k, v) { $('[data-h="' + k + '"]', form).value = v; };
      H('serviciu', SERVICII[st.svc].nume);
      H('diametru', 'R' + st.r);
      H('tip_vehicul', st.veh === 'suv' ? 'SUV / van' : 'autoturism');
      H('extra', c.extras.join(', ') || 'fără');
      H('ziua', date ? isoDay(date) + ' (' + ZILE[date.getDay()] + ')' : '');
      H('ora', start >= 0 ? hhmm(start) : '');
      H('durata', c.dur + ' min');
      H('total', c.total + ' lei');
    }

    function update() { revalidate(); render(); $('[data-msg]').textContent = ''; }

    form.addEventListener('click', function (e) {
      var b = e.target.closest('button.opt');
      if (!b || b.disabled) return;
      if (b.hasAttribute('data-svc')) st.svc = b.getAttribute('data-svc');
      else if (b.hasAttribute('data-veh')) st.veh = b.getAttribute('data-veh');
      else if (b.hasAttribute('data-rim')) st.r = +b.getAttribute('data-rim');
      else if (b.hasAttribute('data-day')) { st.day = +b.getAttribute('data-day'); st.slot = -1; }
      else if (b.hasAttribute('data-slot')) st.slot = +b.getAttribute('data-slot');
      var keep = b.getAttribute('data-slot') || b.getAttribute('data-day');
      update();
      // după re-randare, focusul rămâne pe același buton
      if (b.hasAttribute('data-slot')) { var nb = $('[data-slot="' + keep + '"]', slotsBox); if (nb) nb.focus(); }
    });
    extBox.addEventListener('change', function (e) {
      var id = e.target.getAttribute('data-ext'); if (!id) return;
      if (e.target.checked) st.extra[id] = true; else delete st.extra[id];
      update();
    });
    $$('[data-upper]').forEach(function (i) { i.addEventListener('input', function () { var p = i.selectionStart; i.value = i.value.toUpperCase(); try { i.setSelectionRange(p, p); } catch (e) { /* tel */ } }); });

    // telefon: minim 10 cifre (fără atribut pattern, ca să nu depindem de modul regex al browserului)
    function fieldOk(i) {
      var v = i.value.trim();
      if (!v) return false;
      if (i.hasAttribute('data-phone')) return /^[0-9 +().-]+$/.test(v) && v.replace(/\D/g, '').length >= 10;
      return true;
    }
    function checkBooking(needContact) {
      var msg = $('[data-msg]');
      if (st.slot < 0) {
        msg.textContent = 'Alegeți o oră liberă din pasul 5.';
        slotsBox.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        return false;
      }
      if (needContact) {
        var bad = null;
        $$('.fields input', form).forEach(function (i) { var ok = fieldOk(i); i.setAttribute('aria-invalid', String(!ok)); if (!ok && !bad) bad = i; });
        if (bad) { msg.textContent = 'Completați numele, telefonul (minim 10 cifre) și numărul de înmatriculare.'; bad.focus(); return false; }
      }
      return true;
    }
    function summaryPairs() {
      var c = calc(), date = days[st.day], iv = interval(date), start = iv.o + st.slot * SLOT_MIN;
      return [
        ['Serviciu', SERVICII[st.svc].nume],
        ['Mașina', st.veh === 'suv' ? 'SUV / van' : 'Autoturism'],
        ['Jantă', 'R' + st.r],
        ['Extra', c.extras.join(', ') || '—'],
        ['Ziua', fmtDay(date)],
        ['Ora', hhmm(start) + '–' + hhmm(start + c.dur)],
        ['Durată', c.dur + ' min'],
        ['Total', c.total + ' lei']
      ];
    }
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]; }); };
    function postForm(f) {
      return fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(f)).toString()
      }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!checkBooking(true)) return;
      var btn = $('button[type=submit]', form), pairs = summaryPairs();
      btn.disabled = true; btn.textContent = 'Se trimite…';
      postForm(form).then(function () {
        var th = $('[data-thanks]');
        $('[data-t-name]', th).textContent = form.elements.nume.value.trim().split(/\s+/)[0];
        $('[data-t-phone]', th).textContent = form.elements.telefon.value.trim();
        $('[data-t-sum]', th).innerHTML = pairs.concat([['Nr. înmatriculare', form.elements.numar_inmatriculare.value.trim()]])
          .map(function (p) { return '<dt>' + p[0] + '</dt><dd>' + esc(p[1]) + '</dd>'; }).join('');
        form.hidden = true; th.hidden = false; th.focus();
        th.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      }).catch(function () {
        $('[data-msg]').textContent = 'Nu am putut trimite programarea. Încercați din nou sau trimiteți-o pe WhatsApp.';
      }).then(function () { btn.disabled = false; btn.textContent = 'Programează-te'; });
    });
    $('[data-t-again]').addEventListener('click', function () {
      form.reset(); st.slot = -1; st.extra = {};
      $$('.fields input', form).forEach(function (i) { i.removeAttribute('aria-invalid'); });
      $('[data-thanks]').hidden = true; form.hidden = false; update();
      form.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
    $('[data-wa-booking]').addEventListener('click', function () {
      if (!checkBooking(false)) return;
      var lines = ['Bună ziua! Aș dori o programare la Vulcan Pro:'];
      summaryPairs().forEach(function (p) { lines.push(p[0] + ': ' + p[1]); });
      var n = form.elements.nume.value.trim(), t = form.elements.telefon.value.trim(), nr = form.elements.numar_inmatriculare.value.trim();
      if (n) lines.push('Nume: ' + n); if (t) lines.push('Telefon: ' + t); if (nr) lines.push('Nr. înmatriculare: ' + nr);
      window.open(waLink(lines.join('\n')), '_blank', 'noopener');
    });

    // ---------- asistent „Ce dimensiune am?” + formularul hotelului ----------
    function fillSelect(sel, values, prefix, def) {
      sel.innerHTML = values.map(function (v) { return '<option value="' + v + '"' + (v === def ? ' selected' : '') + '>' + (prefix || '') + v + '</option>'; }).join('');
    }
    var RS = TARIFE.map(function (t) { return t.r; }), A = ANVELOPE.implicit;
    [['w', ANVELOPE.latimi, '', A.latime], ['p', ANVELOPE.profile, '', A.profil], ['r', RS, 'R', A.r]].forEach(function (c) {
      fillSelect($('[data-sh-in="' + c[0] + '"]'), c[1], c[2], c[3]);
      fillSelect($('[data-hs="' + c[0] + '"]'), c[1], c[2], c[3]);
    });
    function sizeRender() {
      var w = $('[data-sh-in="w"]').value, p = $('[data-sh-in="p"]').value, r = $('[data-sh-in="r"]').value;
      $$('[data-sh-w]').forEach(function (e) { e.textContent = w; });
      $$('[data-sh-p]').forEach(function (e) { e.textContent = p; });
      $$('[data-sh-r]').forEach(function (e) { e.textContent = 'R' + r; });
    }
    $$('[data-sh-in]').forEach(function (s) { s.addEventListener('change', sizeRender); });
    $('[data-sh-use]').addEventListener('click', function () {
      st.r = +$('[data-sh-in="r"]').value;
      // aceeași dimensiune și la hotel
      ['w', 'p', 'r'].forEach(function (k) { $('[data-hs="' + k + '"]').value = $('[data-sh-in="' + k + '"]').value; });
      hotelRender();
      update();
      $('[data-sizehelp]').open = false;
      var b = $('[data-rim="' + st.r + '"]', rimsBox);
      if (b) { b.focus(); b.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' }); }
    });
    sizeRender();

    var hf = $('[data-hotel]');
    (function () {
      // sezonul curent: oct–mar = iarnă, apr–sep = vară
      var y = ACUM.getFullYear(), m = ACUM.getMonth(), opts;
      if (m >= 9) opts = ['Iarnă ' + y + '–' + (y + 1), 'Vară ' + (y + 1)];
      else if (m <= 2) opts = ['Iarnă ' + (y - 1) + '–' + y, 'Vară ' + y];
      else opts = ['Vară ' + y, 'Iarnă ' + y + '–' + (y + 1)];
      $('[data-hotel-season]').innerHTML = opts.map(function (o, i) { return '<option value="' + o + '"' + (i === 0 ? ' selected' : '') + '>' + o + (i === 0 ? ' (sezonul curent)' : '') + '</option>'; }).join('');
    })();
    function hotelCalc() {
      var r = +$('[data-hs="r"]').value, t = row(r), cuJante = hf.elements.jante.value === 'cu jante';
      var sezon = t.hotel + (cuJante ? HOTEL.cuJanteExtra : 0);
      var anFull = sezon * 2, an = Math.round(anFull * (1 - HOTEL.reducereAnProcent / 100));
      var peAn = hf.elements.plata.value === 'pe an';
      return { r: r, cuJante: cuJante, sezon: sezon, anFull: anFull, an: an, total: peAn ? an : sezon, peAn: peAn,
        dim: $('[data-hs="w"]').value + '/' + $('[data-hs="p"]').value + ' R' + r };
    }
    function hotelRender() {
      var h = hotelCalc();
      $('[data-hc="sezon"]').textContent = h.sezon + ' lei';
      $('[data-hc="an"]').textContent = h.an + ' lei';
      $('[data-hc="an-note"]').textContent = '2 × ' + h.sezon + ' = ' + h.anFull + ' lei, −' + HOTEL.reducereAnProcent + '% la plata pe un an (economisiți ' + (h.anFull - h.an) + ' lei)';
      $('[data-hc="total"]').textContent = h.total + ' lei';
      var H = function (k, v) { $('[data-hh="' + k + '"]', hf).value = v; };
      H('dimensiune', h.dim + (h.cuJante ? ', cu jante' : ', fără jante'));
      H('pret_sezon', h.sezon + ' lei');
      H('pret_an', h.an + ' lei (2 sezoane, −' + HOTEL.reducereAnProcent + '%)');
      H('total', h.total + ' lei (' + (h.peAn ? 'pe an' : 'pe sezon') + ')');
    }
    hf.addEventListener('change', hotelRender);
    hotelRender();
    hf.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = $('[data-hmsg]'), bad = null;
      $$('input[required]', hf).forEach(function (i) { var ok = fieldOk(i); i.setAttribute('aria-invalid', String(!ok)); if (!ok && !bad) bad = i; });
      if (bad) { msg.textContent = 'Completați numele, telefonul (minim 10 cifre) și numărul de înmatriculare.'; bad.focus(); return; }
      msg.textContent = '';
      var h = hotelCalc(), btn = $('button[type=submit]', hf);
      btn.disabled = true; btn.textContent = 'Se trimite…';
      postForm(hf).then(function () {
        $('[data-ht-text]').textContent = 'Am primit înscrierea pentru ' + h.dim + (h.cuJante ? ' cu jante' : ' fără jante') + ', ' + hf.elements.sezon.value +
          ' – ' + h.total + ' lei ' + (h.peAn ? 'pe an (2 sezoane)' : 'pe sezon') + '. Vă sunăm pentru o oră de predare.';
        hf.hidden = true; var th = $('[data-hthanks]'); th.hidden = false; th.focus();
      }).catch(function () {
        msg.textContent = 'Nu am putut trimite înscrierea. Încercați din nou sau scrieți-ne pe WhatsApp.';
      }).then(function () { btn.disabled = false; btn.textContent = 'Trimite înscrierea'; });
    });
    $('[data-ht-again]').addEventListener('click', function () { hf.reset(); hf.hidden = false; $('[data-hthanks]').hidden = true; hotelRender(); });

    update();
  })();

  // ---------- video în erou: doar pe ecrane late, după încărcarea paginii ----------
  window.addEventListener('load', function () {
    var v = $('[data-hero-video]');
    var conn = navigator.connection || {};
    if (!v || reduceMotion || conn.saveData || !matchMedia('(min-width: 981px)').matches) return;
    setTimeout(function () {
      $$('source', v).forEach(function (s) { s.src = s.getAttribute('data-src'); });
      v.load();
      v.addEventListener('playing', function () { v.classList.add('on'); }, { once: true });
      var p = v.play(); if (p && p.catch) p.catch(function () { /* autoplay blocat: rămâne posterul */ });
    }, 600);
  });
})();
