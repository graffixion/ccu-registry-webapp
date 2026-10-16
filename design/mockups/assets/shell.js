// Wraps <div data-shell="<active-key>"> with the desktop sidebar + topbar.
// Load after the page markup and before icons.js.
(function () {
  const root = document.querySelector('[data-shell]');
  if (!root) return;
  const active = root.dataset.shell;

  const nav = [
    ['sec', 'งานประจำวัน'],
    ['dashboard', 'grid', 'ภาพรวมตึก', '<span class="badge">4</span>'],
    ['registry', 'clipboard', 'ทะเบียนผู้ป่วย', '<span class="count num">1,284</span>'],
    ['admit', 'userplus', 'รับผู้ป่วยใหม่ (Admit)'],
    ['procedures', 'activity', 'หัตถการ / Cath lab'],
    ['sec', 'วิเคราะห์'],
    ['reports', 'chart', 'รายงานและตัวชี้วัด'],
    ['export', 'download', 'ส่งออกข้อมูล'],
    ['sec', 'ผู้ดูแลระบบ'],
    ['master', 'database', 'ข้อมูลหลัก (Master data)'],
    ['users', 'users', 'ผู้ใช้งานและสิทธิ์'],
    ['audit', 'history', 'Audit log'],
  ];

  const items = nav.map(([key, icon, label, extra]) =>
    key === 'sec'
      ? `<div class="nav-sec">${icon}</div>`
      : `<a class="${key === active ? 'on' : ''}"><i data-i="${icon}"></i>${label}${extra || ''}</a>`
  ).join('');

  const sidebar = `
    <aside class="sidebar">
      <div class="brand">
        <div class="logo"><i data-i="heartpulse"></i></div>
        <div><b>Cardio Registry</b><small>ทะเบียนผู้ป่วยตึกหัวใจฯ<br>โรงพยาบาลอุดรธานี</small></div>
      </div>
      <nav class="nav">${items}</nav>
      <div class="side-foot">
        <div class="avatar">ทส</div>
        <div class="grow"><div class="b small">พว.ทดสอบ ระบบ</div><div class="xs muted">พยาบาลวิชาชีพ · หัวหน้าเวร</div></div>
        <i data-i="logout" style="color:var(--muted)"></i>
      </div>
    </aside>`;

  const topbar = `
    <header class="topbar">
      <div class="search"><i data-i="search"></i>ค้นหา HN / AN / ชื่อ-สกุล / เลขบัตรประชาชน<span class="kbd">/</span></div>
      <div class="grow"></div>
      <span class="chip primary lg"><i data-i="bed"></i>ตึกหัวใจและหลอดเลือด</span>
      <span class="small t2 num">ศ. 16 ต.ค. 2569 · 13:33 · เวรเช้า</span>
      <span class="icon-btn"><i data-i="bell"></i><span class="badge">4</span></span>
    </header>`;

  root.outerHTML = `<div class="app">${sidebar}<main class="main">${topbar}<div class="content">${root.innerHTML}</div></main></div>`;
})();
