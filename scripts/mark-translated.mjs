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
 * Records that a docs/ file has been translated, capturing the upstream
 * commit its translation is based on so check-upstream-sync.mjs can later
 * detect when the source has drifted.
 *
 * Usage: node scripts/mark-translated.mjs <path relative to docs/>
 * Example: node scripts/mark-translated.mjs getting-started/intro.md
 */

import {existsSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {latestUpstreamCommitForPath} from './github-api.mjs';
import {updateManifest} from './manifest-io.mjs';
import {updateReadmeProgress} from './update-progress.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const DOCS_FILE_PATH = process.argv[2];

async function main() {
  if (!DOCS_FILE_PATH) {
    console.error('Usage: node scripts/mark-translated.mjs <path relative to docs/>');
    process.exit(1);
  }
  if (!existsSync(join(REPO_ROOT, 'docs', DOCS_FILE_PATH))) {
    throw new Error(`docs/${DOCS_FILE_PATH} does not exist.`);
  }

  const upstreamCommit = await latestUpstreamCommitForPath(DOCS_FILE_PATH);
  const translatedAt = new Date().toISOString();

  await updateManifest((manifest) => {
    manifest.files[DOCS_FILE_PATH] = {status: 'translated', upstreamCommit, translatedAt};
  });

  console.log(`Marked ${DOCS_FILE_PATH} as translated (upstream commit ${upstreamCommit}).`);

  const readmeChanged = updateReadmeProgress();
  if (readmeChanged) console.log('Updated README.md translation progress table.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
