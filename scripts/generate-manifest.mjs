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
 * Bootstraps or extends sync-manifest.json: adds a "pending" entry for every
 * docs/ markdown file that is not yet tracked. Existing entries are left untouched.
 *
 * On the first run (no manifest yet), BASELINE_COMMIT is required and every
 * file is stamped with that single commit, avoiding one GitHub API call per
 * file. On later runs, newly added files are looked up individually against
 * upstream commit history.
 */

import {existsSync, readFileSync, writeFileSync, readdirSync, statSync} from 'node:fs';
import {join, relative, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {latestUpstreamCommitForPath, UPSTREAM_REPO, UPSTREAM_DOCS_PATH} from './github-api.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const DOCS_DIR = join(REPO_ROOT, 'docs');
const MANIFEST_PATH = join(REPO_ROOT, 'sync-manifest.json');
const BASELINE_COMMIT = process.env.BASELINE_COMMIT;

function findMarkdownFiles(dir, fileList = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      findMarkdownFiles(full, fileList);
    } else if (entry.endsWith('.md') || entry.endsWith('.mdx')) {
      fileList.push(relative(DOCS_DIR, full));
    }
  }
  return fileList;
}

async function main() {
  const isBootstrap = !existsSync(MANIFEST_PATH);
  if (isBootstrap && !BASELINE_COMMIT) {
    throw new Error('BASELINE_COMMIT env var is required to bootstrap a new manifest.');
  }

  const manifest = isBootstrap
    ? {upstreamRepo: UPSTREAM_REPO, upstreamDocsPath: UPSTREAM_DOCS_PATH, files: {}}
    : JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));

  const trackedFiles = findMarkdownFiles(DOCS_DIR).sort();
  let added = 0;

  for (const file of trackedFiles) {
    if (manifest.files[file]) continue;
    const upstreamCommit = isBootstrap ? BASELINE_COMMIT : await latestUpstreamCommitForPath(file);
    manifest.files[file] = {status: 'pending', upstreamCommit};
    added++;
  }

  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`${added} file(s) added to sync-manifest.json (${trackedFiles.length} tracked total).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
