---
id: cli-commands
title: CLI 명령어 참조
sidebar_position: 1
---

# Apache Ignite CLI 도구

## 개요 {#overview}

Apache Ignite CLI는 REST API로 클러스터와 통신하며, 전체 클러스터를 구성하거나 노드별 설정을 적용할 수 있습니다. CLI는 대화형 모드로 실행하거나, 대화형 모드에 진입하지 않고 명령어를 바로 실행할 수도 있습니다.

### 대화형 CLI 모드 {#interactive-cli-mode}

CLI를 대화형 모드로 사용하려면 먼저 CLI를 [실행](/getting-started/quick-start#start-the-ignite-cli)한 다음, `update` 명령어로 [클러스터](/configure-and-operate/configuration/config-cluster-and-nodes)나 [노드](/configure-and-operate/reference/node-configuration)를 구성하세요.

예를 들어 클러스터에 새 사용자를 추가하는 명령어는 다음과 같습니다:

```bash
cluster config update ignite.security.authentication.providers.default.users=[{username=newuser,displayName=newuser,password="newpassword",passwordEncoding=PLAIN,roles=[system]}]
```

### 비대화형 CLI 모드 {#non-interactive-cli-mode}

비대화형 모드는 빠른 업데이트나 스크립트에서 명령어를 실행할 때 유용합니다.

명령어를 비대화형으로 실행할 때는 `{`, `}`와 같은 특수 POSIX 문자가 올바르게 해석되도록 인수를 따옴표로 감싸세요:

```bash title="Linux"
bin/ignite3 cluster config update "ignite.schemaSync={delayDurationMillis=500,maxClockSkewMillis=500}"
```

```bash title="Windows"
bin/ignite3.bat cluster config update "ignite.schemaSync={delayDurationMillis=500,maxClockSkewMillis=500}"
```

또는 백슬래시(`\`)로 명령어의 모든 특수 문자를 이스케이프할 수 있습니다. 예를 들면 다음과 같습니다:

```bash title="Linux"
bin/ignite3 cluster config update ignite.security.authentication.providers.default.users=\[\{username\=newuser,displayName\=newuser,password\=\"newpassword\",passwordEncoding\=PLAIN,roles\=\[system\]\}\]
```

```bash title="Windows"
bin/ignite3.bat cluster config update ignite.security.authentication.providers.default.users=\[\{username\=newuser,displayName\=newuser,password\=\"newpassword\",passwordEncoding\=PLAIN,roles\=\[system\]\}\]
```

비대화형 모드는 자동화 스크립트에서도 유용합니다. 예를 들어 Bash 스크립트에서 다음과 같이 구성 항목을 설정할 수 있습니다:

```bash
#!/bin/bash

...

bin/ignite3 cluster config update "ignite.schemaSync={delayDurationMillis=500,maxClockSkewMillis=500}"

bin/ignite3 cluster config update "ignite.security.authentication.providers.default.users=[{username=newuser,displayName=newuser,password=\"newpassword\",passwordEncoding=PLAIN,roles=[system]}]"
```

### 상세 출력 {#verbose-output}

모든 CLI 명령어는 디버깅에 도움이 되는 추가 출력을 표시할 수 있습니다. `-v` 옵션을 여러 번 지정하면 출력 상세도를 높일 수 있습니다. 옵션 1개는 REST 요청과 응답을 보여주고, 2개(-vv)는 요청 헤더를, 3개(-vvv)는 요청 본문을 보여줍니다.

### CLI 도구 로그 {#cli-tool-logs}

CLI 도구는 수행한 작업의 확장 로그를 저장합니다. 이 로그에는 일반 작업 중에는 표시되지 않는 추가 정보가 담겨 있습니다. 로그 디렉터리는 다음 방법으로 구성할 수 있습니다:

- 로그를 저장할 디렉터리를 `IGNITE_CLI_LOGS_DIR` 환경 변수로 설정합니다.
- CLI 홈 폴더를 지정하려면 `$XDG_STATE_HOME` 환경 변수를 설정합니다. 이 구성 변수는 [XDG Base Directory Specification](https://specifications.freedesktop.org/basedir-spec/latest/)을 따르며 `IGNITE_CLI_LOGS_DIR`을 덮어쓰지 않습니다. `$XDG_STATE_HOME`은 설정되어 있고 `IGNITE_CLI_LOGS_DIR`은 설정되어 있지 않으면 로그는 `$XDG_STATE_HOME/ignitecli/logs` 디렉터리에 저장됩니다.

위 속성이 모두 설정되어 있지 않으면 로그는 다음 위치에 저장됩니다:

- Unix 시스템과 macOS에서는 `~/.local/state/ignitecli/logs` 디렉터리에 저장됩니다.
- Windows에서는 `%USERPROFILE%\.local\state\ignitecli\logs` 폴더에 저장됩니다.

## SQL 명령어 {#sql-commands}

이 명령어는 클러스터에서 SQL 쿼리를 실행하는 데 사용합니다.

### sql

SQL 쿼리를 실행합니다. SQL 쿼리를 지정하지 않으면 대화형 SQL 편집기 모드로 진입합니다.

#### 구문 {#syntax}

```
sql [--jdbc-url=<jdbc>] [--plain] [--file=<file>] [--profile=<profileName>] [--verbose] <command>
```

#### 매개변수 {#parameters}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--jdbc-url` | 옵션 | 아니요 | Ignite 클러스터의 JDBC URL입니다(예: 'jdbc:ignite:thin://127.0.0.1:10800'). |
| `--plain` | 플래그 | 아니요 | 출력을 일반 텍스트 형식으로 표시합니다. |
| `--file` | 옵션 | 아니요 | 실행할 SQL 명령어가 담긴 파일의 경로입니다. |
| `--profile` | 옵션 | 아니요 | 로컬 CLI 프로파일 이름(비대화형 모드에서만 사용 가능). |
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |
| `<command>` | 인수 | 예 | 실행할 SQL 쿼리입니다. |

#### 예시 {#example}

```bash
sql "SELECT * FROM PUBLIC.PERSON"
```

### sql planner invalidate-cache

SQL 플래너 캐시를 무효화합니다.

#### 구문 {#syntax-1}

```
sql planner invalidate-cache [--tables=<tables>] [--url=<clusterUrl>] [--profile=<profileName>] [--verbose]
```

#### 매개변수 {#parameters-1}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--tables` | 옵션 | 아니요 | 테이블 목록입니다(쉼표로 구분). |
| `--url` | 옵션 | 아니요 | 클러스터 엔드포인트의 URL입니다. 아무 노드의 URL이나 사용할 수 있습니다. 지정하지 않으면 프로파일 설정의 기본 URL을 사용합니다. |
| `--profile` | 옵션 | 아니요 | 로컬 CLI 프로파일 이름(비대화형 모드에서만 사용 가능). |
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |

#### 예시 {#example-1}

```bash
sql planner invalidate-cache --tables=PUBLIC.PERSON,PUBLIC.ORDERS
```

## CLI 구성 명령어 {#cli-configuration-commands}

이 명령어는 Apache Ignite CLI 도구의 프로파일과 설정을 구성하는 데 사용합니다.

### cli config profile create

지정한 이름으로 프로파일을 생성합니다.

#### 구문 {#syntax-2}

```
cli config profile create [--activate] [--copy-from=<copyFrom>] [--verbose] <profileName>
```

#### 매개변수 {#parameters-2}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--activate` | 플래그 | 아니요 | 새 프로파일을 현재 프로파일로 활성화합니다. |
| `--copy-from` | 옵션 | 아니요 | 내용을 새 프로파일에 복사할 프로파일입니다. |
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |
| `<profileName>` | 인수 | 예 | 새 프로파일의 이름입니다. |

#### 예시 {#example-2}

```bash
cli config profile create --activate --copy-from=default myprofile
```

### cli config profile activate

이름으로 지정한 프로파일을 활성화합니다.

#### 구문 {#syntax-3}

```
cli config profile activate [--verbose] <profileName>
```

#### 매개변수 {#parameters-3}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |
| `<profileName>` | 인수 | 예 | 활성화할 프로파일의 이름입니다. |

#### 예시 {#example-3}

```bash
cli config profile activate myprofile
```

### cli config profile list

구성 프로파일 목록을 표시합니다.

#### 구문 {#syntax-4}

```
cli config profile list [--verbose]
```

#### 매개변수 {#parameters-4}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |

#### 예시 {#example-4}

```bash
cli config profile list
```

### cli config profile show

현재 프로파일의 세부 정보를 가져옵니다.

#### 구문 {#syntax-5}

```
cli config profile show [--verbose]
```

#### 매개변수 {#parameters-5}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |

#### 예시 {#example-5}

```bash
cli config profile show
```

### cli config get

지정한 구성 키의 값을 가져옵니다.

#### 구문 {#syntax-6}

```
cli config get [--profile=<profileName>] [--verbose] <key>
```

#### 매개변수 {#parameters-6}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--profile` | 옵션 | 아니요 | 로컬 CLI 프로파일 이름(비대화형 모드에서만 사용 가능). |
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |
| `<key>` | 인수 | 예 | 속성 이름입니다. |

#### 예시 {#example-6}

```bash
cli config get ignite.jdbc-url
```

### cli config set

쉼표로 구분한 키-값 쌍을 입력받아 구성 매개변수를 설정합니다.

#### 구문 {#syntax-7}

```
cli config set [--profile=<profileName>] [--verbose] <String=String>...
```

#### 매개변수 {#parameters-7}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--profile` | 옵션 | 아니요 | 로컬 CLI 프로파일 이름(비대화형 모드에서만 사용 가능). |
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |
| `<String=String>...` | 인수 | 예 | CLI 구성 매개변수입니다. |

#### 예시 {#example-7}

```bash
cli config set ignite.jdbc-url=http://localhost:10300
```

### cli config show

현재 활성화된 구성을 표시합니다.

#### 구문 {#syntax-8}

```
cli config show [--profile=<profileName>] [--verbose]
```

#### 매개변수 {#parameters-8}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--profile` | 옵션 | 아니요 | 로컬 CLI 프로파일 이름(비대화형 모드에서만 사용 가능). |
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |

#### 예시 {#example-8}

```bash
cli config show
```

### cli config remove

지정한 구성 키를 제거합니다.

#### 구문 {#syntax-9}

```
cli config remove [--profile=<profileName>] [--verbose] <key>
```

#### 매개변수 {#parameters-9}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--profile` | 옵션 | 아니요 | 로컬 CLI 프로파일 이름(비대화형 모드에서만 사용 가능). |
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |
| `<key>` | 인수 | 예 | 속성 이름입니다. |

#### 예시 {#example-9}

```bash
cli config remove ignite.jdbc-url
```

## 클러스터 명령어 {#cluster-commands}

이 명령어는 클러스터를 관리하는 데 사용합니다.

### cluster config show

엔드포인트 URL로 지정한 클러스터의 구성을 표시합니다. 구성 경로 선택자를 지정하면 선택자로 지정한 범위만 표시합니다.

#### 구문 {#syntax-10}

```
cluster config show [--url=<clusterUrl>] [--format=<format>] [--profile=<profileName>] [--verbose] [<selector>]
```

#### 매개변수 {#parameters-10}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--url` | 옵션 | 아니요 | 클러스터 엔드포인트의 URL입니다. |
| `--format` | 옵션 | 아니요 | 출력 형식입니다. 사용 가능한 값: JSON, HOCON(기본값: HOCON). |
| `--profile` | 옵션 | 아니요 | 로컬 CLI 프로파일 이름(비대화형 모드에서만 사용 가능). |
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |
| `<selector>` | 인수 | 아니요 | 구성 경로 선택자입니다. |

#### 예시 {#example-10}

```bash
cluster config show
```

### cluster config update

엔드포인트 URL로 지정한 클러스터의 구성을 제공된 인수 값으로 업데이트합니다.

#### 구문 {#syntax-11}

```
cluster config update [--url=<clusterUrl>] [--file=<configFile>] [--profile=<profileName>] [--verbose] [<args>...]
```

#### 매개변수 {#parameters-11}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--url` | 옵션 | 아니요 | 클러스터 엔드포인트의 URL입니다. |
| `--file` | 옵션 | 아니요 | 실행할 구성 업데이트 명령어가 담긴 파일의 경로입니다. |
| `--profile` | 옵션 | 아니요 | 로컬 CLI 프로파일 이름(비대화형 모드에서만 사용 가능). |
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |
| `<args>...` | 인수 | 아니요 | 업데이트할 구성 인수와 값입니다. |

#### 예시 {#example-11}

```bash
cluster config update ignite.system.idleSafeTimeSyncIntervalMillis=250
```

### cluster init

Ignite 클러스터를 초기화합니다.

#### 구문 {#syntax-12}

```
cluster init --name=<clusterName> [--metastorage-group=<nodeNames>] [--cluster-management-group=<nodeNames>] [--config=<config>] [--config-files=<filePaths>] [--url=<clusterUrl>] [--profile=<profileName>] [--verbose]
```

#### 매개변수 {#parameters-12}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--name` | 옵션 | 예 | 사람이 읽을 수 있는 클러스터 이름입니다. 초기화 후에도 변경할 수 있습니다. |
| `--metastorage-group` | 옵션 | 아니요 | 메타스토리지 그룹 노드입니다(쉼표로 구분된 목록). |
| `--cluster-management-group` | 옵션 | 아니요 | 클러스터 관리 그룹을 호스팅할 노드 이름입니다(쉼표로 구분된 목록). |
| `--config` | 옵션 | 아니요 | 초기화 중에 적용할 클러스터 구성입니다. |
| `--config-files` | 옵션 | 아니요 | 클러스터 구성 파일의 경로입니다(쉼표로 구분된 목록). |
| `--url` | 옵션 | 아니요 | 클러스터 엔드포인트의 URL입니다. |
| `--profile` | 옵션 | 아니요 | 로컬 CLI 프로파일 이름(비대화형 모드에서만 사용 가능). |
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |

#### 예시 {#example-12}

```bash
cluster init --name=myCluster
```

### cluster status

클러스터의 상태를 출력합니다.

#### 구문 {#syntax-13}

```
cluster status [--url=<clusterUrl>] [--profile=<profileName>] [--verbose]
```

#### 매개변수 {#parameters-13}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--url` | 옵션 | 아니요 | 클러스터 엔드포인트의 URL입니다. |
| `--profile` | 옵션 | 아니요 | 로컬 CLI 프로파일 이름(비대화형 모드에서만 사용 가능). |
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |

#### 예시 {#example-13}

```bash
cluster status --url http://localhost:10300
```

### cluster topology physical

지정한 클러스터의 물리 토폴로지를 표시합니다.

#### 구문 {#syntax-14}

```
cluster topology physical [--plain] [--url=<clusterUrl>] [--profile=<profileName>] [--verbose]
```

#### 매개변수 {#parameters-14}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--plain` | 플래그 | 아니요 | 출력을 일반 텍스트 형식으로 표시합니다. |
| `--url` | 옵션 | 아니요 | 클러스터 엔드포인트의 URL입니다. |
| `--profile` | 옵션 | 아니요 | 로컬 CLI 프로파일 이름(비대화형 모드에서만 사용 가능). |
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |

#### 예시 {#example-14}

```bash
cluster topology physical --url http://localhost:10300
```

### cluster topology logical

지정한 클러스터의 논리 토폴로지를 표시합니다.

#### 구문 {#syntax-15}

```
cluster topology logical [--plain] [--url=<clusterUrl>] [--profile=<profileName>] [--verbose]
```

#### 매개변수 {#parameters-15}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--plain` | 플래그 | 아니요 | 출력을 일반 텍스트 형식으로 표시합니다. |
| `--url` | 옵션 | 아니요 | 클러스터 엔드포인트의 URL입니다. |
| `--profile` | 옵션 | 아니요 | 로컬 CLI 프로파일 이름(비대화형 모드에서만 사용 가능). |
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |

#### 예시 {#example-15}

```bash
cluster topology logical --url http://localhost:10300
```

### cluster unit deploy

파일이나 디렉터리에서 배포 단위를 배포합니다(하위 디렉터리는 재귀적으로 탐색하지 않음).

#### 구문 {#syntax-16}

```
cluster unit deploy --version=<version> --path=<path> [--nodes=<nodes>] [--url=<clusterUrl>] [--profile=<profileName>] [--verbose] <id>
```

#### 매개변수 {#parameters-16}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--version` | 옵션 | 예 | 단위 버전(x.y.z)입니다. |
| `--path` | 옵션 | 예 | 배포 단위 파일이나 디렉터리의 경로입니다. |
| `--nodes` | 옵션 | 아니요 | 단위를 배포할 초기 노드 집합입니다(쉼표로 구분). |
| `--url` | 옵션 | 아니요 | 클러스터 엔드포인트의 URL입니다. |
| `--profile` | 옵션 | 아니요 | 로컬 CLI 프로파일 이름(비대화형 모드에서만 사용 가능). |
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |
| `<id>` | 인수 | 예 | 배포 단위 식별자입니다. |

#### 예시 {#example-16}

```bash
cluster unit deploy --version=1.0.0 --path=/path/to/unit.jar myunit
```

### cluster unit undeploy

배포 단위를 배포 해제합니다.

#### 구문 {#syntax-17}

```
cluster unit undeploy --version=<version> [--url=<clusterUrl>] [--profile=<profileName>] [--verbose] <id>
```

#### 매개변수 {#parameters-17}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--version` | 옵션 | 예 | 단위 버전(x.y.z)입니다. |
| `--url` | 옵션 | 아니요 | 클러스터 엔드포인트의 URL입니다. |
| `--profile` | 옵션 | 아니요 | 로컬 CLI 프로파일 이름(비대화형 모드에서만 사용 가능). |
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |
| `<id>` | 인수 | 예 | 단위 ID입니다. |

#### 예시 {#example-17}

```bash
cluster unit undeploy --version=1.0.0 --url http://localhost:10300 myunit
```

### cluster unit list

지정한 배포 단위 ID의 배포 목록을 표시합니다.

#### 구문 {#syntax-18}

```
cluster unit list [--version=<version>] [--status=<statuses>] [--plain] [--url=<clusterUrl>] [--profile=<profileName>] [--verbose] <unitId>
```

#### 매개변수 {#parameters-18}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--version` | 옵션 | 아니요 | 버전으로 배포 단위를 필터링합니다(정확히 일치해야 함). |
| `--status` | 옵션 | 아니요 | 상태로 배포 단위를 필터링합니다(쉼표로 구분). |
| `--plain` | 플래그 | 아니요 | 출력을 일반 텍스트 형식으로 표시합니다. |
| `--url` | 옵션 | 아니요 | 클러스터 엔드포인트의 URL입니다. |
| `--profile` | 옵션 | 아니요 | 로컬 CLI 프로파일 이름(비대화형 모드에서만 사용 가능). |
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |
| `<unitId>` | 인수 | 예 | 배포 단위 ID입니다. |

#### 예시 {#example-18}

```bash
cluster unit list --status=DEPLOYED,STARTING myunit
```

### cluster metric source enable

클러스터 메트릭 소스를 활성화합니다.

#### 구문 {#syntax-19}

```
cluster metric source enable [--url=<clusterUrl>] [--profile=<profileName>] [--verbose] <srcName>
```

#### 매개변수 {#parameters-19}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--url` | 옵션 | 아니요 | 클러스터 엔드포인트의 URL입니다. |
| `--profile` | 옵션 | 아니요 | 로컬 CLI 프로파일 이름(비대화형 모드에서만 사용 가능). |
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |
| `<srcName>` | 인수 | 예 | 메트릭 소스 이름입니다. |

#### 예시 {#example-19}

```bash
cluster metric source enable jvm
```

### cluster metric source disable

클러스터 메트릭 소스를 비활성화합니다.

#### 구문 {#syntax-20}

```
cluster metric source disable [--url=<clusterUrl>] [--profile=<profileName>] [--verbose] <srcName>
```

#### 매개변수 {#parameters-20}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--url` | 옵션 | 아니요 | 클러스터 엔드포인트의 URL입니다. |
| `--profile` | 옵션 | 아니요 | 로컬 CLI 프로파일 이름(비대화형 모드에서만 사용 가능). |
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |
| `<srcName>` | 인수 | 예 | 메트릭 소스 이름입니다. |

#### 예시 {#example-20}

```bash
cluster metric source disable jvm
```

### cluster metric source list

클러스터 메트릭 소스 목록을 표시합니다.

#### 구문 {#syntax-21}

```
cluster metric source list [--plain] [--url=<clusterUrl>] [--profile=<profileName>] [--verbose]
```

#### 매개변수 {#parameters-21}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--plain` | 플래그 | 아니요 | 출력을 일반 텍스트 형식으로 표시합니다. |
| `--url` | 옵션 | 아니요 | 클러스터 엔드포인트의 URL입니다. |
| `--profile` | 옵션 | 아니요 | 로컬 CLI 프로파일 이름(비대화형 모드에서만 사용 가능). |
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |

#### 예시 {#example-21}

```bash
cluster metric source list
```

## 노드 명령어 {#node-commands}

이 명령어는 개별 노드를 관리하는 데 사용합니다.

### node config show

노드 구성을 표시합니다.

#### 구문 {#syntax-22}

```
node config show [--url=<nodeUrl>] [--format=<format>] [--profile=<profileName>] [--verbose] [<selector>]
```

#### 매개변수 {#parameters-22}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--url` | 옵션 | 아니요 | 통신 엔드포인트로 사용할 노드의 URL입니다. |
| `--format` | 옵션 | 아니요 | 출력 형식입니다. 사용 가능한 값: JSON, HOCON(기본값: HOCON). |
| `--profile` | 옵션 | 아니요 | 로컬 CLI 프로파일 이름(비대화형 모드에서만 사용 가능). |
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |
| `<selector>` | 인수 | 아니요 | 구성 경로 선택자입니다. |

#### 예시 {#example-22}

```bash
node config show ignite.clientConnector
```

### node config update

노드 구성을 업데이트합니다.

#### 구문 {#syntax-23}

```
node config update [--url=<nodeUrl>] [--file=<configFile>] [--profile=<profileName>] [--verbose] [<args>...]
```

#### 매개변수 {#parameters-23}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--url` | 옵션 | 아니요 | 통신 엔드포인트로 사용할 노드의 URL입니다. |
| `--file` | 옵션 | 아니요 | 실행할 구성 업데이트 명령어가 담긴 파일의 경로입니다. |
| `--profile` | 옵션 | 아니요 | 로컬 CLI 프로파일 이름(비대화형 모드에서만 사용 가능). |
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |
| `<args>...` | 인수 | 아니요 | 업데이트할 구성 인수와 값입니다. |

#### 예시 {#example-23}

```bash
node config update --url http://localhost:10300 ignite.clientConnector.connectTimeoutMillis=5000
```

### node status

노드의 상태를 출력합니다.

#### 구문 {#syntax-24}

```
node status [--url=<nodeUrl>] [--profile=<profileName>] [--verbose]
```

#### 매개변수 {#parameters-24}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--url` | 옵션 | 아니요 | 통신 엔드포인트로 사용할 노드의 URL입니다. |
| `--profile` | 옵션 | 아니요 | 로컬 CLI 프로파일 이름(비대화형 모드에서만 사용 가능). |
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |

#### 예시 {#example-24}

```bash
node status
```

### node version

노드 빌드 버전을 출력합니다.

#### 구문 {#syntax-25}

```
node version [--url=<nodeUrl>] [--profile=<profileName>] [--verbose]
```

#### 매개변수 {#parameters-25}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--url` | 옵션 | 아니요 | 통신 엔드포인트로 사용할 노드의 URL입니다. |
| `--profile` | 옵션 | 아니요 | 로컬 CLI 프로파일 이름(비대화형 모드에서만 사용 가능). |
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |

#### 예시 {#example-25}

```bash
node version
```

### node metric list

노드 메트릭 목록을 표시합니다.

#### 구문 {#syntax-26}

```
node metric list [--url=<nodeUrl>] [--plain] [--profile=<profileName>] [--verbose]
```

#### 매개변수 {#parameters-26}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--url` | 옵션 | 아니요 | 통신 엔드포인트로 사용할 노드의 URL입니다. |
| `--plain` | 플래그 | 아니요 | 출력을 일반 텍스트 형식으로 표시합니다. |
| `--profile` | 옵션 | 아니요 | 로컬 CLI 프로파일 이름(비대화형 모드에서만 사용 가능). |
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |

#### 예시 {#example-26}

```bash
node metric list
```

### node metric source enable

노드 메트릭 소스를 활성화합니다.

#### 구문 {#syntax-27}

```
node metric source enable [--url=<nodeUrl>] [--profile=<profileName>] [--verbose] <srcName>
```

#### 매개변수 {#parameters-27}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--url` | 옵션 | 아니요 | 통신 엔드포인트로 사용할 노드의 URL입니다. |
| `--profile` | 옵션 | 아니요 | 로컬 CLI 프로파일 이름(비대화형 모드에서만 사용 가능). |
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |
| `<srcName>` | 인수 | 예 | 메트릭 소스 이름입니다. |

#### 예시 {#example-27}

```bash
node metric source enable jvm
```

### node metric source disable

노드 메트릭 소스를 비활성화합니다.

#### 구문 {#syntax-28}

```
node metric source disable [--url=<nodeUrl>] [--profile=<profileName>] [--verbose] <srcName>
```

#### 매개변수 {#parameters-28}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--url` | 옵션 | 아니요 | 통신 엔드포인트로 사용할 노드의 URL입니다. |
| `--profile` | 옵션 | 아니요 | 로컬 CLI 프로파일 이름(비대화형 모드에서만 사용 가능). |
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |
| `<srcName>` | 인수 | 예 | 메트릭 소스 이름입니다. |

#### 예시 {#example-28}

```bash
node metric source disable jvm
```

### node metric source list

노드 메트릭 소스 목록을 표시합니다.

#### 구문 {#syntax-29}

```
node metric source list [--url=<nodeUrl>] [--plain] [--profile=<profileName>] [--verbose]
```

#### 매개변수 {#parameters-29}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--url` | 옵션 | 아니요 | 통신 엔드포인트로 사용할 노드의 URL입니다. |
| `--plain` | 플래그 | 아니요 | 출력을 일반 텍스트 형식으로 표시합니다. |
| `--profile` | 옵션 | 아니요 | 로컬 CLI 프로파일 이름(비대화형 모드에서만 사용 가능). |
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |

#### 예시 {#example-29}

```bash
node metric source list --plain
```

### node unit list

배포된 단위 목록을 표시합니다.

#### 구문 {#syntax-30}

```
node unit list [--version=<version>] [--status=<statuses>] [--url=<nodeUrl>] [--plain] [--profile=<profileName>] [--verbose] <unitId>
```

#### 매개변수 {#parameters-30}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--version` | 옵션 | 아니요 | 버전으로 배포 단위를 필터링합니다(정확히 일치해야 함). |
| `--status` | 옵션 | 아니요 | 상태로 배포 단위를 필터링합니다(쉼표로 구분). |
| `--url` | 옵션 | 아니요 | 통신 엔드포인트로 사용할 노드의 URL입니다. |
| `--plain` | 플래그 | 아니요 | 출력을 일반 텍스트 형식으로 표시합니다. |
| `--profile` | 옵션 | 아니요 | 로컬 CLI 프로파일 이름(비대화형 모드에서만 사용 가능). |
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |
| `<unitId>` | 인수 | 예 | 배포 단위 ID입니다. |

#### 예시 {#example-30}

```bash
node unit list --status=DEPLOYED myunit
```

## 재해 복구 명령어 {#disaster-recovery-commands}

이 명령어는 재해 상황에서 데이터 파티션을 복구하고 시스템 RAFT 그룹을 복구하는 데 사용합니다.

### recovery partitions restart

파티션을 재시작합니다.

#### 구문 {#syntax-31}

```
recovery partitions restart --zone=<zoneName> --table=<tableName> [--partitions=<partitionIds>] [--nodes=<nodeNames>] [--with-cleanup] [--url=<clusterUrl>] [--profile=<profileName>] [--verbose]
```

#### 매개변수 {#parameters-31}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--zone` | 옵션 | 예 | 파티션을 재설정할 영역의 이름입니다. 대소문자를 구분하며 따옴표 없이 입력합니다. |
| `--table` | 옵션 | 예 | 파티션을 재설정할 테이블의 정규화된 이름입니다. 대소문자를 구분하며 따옴표 없이 입력합니다. |
| `--partitions` | 옵션 | 아니요 | 상태를 조회할 파티션 ID입니다. 지정하지 않으면 모든 파티션이 대상입니다(쉼표로 구분). |
| `--nodes` | 옵션 | 아니요 | 파티션 상태를 조회할 노드 이름입니다. 대소문자를 구분하며 따옴표 없이 입력하고, 지정하지 않으면 모든 노드가 대상입니다(쉼표로 구분). |
| `--with-cleanup` | 플래그 | 아니요 | 스토리지 정리 후 파티션을 재시작합니다. 재시작 전에 파티션 스토리지의 모든 데이터를 제거합니다. |
| `--url` | 옵션 | 아니요 | 클러스터 엔드포인트의 URL입니다. |
| `--profile` | 옵션 | 아니요 | 로컬 CLI 프로파일 이름(비대화형 모드에서만 사용 가능). |
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |

#### 예시 {#example-31}

```bash
recovery partitions restart --zone=default --table=PUBLIC.PERSON --with-cleanup
```

### recovery partitions reset

파티션을 재설정합니다.

#### 구문 {#syntax-32}

```
recovery partitions reset --zone=<zoneName> [--table=<tableName>] [--partitions=<partitionIds>] [--url=<clusterUrl>] [--profile=<profileName>] [--verbose]
```

#### 매개변수 {#parameters-32}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--zone` | 옵션 | 예 | 파티션을 재설정할 영역의 이름입니다. 대소문자를 구분하며 따옴표 없이 입력합니다. |
| `--table` | 옵션 | 아니요 | 파티션을 재설정할 테이블의 정규화된 이름입니다. 대소문자를 구분하며 따옴표 없이 입력합니다. |
| `--partitions` | 옵션 | 아니요 | 상태를 조회할 파티션 ID입니다. 지정하지 않으면 모든 파티션이 대상입니다(쉼표로 구분). |
| `--url` | 옵션 | 아니요 | 클러스터 엔드포인트의 URL입니다. |
| `--profile` | 옵션 | 아니요 | 로컬 CLI 프로파일 이름(비대화형 모드에서만 사용 가능). |
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |

#### 예시 {#example-32}

```bash
recovery partitions reset --zone=default --table=PUBLIC.PERSON
```

### recovery partitions states

파티션 상태를 반환합니다.

#### 구문 {#syntax-33}

```
recovery partitions states (--global | --local) [--nodes=<nodeNames>] [--partitions=<partitionIds>] [--zones=<zoneNames>] [--plain] [--url=<clusterUrl>] [--profile=<profileName>] [--verbose]
```

#### 매개변수 {#parameters-33}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--global` | 플래그 | 예* | 글로벌 파티션 상태를 가져옵니다. global과 local 중 하나는 반드시 지정해야 합니다. |
| `--local` | 플래그 | 예* | 로컬 파티션 상태를 가져옵니다. global과 local 중 하나는 반드시 지정해야 합니다. |
| `--nodes` | 옵션 | 아니요 | 파티션 상태를 조회할 노드 이름입니다. 대소문자를 구분하며 따옴표 없이 입력하고, 지정하지 않으면 모든 노드가 대상입니다(쉼표로 구분). |
| `--partitions` | 옵션 | 아니요 | 상태를 조회할 파티션 ID입니다. 지정하지 않으면 모든 파티션이 대상입니다(쉼표로 구분). |
| `--zones` | 옵션 | 아니요 | 파티션 상태를 조회할 영역 이름입니다. 대소문자를 구분하며 따옴표 없이 입력하고, 지정하지 않으면 모든 영역이 대상입니다(쉼표로 구분). |
| `--plain` | 플래그 | 아니요 | 출력을 일반 텍스트 형식으로 표시합니다. |
| `--url` | 옵션 | 아니요 | 클러스터 엔드포인트의 URL입니다. |
| `--profile` | 옵션 | 아니요 | 로컬 CLI 프로파일 이름(비대화형 모드에서만 사용 가능). |
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |

#### 예시 {#example-33}

```bash
recovery partitions states --local --zones=default
```

### recovery cluster reset

클러스터를 재설정합니다.

#### 구문 {#syntax-34}

```
recovery cluster reset [--cluster-management-group=<cmgNodeNames>] [--metastorage-replication-factor=<metastorageReplicationFactor>] [--url=<clusterUrl>] [--profile=<profileName>] [--verbose]
```

#### 매개변수 {#parameters-34}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--cluster-management-group` | 옵션 | 아니요 | 클러스터 관리 그룹을 호스팅할 노드 이름입니다(쉼표로 구분). |
| `--metastorage-replication-factor` | 옵션 | 아니요 | 메타스토리지 RAFT 그룹의 투표 멤버 집합에 속한 노드 수입니다. |
| `--url` | 옵션 | 아니요 | 클러스터 엔드포인트의 URL입니다. |
| `--profile` | 옵션 | 아니요 | 로컬 CLI 프로파일 이름(비대화형 모드에서만 사용 가능). |
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |

#### 예시 {#example-34}

```bash
recovery cluster reset
```

### recovery cluster migrate

복구 과정에서 누락된 노드를 복구된 클러스터로 마이그레이션합니다.

#### 구문 {#syntax-35}

```
recovery cluster migrate --old-cluster-url=<oldClusterUrl> --new-cluster-url=<newClusterUrl> [--verbose]
```

#### 매개변수 {#parameters-35}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--old-cluster-url` | 옵션 | 예 | 이전 클러스터 엔드포인트의 URL입니다(이 클러스터의 노드를 새 클러스터로 마이그레이션합니다). |
| `--new-cluster-url` | 옵션 | 예 | 새 클러스터 엔드포인트의 URL입니다(이전 클러스터의 노드를 이 클러스터로 마이그레이션합니다). |
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |

#### 예시 {#example-35}

```bash
recovery cluster migrate --old-cluster-url=http://old-cluster:10300 --new-cluster-url=http://new-cluster:10300
```

## 분산 명령어 {#distribution-commands}

이 명령어는 테이블 파티션 분산을 관리하는 데 사용합니다.

### distribution reset

파티션 분산을 재설정합니다.

#### 구문 {#syntax-36}

```
distribution reset --zones=<zoneNames> [--url=<clusterUrl>] [--profile=<profileName>] [--verbose]
```

#### 매개변수 {#parameters-36}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--zones` | 옵션 | 예 | 분산 상태를 재설정할 영역 이름입니다(쉼표로 구분). |
| `--url` | 옵션 | 아니요 | 클러스터 엔드포인트의 URL입니다. |
| `--profile` | 옵션 | 아니요 | 로컬 CLI 프로파일 이름(비대화형 모드에서만 사용 가능). |
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |

#### 예시 {#example-36}

```bash
distribution reset --zones=default
```

## 영역 명령어 {#zone-commands}

이 명령어는 영역 수준 구성과 데이터 노드 할당을 관리합니다.

### zone datanodes reset

지정한 영역의 데이터 노드를 재설정합니다.

#### 구문 {#syntax-37}

```
zone datanodes reset --zone-names=<zoneNames>
```

#### 매개변수 {#parameters-37}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--zone-names` | 인수 | 아니요 | 데이터 노드를 재설정할 영역 이름 목록입니다(쉼표로 구분). 지정하지 않으면 모든 영역을 재설정합니다. |

## 기타 명령어 {#miscellaneous-commands}

일반적인 용도로 사용하는 명령어입니다.

### connect

Ignite 3 노드에 연결합니다.

#### 구문 {#syntax-38}

```
connect --username=<username> --password=<password> [--verbose] <nodeUrl>
```

#### 매개변수 {#parameters-38}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--username` | 옵션 | 예 | 클러스터에 연결할 사용자 이름입니다. |
| `--password` | 옵션 | 예 | 클러스터에 연결할 비밀번호입니다. |
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |
| `<nodeUrl>` | 인수 | 예 | 통신 엔드포인트로 사용할 노드의 URL입니다. |

#### 예시 {#example-37}

```bash
connect --username=admin --password=password http://localhost:10300
```

### disconnect

Ignite 3 노드와의 연결을 해제합니다.

#### 구문 {#syntax-39}

```
disconnect [--verbose]
```

#### 매개변수 {#parameters-39}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |

#### 예시 {#example-38}

```bash
disconnect
```

### clear

화면을 지웁니다.

#### 구문 {#syntax-40}

```
clear
```

#### 매개변수 {#parameters-40}

이 명령어는 매개변수를 받지 않습니다.

#### 예시 {#example-39}

```bash
clear
```

### cls

화면을 지웁니다.

#### 구문 {#syntax-41}

```
cls [--verbose]
```

#### 매개변수 {#parameters-41}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |

#### 예시 {#example-40}

```bash
cls
```

### exit

CLI를 종료합니다.

#### 구문 {#syntax-42}

```
exit [--verbose]
```

#### 매개변수 {#parameters-42}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `--verbose` | 플래그 | 아니요 | 로그, REST 호출 등 추가 정보를 표시합니다. |

#### 예시 {#example-41}

```bash
exit
```

### help

지정한 명령어의 도움말 정보를 표시합니다.

#### 구문 {#syntax-43}

```
help [COMMAND]
```

#### 매개변수 {#parameters-43}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `[COMMAND]` | 인수 | 아니요 | 사용법 도움말을 표시할 COMMAND입니다. |

#### 예시 {#example-42}

```bash
help cluster config show
```

### version

현재 CLI 도구 버전을 표시합니다.

#### 구문 {#syntax-44}

```
version
```

#### 매개변수 {#parameters-44}

이 명령어는 매개변수를 받지 않습니다.

#### 예시 {#example-43}

```bash
version
```
