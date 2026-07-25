const fs = require('fs');
const path = require('path');
const root = process.cwd();
const task = {
  id: 'task_' + Date.now(),
  title: 'Agent Worker Build Check',
  goal: 'Build pruefen und Ergebnis fuer den Agenten speichern.',
  allowedCommands: ['git status --short', 'npm run build'],
  notes: ['Keine Secrets ausgeben.', 'Nur lokale Commands.', 'Vor Ausfuehrung bestaetigen.'],
  createdAt: new Date().toISOString()
};
fs.mkdirSync(path.join(root, 'tasks'), { recursive: true });
fs.writeFileSync(path.join(root, 'tasks/next-task.json'), JSON.stringify(task, null, 2), 'utf8');
console.log('[OK] wrote tasks/next-task.json');
