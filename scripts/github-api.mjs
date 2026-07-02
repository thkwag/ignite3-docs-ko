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

export const UPSTREAM_REPO = 'apache/ignite-3';
export const UPSTREAM_BRANCH = 'main';
export const UPSTREAM_DOCS_PATH = 'docs/docs';

export async function githubApi(path, init = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'ignite3-docs-ko-sync-bot',
      ...(process.env.GITHUB_TOKEN ? {Authorization: `Bearer ${process.env.GITHUB_TOKEN}`} : {}),
      ...init.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`GitHub API request failed (${res.status} ${res.statusText}): ${path}\n${await res.text()}`);
  }
  return res.status === 204 ? null : res.json();
}

/** Returns the SHA of the most recent upstream commit that touched the given docs/docs-relative path. */
export async function latestUpstreamCommitForPath(relativePath) {
  const upstreamPath = `${UPSTREAM_DOCS_PATH}/${relativePath}`;
  const commits = await githubApi(
    `/repos/${UPSTREAM_REPO}/commits?path=${encodeURIComponent(upstreamPath)}&sha=${UPSTREAM_BRANCH}&per_page=1`,
  );
  if (commits.length === 0) {
    throw new Error(`No upstream commit history found for ${upstreamPath}`);
  }
  return commits[0].sha;
}
