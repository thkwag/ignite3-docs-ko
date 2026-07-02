# ignite3-docs-ko

Apache Ignite 3 공식 문서를 한국어로 번역해 게시하는 Docusaurus 사이트. 원문은 `apache/ignite-3` 저장소의 `docs/docs`이며, `docs/` 아래 파일을 제자리에서 한국어로 교체하는 방식으로 번역한다.

## 번역 작업 규칙 (필수)

- `docs/` 아래 문서를 번역·수정·검수하거나 `GLOSSARY.md`를 갱신하는 모든 작업은 **시작 전에 Skill 도구로 `translating-docs` 스킬을 호출**한다. 세션마다, 작업 규모와 무관하게 적용된다.
- `GLOSSARY.md`(저장소 루트)가 용어·표기의 단일 표준이다. 번역 전 반드시 읽는다.
- 한국어 문장 품질은 `.claude/skills/translating-docs/references/korean-style.md`의 번역투·문체 규칙을 따른다.
- 용어사전을 변경하면 같은 세션에서 번역 완료 문서 전체를 전수조사해 일괄 수정한다.

## 명령

```bash
npm run check:glossary                        # 용어사전 감사 (번역 완료 문서)
node scripts/check-glossary.mjs <path|--all>  # 특정 파일 / 전체 감사
node scripts/mark-translated.mjs <path>       # 번역 완료 기록 (docs/ 이하 상대 경로)
npm run validate:quick                        # typecheck + 감사 + 링크/이미지 검증
npm run build                                 # 프로덕션 빌드
```

## 번역 상태

- `sync-manifest.json`: 파일별 번역 상태(`translated`/`pending`)와 기준 원본 커밋.
- 번역을 마친 파일은 반드시 `mark-translated.mjs`로 기록한다.
