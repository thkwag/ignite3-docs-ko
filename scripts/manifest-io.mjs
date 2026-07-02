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
 * Concurrency-safe read/write for sync-manifest.json.
 *
 * Multiple translation sessions run scripts/mark-translated.mjs in parallel.
 * A plain read-JSON / mutate / write-JSON cycle loses updates under
 * concurrency: whichever process writes last wins, silently discarding any
 * entry another process added in between.
 *
 * updateManifest() guards against this with the same principle as the Edit
 * tool's "file changed since read" check: right before writing, it re-reads
 * the file and compares it byte-for-byte to what it read at the start of
 * the attempt. If another process wrote in the meantime, it discards this
 * attempt, re-reads the fresh file, re-applies the mutation, and retries —
 * instead of blindly overwriting.
 */

import {existsSync, readFileSync, writeFileSync, renameSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
export const MANIFEST_PATH = join(REPO_ROOT, 'sync-manifest.json');

const MAX_RETRIES = 30;
const RETRY_BASE_DELAY_MS = 30;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Writes `content` to `path` via write-then-rename, atomic on the same filesystem. */
function atomicWrite(path, content) {
  const tmpPath = `${path}.tmp.${process.pid}.${Math.random().toString(36).slice(2)}`;
  writeFileSync(tmpPath, content);
  renameSync(tmpPath, path);
}

export function readManifest() {
  return JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
}

/**
 * Reads sync-manifest.json, applies `mutate(manifest)` in memory, and writes
 * the result back — retrying against a fresh read if another process wrote
 * to the file between our read and our write.
 *
 * `mutate` must be safe to call more than once against different snapshots
 * of the manifest (it may run again on retry) and must not depend on state
 * that changes between attempts other than the manifest content itself.
 *
 * `initial` is used only when the file does not exist yet (the very first
 * run, before any manifest has been created); there is nothing to race
 * against in that case, so it's written directly.
 *
 * Returns whatever `mutate` returns from its final, successfully written
 * application.
 */
export async function updateManifest(mutate, {initial} = {}) {
  if (!existsSync(MANIFEST_PATH)) {
    if (!initial) {
      throw new Error(`${MANIFEST_PATH} does not exist and no "initial" value was provided.`);
    }
    const manifest = initial;
    const result = mutate(manifest);
    atomicWrite(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
    return result;
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const before = readFileSync(MANIFEST_PATH, 'utf8');
    const manifest = JSON.parse(before);
    const result = mutate(manifest);
    const next = JSON.stringify(manifest, null, 2) + '\n';

    const current = readFileSync(MANIFEST_PATH, 'utf8');
    if (current !== before) {
      if (attempt === MAX_RETRIES) {
        throw new Error(
          `${MANIFEST_PATH}: gave up after ${MAX_RETRIES} attempts — too much concurrent write contention.`
        );
      }
      await sleep(RETRY_BASE_DELAY_MS + Math.random() * RETRY_BASE_DELAY_MS);
      continue;
    }

    if (next !== before) {
      atomicWrite(MANIFEST_PATH, next);
    }
    return result;
  }
}
