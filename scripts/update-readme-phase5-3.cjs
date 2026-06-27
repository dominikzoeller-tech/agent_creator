const fs = require('fs');
const path = require('path');

const readmePath = path.join(process.cwd(), 'README.md');
const sectionPath = path.join(process.cwd(), 'README-phase5-3-section.md');

if (!fs.existsSync(sectionPath)) {
  console.error('README-phase5-3-section.md wurde nicht gefunden. Bitte im Projekt-Root ausführen.');
  process.exit(1);
}

const section = fs.readFileSync(sectionPath, 'utf8').trim() + '\n';
const start = '<!-- PHASE5_README_START -->';
const end = '<!-- PHASE5_README_END -->';

let current = '';
if (fs.existsSync(readmePath)) {
  current = fs.readFileSync(readmePath, 'utf8');
} else {
  current = '# Agent Creator\n\n';
}

const startIndex = current.indexOf(start);
const endIndex = current.indexOf(end);

let next;
if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
  const before = current.slice(0, startIndex).trimEnd();
  const after = current.slice(endIndex + end.length).trimStart();
  next = `${before}\n\n${section}\n${after}`.trimEnd() + '\n';
} else {
  next = `${current.trimEnd()}\n\n${section}`;
}

fs.writeFileSync(readmePath, next, 'utf8');
console.log('README.md wurde für Phase 5.3 aktualisiert.');
