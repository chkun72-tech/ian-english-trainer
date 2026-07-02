#!/usr/bin/env node
// Daily rollover: carries over unfinished active tasks, backfills today's
// must-do list with priority-A tasks, and regenerates daily_checklist.md /
// weekly_review.md. Safe to run multiple times a day (idempotent).
'use strict';

const lib = require('./lib');

function main() {
  const bundle = lib.runRolloverAndPersist();
  console.log('Rollover complete.');
  console.log(`- 今日必做: ${bundle.todayActive.length}/${lib.MAX_TODAY_ACTIVE}`);
  for (const t of bundle.todayActive) console.log(`    [${t.priority}] ${t.project} — ${t.task}`);
  console.log(`- 卡住事項: ${bundle.blocked.length}`);
  console.log(`- 暫停但不可遺忘: ${bundle.paused.length}`);
  console.log(`- Parking Lot: ${bundle.parking.length}`);
  console.log(`- 過去 7 天完成: ${bundle.completedRecent.length}`);
  console.log('已重新產生 daily_checklist.md 與 weekly_review.md');
}

if (require.main === module) main();

module.exports = { main };
