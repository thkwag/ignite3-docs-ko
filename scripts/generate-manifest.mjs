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

import {existsSync, readdirSync, statSync} from 'node:fs';
import {join, relative, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {latestUpstreamCommitForPath, UPSTREAM_REPO, UPSTREAM_DOCS_PATH} from './github-api.mjs';
import {MANIFEST_PATH, readManifest, updateManifest} from './manifest-io.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const DOCS_DIR = join(REPO_ROOT, 'docs');
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

  const trackedFiles = findMarkdownFiles(DOCS_DIR).sort();

  // Resolve each newly tracked file's baseline commit once, up front: this
  // is a GitHub API call per file, so it must not be repeated on every
  // optimistic-concurrency retry inside updateManifest().
  const existingFiles = isBootstrap ? {} : readManifest().files;
  const newEntries = [];
  for (const file of trackedFiles) {
    if (existingFiles[file]) continue;
    const upstreamCommit = isBootstrap ? BASELINE_COMMIT : await latestUpstreamCommitForPath(file);
    newEntries.push([file, upstreamCommit]);
  }

  const added = await updateManifest(
    (manifest) => {
      let count = 0;
      for (const [file, upstreamCommit] of newEntries) {
        if (manifest.files[file]) continue; // another process already added it
        manifest.files[file] = {status: 'pending', upstreamCommit};
        count++;
      }
      return count;
    },
    {
      initial: isBootstrap
        ? {upstreamRepo: UPSTREAM_REPO, upstreamDocsPath: UPSTREAM_DOCS_PATH, files: {}}
        : undefined,
    }
  );

  console.log(`${added} file(s) added to sync-manifest.json (${trackedFiles.length} tracked total).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
