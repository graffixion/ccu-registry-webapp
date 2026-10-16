// Mock data for the clickable prototype — every person and number here is fictional.
/* eslint-disable no-unused-vars */
const NOW0 = '2026-10-16T13:33';

const TAMBON = {
  nonghan: { tambon: 'หนองหาน', amphoe: 'หนองหาน', prov: 'อุดรธานี', zip: '41130' },
  kumpawapi: { tambon: 'กุมภวาปี', amphoe: 'กุมภวาปี', prov: 'อุดรธานี', zip: '41110' },
  makkhaeng: { tambon: 'หมากแข้ง', amphoe: 'เมืองอุดรธานี', prov: 'อุดรธานี', zip: '41000' },
  bandung: { tambon: 'ศรีสุทโธ', amphoe: 'บ้านดุง', prov: 'อุดรธานี', zip: '41190' },
  phen: { tambon: 'เพ็ญ', amphoe: 'เพ็ญ', prov: 'อุดรธานี', zip: '41150' },
  banphue: { tambon: 'บ้านผือ', amphoe: 'บ้านผือ', prov: 'อุดรธานี', zip: '41160' },
  nongwuaso: { tambon: 'หมากหญ้า', amphoe: 'หนองวัวซอ', prov: 'อุดรธานี', zip: '41360' },
  nongsamrong: { tambon: 'หนองสำโรง', amphoe: 'เมืองอุดรธานี', prov: 'อุดรธานี', zip: '41000' },
};

const HOSPITALS = [
  { code: 'H01', name: 'รพ.กุมภวาปี', amphoe: 'กุมภวาปี' },
  { code: 'H02', name: 'รพ.หนองหาน', amphoe: 'หนองหาน' },
  { code: 'H03', name: 'รพ.บ้านดุง', amphoe: 'บ้านดุง' },
  { code: 'H04', name: 'รพ.เพ็ญ', amphoe: 'เพ็ญ' },
  { code: 'H05', name: 'รพ.หนองวัวซอ', amphoe: 'หนองวัวซอ' },
  { code: 'H06', name: 'รพ.บ้านผือ', amphoe: 'บ้านผือ' },
  { code: 'H07', name: 'รพ.น้ำโสม', amphoe: 'น้ำโสม' },
  { code: 'H08', name: 'รพ.ศรีธาตุ', amphoe: 'ศรีธาตุ' },
];
const WARDS = ['ICU อายุรกรรม', 'อายุรกรรมชาย 1', 'อายุรกรรมหญิง 2', 'Step-down หัวใจ', 'ศัลยกรรมหัวใจ'];
const DOCTORS = ['นพ.ตัวอย่าง หนึ่ง', 'พญ.ตัวอย่าง สอง', 'นพ.ตัวอย่าง สาม'];
const INSURANCE = ['UC (บัตรทอง)', 'ข้าราชการ', 'ประกันสังคม', 'รัฐวิสาหกิจ', 'ชำระเอง', 'อื่น ๆ'];
const UD_LIST = ['DM', 'HT', 'DLP', 'CKD', 'สูบบุหรี่', 'Prior MI/PCI/CABG', 'Stroke/TIA', 'AF', 'Heart failure', 'COPD/Asthma'];
const MEDS = ['Aspirin', 'P2Y12 inhibitor', 'High-intensity statin', 'Beta-blocker', 'ACEI/ARB/ARNI', 'SGLT2i'];
const OUTCOMES = ['ทุเลา', 'Refer back', 'ย้ายตึก', 'เสียชีวิต', 'ไม่สมัครใจอยู่'];
const DEVICE_TYPES = ['TR-band', 'Sheath', 'ETT', 'TPM', 'IABP', 'CVC', 'Foley'];

const MASTER0 = {
  procedures: ['CAG', 'CAG + PCI', 'Primary PCI', 'Rescue PCI', 'Pharmaco-invasive PCI', 'TPM', 'PPM', 'ICD/CRT', 'IABP', 'Pericardiocentesis', 'Right heart cath', 'DC cardioversion', 'Intubation', 'CVC'].map((name) => ({ name, active: true })),
  complications: [
    ['Hematoma', 'Access site'], ['Bleeding (access site)', 'Access site'], ['Pseudoaneurysm', 'Access site'], ['Radial artery occlusion', 'Access site'], ['Retroperitoneal hematoma', 'Access site'],
    ['VT/VF', 'Cardiac'], ['AF ใหม่', 'Cardiac'], ['Complete heart block', 'Cardiac'], ['Cardiac arrest', 'Cardiac'], ['Cardiogenic shock', 'Cardiac'], ['Tamponade', 'Cardiac'], ['No-reflow', 'Cardiac'], ['Stent thrombosis', 'Cardiac'],
    ['CI-AKI', 'อื่น ๆ'], ['Stroke', 'อื่น ๆ'], ['Contrast allergy', 'อื่น ๆ'], ['Fibrinolytic bleeding', 'อื่น ๆ'], ['Hypotension จาก SK', 'อื่น ๆ'], ['VAP', 'อื่น ๆ'], ['Pressure injury', 'อื่น ๆ'], ['Fall', 'อื่น ๆ'], ['Unplanned extubation', 'อื่น ๆ'],
  ].map(([name, group]) => ({ name, group, active: true })),
  dx: [
    ['I21.0', 'Acute anterior wall STEMI'], ['I21.1', 'Acute inferior wall STEMI'], ['I21.2', 'Acute STEMI of other sites'], ['I21.4', 'NSTEMI'],
    ['I20.0', 'Unstable angina'], ['I50.0', 'Acute decompensated heart failure'], ['R57.0', 'Cardiogenic shock'], ['I44.2', 'Complete heart block'],
    ['I48.9', 'Atrial fibrillation with RVR'], ['I47.2', 'Ventricular tachycardia'], ['I49.5', 'Sick sinus syndrome'], ['I31.3', 'Pericardial effusion'],
  ].map(([icd, name]) => ({ icd, name, active: true })),
  hospitals: HOSPITALS.map((h) => ({ ...h, active: true })),
  wards: WARDS.map((name) => ({ name, active: true })),
  bedCount: 16,
  protocol: { first: 120, every: 15, step: 3, sheathHours: 4 },
};

const USERS0 = [
  { id: 'u1', username: 'nurse01', name: 'พว.ทดสอบ ระบบ', position: 'พยาบาลวิชาชีพ', role: 'nurse', active: true, last: '2026-10-16T07:52' },
  { id: 'u2', username: 'head01', name: 'พว.หัวหน้า ตัวอย่าง', position: 'หัวหน้าตึก', role: 'head', active: true, last: '2026-10-16T08:10' },
  { id: 'u3', username: 'dr01', name: 'นพ.ตัวอย่าง หนึ่ง', position: 'อายุรแพทย์โรคหัวใจ', role: 'doctor', active: true, last: '2026-10-16T09:40' },
  { id: 'u4', username: 'dr02', name: 'พญ.ตัวอย่าง สอง', position: 'อายุรแพทย์โรคหัวใจ', role: 'doctor', active: true, last: '2026-10-15T18:22' },
  { id: 'u5', username: 'nurse02', name: 'พว.เวรบ่าย ตัวอย่าง', position: 'พยาบาลวิชาชีพ', role: 'nurse', active: true, last: '2026-10-15T23:58' },
  { id: 'u6', username: 'qa01', name: 'นางสาวคุณภาพ ตัวอย่าง', position: 'งานพัฒนาคุณภาพ', role: 'qa', active: true, last: '2026-10-14T10:05' },
  { id: 'u7', username: 'admin', name: 'นายไอที ตัวอย่าง', position: 'ศูนย์คอมพิวเตอร์', role: 'admin', active: true, last: '2026-10-16T08:01' },
  { id: 'u8', username: 'nurse03', name: 'พว.ย้ายแล้ว ตัวอย่าง', position: 'พยาบาลวิชาชีพ', role: 'nurse', active: false, last: '2026-08-30T15:00' },
];

// Valid 13-digit Thai ID from a seed (checksum computed, digits fictional)
function mockCid(seed) {
  const body = ('3' + '41' + String((seed * 104729 + 12345) % 1e9).padStart(9, '0'));
  const sum = [...body].reduce((s, c, i) => s + Number(c) * (13 - i), 0);
  return body + ((11 - (sum % 11)) % 10);
}

function mockData() {
  const patients = {};
  const P = (hn, prefix, fn, ln, sex, age, t, x = {}) => {
    const seed = Number(hn);
    patients[hn] = {
      hn, prefix, fn, ln, sex, age, dob: `${2026 - age}-0${(seed % 9) + 1}-1${seed % 9}`,
      cid: mockCid(seed), phone: `08${seed % 10}-${String(seed).slice(1, 4)}-${String(seed).slice(-4)}`,
      ins: INSURANCE[seed % 3], addr: { no: String((seed % 180) + 1), moo: String((seed % 12) + 1), road: '', ...TAMBON[t] },
      contact: { name: `ญาติของ${fn}`, rel: sex === 'ช' ? 'ภรรยา' : 'บุตร', phone: `09${seed % 10}-${String(seed).slice(2, 5)}-${String(seed).slice(-4)}` },
      allergy: [], blood: ['O Rh+', 'A Rh+', 'B Rh+', 'AB Rh+'][seed % 4], wt: 50 + (seed % 30), ht: 150 + (seed % 25), ...x,
    };
  };
  let id = 1;
  const nid = () => 'x' + id++;
  const A = (o) => ({
    status: 'active', ud: [], labs: {}, sk: null, px: [], dev: [], comp: [], mv: [], out: null,
    dcDraft: { meds: {}, fu: '', summary: '' }, ...o,
    px: (o.px || []).map((p) => ({ id: nid(), ...p })),
    dev: (o.dev || []).map((d) => ({ id: nid(), logs: [], ...d })),
    comp: (o.comp || []).map((c) => ({ id: nid(), ...c })),
  });

  // ---------- patients ----------
  P('0123456', 'นาย', 'สมชาย', 'ใจดี', 'ช', 68, 'kumpawapi');
  P('0198765', 'นาง', 'บุญมี', 'ทดสอบ', 'ญ', 74, 'makkhaeng');
  P('0234567', 'นาย', 'ประเสริฐ', 'สุขใจ', 'ช', 59, 'nonghan', { allergy: ['Sulfa'], contact: { name: 'นางสมใจ สุขใจ', rel: 'ภรรยา', phone: '089-123-4567' }, ins: 'UC (บัตรทอง)', wt: 68, ht: 168 });
  P('0345678', 'นางสาว', 'มาลี', 'ศรีสุข', 'ญ', 45, 'nongsamrong');
  P('0456789', 'นาย', 'ทองดี', 'มั่นคง', 'ช', 81, 'phen');
  P('0567891', 'นาย', 'วิชัย', 'ดีงาม', 'ช', 63, 'banphue', { allergy: ['Contrast media (ผื่น)'] });
  P('0678912', 'นาง', 'จันทร์เพ็ญ', 'แสงทอง', 'ญ', 70, 'makkhaeng');
  P('0789123', 'นาย', 'สุรชัย', 'พึ่งบุญ', 'ช', 55, 'nongwuaso');
  P('0891234', 'นาง', 'คำปุน', 'ใจงาม', 'ญ', 77, 'phen', { allergy: ['Penicillin'] });
  P('0912345', 'นาย', 'บุญเลิศ', 'ทองคำ', 'ช', 66, 'bandung');
  P('0123987', 'นาย', 'อำนาจ', 'ศรีวงศ์', 'ช', 52, 'makkhaeng');
  P('0234876', 'นาง', 'สมพร', 'คำดี', 'ญ', 61, 'bandung');
  P('0345765', 'นาย', 'เกียรติ', 'ชัยมงคล', 'ช', 49, 'nongsamrong');
  P('0456654', 'นาง', 'ลำดวน', 'บุญมา', 'ญ', 83, 'kumpawapi');
  // discharged-only patients
  P('0567812', 'นาย', 'สมหวัง', 'แก้วมณี', 'ช', 72, 'makkhaeng');
  P('0678123', 'นาง', 'ทองใบ', 'ศรีสวัสดิ์', 'ญ', 66, 'nonghan');
  P('0789234', 'นาย', 'สมบัติ', 'ใจกล้า', 'ช', 79, 'kumpawapi');
  P('0891345', 'นาง', 'สายทอง', 'พรมมา', 'ญ', 58, 'nongsamrong');
  P('0912456', 'นาย', 'ชาญ', 'ศรีบุญ', 'ช', 61, 'kumpawapi');
  P('0123567', 'นาง', 'คำแพง', 'มีสุข', 'ญ', 69, 'phen');
  P('0234678', 'นาย', 'วีระ', 'บุญยืน', 'ช', 47, 'makkhaeng');
  P('0345111', 'นาย', 'ไพโรจน์', 'แสนดี', 'ช', 64, 'banphue');
  P('0456222', 'นาง', 'บัวผัน', 'ทองมา', 'ญ', 71, 'bandung');
  P('0567333', 'นาย', 'ณรงค์', 'พลายงาม', 'ช', 57, 'nonghan');
  P('0678444', 'นาง', 'เพ็ญศรี', 'จันทร์งาม', 'ญ', 62, 'nongwuaso');
  P('0789555', 'นาย', 'สุพจน์', 'ทองแท้', 'ช', 75, 'phen');

  const D1 = DOCTORS[0], D2 = DOCTORS[1], D3 = DOCTORS[2];
  const admissions = [
    // ---------- active ----------
    A({ an: '6912240', hn: '0123456', bed: 1, admitAt: '2026-10-14T06:20', source: 'Refer-in', refFrom: 'รพ.กุมภวาปี', doctor: D1,
      dx: { name: 'Acute anterior wall STEMI', icd: 'I21.0', killip: 'III', secondary: 'Post cardiac arrest (VF)' }, ud: ['DM', 'HT'],
      labs: { trop: '8,420', cr: '1.6', egfr: '44', lvef: '30' },
      sk: { given: true, drug: 'Streptokinase', place: 'รพ.กุมภวาปี', onset: '2026-10-14T03:40', door: '2026-10-14T04:30', needle: '2026-10-14T05:05', end: '2026-10-14T06:05', result: 'สำเร็จ', comp: '' },
      px: [{ type: 'CAG + PCI', start: '2026-10-14T10:00', end: '2026-10-14T11:10', operator: D1, access: 'Rt femoral', sheath: '7', vessel: 'LAD', stent: 'DES × 2', timiPre: '2', timiPost: '3', contrast: '180', fluoro: '18.2', result: 'สำเร็จ' },
        { type: 'Intubation', start: '2026-10-15T02:05', end: '2026-10-15T02:10', operator: 'แพทย์เวร', access: '-', result: 'สำเร็จ' }],
      dev: [{ type: 'ETT', site: 'Oral', size: '7.5', in: '2026-10-15T02:10', out: null },
        { type: 'Sheath', site: 'Rt femoral artery', size: '7', in: '2026-10-14T10:00', out: '2026-10-14T16:20', meta: { act: '148', hemostasis: 'Manual compression' } },
        { type: 'Foley', site: 'Urethral', size: '14', in: '2026-10-15T02:30', out: null }],
      comp: [{ type: 'Cardiac arrest', at: '2026-10-15T01:50', sev: 'รุนแรง', rel: 'VF arrest — CPR 4 นาที ROSC', mgmt: 'Defibrillation 200J ×2, Amiodarone' }],
      mv: [{ at: '2026-10-14T06:20', from: 'รพ.กุมภวาปี', to: 'ER' }, { at: '2026-10-14T09:40', from: 'ER', to: 'Cath lab' }, { at: '2026-10-14T11:30', from: 'Cath lab', to: 'ตึกหัวใจฯ เตียง 1' }] }),
    A({ an: '6912288', hn: '0198765', bed: 2, admitAt: '2026-10-15T15:40', source: 'ER', doctor: D2,
      dx: { name: 'NSTEMI', icd: 'I21.4', killip: 'I', secondary: 'CKD stage 3' }, ud: ['HT', 'DLP', 'CKD'], labs: { trop: '312', cr: '1.8', egfr: '38' },
      mv: [{ at: '2026-10-15T15:40', from: 'ER', to: 'ตึกหัวใจฯ เตียง 2' }] }),
    A({ an: '6912310', hn: '0234567', bed: 3, admitAt: '2026-10-16T09:10', source: 'Refer-in', refFrom: 'รพ.หนองหาน', doctor: D1,
      dx: { name: 'Acute inferior wall STEMI', icd: 'I21.1', killip: 'I', secondary: 'Type 2 DM, Hypertension' }, ud: ['DM', 'HT', 'DLP', 'สูบบุหรี่'],
      labs: { trop: '1,250', cr: '1.1', egfr: '72', lvef: '50' },
      sk: { given: true, drug: 'Streptokinase', place: 'รพ.หนองหาน', onset: '2026-10-16T05:40', door: '2026-10-16T06:35', needle: '2026-10-16T06:58', end: '2026-10-16T07:58', result: 'ไม่สำเร็จ', comp: 'Hypotension (ให้ NSS 200 ml)' },
      px: [{ type: 'Rescue PCI', start: '2026-10-16T10:20', end: '2026-10-16T11:30', operator: D1, access: 'Rt radial', sheath: '6', vessel: 'RCA', stent: 'DES × 1 (3.0 × 28 mm)', timiPre: '0', timiPost: '3', contrast: '140', fluoro: '12.5', result: 'สำเร็จ' }],
      dev: [{ type: 'Sheath', site: 'Rt radial artery', size: '6', in: '2026-10-16T10:20', out: '2026-10-16T11:40', meta: { hemostasis: 'TR-band' } },
        { type: 'TR-band', site: 'Rt radial', size: '-', in: '2026-10-16T11:45', out: null, meta: { ml: 15 } }],
      comp: [{ type: 'Hematoma', at: '2026-10-16T12:30', sev: 'เล็กน้อย', rel: 'Rescue PCI (Access site)', mgmt: 'EASY grade I (< 5 cm) · ประคบเย็น ติดตามทุก 15 นาที' }],
      mv: [{ at: '2026-10-16T09:10', from: 'รพ.หนองหาน', to: 'ER' }, { at: '2026-10-16T09:40', from: 'ER', to: 'Cath lab' }, { at: '2026-10-16T11:55', from: 'Cath lab', to: 'ตึกหัวใจฯ เตียง 3' }] }),
    A({ an: '6912301', hn: '0345678', bed: 4, admitAt: '2026-10-16T07:30', source: 'OPD', doctor: D2,
      dx: { name: 'Unstable angina', icd: 'I20.0', killip: 'I', secondary: '' }, ud: ['DLP'], labs: { trop: '< 14', cr: '0.7', egfr: '102', lvef: '62' },
      px: [{ type: 'CAG', start: '2026-10-16T10:50', end: '2026-10-16T11:15', operator: D2, access: 'Rt radial', sheath: '6', vessel: 'Insignificant CAD', stent: '-', timiPre: '3', timiPost: '3', contrast: '60', fluoro: '4.1', result: 'สำเร็จ' }],
      dev: [{ type: 'TR-band', site: 'Rt radial', size: '-', in: '2026-10-16T11:23', out: null, meta: { ml: 13 }, logs: [{ at: '2026-10-16T13:23', ml: 3, by: 'พว.ทดสอบ ระบบ', ok: true }] }],
      mv: [{ at: '2026-10-16T07:30', from: 'OPD', to: 'ตึกหัวใจฯ เตียง 4' }] }),
    A({ an: '6912198', hn: '0456789', bed: 5, admitAt: '2026-10-13T20:15', source: 'ER', doctor: D3,
      dx: { name: 'Complete heart block', icd: 'I44.2', killip: 'I', secondary: 'รอ PPM 17/10/69' }, ud: ['HT'], labs: { trop: '24', cr: '1.2', egfr: '58', lvef: '55' },
      px: [{ type: 'TPM', start: '2026-10-13T21:00', end: '2026-10-13T21:30', operator: D3, access: 'Rt femoral vein', sheath: '6', result: 'สำเร็จ' }],
      dev: [{ type: 'TPM', site: 'Rt femoral vein', size: '6', in: '2026-10-13T21:30', out: null, meta: { rate: '70', output: '5 mA' } }],
      mv: [{ at: '2026-10-13T20:15', from: 'ER', to: 'ตึกหัวใจฯ เตียง 5' }] }),
    A({ an: '6912265', hn: '0567891', bed: 7, admitAt: '2026-10-15T21:10', source: 'ER', doctor: D1,
      dx: { name: 'Acute inferior wall STEMI', icd: 'I21.1', killip: 'II', secondary: 'RV infarction' }, ud: ['สูบบุหรี่'], labs: { trop: '4,880', cr: '1.0', egfr: '80' },
      sk: { given: false, reason: 'Late presentation > 12 ชม. — ทำ PCI', onset: '2026-10-15T07:00', door: '2026-10-15T21:10' },
      px: [{ type: 'CAG + PCI', start: '2026-10-16T08:40', end: '2026-10-16T09:35', operator: D1, access: 'Rt femoral', sheath: '7', vessel: 'RCA', stent: 'DES × 1', timiPre: '1', timiPost: '3', contrast: '120', fluoro: '10.0', result: 'สำเร็จ' }],
      dev: [{ type: 'Sheath', site: 'Rt femoral artery', size: '7', in: '2026-10-16T08:40', out: null, meta: {} }],
      mv: [{ at: '2026-10-15T21:10', from: 'ER', to: 'ตึกหัวใจฯ เตียง 7' }] }),
    A({ an: '6912122', hn: '0678912', bed: 8, admitAt: '2026-10-12T10:00', source: 'ER', doctor: D2, dcPending: true,
      dx: { name: 'Acute decompensated heart failure', icd: 'I50.0', killip: 'III', secondary: 'Ischemic cardiomyopathy' }, ud: ['DM', 'HT', 'Heart failure'], labs: { cr: '1.4', egfr: '41' },
      dev: [{ type: 'Foley', site: 'Urethral', size: '14', in: '2026-10-12T11:00', out: '2026-10-14T09:00' }],
      dcDraft: { meds: { 'Beta-blocker': 'ให้' }, fu: '', summary: 'อาการเหนื่อยดีขึ้น ลดยาขับปัสสาวะเป็นชนิดรับประทาน' },
      mv: [{ at: '2026-10-12T10:00', from: 'ER', to: 'ตึกหัวใจฯ เตียง 8' }] }),
    A({ an: '6912280', hn: '0789123', bed: 9, admitAt: '2026-10-15T11:00', source: 'Refer-in', refFrom: 'รพ.หนองวัวซอ', doctor: D3,
      dx: { name: 'NSTEMI', icd: 'I21.4', killip: 'I', secondary: '' }, ud: ['DM', 'DLP'], labs: { trop: '640', cr: '0.9', egfr: '90', lvef: '55' },
      px: [{ type: 'CAG + PCI', start: '2026-10-15T14:00', end: '2026-10-15T14:40', operator: D3, access: 'Rt radial', sheath: '6', vessel: 'LCx', stent: 'DES × 1', timiPre: '2', timiPost: '3', contrast: '90', fluoro: '7.4', result: 'สำเร็จ' }],
      dev: [{ type: 'TR-band', site: 'Rt radial', size: '-', in: '2026-10-15T14:45', out: '2026-10-15T17:45', meta: { ml: 15 }, logs: [0, 1, 2, 3, 4].map((i) => ({ at: `2026-10-15T${16 + Math.floor((45 + i * 15) / 60)}:${String((45 + i * 15) % 60).padStart(2, '0')}`, ml: 3, by: 'พว.เวรบ่าย ตัวอย่าง', ok: true })) }],
      mv: [{ at: '2026-10-15T11:00', from: 'รพ.หนองวัวซอ', to: 'ตึกหัวใจฯ เตียง 9' }] }),
    A({ an: '6912221', hn: '0891234', bed: 10, admitAt: '2026-10-14T18:00', source: 'ER', doctor: D2,
      dx: { name: 'Atrial fibrillation with RVR', icd: 'I48.9', killip: 'II', secondary: '' }, ud: ['HT', 'AF'], labs: { cr: '1.0', egfr: '62', lvef: '48' },
      mv: [{ at: '2026-10-14T18:00', from: 'ER', to: 'ตึกหัวใจฯ เตียง 10' }] }),
    A({ an: '6912251', hn: '0912345', bed: 12, admitAt: '2026-10-15T01:30', source: 'Refer-in', refFrom: 'รพ.บ้านดุง', doctor: D1,
      dx: { name: 'Cardiogenic shock', icd: 'R57.0', killip: 'IV', secondary: 'Acute anterior wall STEMI' }, ud: ['HT', 'สูบบุหรี่'], labs: { trop: '12,600', cr: '2.1', egfr: '32', lvef: '20' },
      sk: { given: false, reason: 'ส่งตรงเพื่อทำ Primary PCI', onset: '2026-10-14T23:50', door: '2026-10-15T01:30', device: '2026-10-15T02:52' },
      px: [{ type: 'Intubation', start: '2026-10-15T02:15', end: '2026-10-15T02:20', operator: D1, access: '-', result: 'สำเร็จ' },
        { type: 'Primary PCI', start: '2026-10-15T02:40', end: '2026-10-15T03:40', operator: D1, access: 'Rt femoral', sheath: '7', vessel: 'LAD (proximal)', stent: 'DES × 1', timiPre: '0', timiPost: '2', contrast: '160', fluoro: '15.8', result: 'สำเร็จบางส่วน' },
        { type: 'IABP', start: '2026-10-15T03:40', end: '2026-10-15T03:55', operator: D1, access: 'Lt femoral', sheath: '7.5', result: 'สำเร็จ' }],
      dev: [{ type: 'ETT', site: 'Oral', size: '8.0', in: '2026-10-15T02:20', out: null }, { type: 'IABP', site: 'Lt femoral artery', size: '7.5', in: '2026-10-15T03:55', out: null, meta: { ratio: '1:1' } },
        { type: 'Sheath', site: 'Rt femoral artery', size: '7', in: '2026-10-15T02:40', out: '2026-10-15T09:10', meta: { act: '162', hemostasis: 'Manual compression' } }],
      comp: [{ type: 'No-reflow', at: '2026-10-15T03:20', sev: 'ปานกลาง', rel: 'Primary PCI', mgmt: 'Intracoronary adenosine' }, { type: 'CI-AKI', at: '2026-10-16T06:00', sev: 'ปานกลาง', rel: 'Primary PCI', mgmt: 'Cr 1.3 → 2.1 · IV hydration' }],
      mv: [{ at: '2026-10-15T01:30', from: 'รพ.บ้านดุง', to: 'Cath lab' }, { at: '2026-10-15T04:10', from: 'Cath lab', to: 'ตึกหัวใจฯ เตียง 12' }] }),
    A({ an: '6912345', hn: '0123987', bed: 13, admitAt: '2026-10-16T10:55', source: 'ER', doctor: D3,
      dx: { name: 'Acute anterior wall STEMI', icd: 'I21.0', killip: 'I', secondary: '' }, ud: ['สูบบุหรี่'], labs: { trop: '2,100' },
      sk: { given: false, reason: 'Primary PCI ภายใน 90 นาที', onset: '2026-10-16T09:20', door: '2026-10-16T10:55', device: '2026-10-16T11:58' },
      px: [{ type: 'Primary PCI', start: '2026-10-16T11:30', end: '2026-10-16T12:30', operator: D3, access: 'Rt radial', sheath: '6', vessel: 'LAD', stent: 'DES × 1', timiPre: '0', timiPost: '3', contrast: '130', fluoro: '11.2', result: 'สำเร็จ' }],
      dev: [{ type: 'TR-band', site: 'Rt radial', size: '-', in: '2026-10-16T12:48', out: null, meta: { ml: 15 } }],
      mv: [{ at: '2026-10-16T10:55', from: 'ER', to: 'Cath lab' }, { at: '2026-10-16T12:45', from: 'Cath lab', to: 'ตึกหัวใจฯ เตียง 13' }] }),
    A({ an: '6912156', hn: '0234876', bed: 14, admitAt: '2026-10-13T09:00', source: 'Refer-in', refFrom: 'รพ.บ้านดุง', doctor: D2, dcPending: true,
      dx: { name: 'NSTEMI', icd: 'I21.4', killip: 'I', secondary: '' }, ud: ['HT', 'DLP'], labs: { trop: '880', cr: '0.8', egfr: '84', lvef: '58' },
      px: [{ type: 'CAG + PCI', start: '2026-10-14T10:00', end: '2026-10-14T10:45', operator: D2, access: 'Rt radial', sheath: '6', vessel: 'RCA', stent: 'DES × 1', timiPre: '2', timiPost: '3', contrast: '85', fluoro: '6.0', result: 'สำเร็จ' }],
      dev: [{ type: 'TR-band', site: 'Rt radial', size: '-', in: '2026-10-14T10:50', out: '2026-10-14T13:50', meta: { ml: 15 } }],
      dcDraft: { meds: { Aspirin: 'ให้', 'P2Y12 inhibitor': 'ให้', 'High-intensity statin': 'ให้', 'Beta-blocker': 'ให้' }, fu: '2026-11-14', summary: 'NSTEMI s/p PCI RCA (DES × 1) สำเร็จ ไม่มีภาวะแทรกซ้อน อาการคงที่ 48 ชม.' },
      mv: [{ at: '2026-10-13T09:00', from: 'รพ.บ้านดุง', to: 'ตึกหัวใจฯ เตียง 14' }] }),
    A({ an: '6912270', hn: '0345765', bed: 15, admitAt: '2026-10-15T16:20', source: 'ER', doctor: D3,
      dx: { name: 'Ventricular tachycardia', icd: 'I47.2', killip: 'I', secondary: 'VT storm' }, ud: [], labs: { cr: '0.9', egfr: '95', lvef: '40' },
      px: [{ type: 'DC cardioversion', start: '2026-10-15T16:40', end: '2026-10-15T16:45', operator: D3, access: '-', result: 'สำเร็จ' }],
      mv: [{ at: '2026-10-15T16:20', from: 'ER', to: 'ตึกหัวใจฯ เตียง 15' }] }),
    A({ an: '6912230', hn: '0456654', bed: 16, admitAt: '2026-10-14T13:00', source: 'OPD', doctor: D3,
      dx: { name: 'Sick sinus syndrome', icd: 'I49.5', killip: 'I', secondary: '' }, ud: ['HT'], labs: { cr: '1.1', egfr: '50', lvef: '60' },
      px: [{ type: 'PPM', start: '2026-10-15T10:00', end: '2026-10-15T11:10', operator: D3, access: 'Lt subclavian vein', result: 'สำเร็จ' }],
      mv: [{ at: '2026-10-14T13:00', from: 'OPD', to: 'ตึกหัวใจฯ เตียง 16' }] }),
  ];

  // ---------- discharged ----------
  const O = (an, hn, admitAt, outAt, dxName, icd, pxType, outcome, extra = {}) => {
    const acs = /STEMI|NSTEMI|angina/i.test(dxName);
    return A({
      an, hn, bed: null, status: 'out', admitAt, source: extra.source || 'ER', refFrom: extra.refFrom, doctor: DOCTORS[Number(an) % 3],
      dx: { name: dxName, icd, killip: 'I', secondary: '' }, ud: ['HT'], labs: { lvef: '55' },
      sk: extra.sk || (/STEMI/.test(dxName) && !/NSTEMI/.test(dxName) ? { given: false, reason: 'Primary PCI' } : null),
      px: pxType ? [{ type: pxType, start: admitAt.replace(/T.*/, 'T13:00'), end: admitAt.replace(/T.*/, 'T13:50'), operator: DOCTORS[Number(an) % 3], access: 'Rt radial', sheath: '6', result: 'สำเร็จ' }] : [],
      out: { type: outcome, at: outAt, dest: extra.dest || '', cause: extra.cause || '', summary: extra.summary || `${dxName}${pxType ? ' s/p ' + pxType : ''} อาการดีขึ้น`, meds: acs ? Object.fromEntries(MEDS.slice(0, 5).map((m) => [m, 'ให้'])) : {}, fu: outcome === 'ทุเลา' ? '2026-11-20' : '' },
      mv: [{ at: admitAt, from: extra.source || 'ER', to: 'ตึกหัวใจฯ' }].concat(outcome === 'ย้ายตึก' ? [{ at: outAt, from: 'ตึกหัวใจฯ', to: extra.dest }] : []),
      ...extra.more,
    });
  };
  admissions.push(
    O('6912104', '0567812', '2026-10-12T08:30', '2026-10-16T10:15', 'NSTEMI', 'I21.4', 'CAG + PCI', 'ทุเลา'),
    O('6912087', '0678123', '2026-10-11T14:00', '2026-10-16T09:30', 'NSTEMI', 'I21.4', 'CAG', 'Refer back', { dest: 'รพ.หนองหาน', source: 'Refer-in', refFrom: 'รพ.หนองหาน' }),
    O('6911990', '0789234', '2026-10-10T22:10', '2026-10-11T05:40', 'Acute anterior wall STEMI', 'I21.0', '', 'เสียชีวิต', { cause: 'Cardiogenic shock / VF', sk: { given: true, drug: 'Streptokinase', place: 'ER รพ.อุดรธานี', onset: '2026-10-10T20:30', door: '2026-10-10T22:10', needle: '2026-10-10T22:38', result: 'ไม่สำเร็จ' } }),
    O('6911942', '0891345', '2026-10-09T09:00', '2026-10-13T11:00', 'Acute decompensated heart failure', 'I50.0', '', 'ย้ายตึก', { dest: 'อายุรกรรมหญิง 2' }),
    O('6911876', '0912456', '2026-10-08T03:20', '2026-10-12T10:00', 'Acute inferior wall STEMI', 'I21.1', 'Rescue PCI', 'Refer back', { dest: 'รพ.กุมภวาปี', source: 'Refer-in', refFrom: 'รพ.กุมภวาปี', sk: { given: true, drug: 'Streptokinase', place: 'รพ.กุมภวาปี', onset: '2026-10-08T01:10', door: '2026-10-08T01:50', needle: '2026-10-08T02:12', result: 'ไม่สำเร็จ' } }),
    O('6911801', '0123567', '2026-10-07T16:00', '2026-10-10T10:00', 'Atrial fibrillation with RVR', 'I48.9', 'DC cardioversion', 'ทุเลา'),
    O('6911755', '0234678', '2026-10-06T10:00', '2026-10-09T11:00', 'NSTEMI', 'I21.4', 'CAG + PCI', 'ทุเลา'),
    O('6911702', '0345111', '2026-10-04T07:40', '2026-10-08T10:00', 'Acute inferior wall STEMI', 'I21.1', 'Primary PCI', 'ทุเลา', { sk: { given: false, reason: 'Primary PCI', door: '2026-10-04T07:40', device: '2026-10-04T08:55' } }),
    O('6911688', '0456222', '2026-10-03T12:00', '2026-10-06T09:00', 'Unstable angina', 'I20.0', 'CAG', 'ทุเลา'),
    O('6911640', '0567333', '2026-10-02T05:10', '2026-10-05T10:00', 'Acute anterior wall STEMI', 'I21.0', 'Pharmaco-invasive PCI', 'Refer back', { dest: 'รพ.หนองหาน', source: 'Refer-in', refFrom: 'รพ.หนองหาน', sk: { given: true, drug: 'Streptokinase', place: 'รพ.หนองหาน', onset: '2026-10-01T23:40', door: '2026-10-02T00:20', needle: '2026-10-02T00:44', result: 'สำเร็จ' } }),
    O('6911599', '0678444', '2026-10-01T09:00', '2026-10-03T13:00', 'Complete heart block', 'I44.2', 'PPM', 'ทุเลา'),
    O('6911560', '0789555', '2026-09-28T19:00', '2026-09-30T08:00', 'Acute decompensated heart failure', 'I50.0', '', 'ไม่สมัครใจอยู่'),
    O('6911501', '0456789', '2026-09-20T10:00', '2026-09-23T10:00', 'Sick sinus syndrome', 'I49.5', '', 'ทุเลา'),
    O('6801122', '0234567', '2025-02-03T11:00', '2025-02-07T10:00', 'NSTEMI', 'I21.4', 'CAG', 'Refer back', { dest: 'รพ.หนองหาน', source: 'Refer-in', refFrom: 'รพ.หนองหาน' }),
  );

  const audit = [
    ['2026-10-16T13:05', 'พว.ทดสอบ ระบบ', 'CREATE', 'หัตถการ', '6912345', 'บันทึก Primary PCI (LAD)'],
    ['2026-10-16T12:45', 'พว.ทดสอบ ระบบ', 'UPDATE', 'Admission', '6912345', 'รับเข้าเตียง 13 จาก Cath lab'],
    ['2026-10-16T12:30', 'พว.ทดสอบ ระบบ', 'CREATE', 'Complication', '6912310', 'Hematoma Rt radial'],
    ['2026-10-16T11:55', 'พว.ทดสอบ ระบบ', 'CREATE', 'Admission', '6912310', 'Admit Refer-in จาก รพ.หนองหาน'],
    ['2026-10-16T10:15', 'พว.ทดสอบ ระบบ', 'DISCHARGE', 'Admission', '6912104', 'จำหน่าย ทุเลา'],
    ['2026-10-16T09:30', 'พว.หัวหน้า ตัวอย่าง', 'DISCHARGE', 'Admission', '6912087', 'Refer back รพ.หนองหาน'],
    ['2026-10-16T09:02', 'พว.หัวหน้า ตัวอย่าง', 'EXPORT', 'Registry', '-', 'ส่งออก Excel ทะเบียน ก.ย. 2569 (ไม่ระบุตัวตน)'],
    ['2026-10-16T08:10', 'พว.หัวหน้า ตัวอย่าง', 'LOGIN', 'Session', '-', 'เข้าสู่ระบบ'],
    ['2026-10-16T07:52', 'พว.ทดสอบ ระบบ', 'VIEW_CID', 'Patient', '0198765', 'เปิดดูเลขบัตรประชาชนเต็ม'],
    ['2026-10-15T23:58', 'พว.เวรบ่าย ตัวอย่าง', 'UPDATE', 'อุปกรณ์', '6912280', 'ถอด TR-band'],
  ].map(([at, user, action, entity, ref, detail]) => ({ at, user, action, entity, ref, detail }));

  return {
    v: 3, now: NOW0, loggedIn: false, role: 'nurse', userId: 'u1',
    patients, admissions, users: JSON.parse(JSON.stringify(USERS0)), master: JSON.parse(JSON.stringify(MASTER0)), audit, ack: [],
  };
}

// Fixed fiscal-year aggregates for the reports page (illustrative)
const REPORT_STATIC = {
  fy69: {
    label: 'ปีงบประมาณ 2569 (ต.ค. 2568 – ก.ย. 2569)',
    tiles: { adm: 1284, admDelta: '▲ 6.2%', los: 4.2, bor: 92.4, btr: 80.3, toi: 0.3, patientDays: 5393, periodDays: 365, mort: 3.1, mortN: 40, d2n: 78, access: 1.6, accessN: '19 จาก 1,205' },
    series: { labels: ['ต.ค.', 'พ.ย.', 'ธ.ค.', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.'], values: [98, 104, 112, 121, 108, 99, 103, 110, 105, 116, 102, 106] },
    d2n: { labels: ['ต.ค.', 'พ.ย.', 'ธ.ค.', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.'], values: [34, 31, 29, 33, 28, 27, 30, 26, 25, 27, 24, 23] },
    outcomes: [['ทุเลา', 912], ['Refer back', 218], ['ย้ายตึก', 114], ['เสียชีวิต', 40]],
    px: [['CAG', 642], ['CAG + PCI', 418], ['Primary PCI', 96], ['TPM', 74], ['PPM', 52], ['Rescue PCI', 31], ['IABP', 18]],
    refer: [['รพ.กุมภวาปี', 34], ['รพ.หนองหาน', 29], ['รพ.บ้านดุง', 22], ['รพ.เพ็ญ', 19], ['รพ.หนองวัวซอ', 15], ['รพ.บ้านผือ', 14], ['อื่น ๆ (14 แห่ง)', 85]],
  },
  q4: {
    label: 'ไตรมาส 4 ปีงบ 2569 (ก.ค. – ก.ย. 2569)',
    tiles: { adm: 324, admDelta: '▲ 2.5%', los: 4.0, bor: 88.0, btr: 20.3, toi: 0.5, patientDays: 1296, periodDays: 92, mort: 2.8, mortN: 9, d2n: 83, access: 1.2, accessN: '4 จาก 310' },
    series: { labels: ['ก.ค.', 'ส.ค.', 'ก.ย.'], values: [116, 102, 106] },
    d2n: { labels: ['ก.ค.', 'ส.ค.', 'ก.ย.'], values: [27, 24, 23] },
    outcomes: [['ทุเลา', 236], ['Refer back', 54], ['ย้ายตึก', 25], ['เสียชีวิต', 9]],
    px: [['CAG', 160], ['CAG + PCI', 104], ['Primary PCI', 25], ['TPM', 18], ['PPM', 14], ['Rescue PCI', 7], ['IABP', 4]],
    refer: [['รพ.กุมภวาปี', 9], ['รพ.หนองหาน', 8], ['รพ.บ้านดุง', 6], ['รพ.เพ็ญ', 5], ['รพ.หนองวัวซอ', 4], ['รพ.บ้านผือ', 3], ['อื่น ๆ', 19]],
  },
};
