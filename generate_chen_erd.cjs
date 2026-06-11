const fs = require('fs');
const path = require('path');

const W = 1800;
const H = 1000;

// ---------- SVG Primitives ----------
function rect(x, y, w, h, attrs = {}) {
  const all = { x, y, width: w, height: h, fill: '#fff', stroke: '#1e3a5f', 'stroke-width': 2.5, rx: 3, ...attrs };
  return `<rect ${Object.entries(all).map(([k, v]) => `${k}="${v}"`).join(' ')}/>`;
}
function ellipse(cx, cy, rx, ry, attrs = {}) {
  const all = { cx, cy, rx, ry, fill: '#f8fafc', stroke: '#475569', 'stroke-width': 1.5, ...attrs };
  return `<ellipse ${Object.entries(all).map(([k, v]) => `${k}="${v}"`).join(' ')}/>`;
}
function diamond(cx, cy, w, h, attrs = {}) {
  const hw = w / 2, hh = h / 2;
  const pts = `${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}`;
  const all = { points: pts, fill: '#fef3c7', stroke: '#d97706', 'stroke-width': 2, ...attrs };
  return `<polygon ${Object.entries(all).map(([k, v]) => `${k}="${v}"`).join(' ')}/>`;
}
function textEl(x, y, content, attrs = {}) {
  const all = { x, y, 'text-anchor': 'middle', 'dominant-baseline': 'middle', 'font-family': 'Segoe UI, Arial, sans-serif', 'font-size': 12, fill: '#1e293b', ...attrs };
  return `<text ${Object.entries(all).map(([k, v]) => `${k}="${v}"`).join(' ')}>${content}</text>`;
}
function lineEl(x1, y1, x2, y2, attrs = {}) {
  const all = { x1, y1, x2, y2, stroke: '#64748b', 'stroke-width': 1.5, ...attrs };
  return `<line ${Object.entries(all).map(([k, v]) => `${k}="${v}"`).join(' ')}/>`;
}

// ---------- Geometry Helpers ----------
function norm(dx, dy) {
  const len = Math.sqrt(dx * dx + dy * dy);
  return len === 0 ? { x: 0, y: 0 } : { x: dx / len, y: dy / len };
}
// Entity rectangle boundary point in direction (dx,dy) from center
function rectBoundary(cx, cy, hw, hh, dx, dy) {
  const n = norm(dx, dy);
  const tx = hw / Math.abs(n.x + 1e-9);
  const ty = hh / Math.abs(n.y + 1e-9);
  const t = Math.min(tx, ty);
  return { x: cx + n.x * t, y: cy + n.y * t };
}
// Diamond boundary point in direction (dx,dy) from center (rhombus equation)
function diamondBoundary(cx, cy, hw, hh, dx, dy) {
  const n = norm(dx, dy);
  const t = 1 / (Math.abs(n.x) / hw + Math.abs(n.y) / hh);
  return { x: cx + n.x * t, y: cy + n.y * t };
}

// ---------- Data ----------
const entities = [
  { name: 'USERS', x: 250, y: 150, w: 140, h: 50, attrs: [
    { name: 'id', pk: true }, { name: 'username' }, { name: 'password' }, { name: 'role' }
  ]},
  { name: 'STUDENTS', x: 700, y: 150, w: 150, h: 50, attrs: [
    { name: 'id', pk: true }, { name: 'nic' }, { name: 'name' },
    { name: 'currentStage' }, { name: 'status' }, { name: 'licenseClass' }
  ]},
  { name: 'INSTRUCTORS', x: 1250, y: 150, w: 150, h: 50, attrs: [
    { name: 'id', pk: true }, { name: 'name' }, { name: 'licenseNumber' }, { name: 'specialization' }
  ]},
  { name: 'PAYMENTS', x: 250, y: 450, w: 140, h: 50, attrs: [
    { name: 'id', pk: true }, { name: 'studentId', fk: true }, { name: 'amount' }, { name: 'paymentType' }
  ]},
  { name: 'LESSONS', x: 700, y: 450, w: 140, h: 50, attrs: [
    { name: 'id', pk: true }, { name: 'studentId', fk: true }, { name: 'instructorId', fk: true }, { name: 'vehicleId', fk: true }
  ]},
  { name: 'VEHICLES', x: 1250, y: 450, w: 140, h: 50, attrs: [
    { name: 'id', pk: true }, { name: 'plateNumber' }, { name: 'transmission' }, { name: 'status' }
  ]},
  { name: 'EXAMS', x: 250, y: 750, w: 130, h: 50, attrs: [
    { name: 'id', pk: true }, { name: 'studentId', fk: true }, { name: 'type' }, { name: 'result' }
  ]},
  { name: 'DOCUMENTS', x: 700, y: 750, w: 150, h: 50, attrs: [
    { name: 'id', pk: true }, { name: 'studentId', fk: true }, { name: 'documentType' }, { name: 'isVerified' }
  ]},
];

const relationships = [
  { name: 'manages',    x: 475,  y: 150,  dw: 110, dh: 50, from: 'USERS', to: 'STUDENTS',   cf: '1', ct: 'M' },
  { name: 'makes',      x: 475,  y: 300,  dw: 110, dh: 50, from: 'STUDENTS', to: 'PAYMENTS',   cf: '1', ct: 'M' },
  { name: 'attends',    x: 700,  y: 300,  dw: 110, dh: 50, from: 'STUDENTS', to: 'LESSONS',    cf: '1', ct: 'M' },
  { name: 'conducts',   x: 975,  y: 300,  dw: 110, dh: 50, from: 'INSTRUCTORS', to: 'LESSONS', cf: '1', ct: 'M' },
  { name: 'assigned_to',x: 975,  y: 450,  dw: 120, dh: 50, from: 'VEHICLES', to: 'LESSONS',  cf: '1', ct: 'M' },
  { name: 'attempts',   x: 475,  y: 450,  dw: 110, dh: 50, from: 'STUDENTS', to: 'EXAMS',      cf: '1', ct: 'M' },
  { name: 'submits',    x: 700,  y: 600,  dw: 110, dh: 50, from: 'STUDENTS', to: 'DOCUMENTS',  cf: '1', ct: 'M' },
];

function findEnt(name) { return entities.find(e => e.name === name); }

let svg = '';

// ---------- Draw Relationships & Lines ----------
relationships.forEach(r => {
  const f = findEnt(r.from);
  const t = findEnt(r.to);

  // Entity boundary points toward diamond
  const fb = rectBoundary(f.x, f.y, f.w / 2, f.h / 2, r.x - f.x, r.y - f.y);
  const tb = rectBoundary(t.x, t.y, t.w / 2, t.h / 2, r.x - t.x, r.y - t.y);

  // Diamond boundary points toward entities
  const dbf = diamondBoundary(r.x, r.y, r.dw / 2, r.dh / 2, fb.x - r.x, fb.y - r.y);
  const dbt = diamondBoundary(r.x, r.y, r.dw / 2, r.dh / 2, tb.x - r.x, tb.y - r.y);

  // Draw connecting lines
  svg += lineEl(fb.x, fb.y, dbf.x, dbf.y, { stroke: '#475569', 'stroke-width': 1.5 });
  svg += lineEl(tb.x, tb.y, dbt.x, dbt.y, { stroke: '#475569', 'stroke-width': 1.5 });

  // Draw diamond
  svg += diamond(r.x, r.y, r.dw, r.dh);
  svg += textEl(r.x, r.y, r.name, { 'font-size': 11, fill: '#92400e', 'font-weight': 600 });

  // Cardinality labels (small offset from diamond boundary toward entity)
  const cardOff = 18;
  const cfPos = { x: dbf.x + norm(fb.x - r.x, fb.y - r.y).x * cardOff, y: dbf.y + norm(fb.x - r.x, fb.y - r.y).y * cardOff };
  const ctPos = { x: dbt.x + norm(tb.x - r.x, tb.y - r.y).x * cardOff, y: dbt.y + norm(tb.x - r.x, tb.y - r.y).y * cardOff };
  svg += textEl(cfPos.x, cfPos.y - 6, r.cf, { 'font-size': 11, fill: '#0f172a', 'font-weight': 'bold' });
  svg += textEl(ctPos.x, ctPos.y - 6, r.ct, { 'font-size': 11, fill: '#0f172a', 'font-weight': 'bold' });
});

// ---------- Draw Entities & Attributes ----------
entities.forEach(e => {
  // Attributes
  const attrRx = 40, attrRy = 14;
  const hOff = e.w / 2 + 55; // horizontal offset from entity center
  const vOff = 44;            // vertical spacing between attribute rows
  e.attrs.forEach((a, i) => {
    const side = i % 2 === 0 ? -1 : 1; // left (-1) or right (+1)
    const row = Math.floor(i / 2);
    const ax = e.x + side * hOff;
    const ay = e.y + (row - (Math.ceil(e.attrs.length / 2) - 1) / 2) * vOff;

    // Attribute oval
    svg += ellipse(ax, ay, attrRx, attrRy, { fill: '#f1f5f9' });
    // Attribute label
    let label = a.name;
    if (a.pk) label = `<tspan text-decoration="underline">${a.name}</tspan>`;
    if (a.fk) label += ' (FK)';
    svg += textEl(ax, ay, label, { 'font-size': 10 });
    // Line to entity
    svg += lineEl(ax + side * (-attrRx), ay, e.x + side * (e.w / 2), ay, { stroke: '#94a3b8', 'stroke-width': 1 });
  });

  // Entity rectangle
  svg += rect(e.x - e.w / 2, e.y - e.h / 2, e.w, e.h);
  // Entity name
  svg += textEl(e.x, e.y, e.name, { 'font-weight': 'bold', 'font-size': 13 });
});

// ---------- Title & Legend ----------
svg += textEl(W / 2, 35, "LankaDrive - Entity Relationship Diagram (Chen's Notation)", {
  'font-size': 20, 'font-weight': 'bold', fill: '#1e3a5f'
});
svg += textEl(W / 2, 62, 'Professional Driving School Management System', {
  'font-size': 13, fill: '#64748b'
});

const ly = H - 55;
svg += rect(40, ly, 18, 18, { fill: '#fff', stroke: '#1e3a5f', 'stroke-width': 2 });
svg += textEl(100, ly + 9, 'Entity', { 'text-anchor': 'start', 'font-size': 12 });
svg += diamond(210, ly + 9, 24, 14, { fill: '#fef3c7', stroke: '#d97706' });
svg += textEl(270, ly + 9, 'Relationship', { 'text-anchor': 'start', 'font-size': 12 });
svg += ellipse(390, ly + 9, 16, 9, { fill: '#f1f5f9', stroke: '#475569' });
svg += textEl(435, ly + 9, 'Attribute', { 'text-anchor': 'start', 'font-size': 12 });
svg += textEl(600, ly + 9, 'PK = Primary Key  |  FK = Foreign Key  |  1 = One  |  M = Many', { 'text-anchor': 'start', 'font-size': 12, fill: '#64748b' });

const output = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="background:#f8fafc">
${svg}
</svg>`;

const outPath = path.join(__dirname, 'chen_er_diagram.svg');
fs.writeFileSync(outPath, output);
console.log('Generated:', outPath);
