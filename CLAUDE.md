# ignite3-docs-ko

Apache Ignite 3 공식 문서를 한국어로 번역해 게시하는 Docusaurus 사이트. 원문은 `apache/ignite-3` 저장소의 `docs/docs`이며, `docs/` 아래 파일을 제자리에서 한국어로 교체하는 방식으로 번역한다.

## 번역 작업 규칙 (필수)

- `docs/` 아래 문서를 번역·수정·검수하거나 `GLOSSARY.md`를 갱신하는 모든 작업은 **시작 전에 Skill 도구로 `translating-docs` 스킬을 호출**한다. 세션마다, 작업 규모와 무관하게 적용된다. 번역 워크플로·보존 규칙·문체 기준은 이 스킬(`.claude/skills/translating-docs/`)이 정의한다.
- `GLOSSARY.md`(프로젝트 루트)가 용어·표기의 단일 표준이다. 번역 전 반드시 읽는다. 스킬 스크립트는 이 파일을 프로젝트 루트에서 동적으로 찾는다(스킬을 다른 프로젝트에도 재사용할 수 있도록 스킬 폴더 안에 두지 않는다).

## 명령

```bash
npm run check:glossary                                                        # 용어사전 감사 (번역 완료 문서)
node .claude/skills/translating-docs/scripts/check-glossary.mjs <path|--all>  # 특정 파일 / 전체 감사
node .claude/skills/translating-docs/scripts/mark-translated.mjs <path>       # 번역 완료 기록 (docs/ 이하 상대 경로)
npm run validate:quick                                                        # typecheck + 감사 + 링크/이미지 검증
npm run build                                                                 # 프로덕션 빌드
```

## 번역 상태 추적

- `sync-manifest.json`: 파일별 번역 상태(`translated`/`pending`)와 기준 원본 커밋.
- 문서 번역을 마쳤다면 `node .claude/skills/translating-docs/scripts/mark-translated.mjs <docs 이하 상대 경로>`로 반드시 기록한다. GitHub API로 원본의 최신 커밋을 조회해 매니페스트에 남기고, `README.md`의 번역 진행 상태 표도 함께 자동 갱신한다(diff에 `README.md`가 나타나는 것은 정상이다). 번역만 하고 이 기록을 건너뛰지 않는다.

## 용어사전 변경 시 전수조사 (예외 없음)

`GLOSSARY.md`의 표준 번역을 바꾸거나 금지 표기를 추가했다면 **같은 세션에서**:

1. `npm run check:glossary` 실행 — 새 규칙 위반을 모두 찾는다.
2. 구표기가 금지 목록에 없다면 `grep -rn "<구표기>" docs/`로도 확인한다(금지 표기에 구표기를 추가하는 것이 원칙).
3. 발견된 위반을 번역 완료 문서 전체에서 일괄 수정한다.
4. `npm run check:glossary` 오류 0건을 확인한다.

변경만 하고 수정을 미루지 않는다. 용어사전과 번역문이 어긋난 상태로 세션을 끝내지 않는다.

## sidebars.ts 카테고리 라벨

문서를 번역한 세션에서 `sidebars.ts`를 열어, 그 문서가 속한 카테고리(중첩 카테고리 포함)의 `label`이 아직 영어면 `GLOSSARY.md` 대역표 기준으로 한국어로 번역한다(예: "Getting Started" → "시작하기"). 번역된 문서가 하나라도 있는 카테고리의 라벨은 한국어여야 한다. 최상위 `label: "Apache Ignite 3 Documentation"`은 사이트 전체 번역 시점에 다룬다.
