/* Cardio Registry — clickable prototype (vanilla JS, hash routing, mock data only) */
'use strict';

// ============================================================ utilities
const KEY = 'cardio-registry-proto';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
Object.assign(ICONS, {
  eyeoff: '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>',
  fastfwd: '<polygon points="13 19 22 12 13 5 13 19"/><polygon points="2 19 11 12 2 5 2 19"/>',
});
const ic = (n, s = 18, style = '') => `<svg class="i" style="width:${s}px;height:${s}px;${style}" viewBox="0 0 24 24">${ICONS[n] || ''}</svg>`;
const pad = (n) => String(n).padStart(2, '0');
const D = (s) => { const [d, t = '00:00'] = s.split('T'); const [y, m, dd] = d.split('-').map(Number); const [h, mi] = t.split(':').map(Number); return new Date(y, m - 1, dd, h, mi); };
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
const MON = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const DOW = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
const fd = (s) => { if (!s) return '–'; const d = D(s); return `${d.getDate()}/${d.getMonth() + 1}/${String(d.getFullYear() + 543).slice(-2)}`; };
const fdl = (s) => { if (!s) return '–'; const d = D(s); return `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear() + 543}`; };
const ft = (s) => (s ? s.slice(11, 16) : '–');
const fdt = (s) => (s ? `${fd(s)} ${ft(s)}` : '–');
const mins = (a, b) => Math.round((D(b) - D(a)) / 60000);
const addMin = (s, m) => iso(new Date(D(s).getTime() + m * 60000));
const sameDay = (a, b) => a && b && a.slice(0, 10) === b.slice(0, 10);
const dur = (m) => { const neg = m < 0; m = Math.abs(m); const h = Math.floor(m / 60), r = m % 60; return (neg ? '-' : '') + (h ? `${h} ชม. ` : '') + `${r} นาที`; };
const hhmm = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
const nowStr = () => S.now;
const cidValid = (c) => /^\d{13}$/.test(c) && (11 - ([...c.slice(0, 12)].reduce((s, d, i) => s + Number(d) * (13 - i), 0) % 11)) % 10 === Number(c[12]);
const cidFmt = (c) => `${c[0]}-${c.slice(1, 5)}-${c.slice(5, 10)}-${c.slice(10, 12)}-${c[12]}`;
const cidMask = (c) => `${c[0]}-${c.slice(1, 5)}-xxxxx-xx-${c[12]}`;

// ============================================================ state
let S;
function load() {
  try { const raw = localStorage.getItem(KEY); if (raw) { const p = JSON.parse(raw); if (p.v === 3) { S = p; return; } } } catch (e) { /* storage unavailable */ }
  S = mockData();
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } }
const user = () => S.users.find((u) => u.id === S.userId) || S.users[0];
const pt = (a) => S.patients[a.hn];
const fullName = (p) => `${p.prefix}${p.fn} ${p.ln}`;
const adm = (an) => S.admissions.find((a) => a.an === an);
const active = () => S.admissions.filter((a) => a.status === 'active');
const dayNo = (a) => Math.floor((D(S.now.slice(0, 10)) - D(a.admitAt.slice(0, 10))) / 864e5) + 1;
const los = (a) => Math.max(1, Math.round((D((a.out?.at || S.now).slice(0, 10)) - D(a.admitAt.slice(0, 10))) / 864e5));
const isSTEMI = (a) => /STEMI/.test(a.dx?.name + ' ' + a.dx?.secondary) && !/NSTEMI/.test(a.dx?.name);
const isACS = (a) => /STEMI|NSTEMI|angina/i.test(a.dx?.name + ' ' + (a.dx?.secondary || ''));
function audit(action, entity, ref, detail) { S.audit.unshift({ at: S.now, user: user().name, action, entity, ref, detail }); }

// ============================================================ ward metrics (LOS, BOR, BTR, Mortality)
function calcWardMetrics(list = S.admissions, periodDays = 30) {
  const bedCount = S.master.bedCount || 16;
  const total = list.length;
  const act = list.filter((a) => a.status === 'active');
  const outs = list.filter((a) => a.status === 'out');
  const improved = outs.filter((a) => a.out?.type === 'ทุเลา').length;
  const refer = outs.filter((a) => a.out?.type === 'Refer back').length;
  const transfer = outs.filter((a) => a.out?.type === 'ย้ายตึก').length;
  const against = outs.filter((a) => a.out?.type === 'ไม่สมัครใจอยู่').length;
  const dead = outs.filter((a) => a.out?.type === 'เสียชีวิต').length;
  const compCount = list.filter((a) => a.comp && a.comp.length > 0).length;

  const totalPatientDays = list.reduce((s, a) => s + los(a), 0);
  const outPatientDays = outs.reduce((s, a) => s + los(a), 0);
  const avgLosAll = total ? (totalPatientDays / total).toFixed(1) : '0.0';
  const avgLosOut = outs.length ? (outPatientDays / outs.length).toFixed(1) : avgLosAll;

  const currentBor = bedCount ? ((active().length / bedCount) * 100).toFixed(1) : '0.0';
  const availBedDays = Math.max(1, bedCount * periodDays);
  const periodBor = Math.min(100, (totalPatientDays / availBedDays) * 100).toFixed(1);

  const disCount = outs.length;
  const btr = bedCount ? (disCount / bedCount).toFixed(2) : '0.00';
  const btrAll = bedCount ? (total / bedCount).toFixed(2) : '0.00';
  const toi = disCount > 0 ? Math.max(0, (availBedDays - totalPatientDays) / disCount).toFixed(1) : '–';

  const mortRateOut = disCount ? ((dead / disCount) * 100).toFixed(1) : '0.0';
  const mortRateAll = total ? ((dead / total) * 100).toFixed(1) : '0.0';
  const stemiList = list.filter((a) => isSTEMI(a));
  const stemiDead = stemiList.filter((a) => a.status === 'out' && a.out?.type === 'เสียชีวิต').length;
  const stemiMortRate = stemiList.length ? ((stemiDead / stemiList.length) * 100).toFixed(1) : '0.0';

  return {
    bedCount, periodDays, total, activeCount: act.length, disCount, improved, refer, transfer, against, dead, compCount,
    totalPatientDays, outPatientDays, avgLosAll, avgLosOut, currentBor, periodBor, btr, btrAll, toi,
    mortRateOut, mortRateAll, stemiDead, stemiCount: stemiList.length, stemiMortRate,
  };
}

const ROLES = {
  nurse: { label: 'พยาบาล', pages: ['beds', 'dashboard', 'patients', 'admit', 'adm', 'procedures', 'notifications', 'me'] },
  head: { label: 'หัวหน้าตึก', pages: ['beds', 'dashboard', 'patients', 'admit', 'adm', 'procedures', 'reports', 'export', 'master', 'audit', 'notifications', 'me'] },
  doctor: { label: 'แพทย์', pages: ['beds', 'dashboard', 'patients', 'admit', 'adm', 'procedures', 'reports', 'export', 'notifications', 'me'] },
  qa: { label: 'QA / เวชสถิติ', pages: ['beds', 'dashboard', 'patients', 'adm', 'reports', 'export', 'me'] },
  admin: { label: 'Admin (IT)', pages: ['master', 'users', 'audit', 'me'] },
};
const can = (page) => ROLES[S.role].pages.includes(page);
const canEdit = () => ['nurse', 'head', 'doctor'].includes(S.role);
const canOverride = () => ['head', 'doctor'].includes(S.role);

// ============================================================ clinical logic
function trInfo(d) {
  const p = S.master.protocol, n = d.logs.length, init = Number(d.meta?.ml || 15);
  const remain = Math.max(0, init - d.logs.reduce((s, l) => s + Number(l.ml), 0));
  const due = remain > 0 ? addMin(d.in, p.first + n * p.every) : null;
  const total = Math.ceil(init / p.step);
  return { remain, due, n, total, left: due ? mins(S.now, due) : null };
}
const isArterial = (d) => /artery|radial/i.test(d.site) && d.type === 'Sheath';
function alerts() {
  const out = [];
  for (const a of active()) {
    const p = pt(a);
    for (const d of a.dev.filter((x) => !x.out)) {
      if (d.type === 'TR-band') {
        const t = trInfo(d);
        if (t.due && t.left <= 30) out.push({ id: `${d.id}-${t.n}`, an: a.an, bed: a.bed, kind: t.left < 0 ? 'danger' : 'warn', icon: 'timer', title: `เตียง ${a.bed} · TR-band ถึงเวลาปล่อยลม`, desc: `ปล่อยลม ${S.master.protocol.step} ml (คงเหลือ ${t.remain} ml) · ${fullName(p)}`, when: t.left < 0 ? `เลยกำหนด ${-t.left} นาที` : `อีก ${t.left} นาที · ${ft(t.due)}`, act: 'deflate', dev: d.id });
        else if (!t.due) out.push({ id: `${d.id}-rm`, an: a.an, bed: a.bed, kind: 'warn', icon: 'timer', title: `เตียง ${a.bed} · TR-band ปล่อยลมหมดแล้ว`, desc: 'ประเมินแผลแล้วบันทึกถอด TR-band', when: 'รอถอด', act: 'removeDev', dev: d.id });
      }
      if (isArterial(d)) {
        const m = mins(d.in, S.now), lim = S.master.protocol.sheathHours * 60;
        if (m >= lim - 30) out.push({ id: `${d.id}-sh`, an: a.an, bed: a.bed, kind: m >= lim ? 'danger' : 'warn', icon: 'alert', title: `เตียง ${a.bed} · Sheath ${d.site.replace(' artery', '')} ${d.size}Fr`, desc: `คาไว้ ${dur(m)} · ตรวจ ACT ก่อนถอด`, when: m >= lim ? `เลยกำหนด ${m - lim} นาที` : `ครบ ${S.master.protocol.sheathHours} ชม. ใน ${lim - m} นาที`, act: 'removeDev', dev: d.id });
      }
      if (d.type === 'ETT') {
        const day = Math.floor(mins(d.in, S.now) / 1440) + 1;
        out.push({ id: `${d.id}-d${day}`, an: a.an, bed: a.bed, kind: 'violet', icon: 'wind', title: `เตียง ${a.bed} · ETT วันที่ ${day}`, desc: 'ประเมิน Weaning (SAT/SBT) ประจำวัน', when: 'ครบกำหนดเวรนี้', act: 'go', tab: 'dev' });
      }
    }
    if (a.dcPending) {
      const c = completeness(a, true);
      if (c.pct < 100) out.push({ id: `${a.an}-dc-${c.missing.length}`, an: a.an, bed: a.bed, kind: 'slate', icon: 'file', title: `เตียง ${a.bed} · ข้อมูลไม่ครบก่อนจำหน่าย`, desc: `ขาด: ${c.missing.join(', ')}`, when: `ความครบถ้วน ${c.pct}%`, act: 'go', tab: 'out' });
    }
  }
  const order = { danger: 0, warn: 1, violet: 2, slate: 3 };
  return out.sort((x, y) => order[x.kind] - order[y.kind]);
}
const unackedAlerts = () => alerts().filter((x) => !S.ack.includes(x.id));

function completeness(a, forDischarge = a.dcPending || a.status === 'out') {
  const p = pt(a), dc = a.status === 'out' ? a.out : a.dcDraft;
  const rules = [
    ['เบอร์โทร/ญาติ', p.phone && p.contact?.phone],
    ['ที่อยู่ (ตำบล)', p.addr?.tambon],
    ['สิทธิการรักษา', p.ins],
    ['Principal Dx', a.dx?.name],
    ['Killip class', a.dx?.killip],
  ];
  if (isSTEMI(a)) rules.push(['SK / Time metrics', a.sk]);
  if (isACS(a) || /failure/i.test(a.dx?.name)) rules.push(['LVEF', a.labs?.lvef]);
  const type = a.status === 'out' ? a.out.type : dc?.type;
  if (forDischarge && type !== 'เสียชีวิต') {
    if (isACS(a) && type !== 'ย้ายตึก') rules.push(['ยากลับบ้าน', MEDS.slice(0, 5).every((m) => dc?.meds?.[m])]);
    if (!type || type === 'ทุเลา') rules.push(['นัดติดตาม', dc?.fu]);
  }
  const missing = rules.filter((r) => !r[1]).map((r) => r[0]);
  return { pct: Math.round(((rules.length - missing.length) / rules.length) * 100), missing, rules };
}

const STATUS_CHIP = (a) => {
  if (a.status === 'active') return `<span class="chip primary"><span class="dot"></span>กำลังรักษา</span>`;
  const t = a.out.type;
  const m = { 'ทุเลา': ['ok', 'check'], 'Refer back': ['info', 'transfer'], 'ย้ายตึก': ['violet', 'bed'], 'เสียชีวิต': ['slate', 'x'], 'ไม่สมัครใจอยู่': ['warn', 'logout'] }[t];
  return `<span class="chip ${m[0]}">${ic(m[1], 13)}${t}</span>`;
};
const devChip = (a, d) => {
  if (d.type === 'TR-band') { const t = trInfo(d); return t.due ? (t.left <= 30 ? `<span class="chip ${t.left < 0 ? 'danger' : 'warn'}">${ic('timer', 13)}TR-band ${t.left < 0 ? 'เลย ' + -t.left : t.left} นาที</span>` : `<span class="chip slate">${ic('timer', 13)}TR-band ${hhmm(mins(d.in, S.now))} ชม.</span>`) : `<span class="chip warn">${ic('timer', 13)}TR-band รอถอด</span>`; }
  if (d.type === 'ETT') return `<span class="chip violet">${ic('wind', 13)}ETT D${Math.floor(mins(d.in, S.now) / 1440) + 1}</span>`;
  if (d.type === 'Sheath') { const m = mins(d.in, S.now), over = isArterial(d) && m >= S.master.protocol.sheathHours * 60; return `<span class="chip ${over ? 'danger' : 'info'}">${ic(over ? 'alert' : 'syringe', 13)}Sheath ${d.site.replace(' artery', '').replace(' vein', ' V')} ${d.size}Fr${over ? ' · ' + hhmm(m) + ' ชม.' : ''}</span>`; }
  return `<span class="chip info">${ic('activity', 13)}${d.type} ${d.site.replace(' artery', '').replace(' vein', '')}</span>`;
};

// ============================================================ UI helpers
function toast(msg, kind = 'ok') {
  let box = $('.toasts'); if (!box) { box = document.createElement('div'); box.className = 'toasts'; document.body.append(box); }
  const t = document.createElement('div'); t.className = `toast ${kind}`; t.innerHTML = `${ic(kind === 'ok' ? 'checkcircle' : 'alertcircle', 17)}<span>${msg}</span>`;
  box.append(t); setTimeout(() => t.remove(), 3200);
}
function modal({ title, body, submit = 'บันทึก', onSubmit, wide, danger, noFooter }) {
  const bg = document.createElement('div'); bg.className = 'modal-bg';
  bg.innerHTML = `<form class="modal ${wide ? 'wide' : ''}" novalidate><div class="modal-h"><h3>${title}</h3><button type="button" class="icon-btn" data-close>${ic('x')}</button></div><div class="modal-b">${body}</div>${noFooter ? '' : `<div class="modal-f"><button type="button" class="btn" data-close>ยกเลิก</button><button class="btn ${danger ? 'danger' : 'primary'}">${submit}</button></div>`}</form>`;
  document.body.append(bg);
  const f = $('form', bg);
  bg.addEventListener('mousedown', (e) => { if (e.target === bg) bg.remove(); });
  bg.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) bg.remove(); });
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    const miss = $$('[required]', f).filter((el) => !el.value.trim());
    $$('.inp', f).forEach((el) => el.classList.remove('err'));
    if (miss.length) { miss.forEach((el) => el.classList.add('err')); toast('กรุณากรอกช่องที่มี * ให้ครบ', 'err'); return; }
    const data = Object.fromEntries(new FormData(f));
    if (onSubmit(data, f) !== false) { bg.remove(); save(); render(); }
  });
  setTimeout(() => $('input:not([type=hidden]),select,textarea', f)?.focus(), 30);
  return f;
}
const F = (label, control, opts = {}) => `<div class="field ${opts.cls || ''}"><span class="label">${label}${opts.req ? ' <span class="req">*</span>' : ''}</span>${control}${opts.help ? `<span class="help">${opts.help}</span>` : ''}</div>`;
const inp = (name, val = '', o = {}) => `<input class="inp ${o.cls || ''}" name="${name}" value="${esc(val)}" type="${o.type || 'text'}" ${o.req ? 'required' : ''} ${o.ph ? `placeholder="${esc(o.ph)}"` : ''} ${o.attrs || ''}>`;
const sel = (name, options, val = '', o = {}) => `<select class="inp" name="${name}" ${o.req ? 'required' : ''} ${o.attrs || ''}>${o.blank !== false ? `<option value="">${o.blank || '— เลือก —'}</option>` : ''}${options.map((x) => { const [v, l] = Array.isArray(x) ? x : [x, x]; return `<option value="${esc(v)}" ${String(v) === String(val) ? 'selected' : ''}>${esc(l)}</option>`; }).join('')}</select>`;
const txt = (name, val = '', o = {}) => `<textarea class="inp" name="${name}" ${o.req ? 'required' : ''} placeholder="${esc(o.ph || '')}">${esc(val)}</textarea>`;
const dt = (name, val = S.now, o = {}) => `<input class="inp num" type="datetime-local" name="${name}" value="${val || ''}" ${o.req ? 'required' : ''}>`;
const card = (title, icon, body, action = '') => `<div class="card"><div class="card-h"><h3>${ic(icon)}${title}</h3>${action}</div><div class="card-b">${body}</div></div>`;
const empty = (msg) => `<div class="empty">${msg}</div>`;
const noAccess = () => `<div class="card empty">${ic('lock', 30)}<div class="b" style="margin-top:8px;color:var(--text)">บทบาท "${ROLES[S.role].label}" ไม่มีสิทธิ์เข้าหน้านี้</div><div class="small">ตามตารางสิทธิ์ในเอกสาร planning ข้อ 1.4 · เปลี่ยนบทบาทได้ที่เมนู "ฉัน"</div></div>`;

// ============================================================ shell
const NAV = [
  ['sec', 'งานประจำวัน'],
  ['beds', '#/beds', 'grid', 'ภาพรวมตึก'],
  ['dashboard', '#/dashboard', 'trend', 'แดชบอร์ดสรุปข้อมูล'],
  ['patients', '#/patients', 'clipboard', 'ทะเบียนผู้ป่วย'],
  ['admit', '#/admit', 'userplus', 'รับผู้ป่วยใหม่ (Admit)'],
  ['procedures', '#/procedures', 'activity', 'หัตถการ / Cath lab'],
  ['notifications', '#/notifications', 'bell', 'การแจ้งเตือน'],
  ['sec', 'วิเคราะห์'],
  ['reports', '#/reports', 'chart', 'รายงานและตัวชี้วัด'],
  ['export', '#/export', 'download', 'ส่งออกข้อมูล'],
  ['sec', 'ผู้ดูแลระบบ'],
  ['master', '#/master', 'database', 'ข้อมูลหลัก (Master data)'],
  ['users', '#/users', 'users', 'ผู้ใช้งานและสิทธิ์'],
  ['audit', '#/audit', 'history', 'Audit log'],
];
function shell(activeKey, mTitle, content) {
  const u = user(), n = unackedAlerts().length;
  let lastSec = null;
  const items = NAV.map((x) => {
    if (x[0] === 'sec') { lastSec = x[1]; return ''; }
    if (!can(x[0])) return '';
    const sec = lastSec ? `<div class="nav-sec">${lastSec}</div>` : ''; lastSec = null;
    const extra = x[0] === 'notifications' && n ? `<span class="badge">${n}</span>` : x[0] === 'patients' ? `<span class="count num">${S.admissions.length}</span>` : x[0] === 'beds' ? `<span class="count num">${active().length}/${S.master.bedCount}</span>` : '';
    return `${sec}<a class="${x[0] === activeKey ? 'on' : ''}" data-go="${x[1]}">${ic(x[2])}${x[3]}${extra}</a>`;
  }).join('');
  const d = D(S.now);
  const shift = d.getHours() >= 8 && d.getHours() < 16 ? 'เวรเช้า' : d.getHours() >= 16 ? 'เวรบ่าย' : 'เวรดึก';
  const bn = [['beds', '#/beds', 'grid', 'หน้าหลัก'], ['dashboard', '#/dashboard', 'trend', 'แดชบอร์ด'], ['patients', '#/patients', 'clipboard', 'ทะเบียน'], ['admit', '#/admit', 'plus', ''], ['notifications', '#/notifications', 'bell', 'แจ้งเตือน'], ['me', '#/me', 'user', 'ฉัน']];
  return `<div class="app" id="app">
    <aside class="sidebar">
      <div class="brand"><div class="logo">${ic('heartpulse', 22)}</div><div><b>Cardio Registry</b><small>ทะเบียนผู้ป่วยตึกหัวใจฯ<br>โรงพยาบาลอุดรธานี</small></div></div>
      <nav class="nav">${items}</nav>
      <div class="side-foot" data-go="#/me" style="cursor:pointer"><div class="avatar">${u.name.replace(/^(พว\.|นพ\.|พญ\.|นาย|นางสาว|นาง)/, '').slice(0, 2)}</div><div class="grow"><div class="b small ellipsis">${u.name}</div><div class="xs muted">${ROLES[S.role].label}</div></div><span data-act="logout" title="ออกจากระบบ" style="color:var(--muted)">${ic('logout')}</span></div>
    </aside>
    <div class="scrim" data-act="closeNav"></div>
    <main class="main">
      <header class="topbar">
        <span class="icon-btn only-m" data-act="openNav">${ic('menu')}</span>
        <div class="m-title only-m">${mTitle}</div>
        ${can('patients') ? `<div class="gs hide-m">${ic('search')}<input id="gs" autocomplete="off" placeholder="ค้นหา HN / AN / ชื่อ-สกุล / เลขบัตรประชาชน   ( / )"><div class="sugg hidden" id="sugg"></div></div>` : ''}
        <div class="grow hide-m"></div>
        <span class="chip primary lg hide-m">${ic('bed', 14)}ตึกหัวใจและหลอดเลือด</span>
        <span class="clock num hide-m" data-act="tick" title="เวลาจำลอง — คลิกเพื่อเดินเวลา +15 นาที">${ic('clock', 14)}${DOW[d.getDay()]} ${fdl(S.now)} · ${ft(S.now)} · ${shift} ${ic('right', 12)}</span>
        ${can('notifications') ? `<span class="icon-btn" data-go="#/notifications">${ic('bell')}${n ? `<span class="badge">${n}</span>` : ''}</span>` : ''}
      </header>
      <div class="content">${content}</div>
    </main>
    <nav class="bottomnav only-m">${bn.filter((b) => can(b[0])).map((b) => b[0] === 'admit' ? `<a data-go="${b[1]}"><span class="fab">${ic('plus', 26)}</span></a>` : `<a class="${b[0] === activeKey ? 'on' : ''}" data-go="${b[1]}">${ic(b[2])}${b[3]}${b[0] === 'notifications' && n ? `<span class="badge">${n}</span>` : ''}</a>`).join('')}</nav>
  </div>`;
}

// ============================================================ pages
const P = {};

// ---------- login
P.login = () => `<div class="login-wrap">
  <div class="login-art">
    <div class="row" style="gap:12px"><div class="logo" style="background:rgba(255,255,255,.15)">${ic('heartpulse', 22)}</div><b style="font-size:18px">Cardio Registry</b></div>
    <div><h1>ทะเบียนผู้ป่วย<br>ตึกหัวใจและหลอดเลือด</h1><p style="opacity:.85;margin-top:10px">โรงพยาบาลอุดรธานี</p></div>
    <div class="hide-sm small" style="opacity:.8">Prototype สำหรับทดสอบ UX · ข้อมูลทั้งหมดเป็นข้อมูลสมมติ<br>ระบบจริงติดตั้งภายในเครือข่ายโรงพยาบาล (on-premise)</div>
  </div>
  <div class="login-form"><form class="login-card" id="loginForm">
    <div><h2 style="font-size:22px">เข้าสู่ระบบ</h2><p class="muted small">ใช้บัญชีที่ได้รับจากศูนย์คอมพิวเตอร์ของโรงพยาบาล</p></div>
    ${F('ชื่อผู้ใช้', inp('username', 'nurse01', { attrs: 'autocomplete="username"' }))}
    ${F('รหัสผ่าน', inp('password', 'demo1234', { type: 'password' }))}
    <div class="field"><span class="label">ทดลองในบทบาท (สำหรับ prototype)</span><div class="roles">${Object.entries(ROLES).map(([k, r]) => `<label class="opt ${k === 'nurse' ? 'on' : ''}" data-act="pickRole" data-role="${k}"><input type="radio" name="role" value="${k}" ${k === 'nurse' ? 'checked' : ''} hidden>${r.label}</label>`).join('')}</div></div>
    <button class="btn primary lg block">${ic('lock')}เข้าสู่ระบบ</button>
    <div class="xs muted" style="text-align:center">${ic('shield', 13)} ทุกการเข้าถึงข้อมูลถูกบันทึกใน Audit log ตาม PDPA</div>
  </form></div></div>`;

// ---------- bed board
P.beds = (q) => {
  const f = q.f || 'all', al = alerts(), un = al.filter((x) => !S.ack.includes(x.id));
  const act = active(), today = S.now.slice(0, 10);
  const admToday = S.admissions.filter((a) => sameDay(a.admitAt, S.now));
  const outToday = S.admissions.filter((a) => a.status === 'out' && sameDay(a.out.at, S.now));
  const pxToday = S.admissions.flatMap((a) => a.px).filter((p) => p.start.startsWith(today));
  const cnt = (arr, key) => Object.entries(arr.reduce((m, x) => ((m[key(x)] = (m[key(x)] || 0) + 1), m), {})).map(([k, v]) => `${k} ${v}`).join(' · ') || '—';
  const beds = Array.from({ length: S.master.bedCount }, (_, i) => ({ n: i + 1, a: act.find((a) => a.bed === i + 1) }));
  const withDev = (b) => b.a && b.a.dev.some((d) => !d.out);
  const filt = { all: () => true, occ: (b) => b.a, dev: withDev, dc: (b) => b.a?.dcPending, empty: (b) => !b.a }[f];
  const bedHtml = beds.filter(filt).map(({ n, a }) => {
    if (!a) return `<div class="bed empty" ${canEdit() ? `data-go="#/admit?bed=${n}"` : ''}><span class="bed-no">เตียง ${n}</span><span class="small">เตียงว่าง</span>${canEdit() ? `<span class="btn sm soft">${ic('plus', 15)}รับผู้ป่วย</span>` : ''}</div>`;
    const p = pt(a), devs = a.dev.filter((d) => !d.out);
    const crit = devs.some((d) => ['ETT', 'IABP'].includes(d.type)) || a.dx.killip === 'IV' || al.some((x) => x.an === a.an && x.kind === 'danger');
    const attn = al.some((x) => x.an === a.an && x.kind === 'warn');
    const chips = devs.map((d) => devChip(a, d)).concat(a.dcPending ? [`<span class="chip ok">${ic('logout', 13)}รอจำหน่าย</span>`] : []);
    return `<div class="bed ${crit ? 'crit' : attn ? 'attn' : ''}" data-go="#/adm/${a.an}">
      <div class="row between"><span class="bed-no">เตียง ${n}</span><span class="day num">D${dayNo(a)}</span></div>
      <div class="nm ellipsis">${fullName(p)}</div>
      <div class="xs muted num">${p.sex} ${p.age} ปี · HN ${p.hn}${p.allergy.length ? ` · <span style="color:var(--danger)">แพ้ยา</span>` : ''}</div>
      <div class="small ellipsis">${a.dx.name}${a.px.length ? ' · ' + a.px[a.px.length - 1].type : ''}</div>
      <div class="devs">${chips.join('') || '<span class="xs muted">ไม่มีอุปกรณ์ที่ต้องติดตาม</span>'}</div></div>`;
  }).join('') || empty('ไม่มีเตียงตามตัวกรองนี้');
  const occ = act.length;
  const octList = S.admissions.filter((a) => a.admitAt.startsWith('2026-10'));
  const wm = calcWardMetrics(octList, 16);
  return `<div class="page-h"><div><h1>ภาพรวมตึก (Bed board)</h1><p>ผู้ป่วยที่อยู่ในตึกขณะนี้ · คลิกการ์ดเพื่อเปิดข้อมูลผู้ป่วย</p></div>
    <div class="row"><button class="btn soft" data-go="#/dashboard">${ic('trend')}แดชบอร์ดสรุปข้อมูล</button><button class="btn" data-act="census">${ic('printer')}พิมพ์ Census ประจำเวร</button>${canEdit() ? `<button class="btn primary" data-go="#/admit">${ic('userplus')}รับผู้ป่วยใหม่</button>` : ''}</div></div>
  <div class="tiles" style="grid-template-columns:repeat(auto-fit,minmax(210px,1fr))">
    <div class="card tile"><div class="lbl">${ic('bed', 16)}อัตราครองเตียง (Occupancy)</div><div class="val num">${wm.currentBor}% <small>(${occ}/${S.master.bedCount} เตียง)</small></div><div class="meter"><i style="width:${wm.currentBor}%"></i></div><div class="sub">ว่าง ${S.master.bedCount - occ} เตียง · เฉลี่ย ต.ค. ${wm.periodBor}%</div></div>
    <div class="card tile"><div class="lbl">${ic('clock', 16)}วันนอนเฉลี่ย (LOS)</div><div class="val num">${wm.avgLosOut} <small>วัน</small></div><div class="sub">สะสม ${wm.totalPatientDays} วันนอน · ทั้งหมดเฉลี่ย ${wm.avgLosAll} วัน</div></div>
    <div class="card tile"><div class="lbl">${ic('transfer', 16)}อัตราหมุนเวียนเตียง (BTR)</div><div class="val num">${wm.btr} <small>ราย/เตียง</small></div><div class="sub">รวมรับใหม่ ${wm.btrAll} ราย/เตียง · จำหน่าย ${wm.disCount} ราย</div></div>
    <div class="card tile"><div class="lbl">${ic('heartpulse', 16)}อัตราตาย (Mortality)</div><div class="val num">${wm.mortRateOut}% <small>(${wm.dead} ราย)</small></div><div class="sub">เทียบทั้งหมด ${wm.mortRateAll}% · STEMI ${wm.stemiMortRate}%</div></div>
    <div class="card tile"><div class="lbl">${ic('userplus', 16)}รับใหม่ / จำหน่ายวันนี้</div><div class="val num">+${admToday.length} <small>/ -${outToday.length} ราย</small></div><div class="sub">หัตถการวันนี้ ${pxToday.length} ครั้ง (${cnt(pxToday, (p) => p.type)})</div></div>
  </div>
  <div class="card"><div class="card-h"><h3>${ic('bell')}การแจ้งเตือนที่ต้องดำเนินการ ${un.length ? `<span class="badge">${un.length}</span>` : ''}</h3><button class="btn ghost sm" data-go="#/notifications">ดูทั้งหมด${ic('right', 15)}</button></div>
    ${un.length ? `<div class="alerts">${un.slice(0, 4).map(alertCard).join('')}</div>` : `<div class="empty">${ic('checkcircle', 22, 'color:var(--ok)')}<div>ไม่มีงานค้าง</div></div>`}</div>
  <div class="card"><div class="card-h" style="flex-wrap:wrap">
      <div class="seg">${[['all', `ทั้งหมด ${S.master.bedCount}`], ['occ', `มีผู้ป่วย ${occ}`], ['dev', `มีอุปกรณ์ ${beds.filter(withDev).length}`], ['dc', `รอจำหน่าย ${act.filter((a) => a.dcPending).length}`], ['empty', `ว่าง ${S.master.bedCount - occ}`]].map(([k, l]) => `<button class="${f === k ? 'on' : ''}" data-go="#/beds?f=${k}">${l}</button>`).join('')}</div>
      <span class="small muted hide-m">${ic('info', 14)} คลิกเวลาที่มุมขวาบนเพื่อเดินเวลาจำลอง +15 นาที แล้วดูการแจ้งเตือนเปลี่ยน</span></div>
    <div class="beds">${bedHtml}</div></div>`;
};
function alertCard(x) {
  const acked = S.ack.includes(x.id);
  const btn = !canEdit() ? '' : x.act === 'deflate' ? `<button class="btn sm primary" data-act="deflate" data-an="${x.an}" data-dev="${x.dev}">บันทึกปล่อยลม</button>` : x.act === 'removeDev' ? `<button class="btn sm soft" data-act="removeDev" data-an="${x.an}" data-dev="${x.dev}">บันทึกถอด</button>` : `<button class="btn sm soft" data-go="#/adm/${x.an}/${x.tab}">เปิด</button>`;
  return `<div class="alert ${x.kind} ${acked ? 'acked' : ''}"><div class="ttl">${ic(x.icon, 16)}${x.title}</div><div class="desc">${x.desc}</div>
    <div class="foot"><span class="chip ${x.kind}">${x.when}</span><div class="row" style="gap:6px">${acked ? '<span class="xs muted">รับทราบแล้ว</span>' : `<button class="btn sm ghost" data-act="ack" data-id="${x.id}" title="รับทราบ">${ic('check', 15)}</button>`}${btn}</div></div></div>`;
}

// ---------- notifications
P.notifications = () => {
  const al = alerts();
  return `<div class="page-h"><div><h1>การแจ้งเตือน</h1><p>สร้างจากอุปกรณ์ที่ใช้อยู่และความครบถ้วนของข้อมูล · ตั้งเกณฑ์ได้ที่ ข้อมูลหลัก → แนวทางอุปกรณ์</p></div>
  ${al.length ? `<button class="btn" data-act="ackAll">${ic('check')}รับทราบทั้งหมด</button>` : ''}</div>
  <div class="card">${al.length ? `<div class="alerts">${al.map(alertCard).join('')}</div>` : empty('ไม่มีการแจ้งเตือน')}</div>
  <div class="card card-b small t2">${ic('info', 15)} ระบบจริงจะเตือนในแอปเท่านั้น และถ้าส่งผ่าน LINE OA ในอนาคต จะส่งเฉพาะ "เตียง + งาน" โดยไม่ส่งชื่อหรือ HN</div>`;
};

// ---------- registry
const DX_GROUPS = [['STEMI', (a) => isSTEMI(a)], ['NSTEMI', (a) => /NSTEMI/.test(a.dx.name)], ['Unstable angina', (a) => /angina/i.test(a.dx.name)], ['Heart failure / Shock', (a) => /failure|shock/i.test(a.dx.name)], ['Arrhythmia', (a) => /block|fibrillation|tachycardia|sinus/i.test(a.dx.name)]];
const PERIODS = [['all', 'ทั้งหมด'], ['today', 'วันนี้'], ['oct', 'ต.ค. 2569'], ['30', '30 วันล่าสุด'], ['fy70', 'ปีงบ 2570'], ['fy69', 'ปีงบ 2569']];
function regFilter(q) {
  const s = (q.q || '').trim().toLowerCase().replace(/-/g, '');
  return S.admissions.filter((a) => {
    const p = pt(a);
    if (s && ![a.an, a.hn, p.cid, (p.fn + ' ' + p.ln).toLowerCase(), fullName(p)].some((v) => String(v).toLowerCase().includes(s))) return false;
    if (q.dx) { const g = DX_GROUPS.find((x) => x[0] === q.dx); if (g && !g[1](a)) return false; }
    if (q.px && !a.px.some((x) => x.type === q.px)) return false;
    const d = a.admitAt;
    if (q.per === 'today' && !sameDay(d, S.now)) return false;
    if (q.per === 'oct' && !d.startsWith('2026-10')) return false;
    if (q.per === '30' && mins(d, S.now) > 30 * 1440) return false;
    if (q.per === 'fy70' && d < '2026-10-01') return false;
    if (q.per === 'fy69' && (d < '2025-10-01' || d >= '2026-10-01')) return false;
    return true;
  }).sort((x, y) => (y.admitAt > x.admitAt ? 1 : -1));
}
P.patients = (q) => {
  const base = regFilter(q), st = q.st || '';
  const rows = st ? base.filter((a) => (st === 'active' ? a.status === 'active' : a.out?.type === st)) : base;
  const per = 10, pages = Math.max(1, Math.ceil(rows.length / per)), page = Math.min(Number(q.page || 1), pages);
  const qs = (o) => '#/patients?' + new URLSearchParams(Object.fromEntries(Object.entries({ ...q, ...o }).filter(([, v]) => v !== '' && v != null))).toString();
  const chip = (k, cls, icon, label, n) => `<span class="chip lg ${cls} ${st === k ? 'sel' : ''}" data-go="${qs({ st: st === k ? '' : k, page: 1 })}">${icon}${label} <b class="num">&nbsp;${n}</b></span>`;
  const n = (t) => base.filter((a) => (t === 'active' ? a.status === 'active' : a.out?.type === t)).length;
  const pxTypes = [...new Set(S.admissions.flatMap((a) => a.px.map((p) => p.type)))].sort();
  return `<div class="page-h"><div><h1>ทะเบียนผู้ป่วย</h1><p>1 แถว = 1 ครั้งที่รับไว้ (AN) · คลิกแถวเพื่อเปิดข้อมูล</p></div>
    <div class="row"><button class="btn" data-act="csv" data-kind="registry">${ic('download')}ส่งออก CSV/Excel</button>${canEdit() ? `<button class="btn primary" data-go="#/admit">${ic('userplus')}รับผู้ป่วยใหม่</button>` : ''}</div></div>
  <div class="card">
    <div class="filters">
      ${F('ค้นหา', `<input class="inp" id="regq" value="${esc(q.q || '')}" placeholder="HN, AN, ชื่อ, เลขบัตร">`, { cls: 'wide' })}
      ${F('ช่วงวันที่ Admit', sel('per', PERIODS, q.per || 'all', { blank: false, attrs: 'data-on="regsel"' }))}
      ${F('กลุ่ม Dx', sel('dx', DX_GROUPS.map((g) => g[0]), q.dx, { blank: 'ทั้งหมด', attrs: 'data-on="regsel"' }))}
      ${F('หัตถการ', sel('px', pxTypes, q.px, { blank: 'ทั้งหมด', attrs: 'data-on="regsel"' }))}
      <button class="btn ghost" data-go="#/patients">${ic('x')}ล้างตัวกรอง</button>
    </div>
    <div class="sum">
      ${chip('', 'slate', '', 'ทั้งหมด', base.length)}
      ${chip('active', 'primary', '<span class="dot"></span>', 'กำลังรักษา', n('active'))}
      ${chip('ทุเลา', 'ok', ic('check', 13), 'ทุเลา', n('ทุเลา'))}
      ${chip('Refer back', 'info', ic('transfer', 13), 'Refer back', n('Refer back'))}
      ${chip('ย้ายตึก', 'violet', ic('bed', 13), 'ย้ายตึก', n('ย้ายตึก'))}
      ${chip('เสียชีวิต', 'slate', ic('x', 13), 'เสียชีวิต', n('เสียชีวิต'))}
      ${chip('ไม่สมัครใจอยู่', 'warn', ic('logout', 13), 'ไม่สมัครใจอยู่', n('ไม่สมัครใจอยู่'))}
    </div>
    <div class="tbl-wrap"><table class="tbl mcards"><thead><tr><th>HN / AN</th><th>ชื่อ-สกุล</th><th>Dx หลัก</th><th>หัตถการ</th><th>Admit</th><th>ออกจากตึก</th><th>LOS</th><th>สถานะ</th><th>ความครบถ้วน</th></tr></thead>
    <tbody>${rows.slice((page - 1) * per, page * per).map((a) => { const p = pt(a), c = completeness(a); return `<tr class="click" data-go="#/adm/${a.an}">
      <td class="num"><div class="b">${a.hn}</div><div class="sub2">AN ${a.an}</div></td>
      <td class="mfull"><div class="b">${fullName(p)}</div><div class="sub2">${p.sex} ${p.age} ปี${a.bed ? ` · เตียง ${a.bed}` : ''}</div></td>
      <td>${a.dx.name}</td><td class="t2">${a.px.map((x) => x.type).join(', ') || '–'}</td>
      <td class="num">${fd(a.admitAt)}</td><td class="num">${a.out ? fd(a.out.at) : '–'}</td><td class="num">${los(a)} วัน</td>
      <td>${STATUS_CHIP(a)}${a.out?.dest ? `<div class="sub2">${a.out.dest}</div>` : ''}</td>
      <td><div class="cmp"><div class="bar"><i class="${c.pct < 80 ? 'lo' : ''}" style="width:${c.pct}%"></i></div><span class="small num">${c.pct}%</span></div></td></tr>`; }).join('') || `<tr><td colspan="9">${empty('ไม่พบข้อมูลตามเงื่อนไข')}</td></tr>`}</tbody></table></div>
    <div class="pager"><span class="small muted">แสดง ${rows.length ? (page - 1) * per + 1 : 0}–${Math.min(page * per, rows.length)} จาก ${rows.length} รายการ</span>
      <div class="pg"><button data-go="${qs({ page: Math.max(1, page - 1) })}">${ic('left', 15)}</button>${Array.from({ length: pages }, (_, i) => `<button class="${i + 1 === page ? 'on' : ''}" data-go="${qs({ page: i + 1 })}">${i + 1}</button>`).join('')}<button data-go="${qs({ page: Math.min(pages, page + 1) })}">${ic('right', 15)}</button></div></div>
  </div>`;
};

// ---------- admit
P.admit = (q) => {
  const freeBeds = Array.from({ length: S.master.bedCount }, (_, i) => i + 1).filter((n) => !active().some((a) => a.bed === n));
  const nextAn = String(Math.max(...S.admissions.map((a) => Number(a.an))) + 1);
  const tambons = Object.entries(TAMBON).map(([k, t]) => [k, `${t.tambon} · ${t.amphoe}`]);
  return `<div class="page-h"><div><div class="crumb"><a class="link" data-go="#/patients">ทะเบียนผู้ป่วย</a>${ic('right', 14)}รับผู้ป่วยใหม่</div><h1>รับผู้ป่วยใหม่ (Admit)</h1></div>
    <div class="row"><button class="btn ghost" data-go="#/patients">ยกเลิก</button><button class="btn" data-act="draft">${ic('save')}บันทึกร่าง</button><button class="btn primary" data-act="admitSubmit">${ic('bed')}บันทึกและรับเข้าเตียง</button></div></div>
  ${freeBeds.length ? '' : `<div class="blockers">${ic('alert', 16)} เตียงเต็ม — ต้องจำหน่ายหรือย้ายผู้ป่วยก่อน</div>`}
  <form class="admit-layout" id="admitForm" novalidate>
    <div class="colstack">
      <div class="card"><div class="sec-h"><span class="n">1</span><h3>ข้อมูลผู้ป่วย</h3></div><div class="sec-b">
        <div class="grid g3" style="align-items:end">
          ${F('HN', inp('hn', '', { req: true, ph: 'เช่น 0234567  (ลองพิมพ์ HN เดิม)', attrs: 'data-on="hnLookup"' }), { req: true })}
          ${F('เลขบัตรประชาชน', inp('cid', '', { req: true, ph: '13 หลัก', attrs: 'data-on="cidCheck" maxlength="17" inputmode="numeric"' }), { req: true, help: '<span id="cidHelp">ตรวจหลักที่ 13 อัตโนมัติ</span>' })}
          <button type="button" class="btn soft" data-act="his">${ic('clouddown')}ดึงจาก HIS <span class="chip violet" style="height:18px;font-size:10.5px">Phase 2</span></button>
        </div>
        <div id="foundBox"></div>
        <div class="grid g4">
          ${F('คำนำหน้า', sel('prefix', ['นาย', 'นาง', 'นางสาว', 'ด.ช.', 'ด.ญ.'], 'นาย', { blank: false }))}
          ${F('ชื่อ', inp('fn', '', { req: true }), { req: true })}
          ${F('นามสกุล', inp('ln', '', { req: true }), { req: true })}
          ${F('เพศ', sel('sex', [['ช', 'ชาย'], ['ญ', 'หญิง']], 'ช', { blank: false }))}
          ${F('อายุ (ปี)', inp('age', '', { type: 'number', req: true, attrs: 'min="0" max="120"' }), { req: true })}
          ${F('สิทธิการรักษา', sel('ins', INSURANCE, '', { req: true }), { req: true })}
          ${F('น้ำหนัก (kg)', inp('wt', '', { type: 'number' }))}
          ${F('ส่วนสูง (cm)', inp('ht', '', { type: 'number' }))}
        </div>
        ${F('ประวัติแพ้ยา / สารทึบรังสี', inp('allergy', '', { ph: 'คั่นด้วยเครื่องหมาย , เช่น Sulfa, Contrast media' }), { help: 'ถ้าไม่มี ให้เว้นว่าง' })}
      </div></div>
      <div class="card"><div class="sec-h"><span class="n">2</span><h3>ที่อยู่และผู้ติดต่อ</h3></div><div class="sec-b">
        <div class="grid g3">${F('บ้านเลขที่', inp('no'))}${F('หมู่', inp('moo'))}${F('ถนน / ซอย', inp('road'))}</div>
        <div class="grid g3">${F('ตำบล', sel('tambon', tambons, '', { req: true, attrs: 'data-on="tambon"' }), { req: true, help: 'เลือกตำบล ระบบเติมที่เหลือให้' })}${F('อำเภอ', inp('amphoe', '', { attrs: 'readonly' }))}${F('จังหวัด / รหัสไปรษณีย์', inp('provzip', '', { attrs: 'readonly' }))}</div>
        <div class="grid g4">${F('โทรศัพท์ผู้ป่วย', inp('phone', '', { req: true, ph: '08x-xxx-xxxx', attrs: 'data-on="phone"' }), { req: true })}${F('ญาติผู้ติดต่อ', inp('cname'))}${F('ความสัมพันธ์', inp('crel'))}${F('โทรศัพท์ญาติ', inp('cphone', '', { attrs: 'data-on="phone"' }))}</div>
      </div></div>
      <div class="card"><div class="sec-h"><span class="n">3</span><h3>ข้อมูลการรับไว้</h3></div><div class="sec-b">
        <div class="grid g3">${F('AN', inp('an', nextAn, { req: true }), { req: true })}${F('วันเวลา Admit', dt('admitAt', S.now, { req: true }), { req: true })}${F('เตียง', sel('bed', freeBeds.map((n) => [n, `เตียง ${n}`]), q.bed || freeBeds[0], { req: true, blank: false }), { req: true, help: `ว่าง ${freeBeds.length} เตียง` })}</div>
        <div class="grid g3">${F('รับจาก', sel('source', ['ER', 'OPD', 'Refer-in', 'ย้ายจากตึกอื่น', 'Cath lab'], 'ER', { blank: false }), { req: true })}${F('โรงพยาบาลต้นทาง (กรณี Refer-in)', sel('refFrom', S.master.hospitals.filter((h) => h.active).map((h) => h.name)))}${F('แพทย์เจ้าของไข้', sel('doctor', DOCTORS, '', { req: true }), { req: true })}</div>
      </div></div>
      <div class="card"><div class="sec-h"><span class="n">4</span><h3>Dx &amp; U/D</h3></div><div class="sec-b">
        <div class="grid" style="grid-template-columns:2fr 1fr">${F('Principal Dx', sel('dx', S.master.dx.filter((d) => d.active).map((d) => [d.icd, `${d.icd} · ${d.name}`]), '', { req: true }), { req: true })}${F('Killip class', sel('killip', ['I', 'II', 'III', 'IV'], 'I', { blank: false }))}</div>
        ${F('Secondary Dx', inp('secondary', '', { ph: 'ถ้ามี' }))}
        <div class="field"><span class="label">Underlying disease (U/D)</span><div class="udgrid">${UD_LIST.map((u) => `<label class="check"><input type="checkbox" name="ud" value="${u}">${u}</label>`).join('')}</div></div>
      </div></div>
    </div>
    <div class="side">
      <div class="card card-b stack" style="gap:14px" id="admitComp"></div>
      <div class="card card-b stack" style="gap:8px"><div class="row b small">${ic('shield', 18, 'color:var(--primary)')}ข้อมูลส่วนบุคคล (PDPA)</div><div class="xs t2">เลขบัตรประชาชนถูกเข้ารหัสในฐานข้อมูล และแสดงแบบปิดบังบางส่วน การเปิดดูเต็มจะถูกบันทึกใน Audit log</div></div>
      <div class="card card-b xs muted">${ic('info', 14)} SK / Time metrics, หัตถการ, อุปกรณ์ และ Complication บันทึกได้ในหน้าผู้ป่วยหลังรับเข้าเตียง</div>
    </div>
  </form>`;
};
function admitCompUpdate() {
  const f = $('#admitForm'); if (!f) return;
  const v = (n) => f.elements[n]?.value?.trim();
  const items = [['HN', v('hn')], ['เลขบัตรประชาชน (ถูกต้อง)', cidValid((v('cid') || '').replace(/\D/g, ''))], ['ชื่อ-สกุล', v('fn') && v('ln')], ['อายุ', v('age')], ['สิทธิการรักษา', v('ins')], ['ที่อยู่ (ตำบล)', v('tambon')], ['โทรศัพท์', /^0\d{8,9}$/.test((v('phone') || '').replace(/\D/g, ''))], ['AN / เวลา / เตียง', v('an') && v('admitAt') && v('bed')], ['แพทย์เจ้าของไข้', v('doctor')], ['Principal Dx', v('dx')]];
  const ok = items.filter((x) => x[1]).length, pct = Math.round((ok / items.length) * 100);
  $('#admitComp').innerHTML = `<div class="row" style="gap:14px"><div class="ring" style="background:conic-gradient(var(--primary) 0 ${pct}%, var(--primary-100) ${pct}% 100%)"><span class="num">${pct}%</span></div><div><div class="b">ความครบถ้วน</div><div class="small muted">ข้อมูลบังคับก่อนรับเข้าเตียง</div></div></div><div class="divider"></div>
    <div class="req-list">${items.map(([l, k]) => `<div style="color:${k ? 'var(--ok)' : 'var(--muted)'}">${ic(k ? 'checkcircle' : 'clock', 16)}${l}</div>`).join('')}</div>`;
}

// ---------- admission record
const TABS = [['summary', 'สรุปทางคลินิก'], ['patient', 'ข้อมูลผู้ป่วย'], ['dx', 'Dx & U/D'], ['sk', 'SK / Time metrics'], ['px', 'หัตถการ'], ['dev', 'อุปกรณ์'], ['comp', 'Complication'], ['out', 'จำหน่าย / ย้ายตึก'], ['history', 'ประวัติแก้ไข']];
P.adm = (q, an, tab = 'summary') => {
  const a = adm(an); if (!a) return `<div class="card empty">ไม่พบ AN ${esc(an)} <a class="link" data-go="#/patients">กลับไปทะเบียน</a></div>`;
  const p = pt(a), c = completeness(a);
  const count = { px: a.px.length, dev: a.dev.filter((d) => !d.out).length, comp: a.comp.length };
  const others = S.admissions.filter((x) => x.hn === a.hn && x.an !== a.an);
  const showCid = S.reveal === a.hn;
  const body = (TAB[tab] || TAB.summary)(a, p);
  return `<div class="crumb"><a class="link" data-go="#/patients">ทะเบียนผู้ป่วย</a>${ic('right', 14)}${fullName(p)}${ic('right', 14)}<b class="t2">AN ${a.an}</b></div>
  <div class="card"><div class="pt">
    <div class="avatar lg">${p.fn.slice(0, 2)}</div>
    <div class="grow"><h2>${fullName(p)} ${STATUS_CHIP(a)}${a.bed ? `<span class="chip primary">เตียง ${a.bed} · D${dayNo(a)}</span>` : ''}${p.allergy.length ? `<span class="chip danger">${ic('alertcircle', 13)}แพ้: ${p.allergy.join(', ')}</span>` : ''}</h2>
      <div class="ids num"><span>${p.sex === 'ช' ? 'ชาย' : 'หญิง'} · <b>${p.age} ปี</b></span><span>HN <b>${p.hn}</b></span><span>AN <b>${a.an}</b></span>
        <span>เลขบัตร <b>${showCid ? cidFmt(p.cid) : cidMask(p.cid)}</b> ${S.role === 'qa' ? '' : `<span data-act="reveal" data-hn="${p.hn}" title="${showCid ? 'ซ่อน' : 'แสดงเต็ม (บันทึก log)'}">${ic(showCid ? 'eyeoff' : 'eye', 15)}</span>`}</span>
        <span>สิทธิ <b>${p.ins}</b></span><span>Admit <b>${fdt(a.admitAt)}</b></span><span>แพทย์ <b>${a.doctor}</b></span>
        <span>ความครบถ้วน <b style="color:${c.pct < 80 ? 'var(--warn)' : 'var(--ok)'}">${c.pct}%</b></span>
        ${others.length ? `<span>${ic('history', 14)} Admit อื่น: ${others.map((o) => `<a class="link" data-go="#/adm/${o.an}">${o.an} (${fd(o.admitAt)})</a>`).join(', ')}</span>` : ''}</div></div>
    <div class="row">${a.status === 'active' && canEdit() ? `<button class="btn" data-act="moveBed" data-an="${a.an}">${ic('bed')}ย้ายเตียง</button><button class="btn" data-go="#/adm/${a.an}/out?o=ย้ายตึก">${ic('transfer')}ย้ายตึก</button><button class="btn primary" data-go="#/adm/${a.an}/out">${ic('logout')}จำหน่าย</button>` : ''}<button class="btn" data-act="print">${ic('printer')}พิมพ์</button></div>
  </div>
  <div class="tabs" style="padding:0 12px">${TABS.map(([k, l]) => `<a class="${k === tab ? 'on' : ''}" data-go="#/adm/${a.an}/${k}">${l}${count[k] ? ` <span class="count">${count[k]}</span>` : ''}</a>`).join('')}</div></div>
  ${body}`;
};
const editBtn = (act, an, label = 'แก้ไข', icon = 'pencil') => (canEdit() ? `<button class="btn ghost sm" data-act="${act}" data-an="${an}">${ic(icon, 15)}${label}</button>` : '');
const addBtn = (act, an, label) => (canEdit() ? `<button class="btn soft sm" data-act="${act}" data-an="${an}">${ic('plus', 15)}${label}</button>` : '');

const TAB = {};
const dxCard = (a) => card('Diagnosis', 'steth', `<div class="stack" style="gap:10px">
  <div><div class="xs muted">Principal Dx</div><div class="b" style="font-size:15px">${a.dx.name}</div><div class="row" style="margin-top:4px"><span class="chip">ICD-10 ${a.dx.icd}</span><span class="chip ${['III', 'IV'].includes(a.dx.killip) ? 'danger' : 'ok'}">Killip ${a.dx.killip}</span></div></div>
  ${a.dx.secondary ? `<div><div class="xs muted">Secondary Dx</div><div class="small">${a.dx.secondary}</div></div>` : ''}
  <div class="divider"></div><div><div class="xs muted" style="margin-bottom:6px">Underlying disease (U/D)</div><div class="row wrap" style="gap:6px">${UD_LIST.map((u) => (a.ud.includes(u) ? `<span class="chip primary">${ic('check', 13)}${u}</span>` : '')).join('') || '<span class="xs muted">ไม่มีโรคประจำตัว</span>'}</div></div>
  <div class="divider"></div><div class="grid g3" style="gap:8px">${[['Trop-T (ng/L)', a.labs.trop], ['Cr / eGFR', a.labs.cr ? `${a.labs.cr} / ${a.labs.egfr || '–'}` : ''], ['LVEF (%)', a.labs.lvef]].map(([k, v]) => `<div class="metric"><div class="k">${k}</div><div class="v num">${v || '–'}</div></div>`).join('')}</div></div>`, editBtn('editDx', a.an));
function skBody(a) {
  const s = a.sk;
  if (!s) return isSTEMI(a) ? `<div class="blockers">${ic('alert', 15)} ผู้ป่วย STEMI ยังไม่ได้บันทึกข้อมูล SK / Time metrics</div>` : '<div class="small muted">ไม่ใช่ STEMI — ไม่ต้องบันทึก (บันทึกได้ถ้าต้องการ)</div>';
  const d2n = s.given && s.door && s.needle ? mins(s.door, s.needle) : null;
  const d2b = s.door && s.device ? mins(s.door, s.device) : null;
  return `<div class="stack" style="gap:12px">
    <div class="row wrap">${s.given ? `<span class="chip info">${ic('syringe', 13)}ให้ ${s.drug || 'SK'} ที่ ${s.place}</span>` : `<span class="chip">ไม่ได้ให้ยาละลายลิ่มเลือด</span><span class="small t2">${s.reason || ''}</span>`}</div>
    <div class="grid g4 num" style="gap:8px">${[['Onset', s.onset], ['Door', s.door], [s.given ? 'Needle' : 'Device', s.given ? s.needle : s.device], [s.given ? 'SK หมด' : '—', s.given ? s.end : '']].map(([k, v]) => `<div class="metric"><div class="k">${k}</div><div class="v">${v ? ft(v) : '–'}</div>${v ? `<div class="xs muted">${fd(v)}</div>` : ''}</div>`).join('')}</div>
    ${d2n != null ? `<div class="kpi-ok ${d2n > 30 ? 'bad' : ''}"><b>${ic(d2n > 30 ? 'alertcircle' : 'checkcircle', 16)} Door-to-needle ${d2n} นาที</b><span class="xs">เป้าหมาย ≤ 30 นาที</span></div>` : ''}
    ${d2b != null ? `<div class="kpi-ok ${d2b > 90 ? 'bad' : ''}"><b>${ic(d2b > 90 ? 'alertcircle' : 'checkcircle', 16)} Door-to-device ${d2b} นาที</b><span class="xs">เป้าหมาย ≤ 90 นาที</span></div>` : ''}
    ${s.onset && (s.needle || s.device) ? `<div class="small t2">Total ischemic time: <b>${dur(mins(s.onset, s.needle || s.device))}</b></div>` : ''}
    ${s.given ? `<dl class="kv"><dt>ผล Reperfusion</dt><dd><span class="chip ${s.result === 'สำเร็จ' ? 'ok' : 'danger'}">${s.result || '–'}</span></dd><dt>ภาวะแทรกซ้อน</dt><dd>${s.comp || 'ไม่มี'}</dd></dl>` : ''}</div>`;
}
const pxItem = (a, x) => `<div class="item"><div class="row between"><div class="b">${x.type}${x.vessel && x.vessel !== '-' ? ` to ${x.vessel}` : ''}</div><span class="chip ${x.result === 'สำเร็จ' ? 'ok' : 'warn'}">${x.result}</span></div>
  <div class="xs muted num">${fdt(x.start)} – ${ft(x.end)} · ${x.operator}</div>
  <div class="pxgrid num">${[['Access', x.access && x.access !== '-' ? `${x.access}${x.sheath ? ' ' + x.sheath + 'Fr' : ''}` : ''], ['Stent', x.stent], ['TIMI', x.timiPre ? `${x.timiPre} → ${x.timiPost}` : ''], ['Contrast', x.contrast ? x.contrast + ' ml' : ''], ['Fluoro', x.fluoro ? x.fluoro + ' นาที' : '']].filter((r) => r[1] && r[1] !== '-').map(([k, v]) => `<div><span>${k}</span> ${v}</div>`).join('')}</div></div>`;
function devItem(a, d, full) {
  const live = !d.out;
  if (d.type === 'TR-band' && live) {
    const t = trInfo(d);
    return `<div class="item warn"><div class="hd"><span class="ic-box">${ic('timer', 16)}</span><div class="grow"><div class="b">TR-band · ${d.site}</div><div class="xs muted num">ใส่ ${fdt(d.in)} · ลมเริ่มต้น ${d.meta.ml} ml · ผ่านมา ${hhmm(mins(d.in, S.now))} ชม.</div></div><span class="chip warn">ใช้งานอยู่</span></div>
      <div class="steps">${Array.from({ length: t.total }, (_, i) => `<i class="${i < t.n ? 'done' : ''}"></i>`).join('')}</div>
      <div class="row between wrap"><span class="small">${t.due ? `<b>ปล่อยลมครั้งถัดไป ${ft(t.due)}</b> <span class="${t.left < 0 ? '' : 'muted'}" style="${t.left < 0 ? 'color:var(--danger);font-weight:600' : ''}">· ${t.left < 0 ? 'เลยกำหนด ' + -t.left : 'อีก ' + t.left} นาที</span> · คงเหลือ ${t.remain} ml` : '<b>ปล่อยลมครบแล้ว — รอถอด</b>'}</span>
      ${canEdit() ? `<div class="row" style="gap:6px"><button class="btn sm" data-act="removeDev" data-an="${a.an}" data-dev="${d.id}">ถอด</button>${t.due ? `<button class="btn sm primary" data-act="deflate" data-an="${a.an}" data-dev="${d.id}">บันทึกปล่อยลม</button>` : ''}</div>` : ''}</div>
      ${full && d.logs.length ? `<div class="divider"></div><div class="xs t2">${d.logs.map((l) => `${ft(l.at)} ปล่อย ${l.ml} ml · ${l.ok ? 'ประเมินปกติ' : '<b style="color:var(--danger)">พบปัญหา</b>'} · ${l.by}`).join('<br>')}</div>` : ''}</div>`;
  }
  const icon = { 'ETT': 'wind', 'Sheath': 'syringe', 'TR-band': 'timer' }[d.type] || 'activity';
  const days = Math.max(1, Math.ceil(mins(d.in, d.out || S.now) / 1440));
  const over = live && isArterial(d) && mins(d.in, S.now) >= S.master.protocol.sheathHours * 60;
  return `<div class="item ${over ? 'danger' : ''}"><div class="hd"><span class="ic-box">${ic(icon, 16)}</span><div class="grow"><div class="b">${d.type} · ${d.site}${d.size && d.size !== '-' ? ' ' + d.size + (d.type === 'ETT' ? '' : 'Fr') : ''}</div>
    <div class="xs muted num">ใส่ ${fdt(d.in)}${d.out ? ` · ถอด ${fdt(d.out)}` : ` · ${d.type === 'Sheath' ? 'คาไว้ ' + dur(mins(d.in, S.now)) : 'device-day ' + days}`}${d.meta?.act ? ` · ACT ${d.meta.act}` : ''}${d.meta?.ratio ? ` · ${d.meta.ratio}` : ''}</div></div>
    ${live ? `<span class="chip ${over ? 'danger' : 'info'}">${over ? 'เลยกำหนด' : 'ใช้งานอยู่'}</span>${canEdit() ? `<button class="btn sm" data-act="removeDev" data-an="${a.an}" data-dev="${d.id}">ถอด</button>` : ''}` : `<span class="chip ok">${ic('check', 13)}ถอดแล้ว</span>`}</div></div>`;
}
const compItem = (c) => `<div class="item ${c.sev === 'รุนแรง' ? 'danger' : 'warn'}"><div class="row between"><div class="b">${c.type}</div><span class="chip ${c.sev === 'รุนแรง' ? 'danger' : 'warn'}">${c.sev}</span></div><div class="xs muted num">${fdt(c.at)}${c.rel ? ' · สัมพันธ์กับ: ' + c.rel : ''}</div>${c.mgmt ? `<div class="small">${c.mgmt}</div>` : ''}</div>`;
const mvTimeline = (a) => `<div class="tl">${a.mv.map((m, i) => `<div class="tl-item"><span class="tl-dot" ${i < a.mv.length - 1 || a.status === 'out' ? 'style="background:var(--muted);box-shadow:0 0 0 3px var(--slate-bg)"' : ''}></span><div><div class="small b">${m.from} → ${m.to}</div><div class="xs muted num">${fdt(m.at)}${m.reason ? ' · ' + m.reason : ''}</div></div></div>`).join('')}${a.status === 'out' ? `<div class="tl-item"><span class="tl-dot" style="background:var(--slate)"></span><div><div class="small b">ออกจากตึก: ${a.out.type}${a.out.dest ? ' · ' + a.out.dest : ''}</div><div class="xs muted num">${fdt(a.out.at)}</div></div></div>` : ''}</div>`;

TAB.summary = (a) => `<div class="cols3">
  <div class="colstack">${dxCard(a)}${card('การเคลื่อนย้าย', 'transfer', mvTimeline(a))}</div>
  <div class="colstack">${card('SK / Time metrics', 'syringe', skBody(a), editBtn('editSk', a.an))}
    ${card('หัตถการ', 'activity', a.px.length ? `<div class="stack" style="gap:10px">${a.px.map((x) => pxItem(a, x)).join('')}</div>` : '<div class="small muted">ยังไม่มีหัตถการ</div>', addBtn('addPx', a.an, 'เพิ่มหัตถการ'))}</div>
  <div class="colstack">${card('อุปกรณ์', 'timer', a.dev.length ? `<div class="stack" style="gap:10px">${a.dev.slice().sort((x, y) => !!x.out - !!y.out).map((d) => devItem(a, d)).join('')}</div>` : '<div class="small muted">ไม่มีอุปกรณ์ (ETT / TR-band / Sheath)</div>', addBtn('addDev', a.an, 'เพิ่มอุปกรณ์'))}
    ${card('Complication', 'alert', a.comp.length ? `<div class="stack" style="gap:10px">${a.comp.map(compItem).join('')}</div>` : '<div class="small muted">ไม่มีภาวะแทรกซ้อน</div>', addBtn('addComp', a.an, 'เพิ่ม'))}</div></div>`;
TAB.patient = (a, p) => `<div class="cols2">
  ${card('ข้อมูลส่วนตัว', 'user', `<dl class="kv"><dt>ชื่อ-สกุล</dt><dd>${fullName(p)}</dd><dt>เพศ / อายุ</dt><dd>${p.sex === 'ช' ? 'ชาย' : 'หญิง'} · ${p.age} ปี</dd><dt>HN</dt><dd class="num">${p.hn}</dd><dt>เลขบัตรประชาชน</dt><dd class="num">${S.reveal === p.hn ? cidFmt(p.cid) : cidMask(p.cid)}</dd><dt>สิทธิการรักษา</dt><dd>${p.ins}</dd><dt>กรุ๊ปเลือด</dt><dd>${p.blood || '–'}</dd><dt>น้ำหนัก / ส่วนสูง</dt><dd class="num">${p.wt || '–'} kg / ${p.ht || '–'} cm${p.wt && p.ht ? ` · BMI ${(p.wt / (p.ht / 100) ** 2).toFixed(1)}` : ''}</dd><dt>แพ้ยา</dt><dd>${p.allergy.length ? p.allergy.map((x) => `<span class="chip danger">${x}</span>`).join(' ') : 'ไม่มีประวัติแพ้'}</dd></dl>`, editBtn('editPatient', a.an))}
  ${card('ที่อยู่และผู้ติดต่อ', 'pin', `<dl class="kv"><dt>ที่อยู่</dt><dd>${p.addr.no} หมู่ ${p.addr.moo}${p.addr.road ? ' ' + p.addr.road : ''} ต.${p.addr.tambon} อ.${p.addr.amphoe} จ.${p.addr.prov} ${p.addr.zip}</dd><dt>โทรศัพท์</dt><dd class="num">${p.phone || '–'}</dd><dt>ญาติผู้ติดต่อ</dt><dd>${p.contact?.name || '–'} ${p.contact?.rel ? `(${p.contact.rel})` : ''}</dd><dt>โทรศัพท์ญาติ</dt><dd class="num">${p.contact?.phone || '–'}</dd></dl>`, editBtn('editPatient', a.an))}
  ${card('ข้อมูลการรับไว้', 'bed', `<dl class="kv"><dt>AN</dt><dd class="num">${a.an}</dd><dt>วันเวลา Admit</dt><dd class="num">${fdt(a.admitAt)}</dd><dt>รับจาก</dt><dd>${a.source}${a.refFrom ? ' · ' + a.refFrom : ''}</dd><dt>เตียง</dt><dd>${a.bed || '–'}</dd><dt>แพทย์เจ้าของไข้</dt><dd>${a.doctor}</dd><dt>วันนอน</dt><dd>${los(a)} วัน</dd></dl>`)}
  ${card('ประวัติการ Admit ทั้งหมด', 'history', `<table class="tbl"><tbody>${S.admissions.filter((x) => x.hn === a.hn).map((x) => `<tr class="click" data-go="#/adm/${x.an}"><td class="num b">${x.an}</td><td class="num">${fd(x.admitAt)}</td><td>${x.dx.name}</td><td>${STATUS_CHIP(x)}</td></tr>`).join('')}</tbody></table>`)}</div>`;
TAB.dx = (a) => `<div class="cols2">${dxCard(a)}
  ${card('แก้ไขด่วน', 'sliders', `<div class="stack" style="gap:14px"><div class="field"><span class="label">Killip class</span><div class="seg" style="align-self:flex-start">${['I', 'II', 'III', 'IV'].map((k) => `<button class="${a.dx.killip === k ? 'on' : ''}" ${canEdit() ? `data-act="killip" data-an="${a.an}" data-k="${k}"` : 'disabled'}>${k}</button>`).join('')}</div></div>
   <div class="field"><span class="label">Underlying disease (U/D) — คลิกเพื่อเลือก/ยกเลิก</span><div class="udgrid">${UD_LIST.map((u) => `<label class="check"><input type="checkbox" ${a.ud.includes(u) ? 'checked' : ''} ${canEdit() ? `data-on="ud" data-an="${a.an}" value="${u}"` : 'disabled'}>${u}</label>`).join('')}</div></div>
   ${canEdit() ? `<button class="btn" data-act="editLabs" data-an="${a.an}" style="align-self:flex-start">${ic('pencil', 15)}แก้ไขผล Lab</button>` : ''}</div>`)}</div>`;
TAB.sk = (a) => `<div class="cols2">${card('SK / ยาละลายลิ่มเลือด และ Time metrics', 'syringe', skBody(a), editBtn('editSk', a.an, a.sk ? 'แก้ไข' : 'บันทึก', a.sk ? 'pencil' : 'plus'))}
  ${card('นิยามที่ใช้คำนวณ', 'info', `<dl class="kv small"><dt>Door-to-needle</dt><dd>เวลาเริ่มยา − เวลาถึงโรงพยาบาลที่ให้ยา (เป้า ≤ 30 นาที)</dd><dt>Door-to-device</dt><dd>เวลา balloon/device − เวลาถึงโรงพยาบาล (เป้า ≤ 90 นาที)</dd><dt>Total ischemic time</dt><dd>เวลาเริ่มรักษา − เวลาเริ่มมีอาการ</dd></dl>`)}</div>`;
TAB.px = (a) => card(`หัตถการ (${a.px.length})`, 'activity', a.px.length ? `<div class="grid-auto" style="grid-template-columns:repeat(auto-fill,minmax(340px,1fr))">${a.px.map((x) => pxItem(a, x)).join('')}</div>` : empty('ยังไม่มีหัตถการ'), addBtn('addPx', a.an, 'เพิ่มหัตถการ'));
TAB.dev = (a) => `<div class="cols2">${card('อุปกรณ์ที่ใช้อยู่', 'timer', a.dev.filter((d) => !d.out).map((d) => devItem(a, d, true)).join('<div style="height:10px"></div>') || '<div class="small muted">ไม่มีอุปกรณ์ที่ใช้อยู่</div>', addBtn('addDev', a.an, 'เพิ่มอุปกรณ์'))}
  ${card('ถอดแล้ว / ประวัติ', 'history', a.dev.filter((d) => d.out).map((d) => devItem(a, d, true)).join('<div style="height:10px"></div>') || '<div class="small muted">—</div>')}</div>
  <div class="card card-b small t2">${ic('info', 15)} แนวทาง TR-band: เริ่มปล่อยลมหลังใส่ ${S.master.protocol.first} นาที แล้วปล่อยครั้งละ ${S.master.protocol.step} ml ทุก ${S.master.protocol.every} นาที · Sheath แดงเตือนเมื่อครบ ${S.master.protocol.sheathHours} ชม. (ตั้งค่าได้ที่ข้อมูลหลัก)</div>`;
TAB.comp = (a) => card(`Complication (${a.comp.length})`, 'alert', a.comp.length ? `<div class="grid-auto" style="grid-template-columns:repeat(auto-fill,minmax(320px,1fr))">${a.comp.map(compItem).join('')}</div>` : empty('ไม่มีภาวะแทรกซ้อน'), addBtn('addComp', a.an, 'เพิ่ม Complication'));
TAB.history = (a) => { const rows = S.audit.filter((x) => x.ref === a.an || x.ref === a.hn); return card('ประวัติการแก้ไข (จาก Audit log)', 'history', rows.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>เวลา</th><th>ผู้ใช้</th><th>การกระทำ</th><th>รายละเอียด</th></tr></thead><tbody>${rows.map((r) => `<tr><td class="num">${fdt(r.at)}</td><td>${r.user}</td><td><span class="chip">${r.action}</span></td><td>${r.detail}</td></tr>`).join('')}</tbody></table></div>` : empty('ยังไม่มีประวัติ')); };
TAB.out = (a) => {
  if (a.status === 'out') {
    const o = a.out;
    return `<div class="cols2">${card('ผลการออกจากตึก', 'logout', `<dl class="kv"><dt>สถานะ</dt><dd>${STATUS_CHIP(a)}</dd><dt>วันเวลา</dt><dd class="num">${fdt(o.at)}</dd>${o.dest ? `<dt>ปลายทาง</dt><dd>${o.dest}</dd>` : ''}${o.cause ? `<dt>สาเหตุการเสียชีวิต</dt><dd>${o.cause}</dd>` : ''}<dt>วันนอน</dt><dd>${los(a)} วัน</dd><dt>สรุปผลการรักษา</dt><dd>${o.summary || '–'}</dd><dt>ยากลับบ้าน</dt><dd>${Object.entries(o.meds || {}).map(([m, v]) => `<span class="chip ${v === 'ให้' ? 'primary' : ''}" style="margin:0 4px 4px 0">${m}: ${v}</span>`).join('') || '–'}</dd><dt>นัดติดตาม</dt><dd>${o.fu ? fdl(o.fu) : '–'}</dd>${o.override ? `<dt>Override</dt><dd style="color:var(--warn)">${o.override}</dd>` : ''}</dl>`)}${card('การเคลื่อนย้าย', 'transfer', mvTimeline(a))}</div>`;
  }
  if (!canEdit()) return card('จำหน่าย / ย้ายตึก', 'logout', '<div class="small muted">บทบาทนี้ดูได้อย่างเดียว</div>');
  const dc = a.dcDraft, sel0 = dc.type || new URLSearchParams(location.hash.split('?')[1] || '').get('o') || '';
  if (!dc.type && sel0) dc.type = sel0;
  const liveDev = a.dev.filter((d) => !d.out);
  const c = completeness(a, true);
  const needDev = sel0 !== 'เสียชีวิต' && liveDev.length;
  const blockers = [...(needDev ? liveDev.map((d) => `ยังไม่ได้ถอด ${d.type} (${d.site})`) : []), ...(sel0 === 'เสียชีวิต' ? [] : c.missing.map((m) => `ข้อมูลไม่ครบ: ${m}`))];
  const opt = (t, cls, icon) => `<div class="opt ${sel0 === t ? 'on' : ''}" data-act="dcType" data-an="${a.an}" data-t="${t}"><span class="ic-box" style="background:var(--${cls}-bg);color:var(--${cls})">${ic(icon, 16)}</span>${t === 'ทุเลา' ? 'ทุเลา (กลับบ้าน)' : t}</div>`;
  return `<div class="cols2"><div class="card"><div class="card-h"><h3>${ic('logout')}จำหน่าย / ออกจากตึก</h3><label class="check small"><input type="checkbox" ${a.dcPending ? 'checked' : ''} data-on="dcPending" data-an="${a.an}">ตั้งสถานะ "รอจำหน่าย"</label></div>
    <form class="card-b stack" style="gap:14px" id="dcForm" data-an="${a.an}" novalidate>
      <div class="field"><span class="label">สถานะการออกจากตึก <span class="req">*</span></span><div class="opts">${opt('ทุเลา', 'ok', 'home')}${opt('Refer back', 'info', 'transfer')}${opt('ย้ายตึก', 'violet', 'bed')}${opt('เสียชีวิต', 'slate', 'x')}${opt('ไม่สมัครใจอยู่', 'warn', 'logout')}</div></div>
      ${sel0 ? `<div class="grid g2">${F('วันเวลา', dt('at', S.now, { req: true }), { req: true })}
        ${sel0 === 'Refer back' ? F('โรงพยาบาลปลายทาง', sel('dest', S.master.hospitals.filter((h) => h.active).map((h) => h.name), a.refFrom || '', { req: true }), { req: true }) : ''}
        ${sel0 === 'ย้ายตึก' ? F('ย้ายไปตึก', sel('dest', S.master.wards.filter((w) => w.active).map((w) => w.name), '', { req: true }), { req: true }) : ''}
        ${sel0 === 'เสียชีวิต' ? F('สาเหตุการเสียชีวิต', inp('cause', '', { req: true }), { req: true }) : ''}</div>
      ${F('สรุปผลการรักษา', `<textarea class="inp" name="summary" data-on="dcText" data-an="${a.an}" data-k="summary">${esc(dc.summary || '')}</textarea>`)}
      ${!['เสียชีวิต', 'ย้ายตึก'].includes(sel0) ? `<div class="field"><span class="label">ยากลับบ้าน ${isACS(a) ? '(บังคับสำหรับ ACS: 5 กลุ่มแรก)' : ''}</span><div class="grid g2" style="gap:8px">${MEDS.map((m) => `<div class="row between" style="border:1px solid var(--border);border-radius:9px;padding:4px 4px 4px 10px"><span class="small">${m}</span><select class="inp" style="width:150px;height:34px" data-on="med" data-an="${a.an}" data-m="${m}">${['', 'ให้', 'ไม่ให้ (มีข้อห้าม)', 'ไม่ให้ (อื่น ๆ)'].map((v) => `<option ${dc.meds[m] === v ? 'selected' : ''} value="${v}">${v || '— ระบุ —'}</option>`).join('')}</select></div>`).join('')}</div></div>
        ${F('นัดติดตาม', `<input class="inp" type="date" value="${dc.fu || ''}" data-on="dcText" data-an="${a.an}" data-k="fu">`)}` : ''}
      ${blockers.length ? `<div class="blockers"><b>${ic('alertcircle', 15)} ยังจำหน่ายไม่ได้ (${blockers.length} รายการ)</b>${blockers.map((b) => `<div>• ${b}</div>`).join('')}</div>
        ${canOverride() ? `${F('Override โดยหัวหน้าตึก/แพทย์ — ระบุเหตุผล', inp('override', '', { ph: 'เช่น ญาติขอรับกลับด่วน / ส่งต่อฉุกเฉิน' }))}` : '<div class="xs muted">ต้องให้หัวหน้าตึกหรือแพทย์ override ถ้าจำเป็นต้องจำหน่ายทันที</div>'}` : '<div class="okbox">' + ic('checkcircle', 15) + ' ข้อมูลครบ พร้อมจำหน่าย</div>'}
      <button class="btn primary lg" data-act="dcSubmit" data-an="${a.an}" ${blockers.length && !canOverride() ? 'disabled' : ''}>${ic('check')}ยืนยัน${sel0 === 'ย้ายตึก' ? 'การย้ายตึก' : 'การจำหน่าย'}</button>` : '<div class="small muted">เลือกสถานะเพื่อกรอกข้อมูลต่อ</div>'}
    </form></div>
    ${card('การเคลื่อนย้าย', 'transfer', mvTimeline(a))}</div>`;
};

// ---------- procedures (cath lab view)
P.procedures = (q) => {
  const all = S.admissions.flatMap((a) => a.px.map((x) => ({ a, x }))).filter(({ x }) => !q.t || x.type === q.t).sort((m, n) => (n.x.start > m.x.start ? 1 : -1));
  const types = [...new Set(S.admissions.flatMap((a) => a.px.map((x) => x.type)))].sort();
  return `<div class="page-h"><div><h1>หัตถการ / Cath lab</h1><p>หัตถการทั้งหมดของผู้ป่วยในทะเบียน · คลิกแถวเพื่อเปิดผู้ป่วย</p></div><button class="btn" data-act="csv" data-kind="procedures">${ic('download')}ส่งออก CSV</button></div>
  <div class="card"><div class="filters"><div class="seg" style="flex-wrap:wrap">${[['', 'ทั้งหมด']].concat(types.map((t) => [t, t])).map(([k, l]) => `<button class="${(q.t || '') === k ? 'on' : ''}" data-go="#/procedures${k ? '?t=' + encodeURIComponent(k) : ''}">${l}</button>`).join('')}</div></div>
  <div class="tbl-wrap"><table class="tbl mcards"><thead><tr><th>วันเวลา</th><th>หัตถการ</th><th>ผู้ป่วย</th><th>Access</th><th>ผลลัพธ์</th><th>ผู้ทำ</th></tr></thead><tbody>
  ${all.map(({ a, x }) => `<tr class="click" data-go="#/adm/${a.an}/px"><td class="num">${fdt(x.start)}</td><td class="b mfull">${x.type}${x.vessel && x.vessel !== '-' ? ` · ${x.vessel}` : ''}</td><td>${fullName(pt(a))} <span class="sub2">AN ${a.an}</span></td><td>${x.access && x.access !== '-' ? x.access + (x.sheath ? ' ' + x.sheath + 'Fr' : '') : '–'}</td><td><span class="chip ${x.result === 'สำเร็จ' ? 'ok' : 'warn'}">${x.result}</span></td><td class="t2">${x.operator}</td></tr>`).join('') || `<tr><td colspan="6">${empty('ไม่มีข้อมูล')}</td></tr>`}</tbody></table></div></div>`;
};

// ---------- dashboard (สรุปสถิติหอผู้ป่วยตามไฟล์อ้างอิง CCU_UdonThani_Patient_Registry.html)
function countByField(list, getter) {
  const counts = {};
  list.forEach((item) => {
    const k = getter(item);
    if (Array.isArray(k)) k.forEach((x) => { if (x) counts[x] = (counts[x] || 0) + 1; });
    else if (k) counts[k] = (counts[k] || 0) + 1;
  });
  return counts;
}
function renderDashBars(countsObj, total, color = 'var(--primary)', sort = true) {
  const entries = Object.entries(countsObj);
  if (sort) entries.sort((a, b) => b[1] - a[1]);
  if (!entries.length) return empty('ยังไม่มีข้อมูล');
  return `<div class="dash-bars">${entries.map(([label, count]) => {
    const pct = total ? Math.round((count / total) * 100) : 0;
    return `<div class="bar-row">
      <div class="bar-label"><span>${esc(label)}</span><strong class="num">${count} ราย (${pct}%)</strong></div>
      <div class="bar-track"><div class="bar-fill" style="width:${Math.min(100, pct)}%;background:${color}"></div></div>
    </div>`;
  }).join('')}</div>`;
}
P.dashboard = (q) => {
  const per = q.per || 'all';
  const list = regFilter({ per });
  const periodDaysMap = { all: 30, today: 1, oct: 16, '30': 30, fy70: 16, fy69: 365 };
  const m = calcWardMetrics(list, periodDaysMap[per] || 30);
  const total = m.total;

  const disCounts = countByField(list, (a) => (a.status === 'active' ? 'กำลังรักษา' : a.out?.type || 'กำลังรักษา'));
  const dxCounts = countByField(list, (a) => a.dx?.name || 'ไม่ระบุ');
  const deviceMetrics = {
    'ได้รับยาละลายลิ่มเลือด (SK)': list.filter((a) => a.sk?.given).length,
    'ใส่ท่อช่วยหายใจ (ETT)': list.filter((a) => a.dev.some((d) => d.type === 'ETT') || a.px.some((p) => p.type === 'Intubation')).length,
    'ใส่สายรัดห้ามเลือด (TR-band)': list.filter((a) => a.dev.some((d) => d.type === 'TR-band')).length,
    'คาสาย Sheath (Radial / Femoral)': list.filter((a) => a.dev.some((d) => d.type === 'Sheath') || a.px.some((p) => p.sheath)).length,
    'สวนหัวใจ / ขยายหลอดเลือด (CAG / PCI)': list.filter((a) => a.px.some((p) => /CAG|PCI/i.test(p.type))).length,
    'ใส่เครื่องกระตุ้นหัวใจ / IABP (TPM / PPM / IABP)': list.filter((a) => a.px.some((p) => /TPM|PPM|ICD|CRT|IABP/i.test(p.type)) || a.dev.some((d) => ['TPM', 'IABP'].includes(d.type))).length,
  };
  const compAndTransferCounts = countByField(list, (a) => {
    const compStr = a.comp?.length ? a.comp.map((c) => c.type).join(', ') : 'ไม่มีภาวะแทรกซ้อน';
    const trStr = a.out?.type === 'ย้ายตึก' ? `ย้ายไป ${a.out.dest || 'ตึกอื่น'}` : a.source === 'Refer-in' ? `Refer-in (${a.refFrom || 'รพ.ชุมชน'})` : 'ไม่ได้ย้ายตึก';
    return `${compStr} | ${trStr}`;
  });

  const perSeg = PERIODS.map(([k, l]) => `<button class="${per === k ? 'on' : ''}" data-go="#/dashboard?per=${k}">${l}</button>`).join('');

  return `<div class="page-h"><div><h1>สรุปสถิติหอผู้ป่วย (Dashboard)</h1><p>ระบบทะเบียนผู้ป่วย ตึกหัวใจและหลอดเลือด โรงพยาบาลอุดรธานี · คำนวณอัตโนมัติจากข้อมูลในทะเบียน</p></div>
    <div class="row"><div class="seg">${perSeg}</div><button class="btn" data-act="csv" data-kind="kpi">${ic('download')}ส่งออก Excel (CSV)</button><button class="btn" data-act="print">${ic('printer')}พิมพ์รายงาน / PDF</button></div></div>

  <!-- Summary Cards 5 หมวดตามไฟล์อ้างอิง CCU_UdonThani_Patient_Registry.html -->
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">ผู้ป่วยในทะเบียนทั้งหมด</div>
      <div class="stat-value num">${m.total}</div>
      <div class="stat-sub">ราย (วันนอนรวม ${m.totalPatientDays} วัน)</div>
    </div>
    <div class="stat-card accent">
      <div class="stat-label">กำลังรักษาในตึก / ย้ายตึก</div>
      <div class="stat-value num">${m.activeCount + m.transfer}</div>
      <div class="stat-sub">กำลังรักษา ${m.activeCount} ราย · ย้ายตึก ${m.transfer} ราย · วันนอนเฉลี่ย ${m.avgLosAll} วัน</div>
    </div>
    <div class="stat-card success">
      <div class="stat-label">จำหน่าย: ทุเลา / Refer back</div>
      <div class="stat-value num">${m.improved + m.refer}</div>
      <div class="stat-sub">ทุเลา ${m.improved} ราย | Refer back ${m.refer} ราย</div>
    </div>
    <div class="stat-card warning">
      <div class="stat-label">ไม่สมัครใจอยู่ / มีภาวะแทรกซ้อน</div>
      <div class="stat-value num">${m.compCount}</div>
      <div class="stat-sub">มี Complication ${m.compCount} ราย · ไม่สมัครใจอยู่ ${m.against} ราย</div>
    </div>
    <div class="stat-card danger">
      <div class="stat-label">เสียชีวิต (Expired)</div>
      <div class="stat-value num">${m.dead}</div>
      <div class="stat-sub">อัตราตาย ${m.mortRateAll}% (เทียบจำหน่าย ${m.mortRateOut}%)</div>
    </div>
  </div>

  <!-- ตัวชี้วัดสำคัญของหอผู้ป่วย: LOS, อัตราหมุนเวียนเตียง, อัตราครองเตียง, อัตราตาย -->
  <div class="card">
    <div class="card-h"><h3>${ic('activity')}ตัวชี้วัดการบริหารเตียงและผลลัพธ์การรักษา (LOS · อัตราหมุนเวียนเตียง · อัตราครองเตียง · อัตราตาย)</h3><span class="xs muted">จำนวนเตียงทั้งหมด ${m.bedCount} เตียง · ช่วงเวลาคำนวณ ${m.periodDays} วัน</span></div>
    <div class="card-b"><div class="tiles" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">
      <div class="metric kpi-box">
        <div class="lbl">${ic('clock', 16)}วันนอนเฉลี่ย (Average LOS)</div>
        <div class="val num">${m.avgLosOut} <small>วัน</small></div>
        <div class="sub">ผู้ป่วยจำหน่าย ${m.disCount} ราย (${m.outPatientDays} วันนอน) · รวมทั้งหมดเฉลี่ย <b>${m.avgLosAll} วัน</b></div>
        <div class="xs muted formula">สูตร: Σ วันนอน ÷ จำนวนผู้ป่วย (${m.totalPatientDays} ÷ ${m.total || 1})</div>
      </div>
      <div class="metric kpi-box">
        <div class="lbl">${ic('transfer', 16)}อัตราหมุนเวียนเตียง (Bed Turnover Rate)</div>
        <div class="val num">${m.btr} <small>ราย/เตียง</small></div>
        <div class="sub">คิดรวมผู้ป่วยรับทั้งหมด <b>${m.btrAll} ราย/เตียง</b> · ระยะว่างเตียง (TOI) ${m.toi} วัน</div>
        <div class="xs muted formula">สูตร: จำนวนจำหน่าย ÷ จำนวนเตียง (${m.disCount} ÷ ${m.bedCount})</div>
      </div>
      <div class="metric kpi-box">
        <div class="lbl">${ic('bed', 16)}อัตราครองเตียง (Bed Occupancy Rate)</div>
        <div class="val num">${m.currentBor}% <small>ณ ปัจจุบัน (${active().length}/${m.bedCount} เตียง)</small></div>
        <div class="meter" style="margin:6px 0"><i style="width:${m.currentBor}%"></i></div>
        <div class="sub">อัตราครองเตียงเฉลี่ยตามวันนอนในคาบเวลา: <b>${m.periodBor}%</b></div>
        <div class="xs muted formula">สูตร: (วันนอนรวม × 100) ÷ (${m.bedCount} เตียง × ${m.periodDays} วัน)</div>
      </div>
      <div class="metric kpi-box">
        <div class="lbl">${ic('heartpulse', 16)}อัตราตาย (Mortality Rate)</div>
        <div class="val num" style="color:var(--danger)">${m.mortRateOut}% <small>(${m.dead} ราย)</small></div>
        <div class="sub">เทียบผู้ป่วยในทะเบียนทั้งหมด: <b>${m.mortRateAll}%</b> · กลุ่ม STEMI: <b>${m.stemiMortRate}%</b></div>
        <div class="xs muted formula">สูตร: (จำนวนเสียชีวิต ÷ จำนวนจำหน่าย) × 100</div>
      </div>
    </div></div>
  </div>

  <!-- กราฟสรุป 4 หมวดตามไฟล์อ้างอิง CCU_UdonThani_Patient_Registry.html -->
  <div class="dashboard-grid">
    <div class="card">
      <div class="card-h"><h3>${ic('logout')}📌 สัดส่วนสถานะการจำหน่าย (Discharge Summary)</h3><a class="small link" data-go="#/patients">ดูในทะเบียน →</a></div>
      <div class="card-b">${renderDashBars(disCounts, total, '#0f4c81', true)}</div>
    </div>
    <div class="card">
      <div class="card-h"><h3>${ic('heartpulse')}🫀 สถิติการวินิจฉัยโรคหลัก (Top Diagnosis - Dx)</h3></div>
      <div class="card-b">${renderDashBars(dxCounts, total, '#0d9488', true)}</div>
    </div>
    <div class="card">
      <div class="card-h"><h3>${ic('syringe')}💉 สถิติหัตถการและอุปกรณ์สำคัญ (SK / ETT / TR-band / Sheath / PCI)</h3><a class="small link" data-go="#/procedures">ดูหัตถการ →</a></div>
      <div class="card-b">${renderDashBars(deviceMetrics, total || 1, '#1d4ed8', false)}</div>
    </div>
    <div class="card">
      <div class="card-h"><h3>${ic('alert')}⚠️ สรุปภาวะแทรกซ้อนและการย้ายตึก (Complications & Transfers)</h3></div>
      <div class="card-b">${renderDashBars(compAndTransferCounts, total, '#b45309', true)}</div>
    </div>
  </div>`;
};

// ---------- reports
function liveReport() {
  const list = S.admissions.filter((a) => a.admitAt.startsWith('2026-10'));
  const outs = list.filter((a) => a.status === 'out');
  const wm = calcWardMetrics(list, 16);
  const days = Array.from({ length: 16 }, (_, i) => i + 1);
  const sk = list.filter((a) => a.sk?.given && a.sk.door && a.sk.needle).sort((x, y) => (x.sk.needle > y.sk.needle ? 1 : -1));
  const d2n = sk.map((a) => mins(a.sk.door, a.sk.needle));
  const pxAll = list.flatMap((a) => a.px), arterial = pxAll.filter((p) => /radial|femoral$/i.test(p.access || ''));
  const accessComp = list.flatMap((a) => a.comp).filter((c) => ['Hematoma', 'Bleeding (access site)', 'Pseudoaneurysm', 'Radial artery occlusion', 'Retroperitoneal hematoma'].includes(c.type));
  const dead = outs.filter((a) => a.out.type === 'เสียชีวิต').length;
  const cnt = (arr) => Object.entries(arr.reduce((m, k) => ((m[k] = (m[k] || 0) + 1), m), {})).sort((x, y) => y[1] - x[1]);
  return {
    label: 'ต.ค. 2569 (1–16 ต.ค.) · คำนวณสดจากข้อมูลในระบบ',
    tiles: {
      adm: list.length,
      admDelta: '',
      los: wm.avgLosOut,
      losAll: wm.avgLosAll,
      bor: wm.currentBor,
      periodBor: wm.periodBor,
      btr: wm.btr,
      btrAll: wm.btrAll,
      toi: wm.toi,
      patientDays: wm.totalPatientDays,
      periodDays: 16,
      mort: wm.mortRateOut,
      mortAll: wm.mortRateAll,
      mortN: dead,
      d2n: d2n.length ? Math.round((d2n.filter((m) => m <= 30).length / d2n.length) * 100) : 0,
      access: arterial.length ? ((accessComp.length / arterial.length) * 100).toFixed(1) : 0,
      accessN: `${accessComp.length} จาก ${arterial.length}`,
    },
    series: { labels: days.map(String), values: days.map((d) => list.filter((a) => Number(a.admitAt.slice(8, 10)) === d).length) },
    d2n: { labels: sk.map((a) => fd(a.sk.needle)), values: d2n },
    outcomes: OUTCOMES.slice(0, 4).map((t) => [t, outs.filter((a) => a.out.type === t).length]),
    px: cnt(pxAll.map((p) => p.type)),
    refer: cnt(outs.filter((a) => a.out.type === 'Refer back').map((a) => a.out.dest)),
  };
}
P.reports = (q) => {
  const per = q.p || 'fy69', R = per === 'live' ? liveReport() : REPORT_STATIC[per], t = R.tiles, tableView = q.view === 'table';
  const seg = [['fy69', 'ปีงบ 2569'], ['q4', 'ไตรมาส 4/2569'], ['live', 'เดือนนี้ (ข้อมูลสด)']].map(([k, l]) => `<button class="${per === k ? 'on' : ''}" data-go="#/reports?p=${k}${tableView ? '&view=table' : ''}">${l}</button>`).join('');
  return `<div class="page-h"><div><h1>รายงานและตัวชี้วัด</h1><p>${R.label}</p></div>
    <div class="row"><div class="seg">${seg}</div><button class="btn soft" data-go="#/dashboard">${ic('trend')}แดชบอร์ดสรุปข้อมูล</button><button class="btn" data-go="#/reports?p=${per}${tableView ? '' : '&view=table'}">${ic(tableView ? 'chart' : 'list')}${tableView ? 'ดูเป็นกราฟ' : 'ดูเป็นตาราง'}</button><button class="btn" data-act="csv" data-kind="kpi">${ic('download')}Excel</button><button class="btn" data-act="print">${ic('printer')}PDF</button></div></div>
  <div class="tiles" style="grid-template-columns:repeat(auto-fit,minmax(190px,1fr))">
    <div class="card tile"><div class="lbl">ผู้ป่วยรับใหม่</div><div class="val num">${Number(t.adm).toLocaleString()}</div><div class="sub">${t.admDelta ? `<b style="color:#006300">${t.admDelta}</b> เทียบปีก่อน` : `วันนอนรวม ${t.patientDays} วัน`}</div></div>
    <div class="card tile"><div class="lbl">วันนอนเฉลี่ย (LOS)</div><div class="val num">${t.los} <small>วัน</small></div><div class="sub">${t.losAll ? `รวมทั้งหมดเฉลี่ย ${t.losAll} วัน` : 'ผู้ป่วยที่จำหน่ายแล้ว'}</div></div>
    <div class="card tile"><div class="lbl">อัตราครองเตียง (BOR)</div><div class="val num">${t.bor}%</div><div class="meter"><i style="width:${Math.min(100, t.bor)}%"></i></div><div class="sub">${t.periodBor ? `เฉลี่ยตามวันนอน ${t.periodBor}%` : `${S.master.bedCount} เตียง · ${t.periodDays} วัน`}</div></div>
    <div class="card tile"><div class="lbl">อัตราหมุนเวียนเตียง (BTR)</div><div class="val num">${t.btr} <small>ราย/เตียง</small></div><div class="sub">${t.btrAll ? `รวมรับใหม่ ${t.btrAll} ราย/เตียง` : `ระยะว่างเตียง (TOI) ${t.toi} วัน`}</div></div>
    <div class="card tile"><div class="lbl">อัตราตาย (Mortality)</div><div class="val num">${t.mort}%</div><div class="sub">เสียชีวิต ${t.mortN} ราย${t.mortAll ? ` (รวม ${t.mortAll}%)` : ''}</div></div>
    <div class="card tile"><div class="lbl">Door-to-needle ≤ 30 นาที</div><div class="val num">${t.d2n}%</div><div class="meter ${t.d2n < 80 ? 'warn' : ''}"><i style="width:${t.d2n}%"></i></div><div class="sub">เป้าหมาย ≥ 80%</div></div>
    <div class="card tile"><div class="lbl">Access-site complication</div><div class="val num">${t.access}%</div><div class="sub">${t.accessN} หัตถการ (arterial)</div></div>
  </div>
  <div class="cols2 viz-root" style="grid-template-columns:1.6fr 1fr">
    ${card(`ผู้ป่วยรับใหม่ ${per === 'live' ? 'รายวัน' : 'รายเดือน'} <span class="chart-sub">ราย</span>`, 'chart', tableView ? tableOf(R.series.labels.map((l, i) => [l, R.series.values[i]]), ['ช่วงเวลา', 'ราย']) : colChart(R.series.labels, R.series.values))}
    ${card('ผลการออกจากตึก <span class="chart-sub">ราย (%)</span>', 'logout', tableView ? tableOf(R.outcomes, ['สถานะ', 'ราย']) : hbars(R.outcomes, { pct: true, labelW: 120 }))}
  </div>
  <div class="cols3 viz-root">
    ${card('Door-to-needle (SK) <span class="chart-sub">นาที</span>', 'syringe', R.d2n.values.length ? (tableView ? tableOf(R.d2n.labels.map((l, i) => [l, R.d2n.values[i]]), ['ช่วงเวลา', 'นาที']) : lineChart(R.d2n.labels, R.d2n.values, 30)) : empty('ไม่มีผู้ป่วยที่ได้ SK ในช่วงนี้'))}
    ${card('หัตถการแยกประเภท <span class="chart-sub">ครั้ง</span>', 'activity', R.px.length ? (tableView ? tableOf(R.px, ['หัตถการ', 'ครั้ง']) : hbars(R.px, { labelW: 130 })) : empty('–'))}
    ${card('Refer back แยกโรงพยาบาล', 'transfer', R.refer.length ? tableOf(R.refer, ['โรงพยาบาลปลายทาง', 'ราย']) : empty('ไม่มี Refer back ในช่วงนี้'))}
  </div>`;
};
const tableOf = (rows, head) => `<table class="tbl"><thead><tr><th>${head[0]}</th><th class="r">${head[1]}</th></tr></thead><tbody>${rows.map(([k, v]) => `<tr><td>${k}</td><td class="r num b">${Number(v).toLocaleString()}</td></tr>`).join('')}</tbody></table>`;
const C = { s: 'var(--series-1)', grid: 'var(--grid)', axis: 'var(--axis)', ink: 'var(--ink-2)', muted: 'var(--ink-muted)', surf: 'var(--surface-1)' };
const T = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-size="${o.size || 11.5}" fill="${o.fill || C.muted}" text-anchor="${o.anchor || 'middle'}" font-weight="${o.w || 400}">${s}</text>`;
const niceMax = (m) => { const p = 10 ** Math.floor(Math.log10(Math.max(m, 1))); return Math.ceil(m / p) * p || 1; };
function colChart(labels, values) {
  const W = 760, H = 260, L = 36, R = 8, Tp = 20, B = 26, max = niceMax(Math.max(...values) * 1.1), pw = W - L - R, ph = H - Tp - B, band = pw / values.length, bw = Math.min(24, band * 0.6);
  let g = '';
  for (let i = 0; i <= 4; i++) { const v = (max / 4) * i, y = Tp + ph - (v / max) * ph; g += `<line x1="${L}" x2="${W - R}" y1="${y}" y2="${y}" stroke="${i ? C.grid : C.axis}"/>` + T(L - 8, y + 4, Math.round(v), { anchor: 'end' }); }
  const peak = values.indexOf(Math.max(...values)), step = Math.ceil(labels.length / 12);
  values.forEach((d, i) => {
    const h = (d / max) * ph, x = L + band * i + (band - bw) / 2, y = Tp + ph - h, r = Math.min(4, h);
    g += `<g data-tip="${esc(labels[i])}: ${d} ราย"><rect class="hit" x="${L + band * i}" y="${Tp}" width="${band}" height="${ph}"/>${h > 0 ? `<path class="mark" d="M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + bw - r}Q${x + bw},${y} ${x + bw},${y + r}V${y + h}Z" fill="${C.s}"/>` : ''}</g>`;
    if ((i === peak || i === values.length - 1) && d) g += T(x + bw / 2, y - 6, d, { fill: C.ink, w: 600, size: 12 });
    if (i % step === 0) g += T(x + bw / 2, H - 6, labels[i]);
  });
  return `<svg width="100%" viewBox="0 0 ${W} ${H}">${g}</svg>`;
}
function hbars(rows, o = {}) {
  const total = rows.reduce((s, r) => s + r[1], 0), max = Math.max(...rows.map((r) => r[1]), 1), W = 420, rowH = 34, L = o.labelW || 110, barMax = W - L - 90, H = rows.length * rowH;
  let g = '';
  rows.forEach(([k, n], i) => {
    const y = i * rowH, w = Math.max(n ? 4 : 0, (n / max) * barMax);
    g += `<g data-tip="${esc(k)}: ${n}${o.pct ? ` (${((n / total) * 100).toFixed(1)}%)` : ''}"><rect class="hit" x="0" y="${y}" width="${W}" height="${rowH}"/>` + T(L - 10, y + 21, esc(k), { anchor: 'end', fill: C.ink, size: 12.5 });
    if (w) g += `<path class="mark" d="M${L},${y + 9}H${L + w - 4}Q${L + w},${y + 9} ${L + w},${y + 13}V${y + 21}Q${L + w},${y + 25} ${L + w - 4},${y + 25}H${L}Z" fill="${C.s}"/>`;
    g += T(L + w + 8, y + 21.5, `${n.toLocaleString()}${o.pct && total ? ` <tspan fill="${C.muted}" font-weight="400">(${((n / total) * 100).toFixed(1)}%)</tspan>` : ''}`, { anchor: 'start', fill: C.ink, size: 12, w: 600 }) + '</g>';
  });
  return `<svg width="100%" viewBox="0 0 ${W} ${H}"><line x1="${L}" x2="${L}" y1="0" y2="${H}" stroke="${C.axis}"/>${g}</svg>`;
}
function lineChart(labels, v, target) {
  const W = 460, H = 260, L = 30, R = 64, Tp = 14, B = 26, lo = Math.min(15, ...v) - 5, hi = Math.max(40, ...v) + 5, pw = W - L - R, ph = H - Tp - B;
  const X = (i) => L + (v.length > 1 ? (pw / (v.length - 1)) * i : pw / 2), Y = (d) => Tp + ph - ((d - lo) / (hi - lo)) * ph;
  let g = '';
  for (let t = Math.ceil(lo / 10) * 10; t <= hi; t += 10) g += `<line x1="${L}" x2="${W - R}" y1="${Y(t)}" y2="${Y(t)}" stroke="${C.grid}"/>` + T(L - 7, Y(t) + 4, t, { anchor: 'end' });
  g += `<line x1="${L}" x2="${W - R}" y1="${Y(target)}" y2="${Y(target)}" stroke="${C.ink}"/>` + T(W - R + 6, Y(target) + 4, `เป้า ${target}`, { anchor: 'start', fill: C.ink, w: 600 });
  const pts = v.map((d, i) => `${X(i)},${Y(d)}`).join(' ');
  if (v.length > 1) g += `<polygon points="${pts} ${X(v.length - 1)},${Tp + ph} ${X(0)},${Tp + ph}" fill="${C.s}" opacity=".10"/><polyline points="${pts}" fill="none" stroke="${C.s}" stroke-width="2" stroke-linejoin="round"/>`;
  v.forEach((d, i) => { g += `<g data-tip="${esc(labels[i])}: ${d} นาที"><circle class="hit" cx="${X(i)}" cy="${Y(d)}" r="12"/><circle class="mark" cx="${X(i)}" cy="${Y(d)}" r="${i === v.length - 1 ? 5 : 3.5}" fill="${C.s}" stroke="${C.surf}" stroke-width="2"/></g>`; });
  g += T(X(v.length - 1) + 10, Y(v[v.length - 1]) + 4, `${v[v.length - 1]} นาที`, { anchor: 'start', fill: C.ink, w: 600, size: 12 });
  const step = Math.ceil(labels.length / 5);
  labels.forEach((l, i) => { if (i % step === 0 || i === labels.length - 1) g += T(X(i), H - 6, l); });
  return `<svg width="100%" viewBox="0 0 ${W} ${H}">${g}</svg>`;
}

// ---------- export
P.export = () => `<div class="page-h"><div><h1>ส่งออกข้อมูล</h1><p>ไฟล์ CSV (UTF-8) เปิดด้วย Excel ได้ทันที · ทุกการส่งออกถูกบันทึกใน Audit log</p></div></div>
  <div class="cols2"><div class="card"><div class="card-h"><h3>${ic('download')}เลือกข้อมูลที่ต้องการ</h3></div><form class="card-b stack" style="gap:14px" id="exportForm" novalidate>
    ${F('ชุดข้อมูล', sel('kind', [['registry', 'ทะเบียนผู้ป่วย (1 แถว/AN)'], ['procedures', 'หัตถการ'], ['devices', 'อุปกรณ์ (ETT / TR-band / Sheath)'], ['complications', 'Complication'], ['kpi', 'สรุปตัวชี้วัด']], 'registry', { blank: false }))}
    ${F('ช่วงวันที่ Admit', sel('per', PERIODS, 'all', { blank: false }))}
    <label class="check"><input type="checkbox" name="deid" ${S.role === 'qa' ? 'checked disabled' : 'checked'}>ไม่ระบุตัวตน (ตัดชื่อ เลขบัตร ที่อยู่ เบอร์โทร)${S.role === 'qa' ? ' — บังคับสำหรับ QA' : ''}</label>
    ${F('วัตถุประสงค์ (บันทึกใน Audit log)', inp('purpose', 'รายงานประจำเดือน', { req: true }), { req: true })}
    <button class="btn primary lg" data-act="exportRun">${ic('download')}ดาวน์โหลด</button></form></div>
  ${card('ประวัติการส่งออกล่าสุด', 'history', `<table class="tbl"><tbody>${S.audit.filter((x) => x.action === 'EXPORT').slice(0, 8).map((x) => `<tr><td class="num">${fdt(x.at)}</td><td>${x.user}</td><td class="t2">${x.detail}</td></tr>`).join('') || '<tr><td>—</td></tr>'}</tbody></table>`)}</div>`;

// ---------- master data
const MTABS = [['procedures', 'หัตถการ'], ['complications', 'Complication'], ['dx', 'Dx (ICD-10)'], ['hospitals', 'โรงพยาบาลในเครือข่าย'], ['wards', 'ตึก / หอผู้ป่วย'], ['protocol', 'แนวทางอุปกรณ์ & เตียง']];
P.master = (q) => {
  const t = q.t || 'procedures', M = S.master;
  let body;
  if (t === 'protocol') {
    body = `<form class="card-b stack" style="gap:14px;max-width:640px" id="protoForm" novalidate>
      <div class="grid g2">${F('TR-band: เริ่มปล่อยลมหลังใส่ (นาที)', inp('first', M.protocol.first, { type: 'number', req: true }))}${F('TR-band: ปล่อยทุก (นาที)', inp('every', M.protocol.every, { type: 'number', req: true }))}
      ${F('TR-band: ปล่อยครั้งละ (ml)', inp('step', M.protocol.step, { type: 'number', req: true }))}${F('Sheath (artery): เตือนเมื่อคาไว้ครบ (ชม.)', inp('sheathHours', M.protocol.sheathHours, { type: 'number', req: true }))}
      ${F('จำนวนเตียงในตึก', inp('bedCount', M.bedCount, { type: 'number', req: true }))}</div>
      <div class="xs muted">${ic('info', 13)} ค่าเริ่มต้นเป็นตัวอย่าง ต้องยืนยันกับแนวทางของตึกใน Phase 0</div>
      <button class="btn primary" data-act="saveProto" style="align-self:flex-start">${ic('save')}บันทึก</button></form>`;
  } else {
    const list = M[t], cols = { procedures: ['ชื่อหัตถการ'], complications: ['ชื่อ', 'กลุ่ม'], dx: ['ICD-10', 'ชื่อโรค'], hospitals: ['รหัส', 'ชื่อ', 'อำเภอ'], wards: ['ชื่อตึก'] }[t];
    const cells = (x) => ({ procedures: [x.name], complications: [x.name, x.group], dx: [x.icd, x.name], hospitals: [x.code, x.name, x.amphoe], wards: [x.name] }[t]);
    body = `<div class="tbl-wrap"><table class="tbl"><thead><tr>${cols.map((c) => `<th>${c}</th>`).join('')}<th>สถานะ</th><th></th></tr></thead><tbody>${list.map((x, i) => `<tr>${cells(x).map((c, j) => `<td class="${j === 0 ? 'b' : ''}">${esc(c)}</td>`).join('')}<td>${x.active ? '<span class="chip ok">ใช้งาน</span>' : '<span class="chip">ปิดใช้งาน</span>'}</td><td class="r"><button class="btn sm" data-act="toggleMaster" data-t="${t}" data-i="${i}">${x.active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}</button></td></tr>`).join('')}</tbody></table></div>`;
  }
  return `<div class="page-h"><div><h1>ข้อมูลหลัก (Master data)</h1><p>รายการตัวเลือกที่ใช้ในฟอร์มทั้งหมด · ปิดใช้งานแทนการลบ เพื่อไม่ให้ข้อมูลเก่าเสีย</p></div>${t !== 'protocol' ? `<button class="btn primary" data-act="addMaster" data-t="${t}">${ic('plus')}เพิ่มรายการ</button>` : ''}</div>
  <div class="card"><div class="tabs" style="padding:0 12px">${MTABS.map(([k, l]) => `<a class="${k === t ? 'on' : ''}" data-go="#/master?t=${k}">${l}</a>`).join('')}</div>${body}</div>`;
};

// ---------- users
P.users = () => `<div class="page-h"><div><h1>ผู้ใช้งานและสิทธิ์</h1><p>บัญชีผู้ใช้ภายในโรงพยาบาล · ห้ามใช้บัญชีร่วมกัน</p></div><button class="btn primary" data-act="addUser">${ic('userplus')}เพิ่มผู้ใช้</button></div>
  <div class="card"><div class="tbl-wrap"><table class="tbl mcards"><thead><tr><th>ชื่อผู้ใช้</th><th>ชื่อ-สกุล</th><th>ตำแหน่ง</th><th>บทบาท</th><th>เข้าระบบล่าสุด</th><th>สถานะ</th><th></th></tr></thead><tbody>
  ${S.users.map((u) => `<tr><td class="mono">${u.username}</td><td class="b mfull">${u.name}</td><td class="t2">${u.position}</td><td><span class="chip primary">${ROLES[u.role].label}</span></td><td class="num">${fdt(u.last)}</td><td>${u.active ? '<span class="chip ok">ใช้งาน</span>' : '<span class="chip">ระงับ</span>'}</td>
    <td class="r"><div class="row" style="justify-content:flex-end;gap:6px"><button class="btn sm" data-act="resetPw" data-id="${u.id}" title="รีเซ็ตรหัสผ่าน">${ic('lock', 15)}</button><button class="btn sm" data-act="toggleUser" data-id="${u.id}">${u.active ? 'ระงับ' : 'เปิดใช้'}</button></div></td></tr>`).join('')}</tbody></table></div></div>
  ${card('ตารางสิทธิ์ตามบทบาท', 'shield', `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>หน้า</th>${Object.values(ROLES).map((r) => `<th class="r">${r.label}</th>`).join('')}</tr></thead><tbody>${NAV.filter((x) => x[0] !== 'sec').map((x) => `<tr><td>${x[3]}</td>${Object.values(ROLES).map((r) => `<td class="r">${r.pages.includes(x[0]) ? ic('check', 16, 'color:var(--ok)') : '<span class="muted">–</span>'}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`)}`;

// ---------- audit
P.audit = (q) => {
  const acts = [...new Set(S.audit.map((x) => x.action))];
  const rows = S.audit.filter((x) => (!q.a || x.action === q.a) && (!q.s || JSON.stringify(x).includes(q.s)));
  return `<div class="page-h"><div><h1>Audit log</h1><p>บันทึกแบบเพิ่มอย่างเดียว (append-only) · การเปิดดูเลขบัตรเต็มและการส่งออกถูกบันทึกทุกครั้ง</p></div><button class="btn" data-act="csv" data-kind="audit">${ic('download')}ส่งออก</button></div>
  <div class="card"><div class="filters"><div class="seg" style="flex-wrap:wrap">${[''].concat(acts).map((k) => `<button class="${(q.a || '') === k ? 'on' : ''}" data-go="#/audit${k ? '?a=' + k : ''}">${k || 'ทั้งหมด'}</button>`).join('')}</div></div>
  <div class="tbl-wrap"><table class="tbl mcards"><thead><tr><th>เวลา</th><th>ผู้ใช้</th><th>การกระทำ</th><th>ข้อมูล</th><th>อ้างอิง</th><th>รายละเอียด</th></tr></thead><tbody>
  ${rows.map((r) => `<tr><td class="num">${fdt(r.at)}</td><td>${r.user}</td><td><span class="chip ${r.action === 'VIEW_CID' || r.action === 'EXPORT' ? 'warn' : r.action === 'DELETE' ? 'danger' : ''}">${r.action}</span></td><td>${r.entity}</td><td class="num">${/^\d{7}$/.test(r.ref) && adm(r.ref) ? `<a class="link" data-go="#/adm/${r.ref}">${r.ref}</a>` : r.ref}</td><td class="mfull">${r.detail}</td></tr>`).join('')}</tbody></table></div></div>`;
};

// ---------- me
P.me = () => { const u = user(); return `<div class="page-h"><div><h1>บัญชีของฉัน</h1><p>การตั้งค่าสำหรับ prototype</p></div></div>
  <div class="cols2">${card('ผู้ใช้', 'user', `<dl class="kv"><dt>ชื่อ</dt><dd>${u.name}</dd><dt>ชื่อผู้ใช้</dt><dd class="mono">${u.username}</dd><dt>ตำแหน่ง</dt><dd>${u.position}</dd><dt>บทบาท</dt><dd>${ROLES[S.role].label}</dd></dl><button class="btn danger" style="margin-top:14px" data-act="logout">${ic('logout')}ออกจากระบบ</button>`)}
  ${card('สลับบทบาท (ทดสอบสิทธิ์)', 'shield', `<div class="opts">${Object.entries(ROLES).map(([k, r]) => `<div class="opt ${S.role === k ? 'on' : ''}" data-act="switchRole" data-role="${k}">${r.label}</div>`).join('')}</div><div class="xs muted" style="margin-top:10px">เมนูและปุ่มจะเปลี่ยนตามตารางสิทธิ์</div>`)}
  ${card('เวลาจำลอง', 'clock', `<div class="row wrap"><span class="b num">${fdl(S.now)} ${ft(S.now)}</span><button class="btn sm" data-act="tick">+15 นาที</button><button class="btn sm" data-act="tick" data-m="60">+1 ชม.</button><button class="btn sm" data-act="resetClock">กลับเป็น 13:33</button></div><div class="xs muted" style="margin-top:8px">ใช้ดูการแจ้งเตือน TR-band / Sheath เปลี่ยนตามเวลา</div>`)}
  ${card('ข้อมูลตัวอย่าง', 'database', `<div class="small t2">การแก้ไขทั้งหมดถูกเก็บในเบราว์เซอร์นี้เท่านั้น (localStorage)</div><button class="btn" style="margin-top:12px" data-act="resetData">${ic('history')}รีเซ็ตข้อมูลตัวอย่าง</button>`)}</div>`; };

// ============================================================ router
function parse() {
  const h = location.hash.slice(1) || '/beds';
  const [path, qs] = h.split('?');
  return { parts: path.split('/').filter(Boolean).map(decodeURIComponent), q: Object.fromEntries(new URLSearchParams(qs || '')) };
}
function render() {
  const { parts, q } = parse();
  const root = $('#root');
  if (!S.loggedIn) { root.innerHTML = P.login(); document.title = 'เข้าสู่ระบบ · Cardio Registry'; return; }
  let [page, ...rest] = parts;
  if (!page || page === 'login') page = ROLES[S.role].pages[0];
  const titles = { beds: 'ภาพรวมตึก', dashboard: 'แดชบอร์ดสรุปข้อมูล', patients: 'ทะเบียนผู้ป่วย', admit: 'รับผู้ป่วยใหม่', adm: 'ข้อมูลผู้ป่วย', procedures: 'หัตถการ', reports: 'รายงาน', export: 'ส่งออกข้อมูล', master: 'ข้อมูลหลัก', users: 'ผู้ใช้งาน', audit: 'Audit log', notifications: 'การแจ้งเตือน', me: 'บัญชีของฉัน' };
  const navKey = page === 'adm' ? 'patients' : page;
  let content;
  if (!P[page]) content = `<div class="card empty">ไม่พบหน้า <a class="link" data-go="#/beds">กลับหน้าหลัก</a></div>`;
  else if (!can(page)) content = noAccess();
  else content = page === 'adm' ? P.adm(q, rest[0], rest[1]) : P[page](q);
  const keepY = render.lastPage === location.hash.split('?')[0] ? window.scrollY : 0;
  root.innerHTML = shell(navKey, titles[page] || '', content);
  window.scrollTo(0, keepY);
  render.lastPage = location.hash.split('?')[0];
  document.title = `${titles[page] || ''} · Cardio Registry`;
  if (page === 'admit') admitCompUpdate();
}

// ============================================================ actions
const A = {};
A.openNav = () => $('#app').classList.add('nav-open');
A.closeNav = () => $('#app').classList.remove('nav-open');
A.pickRole = (el) => { $$('.roles .opt').forEach((o) => o.classList.toggle('on', o === el)); $('input', el).checked = true; };
A.logout = () => { audit('LOGOUT', 'Session', '-', 'ออกจากระบบ'); S.loggedIn = false; save(); location.hash = '#/login'; render(); };
A.switchRole = (el) => { S.role = el.dataset.role; S.userId = (S.users.find((u) => u.role === S.role && u.active) || S.users[0]).id; save(); location.hash = '#/' + ROLES[S.role].pages[0]; render(); toast(`สลับเป็นบทบาท ${ROLES[S.role].label}`); };
A.tick = (el) => { S.now = addMin(S.now, Number(el.dataset.m || 15)); save(); render(); toast(`เวลาจำลอง ${ft(S.now)} น.`); };
A.resetClock = () => { S.now = NOW0; save(); render(); };
A.resetData = () => { const keep = { role: S.role, userId: S.userId }; S = { ...mockData(), ...keep, loggedIn: true }; save(); render(); toast('รีเซ็ตข้อมูลตัวอย่างแล้ว'); };
A.ack = (el) => { S.ack.push(el.dataset.id); save(); render(); };
A.ackAll = () => { alerts().forEach((x) => S.ack.includes(x.id) || S.ack.push(x.id)); save(); render(); };
A.reveal = (el) => { if (S.reveal === el.dataset.hn) S.reveal = null; else { S.reveal = el.dataset.hn; audit('VIEW_CID', 'Patient', el.dataset.hn, 'เปิดดูเลขบัตรประชาชนเต็ม'); toast('บันทึกการเปิดดูเลขบัตรใน Audit log แล้ว'); } save(); render(); };
A.print = () => window.print();
A.census = () => {
  const rows = Array.from({ length: S.master.bedCount }, (_, i) => { const a = active().find((x) => x.bed === i + 1); return a ? `<tr><td>${i + 1}</td><td>${fullName(pt(a))}<br><small>HN ${a.hn} · AN ${a.an}</small></td><td>${a.dx.name}</td><td>D${dayNo(a)}</td><td>${a.dev.filter((d) => !d.out).map((d) => d.type).join(', ') || '–'}</td></tr>` : `<tr><td>${i + 1}</td><td colspan="4" style="color:#888">ว่าง</td></tr>`; }).join('');
  modal({ title: 'Census ประจำเวร', wide: true, submit: 'พิมพ์', body: `<div class="small t2">${fdl(S.now)} ${ft(S.now)} · ผู้ป่วย ${active().length}/${S.master.bedCount}</div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>เตียง</th><th>ผู้ป่วย</th><th>Dx</th><th>วันนอน</th><th>อุปกรณ์</th></tr></thead><tbody>${rows}</tbody></table></div>`, onSubmit: () => { window.print(); return false; } });
};
A.his = () => toast('การเชื่อม HIS อยู่ใน Phase 2 — ตอนนี้ลองพิมพ์ HN เดิม เช่น 0234567 แล้วกด Tab', 'err');
A.draft = () => toast('บันทึกร่างแล้ว (จำลอง)');

// ----- global search
function suggest(v) {
  const box = $('#sugg'); if (!box) return;
  const s = v.trim().toLowerCase().replace(/-/g, '');
  if (!s) { box.classList.add('hidden'); return; }
  const hits = S.admissions.filter((a) => { const p = pt(a); return [a.an, a.hn, p.cid, fullName(p).toLowerCase()].some((x) => x.toLowerCase().includes(s)); }).sort((x, y) => (x.status === 'active' ? -1 : 1) - (y.status === 'active' ? -1 : 1)).slice(0, 6);
  box.innerHTML = hits.map((a, i) => { const p = pt(a); return `<a class="${i === 0 ? 'hl' : ''}" data-go="#/adm/${a.an}"><div class="avatar" style="width:30px;height:30px;font-size:11px">${p.fn.slice(0, 2)}</div><div class="grow"><div class="b small">${fullName(p)}</div><div class="xs muted num">HN ${a.hn} · AN ${a.an} · ${a.dx.name}</div></div>${STATUS_CHIP(a)}</a>`; }).join('') + `<a data-go="#/patients?q=${encodeURIComponent(v)}"><span class="small link">ดูผลทั้งหมดในทะเบียน →</span></a>`;
  box.classList.remove('hidden');
}

// ----- input handlers
const ON = {};
ON.regsel = (el) => { const { q } = parse(); q[el.name] = el.value; q.page = 1; location.hash = '#/patients?' + new URLSearchParams(Object.entries(q).filter(([, v]) => v)).toString(); };
ON.hnLookup = (el, e) => {
  if (e.type !== 'change') return;
  const p = S.patients[el.value.trim()], box = $('#foundBox'), f = $('#admitForm');
  if (!p) { box.innerHTML = el.value ? `<div class="found" style="background:var(--surface-2);border-color:var(--border);color:var(--text-2)">${ic('info')}ไม่พบ HN นี้ในทะเบียน — สร้างผู้ป่วยใหม่</div>` : ''; return; }
  const prev = S.admissions.filter((a) => a.hn === p.hn), act0 = prev.find((a) => a.status === 'active');
  box.innerHTML = act0 ? `<div class="blockers">${ic('alert', 15)} ผู้ป่วยรายนี้ยัง Admit อยู่ (AN ${act0.an} เตียง ${act0.bed}) — ไม่สามารถ Admit ซ้ำได้ <a class="link" data-go="#/adm/${act0.an}">เปิดข้อมูล</a></div>` : `<div class="found">${ic('info')}<span><b>พบผู้ป่วยเดิม</b> — เคย Admit ${prev.length} ครั้ง (ล่าสุด AN ${prev[0]?.an} · ${fdl(prev[0]?.admitAt)} · ${prev[0]?.dx.name}) ระบบเติมข้อมูลให้แล้ว กรุณาตรวจสอบ</span></div>`;
  const set = (n, v) => { if (f.elements[n]) f.elements[n].value = v ?? ''; };
  set('cid', cidFmt(p.cid)); set('prefix', p.prefix); set('fn', p.fn); set('ln', p.ln); set('sex', p.sex); set('age', p.age); set('ins', p.ins); set('wt', p.wt); set('ht', p.ht); set('allergy', p.allergy.join(', '));
  set('no', p.addr.no); set('moo', p.addr.moo); set('road', p.addr.road); const tk = Object.keys(TAMBON).find((k) => TAMBON[k].tambon === p.addr.tambon); set('tambon', tk); ON.tambon(f.elements.tambon);
  set('phone', p.phone); set('cname', p.contact?.name); set('crel', p.contact?.rel); set('cphone', p.contact?.phone);
  ON.cidCheck(f.elements.cid); admitCompUpdate();
};
ON.cidCheck = (el) => { const d = el.value.replace(/\D/g, ''); const h = $('#cidHelp'); el.classList.remove('ok', 'err'); if (d.length < 13) { h.innerHTML = `พิมพ์แล้ว ${d.length}/13 หลัก`; h.parentElement.className = 'help'; return; } const ok = cidValid(d); el.classList.add(ok ? 'ok' : 'err'); h.parentElement.className = `help ${ok ? 'ok' : 'err'}`; h.innerHTML = ok ? '✓ เลขบัตรถูกต้อง' : '✗ เลขหลักที่ 13 ไม่ถูกต้อง — ตรวจสอบอีกครั้ง'; };
ON.tambon = (el) => { const t = TAMBON[el.value], f = el.form; f.elements.amphoe.value = t ? t.amphoe : ''; f.elements.provzip.value = t ? `${t.prov} · ${t.zip}` : ''; };
ON.phone = (el) => { const d = el.value.replace(/\D/g, ''); el.classList.toggle('err', d.length > 0 && !/^0\d{8,9}$/.test(d)); };
ON.ud = (el) => { const a = adm(el.dataset.an); a.ud = el.checked ? [...a.ud, el.value] : a.ud.filter((u) => u !== el.value); audit('UPDATE', 'Dx', a.an, `${el.checked ? 'เพิ่ม' : 'ลบ'} U/D: ${el.value}`); save(); render(); };
ON.med = (el) => { const a = adm(el.dataset.an); a.dcDraft.meds[el.dataset.m] = el.value || undefined; save(); render(); };
ON.dcText = (el) => { const a = adm(el.dataset.an); a.dcDraft[el.dataset.k] = el.value; save(); if (el.type === 'date') render(); };
ON.dcPending = (el) => { const a = adm(el.dataset.an); a.dcPending = el.checked; audit('UPDATE', 'Admission', a.an, el.checked ? 'ตั้งสถานะรอจำหน่าย' : 'ยกเลิกสถานะรอจำหน่าย'); save(); render(); };

// ----- clinical actions
A.killip = (el) => { const a = adm(el.dataset.an); a.dx.killip = el.dataset.k; audit('UPDATE', 'Dx', a.an, `Killip class → ${el.dataset.k}`); save(); render(); toast('บันทึก Killip class แล้ว'); };
A.dcType = (el) => { const a = adm(el.dataset.an); a.dcDraft.type = el.dataset.t; save(); location.hash = `#/adm/${a.an}/out`; render(); };
A.moveBed = (el) => {
  const a = adm(el.dataset.an), free = Array.from({ length: S.master.bedCount }, (_, i) => i + 1).filter((n) => !active().some((x) => x.bed === n));
  modal({ title: 'ย้ายเตียงภายในตึก', body: F('ไปเตียง', sel('bed', free.map((n) => [n, `เตียง ${n}`]), '', { req: true }), { req: true }) + F('เหตุผล', inp('reason', 'ปรับตามความรุนแรง')), onSubmit: (d) => { a.mv.push({ at: S.now, from: `เตียง ${a.bed}`, to: `เตียง ${d.bed}`, reason: d.reason }); audit('UPDATE', 'Admission', a.an, `ย้ายเตียง ${a.bed} → ${d.bed}`); a.bed = Number(d.bed); toast(`ย้ายไปเตียง ${d.bed} แล้ว`); } });
};
A.deflate = (el) => {
  const a = adm(el.dataset.an), d = a.dev.find((x) => x.id === el.dataset.dev), t = trInfo(d), p = pt(a);
  const checks = ['ไม่มีเลือดซึม', 'ไม่มี Hematoma', 'คลำ Radial pulse ได้', 'ปลายมือสี/อุณหภูมิปกติ'];
  modal({ title: `บันทึกปล่อยลม TR-band · เตียง ${a.bed}`, body: `<div class="small t2">${fullName(p)} · ${d.site} · คงเหลือ <b>${t.remain} ml</b> · กำหนด ${ft(t.due)}</div>
    <div class="grid g2">${F('เวลา', dt('at', S.now, { req: true }), { req: true })}${F('ปล่อยลม (ml)', inp('ml', Math.min(S.master.protocol.step, t.remain), { type: 'number', req: true, attrs: `min="1" max="${t.remain}"` }), { req: true })}</div>
    <div class="field"><span class="label">ประเมินหลังปล่อยลม</span><div class="grid g2" style="gap:8px">${checks.map((c) => `<label class="check small"><input type="checkbox" name="chk" value="${c}" checked>${c}</label>`).join('')}</div></div>
    <div class="xs muted">ถ้าเอาเครื่องหมายออกข้อใดข้อหนึ่ง ระบบจะเปิดฟอร์ม Complication ต่อให้</div>`, submit: 'บันทึกปล่อยลม',
  onSubmit: (data, f) => {
    const ok = f.querySelectorAll('[name=chk]:checked').length === checks.length;
    d.logs.push({ at: data.at, ml: Number(data.ml), by: user().name, ok });
    const r = trInfo(d);
    audit('UPDATE', 'อุปกรณ์', a.an, `TR-band ปล่อยลม ${data.ml} ml (คงเหลือ ${r.remain} ml)`);
    toast(r.remain ? `บันทึกแล้ว · ครั้งถัดไป ${ft(r.due)} น.` : 'ปล่อยลมครบแล้ว — ประเมินแผลแล้วบันทึกถอด TR-band');
    if (!ok) setTimeout(() => A.addComp({ dataset: { an: a.an, preset: 'Hematoma', rel: 'TR-band ' + d.site } }), 50);
  } });
};
A.removeDev = (el) => {
  const a = adm(el.dataset.an), d = a.dev.find((x) => x.id === el.dataset.dev);
  modal({ title: `ถอด ${d.type} · ${d.site}`, body: `<div class="grid g2">${F('เวลาถอด', dt('at', S.now, { req: true }), { req: true })}${d.type === 'Sheath' ? F('ACT ก่อนถอด (วินาที)', inp('act', '', { type: 'number' })) : ''}</div>
    ${d.type === 'Sheath' ? F('วิธีห้ามเลือด', sel('hemo', ['Manual compression', 'Closure device', 'TR-band'], 'Manual compression', { blank: false })) : ''}
    ${F('หมายเหตุ', inp('note', d.type === 'ETT' ? 'Extubation ตามแผน' : 'แผลแห้งดี ไม่มีภาวะแทรกซ้อน'))}`, submit: 'บันทึกการถอด',
  onSubmit: (data) => {
    if (data.at < d.in) { toast('เวลาถอดต้องไม่ก่อนเวลาใส่', 'err'); return false; }
    d.out = data.at; d.meta = { ...d.meta, act: data.act || d.meta?.act, hemostasis: data.hemo || d.meta?.hemostasis, note: data.note };
    if (data.hemo === 'TR-band') a.dev.push({ id: 'n' + Date.now(), type: 'TR-band', site: d.site.replace(' artery', ''), size: '-', in: data.at, out: null, meta: { ml: 15 }, logs: [] });
    audit('UPDATE', 'อุปกรณ์', a.an, `ถอด ${d.type} (${d.site})`); toast(`บันทึกถอด ${d.type} แล้ว`);
  } });
};
A.addDev = (el) => {
  const a = adm(el.dataset.an);
  modal({ title: 'เพิ่มอุปกรณ์', body: `<div class="grid g2">${F('ชนิด', sel('type', DEVICE_TYPES, '', { req: true }), { req: true })}${F('ตำแหน่ง', sel('site', ['Rt radial', 'Lt radial', 'Rt femoral artery', 'Lt femoral artery', 'Rt femoral vein', 'Rt IJV', 'Oral', 'Urethral'], '', { req: true }), { req: true })}
    ${F('ขนาด (Fr / mm)', inp('size', ''))}${F('เวลาใส่', dt('in', S.now, { req: true }), { req: true })}${F('ลมเริ่มต้น (TR-band, ml)', inp('ml', 15, { type: 'number' }))}</div>`,
  onSubmit: (d) => { a.dev.push({ id: 'n' + Date.now(), type: d.type, site: d.site, size: d.size || '-', in: d.in, out: null, meta: d.type === 'TR-band' ? { ml: Number(d.ml || 15) } : {}, logs: [] }); audit('CREATE', 'อุปกรณ์', a.an, `ใส่ ${d.type} (${d.site})`); toast(`เพิ่ม ${d.type} แล้ว`); } });
};
A.addPx = (el) => {
  const a = adm(el.dataset.an);
  modal({ title: 'เพิ่มหัตถการ', wide: true, body: `<div class="grid g3">${F('หัตถการ', sel('type', S.master.procedures.filter((x) => x.active).map((x) => x.name), '', { req: true }), { req: true })}${F('เริ่ม', dt('start', S.now, { req: true }), { req: true })}${F('สิ้นสุด', dt('end', S.now))}
    ${F('ผู้ทำ', sel('operator', DOCTORS, a.doctor, { req: true }), { req: true })}${F('Access', sel('access', ['Rt radial', 'Lt radial', 'Rt femoral', 'Lt femoral', 'Rt femoral vein', '-'], 'Rt radial', { blank: false }))}${F('Sheath (Fr)', inp('sheath', '6'))}
    ${F('Vessel', inp('vessel', '', { ph: 'LAD / LCx / RCA' }))}${F('Stent', inp('stent', '', { ph: 'DES × 1' }))}${F('ผลลัพธ์', sel('result', ['สำเร็จ', 'สำเร็จบางส่วน', 'ไม่สำเร็จ'], 'สำเร็จ', { blank: false }))}
    ${F('TIMI ก่อน', sel('timiPre', ['0', '1', '2', '3']))}${F('TIMI หลัง', sel('timiPost', ['0', '1', '2', '3']))}${F('Contrast (ml)', inp('contrast', '', { type: 'number' }))}</div>
    <label class="check small"><input type="checkbox" name="auto" checked>สร้างอุปกรณ์อัตโนมัติ: Radial → TR-band · Femoral → Sheath ค้างไว้</label>`,
  onSubmit: (d) => {
    a.px.push({ id: 'n' + Date.now(), ...d, fluoro: '' });
    if (d.auto && /radial/i.test(d.access)) a.dev.push({ id: 'n' + Date.now() + 1, type: 'TR-band', site: d.access, size: '-', in: d.end || d.start, out: null, meta: { ml: 15 }, logs: [] });
    if (d.auto && /femoral$/i.test(d.access)) a.dev.push({ id: 'n' + Date.now() + 2, type: 'Sheath', site: d.access + ' artery', size: d.sheath, in: d.start, out: null, meta: {}, logs: [] });
    audit('CREATE', 'หัตถการ', a.an, `บันทึก ${d.type}${d.vessel ? ' (' + d.vessel + ')' : ''}`); toast(`บันทึก ${d.type} แล้ว`);
  } });
};
A.addComp = (el) => {
  const a = adm(el.dataset.an), groups = [...new Set(S.master.complications.map((c) => c.group))];
  const rel = [...a.px.map((p) => `${p.type}`), ...a.dev.map((d) => `${d.type} ${d.site}`)];
  modal({ title: 'เพิ่ม Complication', body: `${F('ภาวะแทรกซ้อน', `<select class="inp" name="type" required><option value="">— เลือก —</option>${groups.map((g) => `<optgroup label="${g}">${S.master.complications.filter((c) => c.group === g && c.active).map((c) => `<option ${el.dataset.preset === c.name ? 'selected' : ''}>${c.name}</option>`).join('')}</optgroup>`).join('')}</select>`, { req: true })}
    <div class="grid g2">${F('เวลาที่พบ', dt('at', S.now, { req: true }), { req: true })}${F('ความรุนแรง', sel('sev', ['เล็กน้อย', 'ปานกลาง', 'รุนแรง'], 'เล็กน้อย', { blank: false }))}</div>
    ${F('สัมพันธ์กับ', sel('rel', rel, el.dataset.rel || '', { blank: 'ไม่ระบุ' }))}${F('การจัดการ', txt('mgmt', ''))}`,
  onSubmit: (d) => { a.comp.push({ id: 'n' + Date.now(), ...d }); audit('CREATE', 'Complication', a.an, d.type); toast('บันทึก Complication แล้ว'); } });
};
A.editDx = (el) => {
  const a = adm(el.dataset.an);
  modal({ title: 'แก้ไข Diagnosis', body: `${F('Principal Dx', sel('icd', S.master.dx.map((d) => [d.icd, `${d.icd} · ${d.name}`]), a.dx.icd, { req: true }), { req: true })}${F('Secondary Dx', inp('secondary', a.dx.secondary))}`,
    onSubmit: (d) => { const m = S.master.dx.find((x) => x.icd === d.icd); a.dx = { ...a.dx, icd: d.icd, name: m.name, secondary: d.secondary }; audit('UPDATE', 'Dx', a.an, `Principal Dx → ${m.name}`); toast('บันทึก Dx แล้ว'); } });
};
A.editLabs = (el) => {
  const a = adm(el.dataset.an), L = a.labs;
  modal({ title: 'ผล Lab สำคัญ', body: `<div class="grid g2">${F('Troponin-T (ng/L)', inp('trop', L.trop))}${F('Creatinine (mg/dL)', inp('cr', L.cr))}${F('eGFR', inp('egfr', L.egfr))}${F('LVEF (%)', inp('lvef', L.lvef))}</div>`, onSubmit: (d) => { a.labs = d; audit('UPDATE', 'Lab', a.an, 'แก้ไขผล Lab'); toast('บันทึกผล Lab แล้ว'); } });
};
A.editSk = (el) => {
  const a = adm(el.dataset.an), s = a.sk || { given: true, place: 'ER รพ.อุดรธานี' };
  const f = modal({ title: 'SK / Time metrics', wide: true, body: `<div class="field"><span class="label">ให้ยาละลายลิ่มเลือด</span><div class="seg" style="align-self:flex-start"><button type="button" class="${s.given ? 'on' : ''}" data-sk="1">ให้</button><button type="button" class="${s.given ? '' : 'on'}" data-sk="0">ไม่ได้ให้</button></div><input type="hidden" name="given" value="${s.given ? 1 : 0}"></div>
    <div class="grid g3"><div data-show="1">${F('ยา', sel('drug', ['Streptokinase', 'Tenecteplase', 'Alteplase'], s.drug || 'Streptokinase', { blank: false }))}</div><div data-show="1">${F('สถานที่ให้', sel('place', ['ER รพ.อุดรธานี', 'ตึกหัวใจฯ', ...S.master.hospitals.map((h) => h.name)], s.place, { blank: false }))}</div><div data-show="0">${F('เหตุผลที่ไม่ให้', inp('reason', s.reason || 'Primary PCI'))}</div></div>
    <div class="grid g3">${F('Onset (เริ่มมีอาการ)', dt('onset', s.onset || ''))}${F('Door (ถึง รพ.)', dt('door', s.door || ''))}<div data-show="1">${F('Needle (เริ่มยา)', dt('needle', s.needle || ''))}</div><div data-show="1">${F('SK หมด', dt('end', s.end || ''))}</div><div data-show="0">${F('Device (balloon)', dt('device', s.device || ''))}</div></div>
    <div class="grid g2" data-show="1">${F('ผล Reperfusion', sel('result', ['สำเร็จ', 'ไม่สำเร็จ', 'ไม่ทราบ'], s.result || '', {}))}${F('ภาวะแทรกซ้อนจากยา', inp('comp', s.comp || ''))}</div>`,
  onSubmit: (d) => {
    const given = d.given === '1';
    if (given && d.door && d.needle && d.needle < d.door) { toast('เวลา Needle ต้องไม่ก่อน Door', 'err'); return false; }
    if (d.onset && d.door && d.door < d.onset) { toast('เวลา Door ต้องไม่ก่อน Onset', 'err'); return false; }
    a.sk = given ? { given, drug: d.drug, place: d.place, onset: d.onset, door: d.door, needle: d.needle, end: d.end, result: d.result, comp: d.comp } : { given, reason: d.reason, onset: d.onset, door: d.door, device: d.device };
    audit('UPDATE', 'SK', a.an, given ? `ให้ ${d.drug} · D2N ${d.door && d.needle ? mins(d.door, d.needle) + ' นาที' : '-'}` : `ไม่ได้ให้: ${d.reason}`); toast('บันทึก SK / Time metrics แล้ว');
  } });
  const sync = () => { const g = f.elements.given.value; $$('[data-show]', f).forEach((x) => x.classList.toggle('hidden', x.dataset.show !== g)); };
  $$('[data-sk]', f).forEach((b) => b.addEventListener('click', () => { f.elements.given.value = b.dataset.sk; $$('[data-sk]', f).forEach((x) => x.classList.toggle('on', x === b)); sync(); }));
  sync();
};
A.editPatient = (el) => {
  const a = adm(el.dataset.an), p = pt(a);
  modal({ title: 'แก้ไขข้อมูลผู้ป่วย', wide: true, body: `<div class="grid g3">${F('โทรศัพท์', inp('phone', p.phone, { req: true }), { req: true })}${F('สิทธิการรักษา', sel('ins', INSURANCE, p.ins, { req: true }), { req: true })}${F('แพ้ยา (คั่นด้วย ,)', inp('allergy', p.allergy.join(', ')))}
    ${F('ญาติผู้ติดต่อ', inp('cname', p.contact?.name))}${F('ความสัมพันธ์', inp('crel', p.contact?.rel))}${F('โทรศัพท์ญาติ', inp('cphone', p.contact?.phone))}${F('น้ำหนัก (kg)', inp('wt', p.wt, { type: 'number' }))}${F('ส่วนสูง (cm)', inp('ht', p.ht, { type: 'number' }))}</div>`,
  onSubmit: (d) => { Object.assign(p, { phone: d.phone, ins: d.ins, allergy: d.allergy.split(',').map((x) => x.trim()).filter(Boolean), contact: { name: d.cname, rel: d.crel, phone: d.cphone }, wt: Number(d.wt) || p.wt, ht: Number(d.ht) || p.ht }); audit('UPDATE', 'Patient', p.hn, 'แก้ไขข้อมูลส่วนตัว/ผู้ติดต่อ'); toast('บันทึกข้อมูลผู้ป่วยแล้ว'); } });
};
A.dcSubmit = (el, e) => {
  e.preventDefault();
  const f = $('#dcForm'), a = adm(el.dataset.an), dc = a.dcDraft, type = dc.type;
  const miss = $$('[required]', f).filter((x) => !x.value.trim()); if (miss.length) { miss.forEach((x) => x.classList.add('err')); toast('กรุณากรอกช่องที่มี * ให้ครบ', 'err'); return; }
  const blockers = f.querySelector('.blockers');
  const ov = f.elements.override?.value?.trim();
  if (blockers && !ov) { f.elements.override?.classList.add('err'); toast('มีรายการค้าง — ต้องระบุเหตุผล override', 'err'); return; }
  const v = (n) => f.elements[n]?.value || '';
  a.status = 'out';
  a.out = { type, at: v('at'), dest: v('dest'), cause: v('cause'), summary: dc.summary, meds: Object.fromEntries(Object.entries(dc.meds).filter(([, x]) => x)), fu: dc.fu, override: ov ? `${ov} — ${user().name}` : '' };
  a.dev.filter((d) => !d.out && type === 'เสียชีวิต').forEach((d) => (d.out = v('at')));
  a.mv.push({ at: v('at'), from: `ตึกหัวใจฯ เตียง ${a.bed}`, to: type === 'ทุเลา' ? 'บ้าน' : v('dest') || type });
  const bed = a.bed; a.bed = null; a.dcPending = false;
  audit('DISCHARGE', 'Admission', a.an, `${type}${v('dest') ? ' · ' + v('dest') : ''}${ov ? ' (override)' : ''}`);
  save(); location.hash = `#/adm/${a.an}/out`; render(); toast(`บันทึก${type === 'ย้ายตึก' ? 'ย้ายตึก' : 'จำหน่าย'}แล้ว · เตียง ${bed} ว่าง`);
};
A.admitSubmit = () => {
  const f = $('#admitForm'), v = (n) => f.elements[n]?.value?.trim() || '';
  $$('.inp', f).forEach((x) => x.classList.remove('err'));
  const miss = $$('[required]', f).filter((x) => !x.value.trim());
  const cid = v('cid').replace(/\D/g, '');
  if (cid && !cidValid(cid)) miss.push(f.elements.cid);
  if (S.admissions.some((a) => a.an === v('an'))) { miss.push(f.elements.an); toast(`AN ${v('an')} มีอยู่แล้ว`, 'err'); }
  const existing = S.patients[v('hn')];
  if (existing && S.admissions.some((a) => a.hn === existing.hn && a.status === 'active')) { toast('ผู้ป่วยรายนี้ยัง Admit อยู่', 'err'); return; }
  if (miss.length) { miss.forEach((x) => x.classList.add('err')); miss[0].focus(); toast(`ยังกรอกไม่ครบหรือไม่ถูกต้อง ${miss.length} ช่อง`, 'err'); return; }
  const t = TAMBON[v('tambon')];
  S.patients[v('hn')] = { ...(existing || {}), hn: v('hn'), prefix: v('prefix'), fn: v('fn'), ln: v('ln'), sex: v('sex'), age: Number(v('age')), cid, ins: v('ins'), wt: Number(v('wt')) || null, ht: Number(v('ht')) || null, allergy: v('allergy').split(',').map((x) => x.trim()).filter(Boolean), addr: { no: v('no'), moo: v('moo'), road: v('road'), ...t }, phone: v('phone'), contact: { name: v('cname'), rel: v('crel'), phone: v('cphone') }, blood: existing?.blood };
  const m = S.master.dx.find((x) => x.icd === v('dx'));
  const a = { an: v('an'), hn: v('hn'), bed: Number(v('bed')), status: 'active', admitAt: v('admitAt'), source: v('source'), refFrom: v('refFrom'), doctor: v('doctor'), dx: { name: m.name, icd: m.icd, killip: v('killip'), secondary: v('secondary') }, ud: [...f.querySelectorAll('[name=ud]:checked')].map((x) => x.value), labs: {}, sk: null, px: [], dev: [], comp: [], mv: [{ at: v('admitAt'), from: v('refFrom') || v('source'), to: `ตึกหัวใจฯ เตียง ${v('bed')}` }], out: null, dcDraft: { meds: {}, fu: '', summary: '' } };
  S.admissions.push(a);
  audit('CREATE', 'Admission', a.an, `Admit ${a.source}${a.refFrom ? ' จาก ' + a.refFrom : ''} → เตียง ${a.bed}`);
  save(); location.hash = `#/adm/${a.an}`; toast(`รับ ${fullName(S.patients[a.hn])} เข้าเตียง ${a.bed} แล้ว`);
};

// ----- admin
A.addMaster = (el) => {
  const t = el.dataset.t;
  const forms = { procedures: F('ชื่อหัตถการ', inp('name', '', { req: true }), { req: true }), complications: F('ชื่อ', inp('name', '', { req: true }), { req: true }) + F('กลุ่ม', sel('group', ['Access site', 'Cardiac', 'อื่น ๆ'], 'อื่น ๆ', { blank: false })), dx: F('ICD-10', inp('icd', '', { req: true }), { req: true }) + F('ชื่อโรค', inp('name', '', { req: true }), { req: true }), hospitals: F('รหัสสถานพยาบาล', inp('code', '', { req: true }), { req: true }) + F('ชื่อ', inp('name', 'รพ.', { req: true }), { req: true }) + F('อำเภอ', inp('amphoe')), wards: F('ชื่อตึก', inp('name', '', { req: true }), { req: true }) };
  modal({ title: 'เพิ่มรายการ', body: forms[t], onSubmit: (d) => { S.master[t].push({ ...d, active: true }); audit('CREATE', 'Master', t, `เพิ่ม ${d.name || d.icd}`); toast('เพิ่มรายการแล้ว'); } });
};
A.toggleMaster = (el) => { const x = S.master[el.dataset.t][el.dataset.i]; x.active = !x.active; audit('UPDATE', 'Master', el.dataset.t, `${x.active ? 'เปิด' : 'ปิด'}ใช้งาน ${x.name || x.icd}`); save(); render(); };
A.saveProto = (el, e) => { e.preventDefault(); const f = $('#protoForm'); ['first', 'every', 'step', 'sheathHours'].forEach((k) => (S.master.protocol[k] = Number(f.elements[k].value))); const bc = Number(f.elements.bedCount.value); if (bc < Math.max(0, ...active().map((a) => a.bed))) { toast('มีผู้ป่วยอยู่เตียงที่เกินจำนวนนี้', 'err'); return; } S.master.bedCount = bc; audit('UPDATE', 'Master', 'protocol', 'แก้ไขแนวทางอุปกรณ์/จำนวนเตียง'); save(); render(); toast('บันทึกแนวทางแล้ว — การแจ้งเตือนคำนวณใหม่ทันที'); };
A.addUser = () => modal({ title: 'เพิ่มผู้ใช้', body: `<div class="grid g2">${F('ชื่อผู้ใช้', inp('username', '', { req: true }), { req: true })}${F('ชื่อ-สกุล', inp('name', '', { req: true }), { req: true })}${F('ตำแหน่ง', inp('position', 'พยาบาลวิชาชีพ'))}${F('บทบาท', sel('role', Object.entries(ROLES).map(([k, r]) => [k, r.label]), 'nurse', { blank: false }))}</div><div class="xs muted">ระบบจะสร้างรหัสผ่านชั่วคราว และบังคับเปลี่ยนเมื่อเข้าครั้งแรก</div>`, onSubmit: (d) => { if (S.users.some((u) => u.username === d.username)) { toast('ชื่อผู้ใช้ซ้ำ', 'err'); return false; } S.users.push({ id: 'u' + Date.now(), ...d, active: true, last: '' }); audit('CREATE', 'User', d.username, `เพิ่มผู้ใช้ (${ROLES[d.role].label})`); toast('เพิ่มผู้ใช้แล้ว'); } });
A.toggleUser = (el) => { const u = S.users.find((x) => x.id === el.dataset.id); if (u.id === S.userId) { toast('ระงับบัญชีตัวเองไม่ได้', 'err'); return; } u.active = !u.active; audit('UPDATE', 'User', u.username, u.active ? 'เปิดใช้บัญชี' : 'ระงับบัญชี'); save(); render(); };
A.resetPw = (el) => { const u = S.users.find((x) => x.id === el.dataset.id); audit('UPDATE', 'User', u.username, 'รีเซ็ตรหัสผ่าน'); save(); toast(`รีเซ็ตรหัสผ่าน ${u.username} แล้ว (จำลอง)`); };

// ----- CSV export
function csvRows(kind, list, deid) {
  const id = (a) => { const p = pt(a); return deid ? [a.an, p.sex, p.age] : [a.hn, a.an, fullName(p), cidFmt(p.cid), p.sex, p.age, p.phone, `ต.${p.addr.tambon} อ.${p.addr.amphoe}`]; };
  const idH = deid ? ['AN', 'เพศ', 'อายุ'] : ['HN', 'AN', 'ชื่อ-สกุล', 'เลขบัตร', 'เพศ', 'อายุ', 'โทรศัพท์', 'ที่อยู่'];
  if (kind === 'registry') return [idH.concat(['Admit', 'รับจาก', 'Dx', 'ICD-10', 'Killip', 'U/D', 'หัตถการ', 'สถานะ', 'ออกจากตึก', 'ปลายทาง', 'LOS', 'D2N (นาที)', 'ความครบถ้วน %']), ...list.map((a) => id(a).concat([fdt(a.admitAt), a.source + (a.refFrom ? ' ' + a.refFrom : ''), a.dx.name, a.dx.icd, a.dx.killip, a.ud.join(' '), a.px.map((p) => p.type).join(' | '), a.status === 'active' ? 'กำลังรักษา' : a.out.type, a.out ? fdt(a.out.at) : '', a.out?.dest || '', los(a), a.sk?.given && a.sk.door && a.sk.needle ? mins(a.sk.door, a.sk.needle) : '', completeness(a).pct]))];
  if (kind === 'procedures') return [idH.concat(['หัตถการ', 'เริ่ม', 'สิ้นสุด', 'ผู้ทำ', 'Access', 'Sheath', 'Vessel', 'Stent', 'TIMI ก่อน', 'TIMI หลัง', 'Contrast', 'ผล'])].concat(list.flatMap((a) => a.px.map((x) => id(a).concat([x.type, fdt(x.start), fdt(x.end), x.operator, x.access, x.sheath, x.vessel, x.stent, x.timiPre, x.timiPost, x.contrast, x.result]))));
  if (kind === 'devices') return [idH.concat(['อุปกรณ์', 'ตำแหน่ง', 'ขนาด', 'ใส่', 'ถอด', 'ระยะเวลา (ชม.)', 'จำนวนครั้งปล่อยลม'])].concat(list.flatMap((a) => a.dev.map((d) => id(a).concat([d.type, d.site, d.size, fdt(d.in), d.out ? fdt(d.out) : 'ยังใช้อยู่', (mins(d.in, d.out || S.now) / 60).toFixed(1), d.logs.length]))));
  if (kind === 'complications') return [idH.concat(['Complication', 'เวลา', 'ความรุนแรง', 'สัมพันธ์กับ', 'การจัดการ'])].concat(list.flatMap((a) => a.comp.map((c) => id(a).concat([c.type, fdt(c.at), c.sev, c.rel, c.mgmt]))));
  if (kind === 'audit') return [['เวลา', 'ผู้ใช้', 'การกระทำ', 'ข้อมูล', 'อ้างอิง', 'รายละเอียด'], ...S.audit.map((r) => [fdt(r.at), r.user, r.action, r.entity, r.ref, r.detail])];
  const R = liveReport();
  return [
    ['ตัวชี้วัด', 'ค่า'],
    ['ผู้ป่วยรับใหม่ (ราย)', R.tiles.adm],
    ['วันนอนรวม (Patient-days)', R.tiles.patientDays],
    ['วันนอนเฉลี่ย - จำหน่ายแล้ว (LOS, วัน)', R.tiles.los],
    ['วันนอนเฉลี่ย - รวมทั้งหมด (LOS, วัน)', R.tiles.losAll],
    ['อัตราครองเตียง ณ ปัจจุบัน (BOR %)', R.tiles.bor],
    ['อัตราครองเตียงเฉลี่ยในคาบเวลา (BOR %)', R.tiles.periodBor],
    ['อัตราหมุนเวียนเตียง - จำหน่าย (BTR ราย/เตียง)', R.tiles.btr],
    ['อัตราหมุนเวียนเตียง - รวมรับใหม่ (BTR ราย/เตียง)', R.tiles.btrAll],
    ['ระยะเวลาว่างเตียงเฉลี่ย (Turnover Interval, วัน)', R.tiles.toi],
    ['อัตราตายในโรงพยาบาล - เทียบจำหน่าย (%)', R.tiles.mort],
    ['อัตราตายในโรงพยาบาล - เทียบทั้งหมด (%)', R.tiles.mortAll],
    ['จำนวนผู้เสียชีวิต (ราย)', R.tiles.mortN],
    ['D2N ≤ 30 นาที (%)', R.tiles.d2n],
    ['Access-site complication (%)', R.tiles.access],
    ...R.outcomes.map(([k, v]) => [`ออกจากตึก: ${k}`, v]),
    ...R.px.map(([k, v]) => [`หัตถการ: ${k}`, v]),
  ];
}
function download(name, rows) {
  const csv = '﻿' + rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name }); document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
A.csv = (el) => { const kind = el.dataset.kind, deid = S.role === 'qa', list = kind === 'registry' ? regFilter(parse().q) : S.admissions; download(`cardio-${kind}-${S.now.slice(0, 10)}.csv`, csvRows(kind, list, deid)); audit('EXPORT', kind, '-', `ส่งออก ${kind}${deid ? ' (ไม่ระบุตัวตน)' : ''}`); save(); render(); toast('ดาวน์โหลดไฟล์ CSV แล้ว · บันทึกใน Audit log'); };
A.exportRun = (el, e) => { e.preventDefault(); const f = $('#exportForm'); if (!f.elements.purpose.value.trim()) { f.elements.purpose.classList.add('err'); return; } const kind = f.elements.kind.value, deid = f.elements.deid.checked || S.role === 'qa'; download(`cardio-${kind}-${S.now.slice(0, 10)}.csv`, csvRows(kind, regFilter({ per: f.elements.per.value }), deid)); audit('EXPORT', kind, '-', `ส่งออก ${kind} · ${f.elements.per.selectedOptions[0].text}${deid ? ' (ไม่ระบุตัวตน)' : ''} · ${f.elements.purpose.value}`); save(); render(); toast('ดาวน์โหลดไฟล์แล้ว'); };

// ============================================================ events
document.addEventListener('click', (e) => {
  const go = e.target.closest('[data-go]'); const act = e.target.closest('[data-act]');
  if (act && (!go || go.contains(act))) { e.stopPropagation(); A[act.dataset.act]?.(act, e); return; }
  if (go) { e.preventDefault(); $('#app')?.classList.remove('nav-open'); const before = location.hash; location.hash = go.dataset.go; if (location.hash === before) render(); return; }
  if (!e.target.closest('.gs')) $('#sugg')?.classList.add('hidden');
});
['input', 'change'].forEach((t) => document.addEventListener(t, (e) => {
  const el = e.target;
  if (el.id === 'gs' && t === 'input') return suggest(el.value);
  if (el.id === 'regq' && t === 'input') { clearTimeout(ON.t); ON.t = setTimeout(() => { const { q } = parse(); q.q = el.value; q.page = 1; history.replaceState(null, '', '#/patients?' + new URLSearchParams(Object.entries(q).filter(([, v]) => v))); const pos = el.selectionStart; render(); const n = $('#regq'); n.focus(); n.setSelectionRange(pos, pos); }, 200); return; }
  const h = el.dataset.on; if (h && ON[h]) { if (h === 'regsel' && t !== 'change') return; if (['ud', 'med', 'dcPending'].includes(h) && t !== 'change') return; ON[h](el, e); }
  if (el.form?.id === 'admitForm') admitCompUpdate();
}));
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { const g = $('#gs'); if (g) { e.preventDefault(); g.focus(); } }
  if (e.key === 'Enter' && e.target.id === 'gs') { const first = $('#sugg a.hl'); location.hash = first ? first.dataset.go : `#/patients?q=${encodeURIComponent(e.target.value)}`; }
  if (e.key === 'Escape') { $('.modal-bg')?.remove(); $('#sugg')?.classList.add('hidden'); }
});
document.addEventListener('submit', (e) => {
  if (e.target.id === 'loginForm') {
    e.preventDefault();
    S.role = e.target.elements.role.value; S.userId = (S.users.find((u) => u.role === S.role && u.active) || S.users[0]).id; S.loggedIn = true;
    audit('LOGIN', 'Session', '-', `เข้าสู่ระบบ (${ROLES[S.role].label})`); save();
    location.hash = '#/' + ROLES[S.role].pages[0]; render(); toast(`ยินดีต้อนรับ ${user().name}`);
  } else if (['dcForm', 'exportForm', 'protoForm', 'admitForm'].includes(e.target.id)) e.preventDefault();
});
// chart tooltips
document.addEventListener('mousemove', (e) => {
  const g = e.target.closest?.('[data-tip]'); let tt = $('.tt');
  if (!g) { tt?.remove(); return; }
  if (!tt) { tt = document.createElement('div'); tt.className = 'tt'; document.body.append(tt); }
  tt.textContent = g.dataset.tip; tt.style.left = e.clientX + 12 + 'px'; tt.style.top = e.clientY - 34 + 'px';
});
window.addEventListener('hashchange', render);
window.addEventListener('error', (e) => { const b = document.getElementById('err'); if (b) b.textContent += e.message + ' @' + e.lineno + '\n'; });

load();
if (/[?&]auto=1/.test(location.search) && !S.loggedIn) { S.loggedIn = true; const r = (location.search.match(/role=(\w+)/) || [])[1]; if (ROLES[r]) { S.role = r; S.userId = (S.users.find((u) => u.role === r) || S.users[0]).id; } }
render();

// ============================================================ Cardiac Nursing Diagnosis & Care Plan Extension
(function initCardiacCarePlanModule() {
  const ND_LIST = typeof CARDIAC_NURSING_DIAGNOSES !== 'undefined' ? CARDIAC_NURSING_DIAGNOSES : [];
  ['nurse', 'head', 'doctor', 'qa'].forEach((r) => {
    if (ROLES[r] && !ROLES[r].pages.includes('careplan')) ROLES[r].pages.push('careplan');
  });
  const procIdx = NAV.findIndex((x) => x[0] === 'procedures');
  if (procIdx > -1 && !NAV.some((x) => x[0] === 'careplan')) {
    NAV.splice(procIdx + 1, 0, ['careplan', '#/careplan', 'steth', 'ข้อวินิจฉัย & แผนการพยาบาล']);
  }
  if (!TABS.some((x) => x[0] === 'care')) {
    const devIdx = TABS.findIndex((x) => x[0] === 'dev');
    TABS.splice(devIdx + 1, 0, ['care', 'แผนการรักษา & พยาบาล']);
  }

  window.suggestCarePlanForAdm = function(a) {
    const dxStr = [a.dx?.name, a.dx?.icd, a.dx?.killip, a.dx?.secondary, ...(a.ud || [])].join(' ');
    const pxStr = (a.px || []).map((p) => p.type + ' ' + (p.access || '')).join(' ');
    const devStr = (a.dev || []).map((d) => d.type + ' ' + (d.site || '')).join(' ');
    const compStr = (a.comp || []).map((c) => c.type).join(' ');
    const skStr = a.sk?.given ? 'SK Streptokinase' : '';
    const outStr = a.out?.type || '';
    const all = [dxStr, pxStr, devStr, compStr, skStr, outStr].join(' ');

    const codes = new Set();
    if (/STEMI|NSTEMI|Angina|I21|I20|PCI|CAG/i.test(all)) codes.add('ND01');
    if (/Heart failure|CHF|I50|Shock|R57|III|IV|IABP|Cardiomyopathy/i.test(all)) codes.add('ND02');
    if (/VT|VF|AF|I47|I48|I44|Block|CHB|Sinus|TPM|PPM|AICD|Cardioversion|STEMI/i.test(all)) codes.add('ND03');
    if (a.sk?.given || /TR-band|Sheath|PCI|CAG|Hematoma|Bleeding/i.test(all)) codes.add('ND04');
    if (/ETT|HFNC|BiPAP|Pulmonary edema|I50|Shock/i.test(all)) codes.add('ND05');
    if (/STEMI|NSTEMI|Angina|Dissection|Pericardio/i.test(all)) codes.add('ND06');
    if (/CAG|PCI|CKD|AKI|CIN/i.test(all) || (a.labs?.egfr && a.labs.egfr < 60)) codes.add('ND07');
    if (/TPM|PPM|AICD|Sheath|ETT|IABP|Endocarditis/i.test(all)) codes.add('ND08');
    if (/CAG|PCI|PPM|STEMI/i.test(all)) codes.add('ND09');
    if (a.status === 'out' || a.dcPending || /ทุเลา|Refer/i.test(outStr)) codes.add('ND10');
    if (codes.size === 0) { codes.add('ND01'); codes.add('ND10'); }

    const selected = ND_LIST.filter((n) => codes.has(n.code));
    const tx = [], goals = [], intv = [], evals = [];
    selected.forEach((n) => {
      (n.treatmentPlan || []).forEach((t) => { if (!tx.includes('• ' + t)) tx.push('• ' + t); });
      (n.goals || []).forEach((g) => { if (!goals.includes('• ' + g)) goals.push('• ' + g); });
      intv.push(`[${n.code}: ${n.title}]`);
      (n.interventions || []).forEach((iv) => intv.push('  ' + iv));
      if (n.evaluation) evals.push(`• (${n.code}) ${n.evaluation}`);
    });
    return {
      codes: [...codes],
      summary: selected.map((n, i) => `${i + 1}. ${n.title}`).join(' | '),
      treatmentPlan: tx.join('\n'),
      goals: goals.join('\n'),
      interventions: intv.join('\n'),
      evaluation: evals.join('\n'),
      updatedAt: S?.now || '2026-10-16T13:30',
      by: 'ระบบแนะนำอัตโนมัติตามคลินิก'
    };
  };

  window.ensureAdmCarePlan = function(a) {
    if (!a.care || !a.care.codes || !a.care.codes.length) {
      a.care = window.suggestCarePlanForAdm(a);
    }
    return a.care;
  };

  const origSummary = TAB.summary;
  TAB.summary = (a, p) => {
    const c = window.ensureAdmCarePlan(a);
    const ndChips = (c.codes || []).map((code) => {
      const found = ND_LIST.find((n) => n.code === code);
      return `<span class="chip primary" style="margin:2px 4px 2px 0">${esc(code)}: ${esc(found ? found.title.split('(')[0].trim() : code)}</span>`;
    }).join('');
    const careCard = card(
      'ข้อวินิจฉัยการพยาบาล & แผนการรักษา (Cardiac Care Plan)',
      'steth',
      `<div class="stack" style="gap:8px">
        <div>${ndChips || '<span class="muted">ยังไม่ได้เลือกข้อวินิจฉัย</span>'}</div>
        <div class="small"><b>แผนการรักษา (Medical Plan):</b><div class="t2" style="white-space:pre-line;margin-top:2px">${esc((c.treatmentPlan || '').split('\n').slice(0, 3).join('\n'))}</div></div>
        <div class="small"><b>เป้าหมายการพยาบาล (Goals):</b><div class="t2" style="white-space:pre-line;margin-top:2px">${esc((c.goals || '').split('\n').slice(0, 2).join('\n'))}</div></div>
        <div class="xs muted">อัปเดตล่าสุด: ${fdt(c.updatedAt)} · โดย ${esc(c.by || '-')}</div>
      </div>`,
      `<button class="btn sm primary" data-go="#/adm/${a.an}/care">${ic('pencil', 14)}เปิดดู / แก้ไขแผนการพยาบาล</button>`
    );
    return origSummary(a, p) + `<div style="margin-top:14px">${careCard}</div>`;
  };

  TAB.care = (a, p) => {
    const c = window.ensureAdmCarePlan(a);
    const ro = !canEdit();
    const checklist = ND_LIST.map((nd) => {
      const on = (c.codes || []).includes(nd.code);
      return `<label class="opt ${on ? 'on' : ''}" style="align-items:flex-start;gap:10px;padding:10px 12px;cursor:pointer">
        <input type="checkbox" name="ndCode" value="${nd.code}" ${on ? 'checked' : ''} ${ro ? 'disabled' : ''} data-act="toggleNdCode" data-an="${a.an}">
        <div>
          <div class="row" style="gap:6px"><span class="chip primary">${nd.code}</span><b class="small">${esc(nd.title)}</b></div>
          <div class="xs t2" style="margin-top:2px">${esc(nd.cause)}</div>
        </div>
      </label>`;
    }).join('');

    return `<div class="stack" style="gap:14px">
      <div class="card">
        <div class="card-h">
          <h3>${ic('steth')}ข้อวินิจฉัยทางการพยาบาลและแผนการรักษาผู้ป่วยโรคหัวใจ (AN ${a.an} · ${fullName(p)})</h3>
          <div class="row wrap">
            ${!ro ? `<button class="btn soft sm" data-act="autoCarePlan" data-an="${a.an}">${ic('activity', 14)}วิเคราะห์และแนะนำแผนอัตโนมัติตามคลินิก</button>` : ''}
            <button class="btn sm" data-go="#/careplan">${ic('file', 14)}ดูคลังมาตรฐาน 10 ข้อวินิจฉัย</button>
            <button class="btn sm" data-act="print">${ic('printer', 14)}พิมพ์แผนการพยาบาล</button>
          </div>
        </div>
        <form class="card-b stack" style="gap:14px" id="carePlanForm" onsubmit="return false">
          <div>
            <div class="lbl" style="margin-bottom:6px">1. เลือกข้อวินิจฉัยทางการพยาบาลผู้ป่วยโรคหัวใจ (คลิกเลือกได้มากกว่า 1 ข้อ — ระบบจะดึงแผนมาตรฐานให้อัตโนมัติ)</div>
            <div class="grid g2" style="gap:8px">${checklist}</div>
          </div>
          ${F('สรุปข้อวินิจฉัยทางการพยาบาล (Nursing Diagnosis Summary)', inp('summary', c.summary || '', { ro }))}
          <div class="grid g2">
            ${F('2. แผนการรักษาของแพทย์ (Medical Treatment Plan & Medication Regimen)', `<textarea class="inp" name="treatmentPlan" rows="6" ${ro ? 'readonly' : ''}>${esc(c.treatmentPlan || '')}</textarea>`)}
            ${F('3. ข้อมูลสนับสนุน & เป้าหมายการพยาบาล (Assessment & Expected Outcomes)', `<textarea class="inp" name="goals" rows="6" ${ro ? 'readonly' : ''}>${esc(c.goals || '')}</textarea>`)}
          </div>
          <div class="grid g2">
            ${F('4. กิจกรรมการพยาบาลจำเพาะ (Nursing Interventions)', `<textarea class="inp" name="interventions" rows="7" ${ro ? 'readonly' : ''}>${esc(c.interventions || '')}</textarea>`)}
            ${F('5. การประเมินผลการพยาบาล & การวางแผนจำหน่าย (Evaluation & D-METHOD)', `<textarea class="inp" name="evaluation" rows="7" ${ro ? 'readonly' : ''}>${esc(c.evaluation || '')}</textarea>`)}
          </div>
          <div class="row" style="justify-content:space-between">
            <span class="xs muted">บันทึกเมื่อ: ${fdt(c.updatedAt)} · ผู้บันทึก: ${esc(c.by || '-')}</span>
            ${!ro ? `<button type="button" class="btn primary lg" data-act="saveCarePlan" data-an="${a.an}">${ic('save')}บันทึกแผนการรักษาและแผนการพยาบาล</button>` : ''}
          </div>
        </form>
      </div>
    </div>`;
  };

  A.toggleNdCode = (el) => {
    const a = adm(el.dataset.an);
    if (!a) return;
    const f = $('#carePlanForm');
    const codes = [...f.querySelectorAll('[name=ndCode]:checked')].map((x) => x.value);
    const selected = ND_LIST.filter((n) => codes.includes(n.code));
    const tx = [], goals = [], intv = [], evals = [];
    selected.forEach((n) => {
      (n.treatmentPlan || []).forEach((t) => { if (!tx.includes('• ' + t)) tx.push('• ' + t); });
      (n.goals || []).forEach((g) => { if (!goals.includes('• ' + g)) goals.push('• ' + g); });
      intv.push(`[${n.code}: ${n.title}]`);
      (n.interventions || []).forEach((iv) => intv.push('  ' + iv));
      if (n.evaluation) evals.push(`• (${n.code}) ${n.evaluation}`);
    });
    a.care = {
      codes,
      summary: selected.map((n, i) => `${i + 1}. ${n.title}`).join(' | '),
      treatmentPlan: tx.join('\n'),
      goals: goals.join('\n'),
      interventions: intv.join('\n'),
      evaluation: evals.join('\n'),
      updatedAt: S.now,
      by: user().name
    };
    save(); render();
  };

  A.autoCarePlan = (el) => {
    const a = adm(el.dataset.an);
    if (!a) return;
    a.care = { ...window.suggestCarePlanForAdm(a), updatedAt: S.now, by: user().name };
    audit('UPDATE', 'CarePlan', a.an, `สร้างแผนการพยาบาลอัตโนมัติ (${a.care.codes.join(', ')})`);
    save(); render();
    toast('วิเคราะห์และดึงแผนการพยาบาลมาตรฐานตามข้อมูลคลินิกเรียบร้อยแล้ว');
  };

  A.saveCarePlan = (el) => {
    const a = adm(el.dataset.an);
    const f = $('#carePlanForm');
    if (!a || !f) return;
    const codes = [...f.querySelectorAll('[name=ndCode]:checked')].map((x) => x.value);
    a.care = {
      codes,
      summary: f.elements.summary.value.trim(),
      treatmentPlan: f.elements.treatmentPlan.value.trim(),
      goals: f.elements.goals.value.trim(),
      interventions: f.elements.interventions.value.trim(),
      evaluation: f.elements.evaluation.value.trim(),
      updatedAt: S.now,
      by: user().name
    };
    audit('UPDATE', 'CarePlan', a.an, `บันทึกแผนการรักษาและแผนการพยาบาล (${codes.join(', ') || 'กำหนดเอง'})`);
    save(); render();
    toast('บันทึกแผนการรักษาและแผนการพยาบาลเรียบร้อยแล้ว');
  };

  P.careplan = (q) => {
    const kw = (q.q || '').toLowerCase().trim();
    const list = ND_LIST.filter((n) => !kw || JSON.stringify(n).toLowerCase().includes(kw));
    return `<div class="page-h">
      <div>
        <h1>คลังมาตรฐานข้อวินิจฉัยการพยาบาล & แผนการรักษาโรคหัวใจ</h1>
        <p>มาตรฐานการพยาบาลผู้ป่วยวิกฤตหัวใจและหลอดเลือด (ACS / STEMI / NSTEMI / Heart Failure / Shock / Arrhythmia / SK / ETT / TR-band / Sheath)</p>
      </div>
      <div class="row">
        <button class="btn" data-go="#/patients">${ic('clipboard')}ไปที่ทะเบียนผู้ป่วยเพื่อเขียนแผนรายบุคคล</button>
        <button class="btn" data-act="print">${ic('printer')}พิมพ์มาตรฐานแผนการพยาบาล</button>
      </div>
    </div>
    <div class="grid g2" style="gap:14px">
      ${list.map((nd) => `<div class="card">
        <div class="card-h">
          <div>
            <div class="row" style="gap:8px"><span class="chip primary">${nd.code}</span><b>${esc(nd.title)}</b></div>
            <div class="xs muted" style="margin-top:3px">${esc(nd.cause)}</div>
          </div>
        </div>
        <div class="card-b stack" style="gap:10px">
          <div><div class="xs b" style="color:var(--primary)">🔍 ข้อมูลสนับสนุน (Subjective / Objective Data)</div><ul style="margin:4px 0 0 18px;padding:0" class="small t2">${(nd.subjectiveObj || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
          <div><div class="xs b" style="color:var(--ok)">🎯 เป้าหมายและเกณฑ์การประเมินผล (Expected Outcomes)</div><ul style="margin:4px 0 0 18px;padding:0" class="small t2">${(nd.goals || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
          <div><div class="xs b" style="color:#1e40af">💊 แผนการรักษาของแพทย์ที่เกี่ยวข้อง (Medical Treatment Plan)</div><ul style="margin:4px 0 0 18px;padding:0" class="small t2">${(nd.treatmentPlan || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
          <div><div class="xs b" style="color:#0f4c81">🩺 กิจกรรมการพยาบาลมาตรฐาน (Nursing Interventions)</div><ul style="margin:4px 0 0 4px;padding:0;list-style:none" class="small t2">${(nd.interventions || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
          <div class="xs" style="border-top:1px dashed var(--border);padding-top:6px;color:var(--ok)"><b>✅ การประเมินผล (Evaluation):</b> ${esc(nd.evaluation)}</div>
        </div>
      </div>`).join('')}
    </div>`;
  };

  if (S && S.admissions) S.admissions.forEach((a) => window.ensureAdmCarePlan(a));
  render();
})();
