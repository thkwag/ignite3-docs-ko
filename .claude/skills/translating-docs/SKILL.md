---
name: translating-docs
description: Use when translating Apache Ignite 3 docs into Korean, editing or reviewing Korean content under docs/, updating GLOSSARY.md, running or fixing glossary-audit findings, or marking files translated in this repo. docs/ 번역·검수·수정, 용어사전 갱신 작업에 필수.
---

# Ignite 3 문서 한국어 번역

## 필수 배경

- **GLOSSARY.md**(저장소 루트) — 용어·표기 표준과 문체 규칙. 이 스킬의 모든 작업은 여기서 시작한다.
- **[references/korean-style.md](references/korean-style.md)** — 번역투·AI 문체 패턴 상세와 처방. 문장 품질은 이 문서를 따른다.

## 번역 워크플로

1. **GLOSSARY.md를 처음부터 끝까지 읽는다.** 세션마다 다시 읽는다(직전 세션 이후 바뀌었을 수 있다).
2. 원문을 읽고 개념을 이해한다. Ignite 3 특유 개념(분산 영역, 콜로케이션, 스토리지 프로파일 등)이 불확실하면 `docs/` 안의 관련 원문(미번역 영문) 문서와 공식 Apache Ignite 3 문서에서 확인한다. 추측으로 번역하지 않는다.
3. 번역한다. GLOSSARY.md의 대역표·문체 규칙을 따르고, 아래 "보존 대상"을 지킨다.
4. 대역표에 없는 용어를 번역했다면 **즉시 GLOSSARY.md에 등재**한다(아래 등재 기준).
5. `node scripts/check-glossary.mjs <파일 경로>` — 오류 0건까지 수정하고, 경고는 하나씩 검토해 수정하거나 유지 근거를 확인한다.
6. 자가 검수: 감사 스크립트가 못 잡는 것(의미 오류, 새로운 번역투, 어순, 조사 오류)을 원문 대조로 확인한다.
7. `node scripts/mark-translated.mjs <docs 이하 상대 경로>` 로 매니페스트를 갱신한다(GitHub API 필요 — 실패하면 사용자에게 보고). 이 스크립트는 `README.md`의 번역 진행 상태 표도 함께 자동 갱신하므로, `README.md`가 diff에 나타나도 정상이다.
8. `npm run check:glossary` 로 번역 완료 문서 전체를 다시 확인한다.

## 보존 대상 (번역하지 않는 것)

- 코드 블록·인라인 코드·설정 키·CLI 명령·SQL 키워드·파일 경로·URL. 코드 블록 안 주석도 영어 유지.
- front matter의 `id`, `slug`, `sidebar_position` 등 키와 슬러그 값. `title`·`description` **값**은 번역한다.
- MDX import/export 문, 컴포넌트 이름·속성, HTML 태그 구조.
- 링크 경로·앵커·이미지 경로. 링크 **텍스트**는 번역한다.
- 제목을 번역하면 자동 생성 앵커가 바뀌어 다른 문서에서 들어오는 링크가 깨진다. **번역한 모든 제목(h2~h6)에 원문 앵커를 명시한다**: `## 버전 저장 {#version-storage}`. 원문 앵커는 영문 제목의 GitHub slug(소문자, 공백→하이픈)다.
- Docusaurus admonition 지시어(`:::note` 등). 내용은 번역한다.
- mermaid 등 다이어그램 코드 블록은 라벨 텍스트까지 통째로 원문 유지한다(노드 ID·`<br/>`·내장 코드와 섞여 있어 부분 번역 시 렌더링이 깨진다).
- 제품명·언어명·약어(GLOSSARY.md "원문 유지 용어" 표).

## 용어사전 등재 기준

다음 중 하나면 등재한다:

- Ignite 3 도메인 개념어(다른 문서에도 나올 것이 확실한 용어)
- 번역 선택지가 갈리는 용어(음차 vs 번역, 두 가지 이상 자연스러운 후보)
- 이번 번역에서 잘못 쓸 뻔했던 표현(금지 표기·금지 표현으로 기록)

등재 시 `금지 표기` 열에 예상되는 오표기·경쟁 표기를 함께 적는다. 감사는 이 열로 이루어진다.

## 용어사전 변경 시 전수조사 (예외 없음)

기존 항목의 표준 번역을 바꾸거나 금지 표기를 추가했다면, **같은 세션에서**:

1. `npm run check:glossary` 실행 — 새 규칙 위반을 모두 찾는다.
2. 구표기가 금지 목록에 없다면 `grep -rn "<구표기>" docs/` 로도 확인한다(금지 표기에 구표기를 추가하는 것이 원칙).
3. 발견된 위반을 번역 완료 문서 전체에서 일괄 수정한다.
4. `npm run check:glossary` 오류 0건을 확인한다.

변경만 하고 수정을 미루는 것은 금지다. 용어사전과 번역문이 어긋난 상태로 세션을 끝내지 않는다.

## 감사 도구

```bash
npm run check:glossary                          # 번역 완료(translated) 문서 전체
node scripts/check-glossary.mjs <path...>       # 특정 파일
node scripts/check-glossary.mjs --all           # docs/ 전체 (미번역 포함)
node scripts/check-glossary.mjs --strict        # 경고도 실패 처리
node scripts/check-glossary.mjs --list-rules    # 파싱된 규칙 확인
```

- GLOSSARY.md의 표 형식(열 구성, `/pattern/` 정규식, `,` 구분, 셀 내 `|` 금지)을 지켜야 파싱된다. 규칙을 추가했으면 `--list-rules`로 파싱을 확인한다.
- "번역 미완 가능성" 경고는 영문 문장이 남아 있다는 뜻이다. 의도적으로 남긴 것(예: 표 안의 API 식별자)인지 확인한다.

## sidebars.ts 라벨

문서를 번역한 세션에서 `sidebars.ts`를 열어, 그 문서가 속한 카테고리(중첩 카테고리 포함)의 `label`이 아직 영어면 대역표 기준으로 번역한다(예: "Getting Started" → "시작하기"). "번역된 문서가 하나라도 있는 카테고리"의 라벨은 한국어여야 한다. 최상위 `label: "Apache Ignite 3 Documentation"`은 사이트 전체 번역 시점에 다룬다.

## 흔한 합리화 (전부 금지)

| 합리화 | 실제 |
| ------ | ---- |
| "용어사전은 지난번에 읽어서 기억한다" | 세션 사이에 바뀐다. 매번 다시 읽는다. |
| "한 번만 나오는 용어라 등재할 필요 없다" | 140개 문서에 다시 나온다. 등재 기준에 맞으면 등재한다. |
| "경고는 오류가 아니니 넘어간다" | 경고는 검토 의무가 있다. 수정하거나 유지 근거를 남긴다. |
| "전수조사는 번역 다 끝나고 몰아서 한다" | 용어사전 변경 즉시 한다. 어긋난 상태로 다음 작업을 시작하지 않는다. |
| "감사 통과했으니 번역 완료다" | 스크립트는 알려진 패턴만 잡는다. 원문 대조 검수를 거쳐야 완료다. |
| "일부만 수정하는 작업이라 스킬·용어사전은 불필요하다" | 한 문장을 고쳐도 용어·문체 표준은 적용된다. |

## Red Flags — 이 생각이 들면 멈춘다

- 용어사전을 읽지 않고 번역을 시작하려 한다
- 새 용어를 "일단 이렇게 옮기고 나중에 정리"하려 한다
- 감사 오류를 고치는 대신 규칙을 완화하려 한다(완화가 정당하면 먼저 사용자에게 근거를 보고)
- mark-translated를 건너뛰고 번역만 끝내려 한다
