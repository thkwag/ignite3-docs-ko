---
id: cli-configuration
title: CLI 구성 매개변수
sidebar_label: CLI 구성
---

## CLI 구성 매개변수 {#cli-configuration-parameters}

Apache Ignite CLI는 다양한 구성 매개변수를 지원합니다:

```bash
ignite.jdbc.key-store.path=
ignite.cluster-endpoint-url=http://localhost:10300
ignite.jdbc.client-auth=
ignite.rest.key-store.password=
ignite.jdbc.key-store.password=
ignite.cli.sql.multiline=true
ignite.cli.syntax-highlighting=true
ignite.rest.trust-store.path=
ignite.jdbc.trust-store.password=
ignite.auth.basic.username=
ignite.jdbc-url=jdbc:ignite:thin://127.0.0.1:10800
ignite.rest.key-store.path=
ignite.rest.trust-store.password=
ignite.jdbc.trust-store.path=
ignite.auth.basic.password=
```

| 속성 | 기본값 | 설명 |
|---|---|---|
| ignite.jdbc.key-store.path | | JDBC 키스토어 파일 경로. |
| ignite.cluster-endpoint-url | http://127.0.1.1:10300 | 기본 클러스터 엔드포인트 URL. |
| ignite.jdbc.client-auth | | CLI에서 JDBC 클라이언트 인가 활성화 여부. |
| ignite.rest.key-store.password | | REST 키스토어 비밀번호. |
| ignite.jdbc.key-store.password | | JDBC 키스토어 비밀번호. |
| ignite.cli.sql.multiline | true | CLI에서 SQL 명령어의 여러 줄 입력 모드를 활성화합니다. |
| ignite.cli.syntax-highlighting | true | CLI 출력에서 구문 강조를 활성화합니다. |
| ignite.rest.trust-store.path | | REST 트러스트스토어 경로. |
| ignite.jdbc.trust-store.password | | JDBC 트러스트스토어 비밀번호. |
| ignite.auth.basic.username | | 기본 인증 사용자 이름. |
| ignite.jdbc-url | jdbc:ignite:thin://127.0.0.1:10800 | 기본 JDBC URL. |
| ignite.rest.key-store.path | | REST 키스토어 경로. |
| ignite.rest.trust-store.password | | REST 트러스트스토어 비밀번호. |
| ignite.jdbc.trust-store.path | | JDBC 트러스트스토어 경로. |
| ignite.auth.basic.password | | 기본 인증 비밀번호. |

## 구성 프로파일 {#configuration-profiles}

Apache Ignite [CLI](/tools/cli-commands#interactive-cli-mode)는 서로 다른 설정 묶음을 관리할 수 있도록 구성 프로파일을 지원합니다.

프로파일을 생성하고 관리하려면 다음 명령어를 사용하세요:

- 새 구성 프로파일 생성:

```bash
cli config create <profile_name>
```

- 기존 프로파일로 전환:

```bash
cli config activate <profile_name>
```

- 사용 가능한 모든 프로파일 표시:

```bash
cli config list
```

- 현재 사용 중인 프로파일과 모든 사용자 지정 설정 표시:

```bash
cli config show
```

각 프로파일은 자체 CLI 전용 설정을 저장하므로, 사용 사례별로 격리된 구성을 유지할 수 있습니다.
