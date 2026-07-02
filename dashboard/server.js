#!/usr/bin/env node
// Minimal local Node server for the Project Control Dashboard.
// No frameworks, no database, no login, no cloud calls — everything reads
// and writes plain JSON/Markdown files in this folder.
//
// Usage:
//   node server.js            (defaults to port 8791)
//   PORT=8080 node server.js  (custom port)
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const lib = require('./scripts/lib');
const { importText } = require('./scripts/import_project_update');

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 8791;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.md': 'text/markdown; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function readBody(req, maxBytes) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error('Request body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function currentBundle() {
  const tasks = lib.loadTasks();
  return lib.buildBundle(tasks);
}

function serveStatic(req, res, urlPath) {
  const safePath = path.normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(ROOT, safePath === '/' ? 'dashboard.html' : safePath);

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (url.pathname === '/api/data' && req.method === 'GET') {
      sendJson(res, 200, currentBundle());
      return;
    }

    if (url.pathname === '/api/task-status' && req.method === 'POST') {
      const body = await readBody(req, 10_000);
      const { id, action } = JSON.parse(body || '{}');
      const validActions = ['complete', 'defer', 'blocked'];
      if (!id || !validActions.includes(action)) {
        sendJson(res, 400, { error: 'id 與 action(complete/defer/blocked) 為必填' });
        return;
      }
      const tasks = lib.loadTasks();
      const task = tasks.find((t) => t.id === id);
      if (!task) {
        sendJson(res, 404, { error: '找不到這個任務' });
        return;
      }
      if (action === 'complete') {
        task.status = 'completed';
        task.in_today = false;
      } else if (action === 'blocked') {
        task.status = 'blocked';
        task.in_today = false;
      } else if (action === 'defer') {
        task.in_today = false;
      }
      task.last_updated = lib.nowIso();
      const bundle = lib.computeRollover(tasks);
      lib.saveTasks(tasks);
      lib.writeChecklistFiles(bundle);
      sendJson(res, 200, bundle);
      return;
    }

    if (url.pathname === '/api/import' && req.method === 'POST') {
      const body = await readBody(req, 200_000);
      const { text } = JSON.parse(body || '{}');
      if (!text || !text.trim()) {
        sendJson(res, 400, { error: '貼上的內容是空的' });
        return;
      }
      const result = importText(text);
      sendJson(res, 200, result);
      return;
    }

    if (req.method === 'GET') {
      serveStatic(req, res, url.pathname);
      return;
    }

    res.writeHead(404);
    res.end('Not found');
  } catch (err) {
    sendJson(res, 500, { error: String((err && err.message) || err) });
  }
});

server.listen(PORT, () => {
  console.log(`Project Dashboard 伺服器已啟動：http://localhost:${PORT}/dashboard.html`);
  console.log('按 Ctrl+C 停止伺服器。');
});
