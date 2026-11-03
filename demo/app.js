/* BEN-BEN demo POC. Throwaway: no backend, state in memory + localStorage. */
(function () {
  'use strict';
  const KEY = 'bb-demo-v1';
  const fresh = () => ({
    lang: 'ar', theme: 'auto', auth: false, phone: '',
    kyc: 'none', idDocs: {}, bal: 0, locked: 0, tx: [], saved: [], joined: {}, results: {}, checklist: {},
    listingStatus: { l8: 'pending' }, userListings: [], adminIds: {}, interest: [], reminders: [],
    reqs: [{ id: 'q1', area: 'nc', type: 'apt', max: E(7000000), beds: 3 }], rentReqs: []
  });
  let S;
  try { S = Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { S = fresh(); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } };
  const ui = { ex: { area: 'all', max: 0, saved: false }, au: 'live', rq: 'buyer', ad: 'ids', rooms: {}, timer: null, otp: '123456', pick: 0 };

  /* ---------- i18n + formatting ---------- */
  const ar = () => S.lang === 'ar';
  const T = (a, e) => (ar() ? a : e);
  const X = (o) => o[S.lang];
  const nf = (x, o) => new Intl.NumberFormat(ar() ? 'ar-EG-u-nu-arab' : 'en-US', o).format(x);
  const D = (s) => (ar() ? String(s).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]) : String(s));
  const egp = (p) => { const n = p / 100; const s = nf(n, { maximumFractionDigits: 2 }); return `<bdi class="num">${ar() ? s + ' ج.م' : 'EGP ' + s}</bdi>`; };
  const egpT = (p) => egp(p).replace(/<[^>]+>/g, '');
  const mmss = (s) => D(String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'));
  const $ = (id) => document.getElementById(id);
  const addTx = (kind, amt, note) => { S.tx.unshift({ kind, amt, note, ts: Date.now() }); };
  const fmtTime = (ts) => new Date(ts).toLocaleTimeString(ar() ? 'ar-EG-u-nu-arab' : 'en-GB', { hour: '2-digit', minute: '2-digit' });

  /* ---------- helpers ---------- */
  const ICON = {
    auctions: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>',
    explore: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    rent: '<path d="M3 11l9-8 9 8v10H3z"/><path d="M10 21v-6h4v6"/>',
    requests: '<path d="M4 6h16M4 12h16M4 18h10"/>',
    profile: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>'
  };
  const svg = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICON[k]}</svg>`;
  const pic = '<svg class="pic" viewBox="0 0 100 60" preserveAspectRatio="xMidYMax slice"><path d="M6 60V28h16v32M26 60V10h22v50M52 60V32h14v28M70 60V18h12v42M86 60V34h10v26" fill="#fff"/></svg>';
  const img = (g, inner, tall) => `<div class="img${tall ? ' tall' : ''}" style="background:${GRAD[g % GRAD.length]}">${pic}${inner || ''}</div>`;
  const listingsVisible = () => LISTINGS.filter((l) => (S.listingStatus[l.id] || l.status) === 'approved').concat(S.userListings.filter((l) => l.status === 'approved'));
  const findListing = (id) => LISTINGS.concat(S.userListings).find((l) => l.id === id);
  const toast = (m) => { $('toast').innerHTML = `<div>${m}</div>`; clearTimeout(toast.t); toast.t = setTimeout(() => ($('toast').innerHTML = ''), 2300); };
  const go = (h) => { location.hash = h; };
  const sheet = (html) => { closeSheet(); const d = document.createElement('div'); d.className = 'scrim'; d.id = 'scrim'; d.innerHTML = `<div class="sheet">${html}</div>`; $('phone').appendChild(d); };
  const closeSheet = () => { const s = $('scrim'); if (s) s.remove(); };
  const kycBadge = () => ({ none: `<span class="badge">${T('غير موثّق', 'Not verified')}</span>`, pending: `<span class="badge warn">${T('قيد المراجعة', 'Pending review')}</span>`, approved: `<span class="badge ok">${T('موثّق · المستوى T1', 'Verified · Tier T1')}</span>` }[S.kyc] || '');
  const back = (h) => ({ back: h });


  /* ---------- property detail helpers: gallery, facts, map, agent ---------- */
  const ACC = ['#A27E3E', '#3b4a73', '#6B675F', '#846429', '#5a6fa8', '#22305A'];
  const seed = (x) => x.id.split('').reduce((t, c) => t + c.charCodeAt(0), 0);
  const SCENE_NAMES = [B('الواجهة', 'Exterior'), B('غرفة المعيشة', 'Living room'), B('غرفة النوم', 'Bedroom'), B('المطبخ', 'Kitchen'), B('المسقط الأفقي', 'Floor plan'), B('جولة فيديو', 'Video tour')];
  function scene(i, c) {
    const win = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#cfe3f2" stroke="#fff" stroke-width="2"/>`;
    const v = [
      `<rect width="300" height="225" fill="#cfe3f2"/><rect y="170" width="300" height="55" fill="#7aa36b"/><rect x="60" y="50" width="130" height="125" fill="#f1e9d8"/><rect x="60" y="50" width="130" height="14" fill="${c}"/>${[0, 1, 2].map((r) => [0, 1, 2].map((k) => win(72 + k * 38, 74 + r * 32, 26, 22)).join('')).join('')}<rect x="118" y="140" width="22" height="35" fill="${c}"/><rect x="200" y="80" width="70" height="95" fill="#e4dac4"/>${win(212, 94, 20, 16)}${win(240, 94, 20, 16)}<circle cx="30" cy="140" r="26" fill="#4f8a58"/><rect x="27" y="150" width="6" height="25" fill="#6b4a2b"/><circle cx="278" cy="150" r="18" fill="#4f8a58"/>`,
      `<rect width="300" height="225" fill="#efe6d3"/><rect y="170" width="300" height="55" fill="#c9b99a"/>${win(30, 30, 100, 90)}<line x1="80" y1="30" x2="80" y2="120" stroke="#fff" stroke-width="3"/><rect x="150" y="105" width="130" height="55" rx="12" fill="${c}"/><rect x="150" y="90" width="130" height="25" rx="10" fill="${c}" opacity=".85"/><ellipse cx="150" cy="195" rx="95" ry="14" fill="#fff" opacity=".5"/><rect x="40" y="150" width="70" height="8" rx="3" fill="#6b4a2b"/><rect x="48" y="158" width="6" height="20" fill="#6b4a2b"/><rect x="96" y="158" width="6" height="20" fill="#6b4a2b"/><rect x="236" y="40" width="3" height="55" fill="#6b4a2b"/><circle cx="237" cy="40" r="16" fill="#f6e3a8"/>`,
      `<rect width="300" height="225" fill="#f0e8da"/><rect y="175" width="300" height="50" fill="#bfae8c"/>${win(200, 30, 80, 80)}<rect x="40" y="60" width="110" height="50" rx="6" fill="${c}" opacity=".9"/><rect x="30" y="110" width="140" height="62" rx="8" fill="#fff"/><rect x="40" y="118" width="48" height="22" rx="8" fill="#e9e1d0"/><rect x="96" y="118" width="48" height="22" rx="8" fill="#e9e1d0"/><rect x="176" y="140" width="28" height="32" fill="#8a6b45"/><rect x="214" y="150" width="60" height="6" fill="#e9e1d0"/>`,
      `<rect width="300" height="225" fill="#f4eee2"/><rect y="170" width="300" height="55" fill="#d8ccb2"/><rect x="0" y="40" width="300" height="50" fill="${c}" opacity=".85"/>${[0, 1, 2, 3, 4].map((k) => `<rect x="${14 + k * 56}" y="48" width="48" height="34" fill="#fff" opacity=".25"/>`).join('')}<rect x="0" y="110" width="300" height="60" fill="#fff"/><rect x="0" y="104" width="300" height="10" fill="#8a8272"/><rect x="190" y="116" width="60" height="6" fill="#222"/>${[0, 1, 2].map((k) => `<line x1="${70 + k * 50}" y1="8" x2="${70 + k * 50}" y2="26" stroke="#555"/><circle cx="${70 + k * 50}" cy="30" r="9" fill="#f6e3a8"/>`).join('')}<rect x="60" y="150" width="180" height="20" fill="#e4dac4"/>`,
      `<rect width="300" height="225" fill="#fff"/><g fill="none" stroke="#24231F" stroke-width="3"><rect x="20" y="20" width="260" height="185"/><path d="M130 20v110h150M20 130h110M130 130v75M200 130v75"/></g><g font-size="12" fill="${c}" font-family="sans-serif" text-anchor="middle"><text x="75" y="80">Living</text><text x="205" y="80">Master</text><text x="75" y="175">Kitchen</text><text x="165" y="172">Bath</text><text x="240" y="172">Bed 2</text></g>`,
      `<rect width="300" height="225" fill="#0B1530"/><circle cx="150" cy="112" r="38" fill="${c}"/><path d="M138 92l34 20-34 20z" fill="#fff"/><text x="150" y="190" fill="#C9C4BA" font-size="13" text-anchor="middle" font-family="sans-serif">Video tour · 02:14</text>`
    ];
    return `<svg viewBox="0 0 300 225" preserveAspectRatio="xMidYMid slice">${v[i]}</svg>`;
  }
  function gallery(x, tagHtml) {
    const c = ACC[x.g % ACC.length];
    return `<div class="gal"><div class="strip" id="strip">${SCENE_NAMES.map((n, i) => `<div class="slide" ${i === 5 ? 'data-act="video"' : ''}>${scene(i, c)}<span class="cap">${X(n)}</span></div>`).join('')}</div>
      <span class="count" id="gcount">${D(1)} / ${D(6)}</span><div class="tag">${tagHtml || ''}</div>
      <div class="thumbs">${SCENE_NAMES.map((n, i) => `<button class="${i ? '' : 'on'}" data-act="gal" data-i="${i}" aria-label="${X(n)}">${scene(i, c)}</button>`).join('')}</div></div>`;
  }
  const NEAR = {
    nc: [['🎓', B('الجامعة الأمريكية', 'American University (AUC)'), 4], ['🛍', B('كايرو فستيفال سيتي', 'Cairo Festival City'), 6], ['🏥', B('مستشفى التجمع', 'Tagamoa Hospital'), 3.5], ['✈️', B('مطار القاهرة', 'Cairo Airport'), 24]],
    sz: [['🛍', B('مول العرب', 'Mall of Arabia'), 5], ['🎓', B('مدرسة دولية', 'International school'), 1.5], ['🏥', B('مستشفى دار الفؤاد', 'Dar Al Fouad Hospital'), 7], ['🚆', B('محطة المونوريل', 'Monorail station'), 4]],
    sh: [['🛍', B('مول الشروق', 'Shorouk Mall'), 2], ['🎓', B('مدرسة دولية', 'International school'), 1.2], ['🏥', B('مستشفى الشروق', 'Shorouk Hospital'), 3], ['🛣', B('الطريق الدائري', 'Ring Road'), 12]]
  };
  function mapBlock(x) {
    const n = seed(x); const px = 90 + (n * 37) % 120, py = 60 + (n * 53) % 60;
    return `<div class="mapbox"><svg viewBox="0 0 300 170"><rect width="300" height="170" fill="#e9e4d4"/><rect x="0" y="118" width="120" height="52" fill="#bcd6e6"/><rect x="170" y="14" width="100" height="46" rx="10" fill="#b7d1a4"/>
      <g stroke="#fff" stroke-width="9" fill="none"><path d="M0 90H300M110 0V170M210 0V170"/></g><g stroke="#fff" stroke-width="4" fill="none"><path d="M0 45H300M55 0V170M260 0V170M0 140H300"/></g>
      <g fill="#d6cdb5">${[[10, 10, 35, 28], [65, 10, 35, 28], [120, 10, 38, 28], [220, 66, 32, 18], [120, 100, 40, 28], [65, 100, 36, 28], [220, 100, 32, 28], [270, 100, 24, 28]].map(([a, b, c, d]) => `<rect x="${a}" y="${b}" width="${c}" height="${d}" rx="3"/>`).join('')}</g>
      <circle cx="${px}" cy="${py}" r="22" fill="${ACC[x.g % 6]}" opacity=".2"/><path d="M${px} ${py + 2}c-9-11-12-15-12-21a12 12 0 0 1 24 0c0 6-3 10-12 21z" fill="#C9302C" stroke="#fff" stroke-width="2" transform="translate(0 -6)"/><circle cx="${px}" cy="${py - 21}" r="4" fill="#fff"/></svg></div>`;
  }
  function propDetail(x, kind) {
    const n = seed(x); const baths = x.baths || Math.max(1, x.beds - 1);
    const fin = [B('تشطيب كامل', 'Fully finished'), B('نصف تشطيب', 'Semi-finished'), B('سوبر لوكس', 'Super lux')][n % 3];
    const floor = (n % 6) + 1, park = 1 + (n % 2), year = 2022 + (n % 4);
    const view = [B('حديقة', 'Garden view'), B('حمام سباحة', 'Pool view'), B('شارع رئيسي', 'Main street')][n % 3];
    const AM = [['🏊', B('حمام سباحة', 'Pool')], ['🏋️', B('نادي رياضي', 'Gym')], ['🛡', B('أمن ٢٤/٧', '24/7 security')], ['🚗', B('موقف سيارات', 'Parking')], ['🌳', B('حدائق', 'Landscaped gardens')], ['🛗', B('مصعد', 'Elevator')], ['❄️', B('تكييف مركزي', 'Central A/C')], ['🧒', B('منطقة أطفال', 'Kids area')], ['🏛', B('نادي اجتماعي', 'Clubhouse')], ['📶', B('منزل ذكي', 'Smart home')]];
    const am = [0, 1, 2, 3, 4, 5, 6, 7].map((k) => AM[(k + n) % AM.length]);
    const near = NEAR[x.area];
    const ag = [[B('أحمد مصطفى', 'Ahmed Mostafa'), '4.9'], [B('منى سمير', 'Mona Samir'), '4.8'], [B('طارق علي', 'Tarek Ali'), '4.7']][n % 3];
    const desc = T(`${X(TYPES[x.type])} بمساحة ${D(x.size)} م² و${D(x.beds)} غرف نوم في ${X(AREAS[x.area])}، ${X(fin)}، بإطلالة ${X(view)}. قريب من الخدمات والمدارس والطرق الرئيسية، داخل مجتمع مسوّر بأمن على مدار الساعة.`,
      `${X(TYPES[x.type])} of ${x.size} m² with ${x.beds} bedrooms in ${X(AREAS[x.area])}. ${X(fin)}, ${X(view).toLowerCase()}. Close to schools, services and main roads, inside a gated community with 24/7 security.`);
    const spec = [[T('الرقم المرجعي', 'Reference'), `<bdi dir="ltr">BB-${1000 + n * 7}</bdi>`], [T('الدور', 'Floor'), D(floor)], [T('التشطيب', 'Finishing'), X(fin)], [T('سنة البناء', 'Year built'), D(year)], [T('الإطلالة', 'View'), X(view)], [T('مواقف السيارات', 'Parking'), D(park)], [T('الملكية', 'Ownership'), T('تسجيل شهر عقاري', 'Registered title')]];
    let extra = '';
    if (kind === 'sale') { const down = x.price / 10; const mo = Math.round((x.price - down) / 84 / 100) * 100; extra = `<h2>${T('خطة الدفع', 'Payment plan')}</h2><div class="card pad"><div class="kv"><span>${T('مقدم ١٠٪', 'Down payment 10%')}</span><b>${egp(down)}</b></div><div class="kv"><span>${T('قسط شهري × ٨٤ شهر', 'Monthly × 84 months')}</span><b>${egp(mo)}</b></div><div class="kv"><span>${T('أو كاش', 'Or cash')}</span><b>${egp(x.price * 0.93)}</b></div></div>`; }
    if (kind === 'auction') extra = `<h2>${T('المستندات والفحص', 'Documents & inspection')}</h2><div class="card menu"><div class="kv" style="padding:12px 14px"><span>📄 ${T('عقد الملكية', 'Title deed')}</span><span class="badge ok">${T('موثّق', 'Verified')}</span></div><div class="kv" style="padding:12px 14px"><span>🔍 ${T('تقرير الفحص الفني', 'Technical inspection report')}</span><span class="badge ok">PDF</span></div><div class="kv" style="padding:12px 14px"><span>⚖️ ${T('فحص قانوني', 'Legal check')}</span><span class="badge ok">${T('سليم', 'Clear')}</span></div></div>`;
    if (kind === 'rent') extra = `<h2>${T('شروط الإيجار', 'Lease terms')}</h2><div class="card pad"><div class="kv"><span>${T('أقل مدة', 'Minimum term')}</span><b>${D(6)} ${T('أشهر', 'months')}</b></div><div class="kv"><span>${T('الدفع', 'Payment')}</span><b>${T('شهري / ربع سنوي', 'Monthly / quarterly')}</b></div><div class="kv"><span>${T('المرافق', 'Utilities')}</span><b>${T('على المستأجر', 'Tenant pays')}</b></div><div class="kv"><span>${T('حيوانات أليفة', 'Pets')}</span><b>${n % 2 ? T('مسموح', 'Allowed') : T('غير مسموح', 'Not allowed')}</b></div></div>`;
    return `<div class="facts"><div><b>${D(x.beds)}</b>${T('غرف', 'Beds')}</div><div><b>${D(baths)}</b>${T('حمامات', 'Baths')}</div><div><b>${D(x.size)}</b>${T('م²', 'm²')}</div><div><b>${D(floor)}</b>${T('الدور', 'Floor')}</div></div>
      <div class="row small muted" style="margin-bottom:8px"><span>📍</span><span>${X(AREAS[x.area])}, ${T('القاهرة، مصر', 'Cairo, Egypt')}</span></div>
      <h2>${T('الوصف', 'Description')}</h2><p class="small" style="line-height:1.7">${desc}</p>
      <h2>${T('التفاصيل', 'Property details')}</h2><div class="card pad">${spec.map(([k, v]) => `<div class="kv"><span>${k}</span><b>${v}</b></div>`).join('')}</div>
      <h2>${T('المرافق والخدمات', 'Amenities')}</h2><div class="amen">${am.map(([i, l]) => `<span>${i} ${X(l)}</span>`).join('')}</div>
      ${extra}
      <h2>${T('الموقع', 'Location')}</h2>${mapBlock(x)}
      <div class="card pad" style="margin-top:10px;padding-block:4px">${near.map(([i, l, k]) => `<div class="kv"><span>${i} ${X(l)}</span><b>${D(k)} ${T('كم', 'km')}</b></div>`).join('')}</div>
      <button class="btn sec" data-act="toast" data-m="${T('سيفتح تطبيق الخرائط (تجريبي)', 'Would open Maps (demo)')}">🗺 ${T('افتح في الخرائط', 'Open in Maps')}</button>
      <h2>${T('المُعلن', 'Listed by')}</h2><div class="card pad"><div class="agent"><div class="avatar">👤</div><div class="grow"><b>${X(ag[0])}</b><div class="small muted">${T('وسيط موثّق من بن بن', 'BEN-BEN verified agent')} · ⭐ ${D(ag[1])}</div></div></div>
      <div class="acts"><button class="btn sm" data-act="toast" data-m="${T('اتصال (تجريبي)', 'Calling… (demo)')}">📞 ${T('اتصال', 'Call')}</button><button class="btn sm" data-act="toast" data-m="${T('واتساب (تجريبي)', 'WhatsApp (demo)')}">💬 ${T('واتساب', 'WhatsApp')}</button><button class="btn sm sec" data-act="toast" data-m="${T('تم إرسال رسالتك', 'Message sent')}">✉️ ${T('رسالة', 'Message')}</button></div></div>
      <div class="row small muted" style="margin:10px 0"><span>${T('تاريخ النشر:', 'Posted:')} ${D(2 + (n % 20))} ${T('نوفمبر ٢٠٢٦', 'Nov 2026')}</span><span class="grow"></span><button data-act="toast" data-m="${T('تمت المشاركة (تجريبي)', 'Shared (demo)')}">↗ ${T('مشاركة', 'Share')}</button></div>`;
  }

  /* ---------- screens ---------- */
  const R = {};

  R.login = () => ({ nonav: true, html: `
    <div class="hero"><img src="assets/logo/lockup-horizontal.svg" alt="BEN-BEN">
      <h1>${T('أهلاً بك في بن بن', 'Welcome to BEN-BEN')}</h1>
      <p class="muted">${T('مزادات عقارية في مصر، بكل شفافية.', 'Real-estate auctions in Egypt, with full transparency.')}</p></div>
    <label class="field"><span>${T('رقم الموبايل', 'Mobile number')}</span>
      <input id="phone-in" inputmode="tel" value="${S.phone || '+20 100 555 0199'}" dir="ltr"></label>
    <button class="btn" data-act="sendOtp">${T('إرسال الرمز', 'Send code')}</button>
    <p class="muted small" style="margin-top:14px;text-align:center">${T('عرض تجريبي: أي رمز يعمل.', 'Demo: any code works.')}</p>` });

  R.otp = () => ({ nonav: true, back: '#/login', html: `
    <h1>${T('أدخل الرمز', 'Enter the code')}</h1>
    <p class="muted">${T('أرسلنا رمزًا إلى', 'We sent a code to')} <bdi dir="ltr">${S.phone}</bdi></p>
    <div class="otp">${[0, 1, 2, 3, 4, 5].map((i) => `<input maxlength="1" inputmode="numeric" data-otp="${i}" value="${ui.otp[i] || ''}">`).join('')}</div>
    <button class="btn" data-act="verifyOtp">${T('تأكيد', 'Verify')}</button>
    <p class="muted small" style="margin-top:14px;text-align:center">${T('اكتب أي ٦ أرقام.', 'Type any 6 digits.')}</p>` });

  R.kyc = () => {
    const docs = S.idDocs; const names = [['front', T('صورة البطاقة (الوجه)', 'ID card, front')], ['back', T('صورة البطاقة (الظهر)', 'ID card, back')], ['selfie', T('سيلفي', 'Selfie')]];
    if (S.kyc === 'pending') return { nonav: false, tab: 'profile', back: '#/profile', title: T('توثيق الهوية', 'ID verification'), html: `
      <div class="steps"><i class="on"></i><i class="on"></i><i class="on"></i></div>
      <div class="hero"><div style="font-size:54px">⏳</div><h1>${T('قيد المراجعة', 'Pending review')}</h1>
      <p class="muted">${T('فريقنا يراجع هويتك. عادةً خلال ساعات.', 'Our team is reviewing your ID. Usually within hours.')}</p></div>
      <div class="banner info">${T('للعرض التجريبي: اضغط لمحاكاة موافقة الفريق، أو وافق من لوحة الإدارة.', 'For the demo: simulate staff approval below, or approve it from the admin view.')}</div>
      <button class="btn" data-act="approveMe">${T('محاكاة الموافقة', 'Simulate staff approval')}</button>
      <a class="btn sec" href="#/admin">${T('فتح لوحة الإدارة', 'Open admin view')}</a>` };
    if (S.kyc === 'approved') return { tab: 'profile', back: '#/profile', title: T('توثيق الهوية', 'ID verification'), html: `
      <div class="hero"><div style="font-size:54px">✅</div><h1>${T('تمت الموافقة', 'Approved')}</h1>
      <p><span class="badge ok">${T('المستوى T1', 'Tier T1')}</span></p>
      <p class="muted" style="margin-top:10px">${T('يمكنك الآن الانضمام للمزادات بعد شحن المحفظة.', 'You can now join auctions after funding your wallet.')}</p></div>
      <div class="card pad"><div class="kv"><span>${T('المستوى', 'Tier')}</span><b>T1</b></div><div class="kv"><span>${T('حد المزايدة', 'Bid limit')}</span><b>${egp(E(20000000))}</b></div></div>
      <a class="btn" href="#/topup">${T('شحن المحفظة', 'Top up wallet')}</a><a class="btn sec" href="#/auctions">${T('تصفح المزادات', 'Browse auctions')}</a>` };
    const done = names.every(([k]) => docs[k]);
    return { nonav: true, back: '#/auctions', title: T('توثيق الهوية', 'ID verification'), html: `
      <div class="steps"><i class="on"></i><i class="${docs.front ? 'on' : ''}"></i><i class="${done ? 'on' : ''}"></i></div>
      <h1>${T('وثّق هويتك', 'Verify your ID')}</h1><p class="muted" style="margin-bottom:14px">${T('مطلوب مرة واحدة للمزايدة.', 'Needed once, to bid.')}</p>
      ${names.map(([k, l]) => `<div class="upload ${docs[k] ? 'done' : ''}" data-act="upload" data-k="${k}">${docs[k] ? '✓ ' + l : '📷 ' + l + '<br><span class="small muted">' + T('اضغط للرفع (تجريبي)', 'Tap to upload (fake)') + '</span>'}</div>`).join('')}
      <button class="btn" data-act="submitKyc" ${done ? '' : 'disabled'}>${T('إرسال للمراجعة', 'Submit for review')}</button>
      <a class="btn sec" href="#/auctions">${T('لاحقًا', 'Later')}</a>` };
  };

  /* Auctions */
  R.auctions = () => {
    const list = AUCTIONS.filter((a) => a.status === ui.au);
    const seg = ['live', 'upcoming', 'ended'].map((k) => `<button class="${ui.au === k ? 'on' : ''}" data-act="auTab" data-k="${k}">${{ live: T('مباشر', 'Live'), upcoming: T('قريبًا', 'Upcoming'), ended: T('منتهية', 'Ended') }[k]}</button>`).join('');
    return { tab: 'auctions', logo: true, html: `
      ${S.kyc !== 'approved' ? `<a class="banner warn" href="#/kyc" style="text-decoration:none">🔒 ${S.kyc === 'pending' ? T('هويتك قيد المراجعة.', 'Your ID is under review.') : T('وثّق هويتك لتتمكن من المزايدة.', 'Verify your ID to bid.')}</a>` : ''}
      <a class="card pad row between" href="#/wallet" style="text-decoration:none"><span class="muted">${T('رصيدك المتاح', 'Available balance')}</span><b class="price">${egp(S.bal)}</b></a>
      <h1>${T('مزادات الـ٢٤ ساعة', 'Flash 24H auctions')}</h1>
      <div class="seg">${seg}</div>
      ${list.map(auctionCard).join('')}` };
  };
  function auctionCard(a) {
    const res = S.results[a.id];
    const bd = a.status === 'live' ? `<span class="badge live">${T('مباشر', 'LIVE')}</span>` : a.status === 'upcoming' ? `<span class="badge gold">${T('يبدأ خلال', 'Starts in')} ${a.startsIn.split(' / ')[ar() ? 0 : 1]}</span>` : `<span class="badge">${T('منتهي', 'Ended')}</span>`;
    return `<a class="card" href="#/auction/${a.id}" style="text-decoration:none">${img(a.g, `<div class="badges">${bd}${res ? `<span class="badge ${res.won ? 'ok' : 'danger'}">${res.won ? T('فزت', 'Won') : T('لم تفز', 'Lost')}</span>` : ''}${S.joined[a.id] && !res ? `<span class="badge ok">${T('منضم', 'Joined')}</span>` : ''}</div>`)}
      <div class="pad"><b>${X(a.title)}</b><div class="muted small">${X(AREAS[a.area])} · ${D(a.size)} ${T('م²', 'm²')} · ${D(a.beds)} ${T('غرف', 'beds')}</div>
      <div class="row between" style="margin-top:8px"><span class="muted small">${a.status === 'ended' ? T('السعر النهائي', 'Final price') : T('سعر الافتتاح', 'Opening price')}</span><span class="price">${egp(a.final || a.start)}</span></div></div></a>`;
  }

  R.auction = (id) => {
    const a = AUCTIONS.find((x) => x.id === id); const res = S.results[id]; const joined = S.joined[id];
    let cta;
    if (a.status === 'ended') cta = `<div class="banner info">${T('انتهى المزاد بسعر', 'Auction closed at')} ${egp(a.final)}</div>`;
    else if (a.status === 'upcoming') cta = `<button class="btn sec" data-act="remind" data-id="${id}">${S.reminders.includes(id) ? '✓ ' + T('سنذكّرك', 'Reminder set') : T('ذكّرني', 'Remind me')}</button>`;
    else if (res) cta = res.won ? `<a class="btn" href="#/win/${id}">${T('قائمة الفائز', 'Winner checklist')}</a>` : `<div class="banner danger">${T('انتهى مزادك ولم تفز. تم تحرير التأمين.', 'You did not win. Deposit released.')}</div>`;
    else if (joined) cta = `<a class="btn" href="#/room/${id}">${T('ادخل غرفة المزاد المباشر', 'Enter the live room')}</a>`;
    else cta = `<button class="btn" data-act="joinSheet" data-id="${id}">${T('انضم للمزايدة', 'Join to bid')}</button>`;
    return { back: '#/auctions', title: T('تفاصيل المزاد', 'Auction'), tab: 'auctions', flush: false, html: `
      ${gallery(a, a.status === 'live' ? `<span class="badge live">${T('مباشر', 'LIVE')}</span>` : `<span class="badge gold">${T('مزاد', 'Auction')}</span>`)}
      <h1>${X(a.title)}</h1><p class="muted">${X(AREAS[a.area])} · ${X(TYPES[a.type])}</p>
      <div class="card pad" style="margin-top:12px">
        <div class="kv"><span>${T('سعر الافتتاح', 'Opening price')}</span><b>${egp(a.start)}</b></div>
        <div class="kv"><span>${T('تأمين المزايدة (يُحجز)', 'Bidding deposit (locked)')}</span><b>${egp(a.deposit)}</b></div>
        <div class="kv"><span>${T('المساحة', 'Size')}</span><b>${D(a.size)} ${T('م²', 'm²')}</b></div>
        <div class="kv"><span>${T('غرف النوم', 'Bedrooms')}</span><b>${D(a.beds)}</b></div>
        <div class="kv"><span>${T('زيادات المزايدة', 'Bid increments')}</span><b>${a.steps.map((s) => egp(s)).join(' · ')}</b></div></div>
      ${propDetail(a, 'auction')}
      <div class="banner info">⏱ ${T('الحماية من القنص: أي مزايدة في آخر ٢٠ ثانية تمدد الوقت.', 'Anti-sniping: a bid in the last 20 seconds extends the clock.')}</div>
      ${cta}` };
  };

  /* Live room */
  function room(a) {
    if (!ui.rooms[a.id]) ui.rooms[a.id] = { cur: a.start, leader: null, rem: a.secs, total: a.secs, feed: [], botsLeft: a.bots, myBids: 0, inc: 0, ext: false, ended: false, lastBot: '' };
    return ui.rooms[a.id];
  }
  R.room = (id) => {
    const a = AUCTIONS.find((x) => x.id === id);
    if (!a || a.status !== 'live') return { redirect: '#/auctions' };
    if (S.results[id]) return S.results[id].won ? { redirect: '#/win/' + id } : { redirect: '#/auction/' + id };
    if (!S.joined[id]) return { redirect: '#/auction/' + id };
    const r = room(a); const C = 2 * Math.PI * 64; const low = r.rem <= 10;
    const status = r.leader === 'me' ? `<div class="status win">🏆 ${T('أنت الأعلى سعرًا', 'You are the highest bidder')}</div>`
      : r.leader && r.myBids ? `<div class="status out">⚠️ ${T('تم تجاوز مزايدتك!', 'You have been outbid!')}</div>`
      : r.leader ? `<div class="status" style="background:var(--ds-surface)">${T('الأعلى حاليًا', 'Top bid by')} ${ar() ? BOT_NAMES[r.lastIdx] : BOT_NAMES_EN[r.lastIdx]}</div>`
      : `<div class="status" style="background:var(--ds-surface)">${T('لا مزايدات بعد، كن الأول', 'No bids yet, be the first')}</div>`;
    const bid = r.cur + a.steps[r.inc];
    return { stage: true, nonav: true, back: '#/auction/' + id, title: X(a.title), html: `
      <div class="stage"><div class="row between"><span class="badge live">${T('مباشر', 'LIVE')}</span><span class="small muted">${T('تأمينك محجوز', 'Deposit locked')}: ${egp(a.deposit)}</span></div>
      <div class="ring ${low ? 'low' : ''}" id="ring"><svg viewBox="0 0 150 150"><circle cx="75" cy="75" r="64" fill="none" stroke="var(--ds-stage-ring-track)" stroke-width="9"/>
        <circle id="arc" cx="75" cy="75" r="64" fill="none" stroke="${low ? 'var(--ds-danger)' : 'var(--ds-accent)'}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - Math.min(1, r.rem / r.total))}"/></svg>
        <div class="t" id="rt">${mmss(r.rem)}</div>${r.ext ? `<div class="ext">+ ${T('تمديد', 'Extended')}</div>` : ''}</div>
      <div style="text-align:center"><div class="muted small">${T('أعلى مزايدة', 'Current bid')}</div><div class="big" style="color:var(--ds-accent-text)">${egp(r.cur)}</div></div>
      ${status}
      <div class="small muted">${T('اختر الزيادة', 'Choose increment')}</div>
      <div class="inc">${a.steps.map((s, i) => `<button class="${r.inc === i ? 'on' : ''}" data-act="inc" data-i="${i}">+${egp(s)}</button>`).join('')}</div>
      <button class="btn" data-act="bid" data-id="${id}" ${r.leader === 'me' ? 'disabled' : ''}>${T('زايد بـ', 'Bid')} ${egp(bid)}</button>
      <div class="feed">${r.feed.length ? r.feed.slice(0, 6).map((f) => `<div class="${f.me ? 'me' : ''}"><span>${f.me ? T('أنت', 'You') : f.name}</span><span>${egp(f.amt)}</span></div>`).join('') : `<div class="muted">${T('بانتظار المزايدات…', 'Waiting for bids…')}</div>`}</div>
      </div>` };
  };
  function placeBid(a, who, amt, idx) {
    const r = room(a); r.cur = amt; r.leader = who; r.feed.unshift({ me: who === 'me', name: who === 'me' ? '' : (ar() ? BOT_NAMES[idx] : BOT_NAMES_EN[idx]), amt });
    if (who === 'me') r.myBids++; else r.lastIdx = idx;
    r.ext = false;
    if (r.rem <= 20) { r.rem = 20; r.ext = true; setTimeout(() => { r.ext = false; }, 2500); }
  }
  function roomTick(id) {
    const a = AUCTIONS.find((x) => x.id === id); const r = room(a);
    if (r.ended) return;
    r.rem = Math.max(0, r.rem - 1);
    if (r.botsLeft > 0 && r.rem > 4 && Math.random() < 0.4) {
      r.botsLeft--; placeBid(a, 'bot', r.cur + a.steps[Math.floor(Math.random() * 2)], Math.floor(Math.random() * 5)); render(); return;
    }
    if (r.rem <= 0) { finishAuction(a); return; }
    if (!r.ext) { const e = document.querySelector('.ext'); if (e) e.remove(); }
    const t = $('rt'); if (!t) return;
    t.textContent = mmss(r.rem); const C = 2 * Math.PI * 64;
    $('arc').setAttribute('stroke-dashoffset', C * (1 - Math.min(1, r.rem / r.total)));
    const low = r.rem <= 10; $('ring').classList.toggle('low', low); $('arc').setAttribute('stroke', low ? 'var(--ds-danger)' : 'var(--ds-accent)');
  }
  function finishAuction(a) {
    const r = room(a); r.ended = true;
    if (r.leader === 'me') { S.results[a.id] = { won: true, final: r.cur }; addTx('hold', 0, T('فزت بالمزاد، التأمين محجوز', 'Won auction, deposit kept on hold') + ' · ' + X(a.title)); save(); go('#/win/' + a.id); }
    else { S.results[a.id] = { won: false }; S.locked -= a.deposit; S.bal += a.deposit; addTx('unlock', a.deposit, T('تحرير التأمين', 'Deposit released') + ' · ' + X(a.title)); save(); toast(T('انتهى المزاد، لم تفز', 'Auction ended, you did not win')); go('#/auction/' + a.id); }
  }

  R.win = (id) => {
    const a = AUCTIONS.find((x) => x.id === id); const res = S.results[id]; if (!res || !res.won) return { redirect: '#/auctions' };
    const cl = S.checklist[id] || {};
    const items = [T('توقيع اتفاقية الحجز إلكترونيًا', 'E-sign the reservation agreement'), T('دفع الدفعة المقدمة (١٠٪)', 'Pay the 10% down payment'), T('رفع مستندات الملكية والدخل', 'Upload income & ownership documents'), T('حجز موعد التوثيق بالشهر العقاري', 'Book the notary appointment')];
    const doneAll = items.every((_, i) => cl[i]);
    return { tab: 'auctions', back: '#/auctions', title: T('الفائز', 'Winner'), html: `
      <div class="hero"><div class="confetti">🎉</div><h1>${T('مبروك! فزت بالمزاد', 'Congratulations! You won')}</h1><p class="muted">${X(a.title)}</p></div>
      <div class="card pad"><div class="kv"><span>${T('سعر الفوز', 'Winning price')}</span><b>${egp(res.final)}</b></div>
        <div class="kv"><span>${T('الدفعة المقدمة ١٠٪', 'Down payment 10%')}</span><b>${egp(res.final / 10)}</b></div>
        <div class="kv"><span>${T('التأمين المحجوز (يُخصم)', 'Held deposit (credited)')}</span><b>${egp(a.deposit)}</b></div>
        <div class="kv"><span>${T('المتبقي من الدفعة', 'Down payment remaining')}</span><b>${egp(res.final / 10 - a.deposit)}</b></div></div>
      <h2>${T('قائمة الفائز', 'Winner checklist')}</h2>
      <div class="card">${items.map((t, i) => `<button class="check ${cl[i] ? 'done' : ''}" data-act="chk" data-id="${id}" data-i="${i}"><span class="box">${cl[i] ? '✓' : ''}</span><span>${t}</span></button>`).join('')}</div>
      ${doneAll ? `<div class="banner ok">✅ ${T('اكتملت الخطوات. سيتواصل معك فريقنا لإتمام النقل.', 'All steps done. Our team will contact you to complete the transfer.')}</div>` : ''}
      <a class="btn sec" href="#/wallet">${T('المحفظة', 'Wallet')}</a>` };
  };

  /* Wallet */
  R.wallet = () => ({ tab: 'profile', back: '#/profile', title: T('المحفظة', 'Wallet'), html: `
    <div class="walletcard"><div class="small" style="opacity:.8">${T('الرصيد المتاح', 'Available balance')}</div><div class="big">${egp(S.bal)}</div>
      <div class="row between" style="margin-top:10px"><span class="small" style="opacity:.8">🔒 ${T('تأمين محجوز', 'Locked deposit')}</span><b>${egp(S.locked)}</b></div></div>
    <a class="btn" href="#/topup">${T('شحن المحفظة', 'Top up')}</a>
    <h2>${T('المعاملات', 'Transactions')}</h2>
    <div class="card pad" style="padding-block:4px">${S.tx.length ? S.tx.map((t) => `<div class="tx"><div><div>${t.note}</div><div class="muted small">${fmtTime(t.ts)}</div></div><div class="amt ${t.amt > 0 ? 'pos' : t.amt < 0 ? 'neg' : ''}">${t.amt > 0 ? '+' : t.amt < 0 ? '−' : ''}${egp(Math.abs(t.amt))}</div></div>`).join('') : `<p class="muted" style="padding:14px 0">${T('لا معاملات بعد.', 'No transactions yet.')}</p>`}</div>` });

  R.topup = () => ({ tab: 'profile', back: '#/wallet', title: T('شحن المحفظة', 'Top up'), html: `
    <h1>${T('كم تريد أن تشحن؟', 'How much to add?')}</h1>
    <div class="chips" style="flex-wrap:wrap">${[50000, 100000, 250000, 500000].map((v, i) => `<button class="chip ${ui.pick === i ? 'on' : ''}" data-act="pickAmt" data-i="${i}">${egp(E(v))}</button>`).join('')}</div>
    <div class="card pad"><div class="row"><span style="font-size:24px">💳</span><div class="grow"><b>${T('بطاقة تجريبية', 'Mock card')} •••• 4242</b><div class="muted small">${T('دفع تجريبي، لا يتم خصم أي مبلغ.', 'Fake checkout, no money moves.')}</div></div></div></div>
    <button class="btn" data-act="doTopup">${T('ادفع', 'Pay')} ${egp(E([50000, 100000, 250000, 500000][ui.pick]))}</button>` });

  /* Explore */
  R.explore = () => {
    const f = ui.ex; let list = listingsVisible().filter((l) => (f.area === 'all' || l.area === f.area) && (!f.max || l.price <= f.max) && (!f.saved || S.saved.includes(l.id)));
    const chips = [['all', T('الكل', 'All')]].concat(Object.keys(AREAS).map((k) => [k, X(AREAS[k])])).map(([k, l]) => `<button class="chip ${f.area === k ? 'on' : ''}" data-act="exArea" data-k="${k}">${l}</button>`).join('') + `<button class="chip ${f.saved ? 'on' : ''}" data-act="exSaved">♥ ${T('المحفوظة', 'Saved')}</button>`;
    return { tab: 'explore', logo: true, html: `
      <div class="row between"><h1>${T('استكشف العقارات', 'Explore')}</h1><a class="btn sm" href="#/list-new">+ ${T('أضف عقارك', 'List')}</a></div>
      <div class="chips">${chips}</div>
      <label class="field"><span>${T('السعر الأقصى', 'Max price')}</span><select data-act="exMax">${[[0, T('بدون حد', 'Any')], [3000000, '3M'], [6000000, '6M'], [10000000, '10M']].map(([v, l]) => `<option value="${v}" ${f.max === E(v) || (!v && !f.max) ? 'selected' : ''}>${v ? (ar() ? 'حتى ' : 'Up to ') + (ar() ? D(l.replace('M', '')) + ' مليون' : 'EGP ' + l) : l}</option>`).join('')}</select></label>
      ${list.length ? list.map((l) => listingCard(l)).join('') : `<p class="muted" style="text-align:center;padding:30px">${T('لا نتائج.', 'No results.')}</p>`}` };
  };
  function listingCard(l) {
    return `<a class="card" href="#/listing/${l.id}" style="text-decoration:none">${img(l.g, `<button class="heart" data-act="save" data-id="${l.id}" aria-label="save">${S.saved.includes(l.id) ? '♥' : '♡'}</button>`)}
      <div class="pad"><b>${X(l.title)}</b><div class="muted small">${X(AREAS[l.area])} · ${D(l.size)} ${T('م²', 'm²')} · ${D(l.beds)} ${T('غرف', 'beds')}</div><div class="price" style="margin-top:6px">${egp(l.price)}</div></div></a>`;
  }
  R.listing = (id) => {
    const l = findListing(id); if (!l) return { redirect: '#/explore' };
    return { tab: 'explore', back: '#/explore', title: T('تفاصيل العقار', 'Listing'), html: `
      ${gallery(l, `<span class="badge gold">${T('للبيع', 'For sale')}</span>`)}
      <div class="row between"><h1 class="grow">${X(l.title)}</h1><button class="ibtn" data-act="save" data-id="${l.id}" style="font-size:22px">${S.saved.includes(l.id) ? '♥' : '♡'}</button></div><div class="price">${egp(l.price)} <small>· ${egp(Math.round(l.price / l.size))} / ${T('م²', 'm²')}</small></div><p class="muted">${X(AREAS[l.area])} · ${X(TYPES[l.type])}</p>
      ${propDetail(l, 'sale')}
      <button class="btn" data-act="contact">${T('تواصل مع البائع', 'Contact seller')}</button>
      <button class="btn sec" data-act="save" data-id="${l.id}">${S.saved.includes(l.id) ? '♥ ' + T('محفوظ', 'Saved') : '♡ ' + T('احفظ', 'Save')}</button>` };
  };
  R['list-new'] = () => ({ tab: 'explore', back: '#/explore', title: T('أضف عقارك', 'List a property'), html: `
    <h1>${T('أضف عقارًا للبيع', 'List a property for sale')}</h1><p class="muted" style="margin-bottom:14px">${T('تتم مراجعته من فريقنا قبل النشر.', 'Reviewed by our team before it goes live.')}</p>
    <label class="field"><span>${T('العنوان', 'Title')}</span><input id="ln-title" value="${T('شقة ٣ غرف، كمبوند الباتروس', '3-bed apartment, Al Patroise compound')}"></label>
    <label class="field"><span>${T('المنطقة', 'Area')}</span><select id="ln-area">${Object.keys(AREAS).map((k) => `<option value="${k}">${X(AREAS[k])}</option>`).join('')}</select></label>
    <label class="field"><span>${T('السعر (جنيه)', 'Price (EGP)')}</span><input id="ln-price" inputmode="numeric" value="4800000" dir="ltr"></label>
    <button class="btn" data-act="submitListing">${T('إرسال للمراجعة', 'Submit for review')}</button>` });

  /* Rent */
  R.rent = () => ({ tab: 'rent', logo: true, html: `<h1>${T('إيجارات', 'Rentals')}</h1>${RENTALS.map((r) => `<a class="card" href="#/rental/${r.id}" style="text-decoration:none">${img(r.g, `<div class="badges">${r.furnished ? `<span class="badge gold">${T('مفروشة', 'Furnished')}</span>` : ''}</div>`)}<div class="pad"><b>${X(r.title)}</b><div class="muted small">${X(AREAS[r.area])} · ${D(r.size)} ${T('م²', 'm²')} · ${D(r.beds)} ${T('غرف', 'beds')}</div><div class="price" style="margin-top:6px">${egp(r.rent)} <small>/ ${T('شهر', 'month')}</small></div></div></a>`).join('')}` });
  R.rental = (id) => {
    const r = RENTALS.find((x) => x.id === id); const sent = S.rentReqs.find((q) => q.rid === id);
    return { tab: 'rent', back: '#/rent', title: T('تفاصيل الإيجار', 'Rental'), html: `
      ${gallery(r, `<span class="badge gold">${r.furnished ? T('مفروشة', 'Furnished') : T('للإيجار', 'For rent')}</span>`)}
      <h1>${X(r.title)}</h1><div class="price">${egp(r.rent)} <small>/ ${T('شهر', 'month')} · ${T('تأمين', 'deposit')} ${egp(r.rent * 2)}</small></div>
      ${propDetail(r, 'rent')}
      ${sent ? `<div class="banner ok">✓ ${T('تم إرسال طلبك', 'Request sent')}</div><a class="btn sec" href="#/requests" data-act="rqRent">${T('تابع طلباتك', 'Track your requests')}</a>` : `<button class="btn" data-act="rentSheet" data-id="${id}">${T('اطلب الإيجار', 'Request to rent')}</button>`}` };
  };

  /* Requests */
  const matchesFor = (q) => listingsVisible().filter((l) => l.area === q.area && l.type === q.type && l.price <= q.max && l.beds >= q.beds);
  R.requests = () => {
    const seg = [['buyer', T('طلبات الشراء', 'Buy requests')], ['rent', T('طلبات الإيجار', 'Rentals')], ['invest', T('استثمار', 'Invest')]].map(([k, l]) => `<button class="${ui.rq === k ? 'on' : ''}" data-act="rqTab" data-k="${k}">${l}</button>`).join('');
    let body = '';
    if (ui.rq === 'buyer') body = `<a class="btn" href="#/request-new">+ ${T('طلب جديد', 'New request')}</a><div style="height:12px"></div>` + S.reqs.map((q) => { const m = matchesFor(q); return `<div class="card pad"><div class="row between"><b>${X(TYPES[q.type])} · ${X(AREAS[q.area])}</b><span class="badge ${m.length ? 'ok' : ''}">${D(m.length)} ${T('مطابقة', 'matches')}</span></div><div class="muted small">${T('حتى', 'Up to')} ${egp(q.max)} · ${D(q.beds)}+ ${T('غرف', 'beds')}</div>${m.map((l) => `<a class="row between" href="#/listing/${l.id}" style="padding:10px 0;border-top:1px solid var(--ds-line);margin-top:8px;color:inherit;text-decoration:none"><span class="grow small">${X(l.title)}</span><b class="small">${egp(l.price)}</b></a>`).join('')}</div>`; }).join('');
    else if (ui.rq === 'rent') body = S.rentReqs.length ? S.rentReqs.map((q) => { const r = RENTALS.find((x) => x.id === q.rid); const ok = Date.now() - q.ts > 6000; return `<div class="card pad"><div class="row between"><b>${X(r.title)}</b><span class="badge ${ok ? 'ok' : 'warn'}">${ok ? T('وافق المالك', 'Landlord accepted') : T('مُرسل', 'Sent')}</span></div><div class="muted small">${T('الانتقال', 'Move-in')}: <bdi dir="ltr">${q.date}</bdi> · ${D(q.months)} ${T('شهر', 'months')}</div></div>`; }).join('') : `<p class="muted" style="text-align:center;padding:30px">${T('لا طلبات إيجار. اطلب من تبويب الإيجار.', 'No rental requests yet. Request one from the Rent tab.')}</p>`;
    else body = INVEST.map((v) => `<div class="card pad"><div class="row between"><b class="grow">${X(v.title)}</b><span class="badge gold">${D(v.yieldPct)}${ar() ? '٪' : '%'} ${T('عائد', 'yield')}</span></div>
      <div class="muted small">${X(AREAS[v.area])} · ${T('أقل تذكرة', 'Min ticket')} ${egp(v.ticket)} · ${D(v.term)} ${T('سنوات', 'yrs')}</div>
      <div class="bar" style="margin:10px 0 4px"><i style="width:${v.funded}%"></i></div><div class="row between small muted"><span>${D(v.funded)}${ar() ? '٪' : '%'} ${T('ممول', 'funded')}</span>
      <button class="btn sm ${S.interest.includes(v.id) ? 'sec' : ''}" data-act="interest" data-id="${v.id}">${S.interest.includes(v.id) ? '✓ ' + T('تم التسجيل', 'Interested') : T('أبدِ اهتمامك', 'Express interest')}</button></div></div>`).join('');
    return { tab: 'requests', logo: true, html: `<h1>${T('الطلبات والاستثمار', 'Requests & Invest')}</h1><div class="seg">${seg}</div>${body}` };
  };
  R['request-new'] = () => ({ tab: 'requests', back: '#/requests', title: T('طلب شراء', 'New buy request'), html: `
    <h1>${T('ماذا تبحث عنه؟', 'What are you looking for?')}</h1><p class="muted" style="margin-bottom:14px">${T('سنطابق طلبك مع العقارات المتاحة.', 'We match it with available listings.')}</p>
    <label class="field"><span>${T('المنطقة', 'Area')}</span><select id="rq-area">${Object.keys(AREAS).map((k) => `<option value="${k}">${X(AREAS[k])}</option>`).join('')}</select></label>
    <label class="field"><span>${T('النوع', 'Type')}</span><select id="rq-type">${Object.keys(TYPES).map((k) => `<option value="${k}">${X(TYPES[k])}</option>`).join('')}</select></label>
    <label class="field"><span>${T('الميزانية القصوى', 'Max budget')}</span><select id="rq-max">${[3000000, 6000000, 10000000, 20000000].map((v) => `<option value="${v}" ${v === 6000000 ? 'selected' : ''}>${egpT(E(v))}</option>`).join('')}</select></label>
    <label class="field"><span>${T('أقل عدد غرف', 'Min bedrooms')}</span><select id="rq-beds">${[1, 2, 3, 4].map((v) => `<option value="${v}" ${v === 2 ? 'selected' : ''}>${D(v)}</option>`).join('')}</select></label>
    <button class="btn" data-act="submitReq">${T('إرسال الطلب', 'Submit request')}</button>` });

  /* Profile + admin */
  R.profile = () => ({ tab: 'profile', logo: true, html: `
    <div class="card pad row"><div class="ibtn" style="background:var(--ds-accent-tint);width:52px;height:52px;border-radius:50%;font-size:20px">👤</div><div class="grow"><b dir="ltr">${S.phone}</b><div>${kycBadge()}</div></div></div>
    <div class="card menu">
      <a href="#/wallet"><span>💰 ${T('المحفظة', 'Wallet')}</span><b>${egp(S.bal)}</b></a>
      <a href="#/kyc"><span>🪪 ${T('توثيق الهوية', 'ID verification')}</span><span class="muted">›</span></a>
      <a href="#/explore" data-act="exSavedGo"><span>♥ ${T('المحفوظات', 'Saved listings')}</span><b>${D(S.saved.length)}</b></a>
      <button data-act="lang"><span>🌐 ${T('اللغة', 'Language')}</span><b>${T('العربية ← English', 'English → العربية')}</b></button>
      <button data-act="theme"><span>◐ ${T('المظهر', 'Theme')}</span><b>${{ auto: T('تلقائي (حسب الهاتف)', 'Auto (follows phone)'), light: T('فاتح', 'Light'), dark: T('داكن', 'Dark') }[S.theme]}</b></button>
      <a href="#/admin"><span>🛠 ${T('لوحة الإدارة (تجريبي)', 'Staff admin (demo)')}</span><span class="muted">›</span></a>
      <button data-act="reset"><span>↺ ${T('إعادة ضبط العرض', 'Reset demo')}</span></button>
      <button data-act="logout"><span>⎋ ${T('تسجيل الخروج', 'Log out')}</span></button></div>` });

  R.admin = () => {
    const ids = []; if (S.kyc === 'pending') ids.push({ id: 'me', name: T('أنت (مستخدم العرض)', 'You (demo user)'), phone: S.phone, me: true });
    SEED_ADMIN_IDS.forEach((u) => { if ((S.adminIds[u.id] || 'pending') === 'pending') ids.push({ id: u.id, name: X(u.name), phone: u.phone }); });
    const pend = LISTINGS.filter((l) => (S.listingStatus[l.id] || l.status) === 'pending').concat(S.userListings.filter((l) => l.status === 'pending'));
    const seg = [['ids', T('مراجعة الهويات', 'ID approvals') + ' (' + D(ids.length) + ')'], ['listings', T('مراجعة العقارات', 'Listings') + ' (' + D(pend.length) + ')']].map(([k, l]) => `<button class="${ui.ad === k ? 'on' : ''}" data-act="adTab" data-k="${k}">${l}</button>`).join('');
    const empty = `<p class="muted" style="text-align:center;padding:30px">${T('لا عناصر معلّقة. ✓', 'Nothing pending. ✓')}</p>`;
    const body = ui.ad === 'ids' ? (ids.length ? ids.map((u) => `<div class="card pad"><div class="row between"><div><b>${u.name}</b><div class="muted small" dir="ltr">${u.phone}</div></div>${u.me ? `<span class="badge gold">${T('أنت', 'You')}</span>` : ''}</div>
        <div class="row" style="margin-top:10px"><button class="btn sm ok" data-act="adId" data-id="${u.id}" data-v="approved">${T('موافقة', 'Approve')}</button><button class="btn sm sec" data-act="adId" data-id="${u.id}" data-v="rejected">${T('رفض', 'Reject')}</button></div></div>`).join('') : empty)
      : (pend.length ? pend.map((l) => `<div class="card pad"><b>${X(l.title)}</b><div class="muted small">${X(AREAS[l.area])} · ${egp(l.price)}</div><div class="row" style="margin-top:10px"><button class="btn sm ok" data-act="adList" data-id="${l.id}" data-v="approved">${T('موافقة ونشر', 'Approve & publish')}</button><button class="btn sm sec" data-act="adList" data-id="${l.id}" data-v="rejected">${T('رفض', 'Reject')}</button></div></div>`).join('') : empty);
    return { tab: 'profile', back: '#/profile', title: T('لوحة الإدارة', 'Staff admin'), html: `<div class="banner info">🛠 ${T('عرض الإدارة التجريبي: هكذا يعمل فريقنا.', 'Demo admin view: this is how our staff works.')}</div><div class="seg">${seg}</div>${body}` };
  };

  /* ---------- router + render ---------- */
  function render() {
    clearInterval(ui.timer); ui.timer = null;
    const [, name = 'login', arg] = (location.hash || '#/login').split('/');
    if (!S.auth && name !== 'login' && name !== 'otp') return go('#/login');
    if (S.auth && (name === 'login' || name === 'otp')) return go('#/auctions');
    const fn = R[name]; if (!fn) return go('#/auctions');
    const s = fn(arg); if (s.redirect) return go(s.redirect);
    document.documentElement.lang = S.lang; document.documentElement.dir = ar() ? 'rtl' : 'ltr';
    if (S.theme === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', S.theme);
    const ph = $('phone'); if (s.stage) ph.setAttribute('data-surface', 'stage'); else ph.removeAttribute('data-surface');
    $('top').innerHTML = (s.back ? `<a class="ibtn back" href="${s.back}" aria-label="back">‹</a>` : '') + (s.logo ? `<div class="logo"><img src="assets/logo/lockup-horizontal${s.stage || document.documentElement.dataset.theme === 'dark' ? '-on-navy' : ''}.svg" alt="BEN-BEN"></div>` : `<div class="title">${s.title || ''}</div>`) +
      `<button class="ibtn" data-act="lang" aria-label="language">${ar() ? 'EN' : 'ع'}</button><button class="ibtn" data-act="theme" aria-label="theme">🌓</button>`;
    // pick logo variant by effective theme
    const dark = S.theme === 'dark' || (S.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
    const li = $('top').querySelector('.logo img'); if (li) li.src = 'assets/logo/lockup-horizontal' + (dark || s.stage ? '-on-navy' : '') + '.svg';
    const hero = document.querySelector('.hero img'); if (hero) hero.src = 'assets/logo/lockup-horizontal' + (dark ? '-on-navy' : '') + '.svg';
    const v = $('view'); const keep = v.dataset.route === name ? v.scrollTop : 0;
    v.innerHTML = s.html; v.dataset.route = name; v.scrollTop = keep;
    const hi = v.querySelector('.hero img'); if (hi) hi.src = 'assets/logo/lockup-horizontal' + (dark ? '-on-navy' : '') + '.svg';
    $('nav').style.display = s.nonav ? 'none' : 'flex';
    $('nav').innerHTML = [['auctions', T('المزادات', 'Auctions')], ['explore', T('استكشف', 'Explore')], ['rent', T('إيجار', 'Rent')], ['requests', T('الطلبات', 'Requests')], ['profile', T('حسابي', 'Profile')]].map(([k, l]) => `<a href="#/${k}" class="${s.tab === k ? 'on' : ''}">${svg(k)}${l}</a>`).join('');
    if (name === 'room') ui.timer = setInterval(() => roomTick(arg), 1000);
    if (name === 'requests' && ui.rq === 'rent') setTimeout(() => { if (location.hash === '#/requests') render(); }, 6200);
  }
  window.addEventListener('hashchange', render);

  /* ---------- actions ---------- */
  const A = {
    lang() { S.lang = ar() ? 'en' : 'ar'; save(); render(); },
    theme() { S.theme = { auto: 'light', light: 'dark', dark: 'auto' }[S.theme]; save(); render(); },
    reset() { try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } S = fresh(); ui.rooms = {}; ui.ex = { area: 'all', max: 0, saved: false }; ui.au = 'live'; ui.rq = 'buyer'; closeSheet(); if (location.hash === '#/login') render(); else go('#/login'); toast('Demo reset'); },
    logout() { S.auth = false; save(); go('#/login'); },
    sendOtp() { S.phone = $("phone-in").value || '+20 100 555 0199'; save(); go('#/otp'); },
    verifyOtp() { S.auth = true; save(); go(S.kyc === 'none' ? '#/kyc' : '#/auctions'); },
    upload(el) { S.idDocs[el.dataset.k] = true; save(); render(); },
    submitKyc() { S.kyc = 'pending'; save(); render(); toast(T('تم الإرسال للمراجعة', 'Submitted for review')); },
    approveMe() { S.kyc = 'approved'; save(); render(); toast(T('تمت الموافقة · المستوى T1', 'Approved · Tier T1')); },
    auTab(el) { ui.au = el.dataset.k; render(); },
    remind(el) { const i = S.reminders.indexOf(el.dataset.id); if (i < 0) S.reminders.push(el.dataset.id); else S.reminders.splice(i, 1); save(); render(); },
    joinSheet(el) {
      const a = AUCTIONS.find((x) => x.id === el.dataset.id);
      if (S.kyc !== 'approved') return sheet(`<h2>🔒 ${T('التوثيق مطلوب', 'Verification needed')}</h2><p class="muted" style="margin-bottom:14px">${T('وثّق هويتك للمزايدة.', 'Verify your ID to bid.')}</p><a class="btn" href="#/kyc" data-act="close">${T('وثّق الآن', 'Verify now')}</a>`);
      const ok = S.bal >= a.deposit;
      sheet(`<h2>${T('انضم للمزاد', 'Join the auction')}</h2><p class="muted small" style="margin-bottom:10px">${T('نحجز تأمينًا من محفظتك. يُحرَّر كاملًا إن لم تفز.', 'We lock a deposit from your wallet. Released in full if you do not win.')}</p>
        <div class="card pad"><div class="kv"><span>${T('التأمين', 'Deposit')}</span><b>${egp(a.deposit)}</b></div><div class="kv"><span>${T('رصيدك المتاح', 'Available')}</span><b>${egp(S.bal)}</b></div><div class="kv"><span>${T('بعد الحجز', 'After lock')}</span><b>${egp(S.bal - a.deposit)}</b></div></div>
        ${ok ? `<button class="btn" data-act="join" data-id="${a.id}">🔒 ${T('احجز التأمين وانضم', 'Lock deposit & join')}</button>` : `<div class="banner warn">${T('رصيدك لا يكفي لحجز التأمين.', 'Not enough balance for the deposit.')}</div><a class="btn" href="#/topup" data-act="close">${T('اشحن المحفظة', 'Top up wallet')}</a>`}<button class="btn sec" data-act="close">${T('إلغاء', 'Cancel')}</button>`);
    },
    join(el) { const a = AUCTIONS.find((x) => x.id === el.dataset.id); S.bal -= a.deposit; S.locked += a.deposit; S.joined[a.id] = true; addTx('lock', -a.deposit, T('حجز تأمين', 'Deposit locked') + ' · ' + X(a.title)); save(); closeSheet(); go('#/room/' + a.id); },
    close() { closeSheet(); },
    inc(el) { const a = location.hash.split('/')[2]; room(AUCTIONS.find((x) => x.id === a)).inc = +el.dataset.i; render(); },
    bid(el) { const a = AUCTIONS.find((x) => x.id === el.dataset.id); const r = room(a); if (r.leader === 'me' || r.ended) return; placeBid(a, 'me', r.cur + a.steps[r.inc]); render(); },
    chk(el) { const c = (S.checklist[el.dataset.id] = S.checklist[el.dataset.id] || {}); c[el.dataset.i] = !c[el.dataset.i]; save(); render(); },
    pickAmt(el) { ui.pick = +el.dataset.i; render(); },
    doTopup() { const v = E([50000, 100000, 250000, 500000][ui.pick]); toast('…'); setTimeout(() => { S.bal += v; addTx('topup', v, T('شحن المحفظة (بطاقة تجريبية)', 'Top-up (mock card)')); save(); go('#/wallet'); toast(T('تم الشحن', 'Top-up complete')); }, 700); },
    exArea(el) { ui.ex.area = el.dataset.k; render(); },
    exSaved() { ui.ex.saved = !ui.ex.saved; render(); },
    exSavedGo() { ui.ex.saved = true; },
    save(el, ev) { ev.preventDefault(); ev.stopPropagation(); const id = el.dataset.id, i = S.saved.indexOf(id); if (i < 0) S.saved.push(id); else S.saved.splice(i, 1); save(); render(); },
    toast(el) { toast(el.dataset.m); },
    video() { toast(T('فيديو تجريبي', 'Demo video (placeholder)')); },
    gal(el) { const st = $('strip'); st.children[+el.dataset.i].scrollIntoView({ inline: 'start', block: 'nearest', behavior: 'smooth' }); },
    contact() { toast(T('تم إرسال طلبك للبائع', 'Your message was sent to the seller')); },
    submitListing() {
      S.userListings.push({ id: 'u' + (S.userListings.length + 1), area: $('ln-area').value, type: 'apt', title: { ar: $('ln-title').value, en: $('ln-title').value }, price: E(+$('ln-price').value || 0), beds: 3, baths: 2, size: 160, g: 3, status: 'pending' });
      save(); go('#/explore'); toast(T('أُرسل للمراجعة. وافق عليه من لوحة الإدارة.', 'Sent for review. Approve it from the admin view.'));
    },
    rentSheet(el) { sheet(`<h2>${T('طلب إيجار', 'Rental request')}</h2><label class="field"><span>${T('تاريخ الانتقال', 'Move-in date')}</span><input type="date" id="rr-date" value="2026-12-01"></label>
      <label class="field"><span>${T('المدة', 'Duration')}</span><select id="rr-months"><option value="6">${D(6)} ${T('أشهر', 'months')}</option><option value="12" selected>${D(12)} ${T('شهرًا', 'months')}</option><option value="24">${D(24)} ${T('شهرًا', 'months')}</option></select></label>
      <button class="btn" data-act="rentSend" data-id="${el.dataset.id}">${T('إرسال الطلب', 'Send request')}</button><button class="btn sec" data-act="close">${T('إلغاء', 'Cancel')}</button>`); },
    rentSend(el) { S.rentReqs.push({ rid: el.dataset.id, date: $('rr-date').value, months: +$('rr-months').value, ts: Date.now() }); save(); closeSheet(); render(); toast(T('تم إرسال طلب الإيجار', 'Rental request sent')); },
    rqRent() { ui.rq = 'rent'; },
    rqTab(el) { ui.rq = el.dataset.k; render(); },
    interest(el) { const i = S.interest.indexOf(el.dataset.id); if (i < 0) { S.interest.push(el.dataset.id); toast(T('سنتواصل معك', 'We will contact you')); } else S.interest.splice(i, 1); save(); render(); },
    submitReq() { S.reqs.unshift({ id: 'q' + Date.now(), area: $('rq-area').value, type: $('rq-type').value, max: E(+$('rq-max').value), beds: +$('rq-beds').value }); ui.rq = 'buyer'; save(); go('#/requests'); toast(T('تم الطلب، راجع المطابقات', 'Request created, see the matches')); },
    adTab(el) { ui.ad = el.dataset.k; render(); },
    adId(el) {
      const v = el.dataset.v;
      if (el.dataset.id === 'me') { S.kyc = v === 'approved' ? 'approved' : 'none'; if (v !== 'approved') S.idDocs = {}; } else S.adminIds[el.dataset.id] = v;
      save(); render(); toast(v === 'approved' ? T('تمت الموافقة', 'Approved') : T('تم الرفض', 'Rejected'));
    },
    adList(el) {
      const u = S.userListings.find((l) => l.id === el.dataset.id); if (u) u.status = el.dataset.v; else S.listingStatus[el.dataset.id] = el.dataset.v;
      save(); render(); toast(el.dataset.v === 'approved' ? T('نُشر العقار', 'Listing published') : T('تم الرفض', 'Rejected'));
    }
  };
  document.addEventListener('click', (ev) => {
    if (ev.target.id === 'scrim') return closeSheet();
    const el = ev.target.closest('[data-act]'); if (!el || !A[el.dataset.act]) return;
    A[el.dataset.act](el, ev);
  });
  document.addEventListener('change', (ev) => { if (ev.target.dataset.act === 'exMax') { ui.ex.max = E(+ev.target.value); render(); } });
  document.addEventListener('input', (ev) => {
    const i = ev.target.dataset.otp; if (i === undefined) return;
    ui.otp = ui.otp.split(''); ui.otp[+i] = ev.target.value; ui.otp = ui.otp.join('');
    const n = ev.target.parentNode.children[+i + 1]; if (ev.target.value && n) n.focus();
  });
  document.addEventListener('scroll', (ev) => {
    if (ev.target.id !== 'strip') return; const st = ev.target; const i = Math.round(Math.abs(st.scrollLeft) / st.clientWidth);
    const c = $('gcount'); if (c) c.textContent = D(i + 1) + ' / ' + D(6);
    document.querySelectorAll('.thumbs button').forEach((b, k) => b.classList.toggle('on', k === i));
  }, true);
  $('side-reset').addEventListener('click', A.reset);
  if (!location.hash) location.hash = '#/login';
  render();
  window.__bb = { S, ui };
})();
