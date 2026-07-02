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
 * Audits translated docs against GLOSSARY.md.
 *
 * Checks, per target file:
 *   1. Banned term variants ("금지 표기" column of the term table).
 *   2. Banned expressions ("금지 표현" table), honoring the 수준 column:
 *      오류 = violation, 경고 = review item, 경고(N+) = reported only when
 *      the pattern occurs N or more times in one file.
 *   3. Untranslated-content heuristic: prose lines that remain English in a
 *      file that is supposed to be translated.
 *
 * Code fences, inline code, link targets, and bare URLs are excluded from
 * matching so code samples never trigger false positives.
 *
 * Usage:
 *   node scripts/check-glossary.mjs               # files marked "translated" in sync-manifest.json
 *   node scripts/check-glossary.mjs --all         # every file under docs/
 *   node scripts/check-glossary.mjs <path...>     # specific files (repo-root- or docs-relative)
 *   --strict                                      # warnings also fail (exit 1)
 *   --list-rules                                  # print parsed rules and exit
 *
 * Exit codes: 0 = clean, 1 = violations (errors, or warnings with --strict), 2 = usage/parse failure.
 */

import {readFileSync, readdirSync, existsSync, statSync} from 'node:fs';
import {join, dirname, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const DOCS_ROOT = join(REPO_ROOT, 'docs');
const GLOSSARY_PATH = join(REPO_ROOT, 'GLOSSARY.md');
const MANIFEST_PATH = join(REPO_ROOT, 'sync-manifest.json');

// ---------------------------------------------------------------------------
// GLOSSARY.md parsing
// ---------------------------------------------------------------------------

/** Splits a markdown table row into trimmed cells (no escaped-pipe support by design). */
function splitRow(line) {
  const cells = line.split('|').map((c) => c.trim());
  // A leading and trailing '|' produce empty first/last entries.
  if (cells.length && cells[0] === '') cells.shift();
  if (cells.length && cells[cells.length - 1] === '') cells.pop();
  return cells;
}

function isSeparatorRow(cells) {
  return cells.every((c) => /^:?-{3,}:?$/.test(c));
}

/** Extracts table rows (as cell arrays) that appear under the given "## heading". */
function tableRowsUnderHeading(markdown, heading) {
  const lines = markdown.split('\n');
  const start = lines.findIndex((l) => l.trim() === `## ${heading}`);
  if (start === -1) {
    throw new Error(`GLOSSARY.md: section "## ${heading}" not found`);
  }
  const rows = [];
  let headerSeen = false;
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i];
    if (/^##\s/.test(line)) break;
    if (!line.trim().startsWith('|')) continue;
    const cells = splitRow(line);
    if (!headerSeen) {
      headerSeen = true; // header row
      continue;
    }
    if (isSeparatorRow(cells)) continue;
    rows.push(cells);
  }
  return rows;
}

/**
 * Compiles one "금지" cell item into a rule pattern.
 * Items wrapped in /slashes/ are regexes; anything else is a literal.
 */
function compilePattern(item) {
  const m = item.match(/^\/(.+)\/$/);
  try {
    return m ? new RegExp(m[1], 'g') : new RegExp(escapeRegExp(item), 'g');
  } catch (err) {
    throw new Error(`GLOSSARY.md: invalid pattern "${item}": ${err.message}`);
  }
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseLevel(cell) {
  if (cell === '오류') return {level: 'error', threshold: 1};
  if (cell === '경고') return {level: 'warn', threshold: 1};
  const m = cell.match(/^경고\((\d+)\+\)$/);
  if (m) return {level: 'warn', threshold: Number(m[1])};
  throw new Error(`GLOSSARY.md: unknown 수준 value "${cell}"`);
}

function loadRules() {
  const markdown = readFileSync(GLOSSARY_PATH, 'utf8');
  const rules = [];

  for (const cells of tableRowsUnderHeading(markdown, '용어 대역표')) {
    const [english, korean, banned = ''] = cells;
    if (!banned) continue;
    for (const item of banned.split(',').map((s) => s.trim()).filter(Boolean)) {
      rules.push({
        pattern: compilePattern(item),
        source: item,
        suggestion: korean,
        label: `용어: ${english}`,
        level: 'error',
        threshold: 1,
      });
    }
  }

  for (const cells of tableRowsUnderHeading(markdown, '금지 표현')) {
    const [banned, replacement, levelCell, note = ''] = cells;
    if (!banned || !levelCell) continue;
    const {level, threshold} = parseLevel(levelCell);
    for (const item of banned.split(',').map((s) => s.trim()).filter(Boolean)) {
      rules.push({
        pattern: compilePattern(item),
        source: item,
        suggestion: replacement,
        label: note || '금지 표현',
        level,
        threshold,
      });
    }
  }

  return rules;
}

// ---------------------------------------------------------------------------
// Target file resolution
// ---------------------------------------------------------------------------

function walkDocs(dir) {
  const found = [];
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...walkDocs(full));
    } else if (/\.(md|mdx)$/.test(entry.name)) {
      found.push(full);
    }
  }
  return found.sort();
}

function translatedFilesFromManifest() {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  return Object.entries(manifest.files)
    .filter(([, meta]) => meta.status === 'translated')
    .map(([rel]) => join(DOCS_ROOT, rel));
}

function resolveTargets(args) {
  if (args.all) return walkDocs(DOCS_ROOT);
  if (args.paths.length > 0) {
    return args.paths.map((p) => {
      for (const candidate of [resolve(p), join(REPO_ROOT, p), join(DOCS_ROOT, p)]) {
        if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
      }
      throw new Error(`file not found: ${p}`);
    });
  }
  return translatedFilesFromManifest();
}

// ---------------------------------------------------------------------------
// Content stripping (exclude code and targets from matching)
// ---------------------------------------------------------------------------

function blank(match) {
  return ' '.repeat(match.length);
}

/** Returns lines with unmatched-able regions blanked out, preserving line numbers and offsets. */
function stripLines(content) {
  const lines = content.split('\n');
  let inFence = false;
  let inJsxTemplate = false;
  let inJsxComment = false;
  return lines.map((line) => {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      return '';
    }
    if (inFence) return '';
    // JSX components that wrap a template literal, e.g.
    // <RailroadDiagram>{`...`}</RailroadDiagram> or <Mermaid chart={`...`}/>,
    // hold diagram/grammar source rather than markdown, so they need their
    // own start/end match (not a ``` fence).
    if (/^\s*<[A-Za-z][A-Za-z0-9]*[^{]*\{`\s*$/.test(line)) {
      inJsxTemplate = true;
      return '';
    }
    if (inJsxTemplate) {
      if (/^\s*`\}\s*(\/>|<\/[A-Za-z][A-Za-z0-9]*>)\s*$/.test(line)) inJsxTemplate = false;
      return '';
    }
    // {/* ... */} JSX comments (license headers) stay in English on purpose.
    if (/^\s*\{\/\*\s*$/.test(line)) {
      inJsxComment = true;
      return '';
    }
    if (inJsxComment) {
      if (/^\s*\*\/\}\s*$/.test(line)) inJsxComment = false;
      return '';
    }
    let l = line;
    if (/^\s*(import|export)\s/.test(l)) return '';
    l = l.replace(/`[^`]*`/g, blank); // inline code
    l = l.replace(/\]\([^)]*\)/g, (m) => `](${' '.repeat(m.length - 3)})`); // link targets
    l = l.replace(/<!--.*?-->/g, blank); // single-line HTML comments
    l = l.replace(/https?:\/\/\S+/g, blank); // bare URLs
    return l;
  });
}

// ---------------------------------------------------------------------------
// Auditing
// ---------------------------------------------------------------------------

/** Returns the [start, end] line indexes of the front matter block, or null. */
function frontMatterRange(rawLines) {
  if (rawLines[0]?.trim() !== '---') return null;
  for (let i = 1; i < rawLines.length; i++) {
    if (rawLines[i].trim() === '---') return {start: 0, end: i};
  }
  return null;
}

function auditFile(filePath, rules) {
  const content = readFileSync(filePath, 'utf8');
  const lines = stripLines(content);
  const fm = frontMatterRange(content.split('\n'));
  const errors = [];
  const warnings = [];

  for (const rule of rules) {
    const hits = [];
    lines.forEach((line, idx) => {
      rule.pattern.lastIndex = 0;
      for (const m of line.matchAll(rule.pattern)) {
        hits.push({line: idx + 1, text: m[0]});
      }
    });
    if (hits.length === 0 || hits.length < rule.threshold) continue;
    const bucket = rule.level === 'error' ? errors : warnings;
    for (const hit of hits) {
      bucket.push({...hit, rule, count: hits.length});
    }
  }

  // Untranslated-content heuristic: flag English prose lines.
  const englishProse = [];
  lines.forEach((line, idx) => {
    // Inside front matter only title/description hold translatable prose;
    // id, slug, and other keys legitimately stay English.
    if (fm && idx >= fm.start && idx <= fm.end && !/^\s*(title|description)\s*:/.test(line)) return;
    const t = line.trim();
    if (t.length < 20) return;
    if (/^(\||:::|---|<|!\[|#{1,6}\s*$)/.test(t)) return;
    if (/[가-힣]/.test(t)) return;
    // A list item whose "sentence" is really one bare identifier
    // (java.sql.Connection#clearWarnings, some.config.key) isn't prose to
    // translate — it's an API/config reference the source also left bare.
    if (/^[-*]\s+\S+$/.test(t)) return;
    // Headings dominated by ALL-CAPS tokens are SQL syntax (### ALTER TABLE ...
    // ADD COLUMN) or acronym-only titles (### REST API SSL), not prose to translate.
    if (/^#{1,6}\s/.test(t)) {
      const capsTokens = t.match(/\b[A-Z][A-Z0-9_]+\b/g) || [];
      if (capsTokens.length >= 2) return;
    }
    const words = t.match(/[A-Za-z]{2,}/g) || [];
    if (words.length >= 4) englishProse.push(idx + 1);
  });
  if (englishProse.length > 0) {
    warnings.push({
      line: englishProse[0],
      text: `영문 문장 ${englishProse.length}줄 잔존 (줄: ${englishProse.slice(0, 10).join(', ')}${englishProse.length > 10 ? ' …' : ''})`,
      rule: {source: 'untranslated', suggestion: '번역 필요 여부 확인', label: '번역 미완 가능성', level: 'warn'},
      count: englishProse.length,
    });
  }

  return {errors, warnings};
}

function formatFinding(relPath, f, kind) {
  const tag = kind === 'error' ? '오류' : '경고';
  const countInfo = f.rule.threshold > 1 ? ` [파일 내 ${f.count}회]` : '';
  return `${relPath}:${f.line}: [${tag}] "${f.text}" → ${f.rule.suggestion} (${f.rule.label})${countInfo}`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = {all: false, strict: false, listRules: false, paths: []};
  for (const a of argv) {
    if (a === '--all') args.all = true;
    else if (a === '--strict') args.strict = true;
    else if (a === '--list-rules') args.listRules = true;
    else if (a.startsWith('--')) throw new Error(`unknown flag: ${a}`);
    else args.paths.push(a);
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const rules = loadRules();

  if (args.listRules) {
    for (const r of rules) {
      console.log(`[${r.level}${r.threshold > 1 ? ` ${r.threshold}+` : ''}] ${r.source} → ${r.suggestion} (${r.label})`);
    }
    console.log(`\n${rules.length} rules loaded.`);
    return;
  }

  const targets = resolveTargets(args);
  if (targets.length === 0) {
    console.log('검사 대상 문서가 없습니다 (sync-manifest.json에 translated 상태 파일 없음).');
    return;
  }

  let errorCount = 0;
  let warningCount = 0;
  for (const file of targets) {
    const rel = relative(REPO_ROOT, file);
    const relPath = rel.startsWith('..') ? file : rel;
    const {errors, warnings} = auditFile(file, rules);
    errorCount += errors.length;
    warningCount += warnings.length;
    for (const f of errors) console.log(formatFinding(relPath, f, 'error'));
    for (const f of warnings) console.log(formatFinding(relPath, f, 'warn'));
  }

  console.log(`\n검사 완료: 문서 ${targets.length}개, 오류 ${errorCount}건, 경고 ${warningCount}건`);
  if (errorCount > 0 || (args.strict && warningCount > 0)) {
    process.exitCode = 1;
  }
}

try {
  main();
} catch (err) {
  console.error(String(err.message || err));
  process.exitCode = 2;
}
