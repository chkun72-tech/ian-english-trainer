#!/usr/bin/env node
// Parses one or more PROJECT_UPDATE ... END_PROJECT_UPDATE text blocks and
// upserts them into data/projects.json + data/tasks.json, then regenerates
// daily_checklist.md and weekly_review.md.
//
// Usage:
//   node import_project_update.js < updates.txt
//   node import_project_update.js path/to/updates.txt
'use strict';

const fs = require('fs');
const lib = require('./lib');

const VALID_SOURCES = ['ChatGPT', 'Cloud Code', 'Codex', 'Manus', 'User'];
const FIELD_NAMES = ['project', 'task', 'status', 'priority', 'next_action', 'source', 'date', 'notes'];

// Extracts all PROJECT_UPDATE blocks from raw pasted text.
function parseBlocks(text) {
  const blocks = [];
  const errors = [];
  const blockRe = /PROJECT_UPDATE([\s\S]*?)END_PROJECT_UPDATE/g;
  let match;
  let index = 0;
  while ((match = blockRe.exec(text)) !== null) {
    index += 1;
    const body = match[1];
    const fields = {};
    const lines = body.split('\n').map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) continue;
      const key = line.slice(0, colonIdx).trim().toLowerCase();
      const value = line.slice(colonIdx + 1).trim();
      if (FIELD_NAMES.includes(key)) fields[key] = value;
    }

    if (!fields.project || !fields.task) {
      errors.push(`第 ${index} 個區塊缺少 project 或 task，已略過。`);
      continue;
    }
    if (fields.status && !lib.VALID_STATUSES.includes(fields.status)) {
      errors.push(`第 ${index} 個區塊 status "${fields.status}" 不合法，已改為 active。`);
      fields.status = 'active';
    }
    if (fields.priority && !lib.VALID_PRIORITIES.includes(fields.priority)) {
      errors.push(`第 ${index} 個區塊 priority "${fields.priority}" 不合法，已改為 C。`);
      fields.priority = 'C';
    }
    if (fields.source && !VALID_SOURCES.includes(fields.source)) {
      errors.push(`第 ${index} 個區塊 source "${fields.source}" 不在清單內，仍會保留原文字。`);
    }
    blocks.push(fields);
  }
  if (blocks.length === 0 && text.trim()) {
    errors.push('沒有找到任何 PROJECT_UPDATE ... END_PROJECT_UPDATE 區塊。');
  }
  return { blocks, errors };
}

// Applies parsed blocks to the in-memory projects/tasks arrays.
function applyUpdates(projects, tasks, blocks) {
  const summary = { projectsAdded: [], tasksAdded: [], tasksUpdated: [] };
  for (const fields of blocks) {
    const { project, created: projectCreated } = lib.upsertProject(projects, fields.project);
    if (projectCreated) summary.projectsAdded.push(project.name);

    const { task, created: taskCreated } = lib.upsertTask(tasks, fields.project, fields.task, {
      status: fields.status,
      priority: fields.priority,
      next_action: fields.next_action,
      source: fields.source,
      notes: fields.notes,
      date: fields.date,
    });
    if (taskCreated) summary.tasksAdded.push(`${task.project} — ${task.task}`);
    else summary.tasksUpdated.push(`${task.project} — ${task.task}`);
  }
  return summary;
}

// Full pipeline used by both the CLI and the import server endpoint.
function importText(text) {
  const { blocks, errors } = parseBlocks(text);
  const projects = lib.loadProjects();
  const tasks = lib.loadTasks();
  const summary = applyUpdates(projects, tasks, blocks);
  lib.saveProjects(projects);
  lib.saveTasks(tasks);
  const bundle = lib.runRolloverAndPersist();
  return { summary, errors, bundle };
}

function main() {
  const arg = process.argv[2];
  const text = arg ? fs.readFileSync(arg, 'utf8') : fs.readFileSync(0, 'utf8');
  const { summary, errors } = importText(text);

  if (summary.projectsAdded.length) {
    console.log('新增專案:');
    for (const p of summary.projectsAdded) console.log(`  - ${p}`);
  }
  if (summary.tasksAdded.length) {
    console.log('新增任務:');
    for (const t of summary.tasksAdded) console.log(`  - ${t}`);
  }
  if (summary.tasksUpdated.length) {
    console.log('更新任務:');
    for (const t of summary.tasksUpdated) console.log(`  - ${t}`);
  }
  if (errors.length) {
    console.log('警告:');
    for (const e of errors) console.log(`  - ${e}`);
  }
  console.log('已重新產生 daily_checklist.md 與 weekly_review.md');
}

if (require.main === module) main();

module.exports = { parseBlocks, applyUpdates, importText, VALID_SOURCES };
