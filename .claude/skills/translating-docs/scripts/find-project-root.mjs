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
 * Locates a project's root by walking up from a starting directory until a
 * directory containing `markerFile` is found — the same technique git uses
 * for `.git` and npm uses for `package.json`.
 *
 * This lets these scripts, which live inside a skill folder, find the
 * project-specific files (GLOSSARY.md, docs/, sync-manifest.json) of
 * whatever project the skill is invoked against, rather than assuming a
 * fixed path relative to the skill's own install location. That fixed-path
 * assumption breaks the moment the skill is shared across more than one
 * project.
 */

import {existsSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';

export function findProjectRoot(markerFile, startDir = process.cwd()) {
  let dir = resolve(startDir);
  while (true) {
    if (existsSync(join(dir, markerFile))) return dir;
    const parent = dirname(dir);
    if (parent === dir) {
      throw new Error(`Could not find ${markerFile} in ${startDir} or any parent directory.`);
    }
    dir = parent;
  }
}
