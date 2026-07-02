#!/usr/bin/env node
/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Detects drift between translated docs and their upstream source.
 *
 * For every unique baseline commit recorded among "translated" manifest
 * entries, computes the upstream diff between that commit and the current
 * default branch (one GitHub API call per unique baseline), then flags any
 * translated file whose upstream path appears in that diff.
 *
 * Writes a Markdown summary to $GITHUB_STEP_SUMMARY when running in Actions,
 * and upserts a tracking issue on this repository with the current list of
 * stale translations.
 */

import {readFileSync, appendFileSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {githubApi, UPSTREAM_REPO, UPSTREAM_BRANCH, UPSTREAM_DOCS_PATH} from './github-api.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH = join(__dirname, '..', 'sync-manifest.json');
const TRACKING_ISSUE_TITLE = '[sync] 원본 문서 변경 감지';
const TRACKING_LABEL = 'upstream-sync';
const THIS_REPO = process.env.GITHUB_REPOSITORY; // e.g. "thkwag/ignite3-docs-ko"
const TOKEN = process.env.GITHUB_TOKEN;

async function changedPathsSince(baseCommit) {
  const compare = await githubApi(`/repos/${UPSTREAM_REPO}/compare/${baseCommit}...${UPSTREAM_BRANCH}`);
  return new Set((compare.files ?? []).map((f) => f.filename));
}

async function findStaleFiles(manifest) {
  const translated = Object.entries(manifest.files).filter(([, e]) => e.status === 'translated');
  const baselineGroups = new Map(); // upstreamCommit -> relativePath[]
  for (const [file, entry] of translated) {
    if (!baselineGroups.has(entry.upstreamCommit)) baselineGroups.set(entry.upstreamCommit, []);
    baselineGroups.get(entry.upstreamCommit).push(file);
  }

  const stale = [];
  for (const [baseCommit, files] of baselineGroups) {
    const changedPaths = await changedPathsSince(baseCommit);
    for (const file of files) {
      if (changedPaths.has(`${UPSTREAM_DOCS_PATH}/${file}`)) {
        stale.push(file);
      }
    }
  }
  return stale.sort();
}

function buildIssueBody(staleFiles) {
  if (staleFiles.length === 0) {
    return '현재 원본과 어긋난 번역 파일이 없습니다.';
  }
  return [
    '원본(영문) 문서가 변경되어 재검토가 필요한 번역 파일 목록입니다.',
    '',
    ...staleFiles.map((f) => `- [ ] \`docs/${f}\``),
    '',
    '재번역 후 `node .claude/skills/translating-docs/scripts/mark-translated.mjs <경로>`로 매니페스트를 갱신하면 이 항목에서 제외됩니다.',
  ].join('\n');
}

async function upsertTrackingIssue(staleFiles) {
  if (!THIS_REPO) {
    console.log('GITHUB_REPOSITORY not set; skipping issue upsert (local run).');
    return;
  }
  if (!TOKEN) {
    throw new Error('GITHUB_TOKEN is required to upsert the tracking issue.');
  }

  const body = buildIssueBody(staleFiles);
  const openIssues = await githubApi(`/repos/${THIS_REPO}/issues?state=open&labels=${TRACKING_LABEL}`);
  const existing = openIssues.find((i) => i.title === TRACKING_ISSUE_TITLE);

  if (existing) {
    await githubApi(`/repos/${THIS_REPO}/issues/${existing.number}`, {
      method: 'PATCH',
      body: JSON.stringify({body}),
    });
    console.log(`Updated tracking issue #${existing.number}.`);
  } else if (staleFiles.length > 0) {
    const created = await githubApi(`/repos/${THIS_REPO}/issues`, {
      method: 'POST',
      body: JSON.stringify({title: TRACKING_ISSUE_TITLE, body, labels: [TRACKING_LABEL]}),
    });
    console.log(`Created tracking issue #${created.number}.`);
  }
}

async function main() {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  const staleFiles = await findStaleFiles(manifest);

  const summary = staleFiles.length
    ? `**${staleFiles.length}개 번역 파일의 원본이 변경되었습니다:**\n\n${staleFiles.map((f) => `- \`docs/${f}\``).join('\n')}`
    : '번역된 파일 중 원본과 어긋난 항목이 없습니다.';
  console.log(summary);

  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + '\n');
  }

  await upsertTrackingIssue(staleFiles);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
