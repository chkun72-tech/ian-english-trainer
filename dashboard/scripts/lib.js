// Shared data + rollover + markdown helpers for the Project Control Dashboard.
'use strict';

const fs = require('fs');
const path = require('path');

const DASHBOARD_DIR = path.join(__dirname, '..');
const DATA_DIR = path.join(DASHBOARD_DIR, 'data');
const PROJECTS_PATH = path.join(DATA_DIR, 'projects.json');
const TASKS_PATH = path.join(DATA_DIR, 'tasks.json');
const CHECKLIST_PATH = path.join(DASHBOARD_DIR, 'daily_checklist.md');
const WEEKLY_REVIEW_PATH = path.join(DASHBOARD_DIR, 'weekly_review.md');

const VALID_STATUSES = ['active', 'completed', 'blocked', 'paused', 'parking'];
const VALID_PRIORITIES = ['A', 'B', 'C'];
const MAX_TODAY_ACTIVE = 3;

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  const raw = fs.readFileSync(filePath, 'utf8').trim();
  if (!raw) return fallback;
  return JSON.parse(raw);
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function loadProjects() {
  return readJson(PROJECTS_PATH, []);
}

function saveProjects(projects) {
  writeJson(PROJECTS_PATH, projects);
}

function loadTasks() {
  return readJson(TASKS_PATH, []);
}

function saveTasks(tasks) {
  writeJson(TASKS_PATH, tasks);
}

function slugify(str) {
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '') || 'item';
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function nowIso() {
  return new Date().toISOString();
}

// Find or create a project by name. Returns { project, created }.
function upsertProject(projects, name) {
  const trimmed = String(name).trim();
  const slug = slugify(trimmed);
  let project = projects.find((p) => p.id === slug);
  if (project) {
    project.last_updated = nowIso();
    return { project, created: false };
  }
  project = {
    id: slug,
    name: trimmed,
    created_at: nowIso(),
    last_updated: nowIso(),
  };
  projects.push(project);
  return { project, created: true };
}

// Find or create a task under a project, then apply the given fields.
// fields: { status, priority, next_action, source, notes, date }
function upsertTask(tasks, projectName, taskName, fields) {
  const projectSlug = slugify(projectName);
  const taskSlug = slugify(taskName);
  const id = `${projectSlug}__${taskSlug}`;
  let task = tasks.find((t) => t.id === id);
  const created = !task;

  if (!task) {
    task = {
      id,
      project: String(projectName).trim(),
      task: String(taskName).trim(),
      status: 'active',
      priority: 'C',
      next_action: '',
      source: 'User',
      notes: '',
      date: todayStr(),
      created_at: nowIso(),
      last_updated: nowIso(),
      in_today: false,
    };
    tasks.push(task);
  }

  if (fields.status && VALID_STATUSES.includes(fields.status)) {
    task.status = fields.status;
  }
  if (fields.priority && VALID_PRIORITIES.includes(fields.priority)) {
    task.priority = fields.priority;
  }
  if (fields.next_action !== undefined && fields.next_action !== '') {
    task.next_action = fields.next_action;
  }
  if (fields.source !== undefined && fields.source !== '') {
    task.source = fields.source;
  }
  if (fields.notes !== undefined && fields.notes !== '') {
    task.notes = fields.notes;
  }
  if (fields.date !== undefined && fields.date !== '') {
    task.date = fields.date;
  }
  task.project = String(projectName).trim();
  task.task = String(taskName).trim();
  task.last_updated = nowIso();

  return { task, created };
}

// Recomputes which active tasks are in "today's must-do" list (max 3),
// carrying over yesterday's unfinished active tasks first, then backfilling
// with priority-A active tasks. Mutates tasks in place.
function computeRollover(tasks) {
  for (const t of tasks) {
    if (t.status !== 'active') t.in_today = false;
  }

  const carried = tasks
    .filter((t) => t.status === 'active' && t.in_today)
    .sort((a, b) => new Date(a.last_updated) - new Date(b.last_updated))
    .slice(0, MAX_TODAY_ACTIVE);

  const carriedIds = new Set(carried.map((t) => t.id));
  for (const t of tasks) {
    if (t.status === 'active' && !carriedIds.has(t.id)) t.in_today = false;
  }

  let remaining = MAX_TODAY_ACTIVE - carried.length;
  if (remaining > 0) {
    const candidates = tasks
      .filter((t) => t.status === 'active' && !t.in_today && t.priority === 'A')
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    for (const t of candidates) {
      if (remaining <= 0) break;
      t.in_today = true;
      remaining -= 1;
    }
  }

  return buildBundle(tasks);
}

function buildBundle(tasks) {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return {
    todayActive: tasks.filter((t) => t.status === 'active' && t.in_today),
    blocked: tasks.filter((t) => t.status === 'blocked'),
    paused: tasks.filter((t) => t.status === 'paused'),
    parking: tasks.filter((t) => t.status === 'parking'),
    completedRecent: tasks
      .filter((t) => t.status === 'completed' && new Date(t.last_updated).getTime() >= sevenDaysAgo)
      .sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated)),
    generated_at: nowIso(),
  };
}

function renderChecklist(bundle) {
  const lines = [];
  lines.push(`# 今日 Checklist — ${todayStr()}`, '');
  lines.push('## 今日必做');
  if (bundle.todayActive.length === 0) {
    lines.push('_目前沒有今日必做任務_');
  } else {
    for (const t of bundle.todayActive) {
      lines.push(`- [ ] **${t.project}** — ${t.task}（priority ${t.priority}）`);
      if (t.next_action) lines.push(`  - next: ${t.next_action}`);
    }
  }
  lines.push('', '## 卡住事項');
  if (bundle.blocked.length === 0) {
    lines.push('_目前沒有卡住的任務_');
  } else {
    for (const t of bundle.blocked) {
      lines.push(`- **${t.project}** — ${t.task}${t.notes ? `（${t.notes}）` : ''}`);
    }
  }
  lines.push('', '## 暫停但不可遺忘');
  if (bundle.paused.length === 0) {
    lines.push('_目前沒有暫停中的任務_');
  } else {
    for (const t of bundle.paused) {
      lines.push(`- **${t.project}** — ${t.task}`);
    }
  }
  lines.push('', '## Parking Lot');
  if (bundle.parking.length === 0) {
    lines.push('_Parking Lot 是空的_');
  } else {
    for (const t of bundle.parking) {
      lines.push(`- **${t.project}** — ${t.task}`);
    }
  }
  lines.push('', `_最後更新：${bundle.generated_at}_`, '');
  return lines.join('\n');
}

function renderWeeklyReview(bundle) {
  const lines = [];
  lines.push('# 本週回顧', '');
  lines.push(`- 今日必做：${bundle.todayActive.length}`);
  lines.push(`- 卡住事項：${bundle.blocked.length}`);
  lines.push(`- 暫停事項：${bundle.paused.length}`);
  lines.push(`- Parking Lot：${bundle.parking.length}`);
  lines.push(`- 過去 7 天完成：${bundle.completedRecent.length}`, '');
  lines.push('## 過去 7 天完成的任務');
  if (bundle.completedRecent.length === 0) {
    lines.push('_過去 7 天還沒有完成的任務_');
  } else {
    for (const t of bundle.completedRecent) {
      lines.push(`- **${t.project}** — ${t.task}（完成於 ${t.last_updated.slice(0, 10)}）`);
    }
  }
  lines.push('', `_最後更新：${bundle.generated_at}_`, '');
  return lines.join('\n');
}

function writeChecklistFiles(bundle) {
  fs.writeFileSync(CHECKLIST_PATH, renderChecklist(bundle), 'utf8');
  fs.writeFileSync(WEEKLY_REVIEW_PATH, renderWeeklyReview(bundle), 'utf8');
}

// Loads tasks, recomputes rollover, saves, and regenerates the markdown files.
// Returns the bundle used by dashboard.html.
function runRolloverAndPersist() {
  const tasks = loadTasks();
  const bundle = computeRollover(tasks);
  saveTasks(tasks);
  writeChecklistFiles(bundle);
  return bundle;
}

module.exports = {
  DATA_DIR,
  PROJECTS_PATH,
  TASKS_PATH,
  CHECKLIST_PATH,
  WEEKLY_REVIEW_PATH,
  VALID_STATUSES,
  VALID_PRIORITIES,
  MAX_TODAY_ACTIVE,
  loadProjects,
  saveProjects,
  loadTasks,
  saveTasks,
  slugify,
  todayStr,
  nowIso,
  upsertProject,
  upsertTask,
  computeRollover,
  buildBundle,
  renderChecklist,
  renderWeeklyReview,
  writeChecklistFiles,
  runRolloverAndPersist,
};
