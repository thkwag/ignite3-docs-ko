# Apache Ignite 3 문서 한국어 번역 (비공식)

[Apache Ignite 3](https://ignite.apache.org/) 공식 문서(<https://ignite.apache.org/docs/ignite3/latest/index>)를 한국어로 번역해 게시하는 독립 사이트입니다.

**Apache Software Foundation과는 관련이 없는 비공식 프로젝트**입니다. 원문은 언제나 [공식 영문 문서](https://ignite.apache.org/docs/ignite3/latest/index)를 기준으로 합니다.

- 사이트: <https://thkwag.github.io/ignite3-docs-ko/>
- 원본 저장소: <https://github.com/apache/ignite-3> (`docs/docs` 디렉터리)

## 구조

Apache Ignite 3 공식 문서 저장소의 Docusaurus 구성(`docs/docusaurus.config.ts`, `docs/sidebars.ts`, `docs/docs/`)을 그대로 가져와 단일 언어(한국어) 사이트로 재구성했습니다. 원본과 달리 버전 관리(3.0.0/3.1.0 동시 게시)는 사용하지 않으며, 항상 원본의 최신(`latest`) 문서 한 가지 버전만 번역 대상으로 삼습니다.

```
docs/                   문서 콘텐츠 (원본과 동일한 디렉터리 구조, id는 원본 slug 유지)
src/                     Docusaurus 테마 커스터마이징
static/                  이미지 등 정적 파일
sync-manifest.json       파일별 번역 기준 커밋을 추적하는 매니페스트
scripts/check-upstream-sync.mjs   원본 변경 감지 스크립트
.github/workflows/       배포 및 원본 추적 자동화
```

## 번역 상태 추적

각 문서 파일의 번역 여부와 번역 시점의 원본 커밋은 [`sync-manifest.json`](./sync-manifest.json)에 기록합니다. `status`가 `translated`인 파일만 한국어로 번역이 완료된 것이며, 그 외에는 원본(영문) 콘텐츠가 그대로 배치되어 있습니다.

`.github/workflows/check-upstream-sync.yml`이 정기적으로 `apache/ignite-3`의 `docs/docs` 변경 사항을 확인하여, 이미 번역된 파일의 원본이 바뀌면 GitHub Issue로 알립니다.

문서 하나를 번역했다면 아래 명령으로 매니페스트를 갱신합니다.

```bash
node scripts/mark-translated.mjs <docs 이하 상대 경로>
# 예: node scripts/mark-translated.mjs getting-started/intro.md
```

## 로컬 개발

```bash
npm install
npm run start      # 로컬 미리보기
npm run build      # 프로덕션 빌드
npm run validate   # 링크/이미지/빌드 검증
```

## 라이선스

원본 문서와 동일하게 [Apache License, Version 2.0](./LICENSE)에 따라 배포됩니다. 번역 등 변경 사항은 [`NOTICE`](./NOTICE)에 기록되어 있습니다.
