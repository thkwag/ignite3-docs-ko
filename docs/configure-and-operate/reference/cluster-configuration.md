---
id: cluster-configuration
title: 클러스터 구성 매개변수
sidebar_label: 클러스터 구성
---

Ignite 3 클러스터 구성은 클러스터 전체에 공유됩니다. 어느 노드에 구성을 적용하든 클러스터의 모든 노드에 전파됩니다.

:::note
클러스터 이름은 표준 클러스터 구성에 포함되지 않으며 `cluster config update`로 변경할 수 없습니다. 초기화 후 클러스터 이름을 바꾸려면 [REST API](/tools/rest-api#renaming-a-cluster)를 사용하세요.
:::

Ignite 3에서는 HOCON 또는 JSON으로 구성을 생성하고 관리할 수 있습니다. 구성 파일에는 `ignite`라는 단일 루트 "노드"가 있습니다. 모든 구성 섹션은 이 노드 아래에 자식, 손자 형태로 계층을 이룹니다.

## 클러스터 구성 확인 {#checking-cluster-configuration}

클러스터 구성을 조회하려면 CLI 도구를 사용하세요.

- CLI 도구를 시작하고 클러스터의 아무 노드에나 연결하세요.
- `cluster config show` 명령어를 실행하세요.

CLI 도구는 전체 클러스터 구성을 출력합니다. 구성의 일부만 필요하다면 필요한 속성을 명령어 인수로 지정해 검색 범위를 좁힐 수 있습니다. 예를 들면 다음과 같습니다.

```shell
cluster config show ignite.transaction
```

## 클러스터 구성 변경 {#changing-cluster-configuration}

클러스터 구성은 CLI 도구에서 변경합니다. `--file` 매개변수로 구성 파일을 전달하면 대화형(REPL) 모드와 비대화형 모드 모두에서 업데이트할 수 있습니다.

:::note
CLI에서 직접 설정한 값은 구성 파일에 설정된 값보다 우선합니다.
:::

### REPL로 업데이트 {#update-via-repl}

CLI 도구를 시작하고 클러스터의 아무 노드에나 연결하세요.

- `cluster config update` 명령어를 실행하고 업데이트할 구성을 명령어 인수로 지정하세요. 예를 들면 다음과 같습니다.

```shell
cluster config update ignite.system.idleSafeTimeSyncIntervalMillis=600
```

- 매개변수를 하나 이상 업데이트하려면 `cluster config update` 명령어에 구성 파일을 전달하세요.

```shell
cluster config update --file ../ignite-config.conf
```

- 두 방식을 함께 사용해 구성을 업데이트할 수도 있습니다.

```shell
cluster config update --file ../ignite-config.conf ignite.system.idleSafeTimeSyncIntervalMillis=600
```

업데이트한 구성은 클러스터 전체에 자동으로 적용됩니다.

### 비대화형 모드로 업데이트 {#update-via-non-interactive-mode}

CLI 도구를 먼저 시작하지 않고도 [비대화형](/tools/cli-commands#non-interactive-cli-mode) CLI 모드로 클러스터 구성을 수정할 수 있습니다.

- `--file` 매개변수로 구성 파일을 전달하세요.

```shell
bin/ignite3 cluster config update --file ../ignite-config.conf
```

업데이트한 구성은 클러스터 전체에 자동으로 적용됩니다.

## 클러스터 구성 내보내기 {#exporting-cluster-configuration}

클러스터 구성을 파일로 내보내야 한다면 다음 명령어를 사용하세요.

```shell
bin/ignite3 cluster config show > cluster-config.txt
```

## 구성 매개변수 {#configuration-parameters}

### 이벤트 로그 구성 {#event-log-configuration}

```json
{
  "ignite" : {
    "eventlog" : {
      "channels" : [ ],
      "sinks" : [ ]
    }
  }
}
```

| 속성 | 기본값 | 설명 | 변경 가능 여부 | 재시작 필요 여부 | 허용 값 |
|----------|---------|-------------|------------|------------------|-------------------|
| channels | | 이름이 있는 이벤트 채널 목록입니다. | 예 | 아니요 | 유효한 채널 |
| sinks | | 이름이 있는 이벤트 싱크 목록입니다. | 예 | 아니요 | 유효한 싱크 |

### 가비지 컬렉션 구성 {#garbage-collection-configuration}

```json
{
  "ignite" : {
    "gc" : {
      "batchSize" : 5,
      "lowWatermark" : {
        "dataAvailabilityTimeMillis" : 600000,
        "updateIntervalMillis" : 300000
      },
      "threads" : 16
    }
  }
}
```

| 속성 | 기본값 | 설명 | 변경 가능 여부 | 재시작 필요 여부 | 허용 값 |
|----------|---------|-------------|------------|------------------|-------------------|
| batchSize | 5 | 가비지 컬렉션이 파티션마다 한 번에 제거하는 항목 수입니다. | 예 | 아니요 | 0 - inf |
| lowWatermark.dataAvailabilityTimeMillis | 600000 | 오래된 버전을 사용할 수 있는 기간을 밀리초 단위로 지정합니다. | 예 | 아니요 | 1000 - inf |
| lowWatermark.updateIntervalMillis | 300000 | 하한 워터마크를 업데이트하는 주기입니다. | 예 | 아니요 | 0 - inf |
| threads | Runtime.getRuntime().availableProcessors() | 가비지 컬렉터가 사용하는 스레드 수입니다. | 예 | 예 | 1 - inf |

### 시스템 구성 {#system-configuration}

```json
{
  "ignite" : {
    "system" : {
      "idleSafeTimeSyncIntervalMillis" : 500
    }
  }
}
```

| 속성 | 기본값 | 설명 | 변경 가능 여부 | 재시작 필요 여부 | 허용 값 |
|----------|---------|-------------|------------|------------------|-------------------|
| idleSafeTimeSyncIntervalMillis | 500 | 메타스토리지가 유휴 상태(쓰기가 발생하지 않는 상태)일 때 시간 동기화 명령어를 실행하는 주기(밀리초 단위)를 결정합니다. schemaSync.delayDurationMillis를 초과해서는 안 되며, 최적값은 schemaSync.delayDurationMillis / 2입니다. | 예 | 아니요(메타스토리지 리더가 재선출되면 적용됨) | 1 - inf |

### 메트릭 구성 {#metrics-configuration}

```json
{
  "ignite" : {
    "metrics" : {
      "exporters" : [ ]
    }
  }
}
```

| 속성 | 기본값 | 설명 | 변경 가능 여부 | 재시작 필요 여부 | 허용 값 |
|----------|---------|-------------|------------|------------------|-------------------|
| exporters | | 현재 사용 중인 [메트릭](/configure-and-operate/monitoring/config-metrics) 익스포터 목록입니다. | 예 | 아니요 | 유효한 익스포터 |

### 복제 구성 {#replication-configuration}

```json
{
  "ignite" : {
    "replication" : {
      "idleSafeTimePropagationDurationMillis" : 1000,
      "leaseAgreementAcceptanceTimeLimitMillis" : 120000,
      "leaseExpirationIntervalMillis" : 5000,
      "rpcTimeoutMillis" : 60000,
      "batchSizeBytes" : 8192
    }
  }
}
```

| 속성 | 기본값 | 설명 | 변경 가능 여부 | 재시작 필요 여부 | 허용 값 |
|----------|---------|-------------|------------|------------------|-------------------|
| idleSafeTimePropagationDurationMillis | 1000 | 파티션 안전 시간(Safe Time) 업데이트 간격입니다. | 아니요 | N/A | 1 - inf |
| leaseAgreementAcceptanceTimeLimitMillis | 120000 | 새 파티션 리스홀더 선출에 걸리는 최대 시간(밀리초 단위)입니다. | 예 | N/A | 5000 - inf |
| leaseExpirationIntervalMillis | 5000 | 리스 하나의 지속 시간입니다. | 예 | N/A | 2000 - 120000 |
| rpcTimeoutMillis | 60000 | 복제 요청 처리 타임아웃입니다. | 예 | 아니요 | 0 - inf |
| batchSizeBytes | 8192 | 물리 스토리지에 한 번에 기록할 데이터 길이(바이트 단위)입니다. 원자적 쓰기 하나의 크기를 제한하는 데 사용합니다. | 예 | 아니요 | 1 - Integer.MAX_VALUE |

### 스키마 동기화 구성 {#schema-sync-configuration}

```json
{
  "ignite" : {
    "schemaSync" : {
      "delayDurationMillis" : 100,
      "maxClockSkewMillis" : 500
    }
  }
}
```

| 속성 | 기본값 | 설명 | 변경 가능 여부 | 재시작 필요 여부 | 허용 값 |
|----------|---------|-------------|------------|------------------|-------------------|
| delayDurationMillis | 100 | 스키마 업데이트가 적용되기까지의 지연 시간입니다. 모든 클러스터 노드에 스키마 업데이트를 전달하는 데 걸리는 일반적인 시간보다 길어야 하며, 그렇지 않으면 작업 처리가 지연될 수 있습니다. system.idleSafeTimeSyncIntervalMillis보다 작아서는 안 되며, 최적값은 system.idleSafeTimeSyncIntervalMillis * 2입니다. | 아니요 | N/A | 1 - inf |
| maxClockSkewMillis | 500 | 클러스터가 허용하는 물리 시계 간 최대 클록 스큐(clock skew, 밀리초 단위)입니다. 클러스터 내 두 노드의 물리 시계 차이가 이 값을 초과하면 클러스터가 비정상적으로 동작할 수 있습니다. | 아니요 | N/A | 0 - inf |

### 보안 구성 {#security-configuration}

```json
{
  "ignite" : {
    "security" : {
      "authentication" : {
        "providers" : [ {
          "name" : "default",
          "type" : "basic",
          "users" : [ {
            "password" : "********",
            "username" : "ignite",
            "displayName" : "ignite"
          }]
        } ]
      }
  }
}
```

| 속성 | 기본값 | 설명 | 변경 가능 여부 | 재시작 필요 여부 | 허용 값 |
|----------|---------|-------------|------------|------------------|-------------------|
| **인증 매개변수** | | | | | |
| providers.name | default | 인증 공급자의 이름입니다. | 예 | 아니요 | 유효한 문자열 |
| providers.type | basic | 인증 공급자 유형입니다. | 예 | 아니요 | basic, ldap |
| providers.users | | 특정 공급자에 등록된 사용자 목록입니다. | | | |
| providers.users.displayName | ignite | 대소문자를 구분하는 사용자 이름입니다. | 아니요 | N/A | 유효한 사용자 이름 |
| providers.users.password | ******** | 사용자 비밀번호입니다. | 예 | 아니요 | 유효한 비밀번호 |
| providers.users.username | ignite | 대소문자를 구분하지 않는 사용자 이름입니다. | 예 | 아니요 | 유효한 사용자 이름 |
| **인가 매개변수** | | | | | |

### SQL 구성 {#sql-configuration}

```json
{
  "ignite" : {
    "sql" : {
      "createTable" : {
        "minStaleRowsCount" : 500,
        "staleRowsFraction" : 0.2
      },
      "planner" : {
        "estimatedNumberOfQueries" : 1024,
        "maxPlanningTimeMillis" : 15000
      }
    }
  }
}
```

| 속성 | 기본값 | 설명 | 변경 가능 여부 | 재시작 필요 여부 | 허용 값 |
|----------|---------|-------------|------------|------------------|-------------------|
| createTable.minStaleRowsCount | 500 | 쿼리 실행 계획을 자동으로 다시 생성하는 데 필요한, 마지막 쿼리 계획 업데이트 이후의 업데이트 횟수입니다. `WITH min stale rows` [매개변수](/sql/reference/language-definition/ddl#create-table)를 지정하면 이 값이 재정의됩니다. | 예 | 아니요 | 0 - Long.MAX_VALUE |
| createTable.staleRowsFraction | 0.2 | 쿼리 실행 계획이 자동으로 다시 생성되려면 변경되어야 하는 테이블의 비율입니다. `WITH stale rows fraction` [매개변수](/sql/reference/language-definition/ddl#create-table)를 지정하면 이 값이 재정의됩니다. | 예 | 아니요 | 0 - 1 |
| planner.estimatedNumberOfQueries | 1024 | 일정 기간 동안 클러스터에서 실행될 것으로 예상되는 고유 쿼리 수입니다. 내부 캐시와 프로세스를 최적화하는 데 사용합니다. 선택 사항입니다. | 예 | 예 | 0 - Integer.MAX_VALUE |
| planner.maxPlanningTimeMillis | 15000 | 쿼리 계획 수립 타임아웃(밀리초)입니다. 타임아웃에 도달하면 계획 최적화 프로세스가 중단됩니다. "0"은 타임아웃이 없음을 의미합니다. | 예 | 예 | 0 - Long.MAX_VALUE |

### 트랜잭션 구성 {#transactions-configuration}

```json
{
  "ignite" : {
    "transaction" : {
      "readOnlyTimeoutMillis" : 600000,
      "readWriteTimeoutMillis" : 30000
    }
  }
}
```

| 속성 | 기본값 | 설명 | 변경 가능 여부 | 재시작 필요 여부 | 허용 값 |
|----------|---------|-------------|------------|------------------|-------------------|
| readOnlyTimeoutMillis | 600000 | 읽기 전용 트랜잭션의 타임아웃입니다. 트랜잭션이 참여 노드에서 확보한 리소스를 얼마나 오래 유지하는지를 정의합니다. 타임아웃을 지정하지 않거나 `0`으로 설정하면 기본값인 10분이 적용됩니다. 트랜잭션은 타임아웃이 만료될 때까지 활성 상태를 유지하도록 보장됩니다. 타임아웃에 도달하면 트랜잭션이 중단되지만, 관련 리소스가 정리되는 동안 타임아웃을 살짝 넘겨 잠시 유지될 수 있습니다. | 예 | 아니요 | 1 - inf |
| readWriteTimeoutMillis | 30000 | 읽기-쓰기 트랜잭션의 타임아웃입니다. 트랜잭션이 참여 노드에서 확보한 리소스를 얼마나 오래 유지하는지를 정의합니다. 타임아웃을 지정하지 않거나 `0`으로 설정하면 기본값인 30초가 적용됩니다. 트랜잭션은 타임아웃이 만료될 때까지 활성 상태를 유지하도록 보장됩니다. 타임아웃에 도달하면 트랜잭션이 중단되지만, 관련 리소스가 정리되는 동안 타임아웃을 살짝 넘겨 잠시 유지될 수 있습니다. | 예 | 아니요 | 1 - inf |

### 시스템 구성(내부) {#system-configuration-internal}

이 섹션에서는 Ignite 컴포넌트가 사용하는 내부 속성을 설명합니다. `cluster config update` CLI 명령어로 이 속성을 편집할 수 있지만, 변경하기 전에 Ignite 지원팀과 상의하는 것을 권장합니다. 이 속성은 클러스터 전체에 적용됩니다. 노드별 속성은 [노드 구성](/configure-and-operate/reference/node-configuration#system-configuration)을 참고하세요.

:::note
속성 이름은 `camelCase`로 표기됩니다.
:::

```json
{
  "ignite" : {
    "system" : {
      "cmgPath" : "",
      "metastoragePath" : "",
      "partitionsBasePath" : "",
      "partitionsLogPath" : "",
      "properties":[]
    }
  }
}
```

| 속성 | 기본값 | 설명 | 변경 가능 여부 | 재시작 필요 여부 | 허용 값 |
|----------|---------|-------------|------------|------------------|-------------------|
| system.cmgPath | | 클러스터 관리 그룹(cluster management group) 정보를 저장하는 경로입니다. 기본적으로 데이터는 `{IGNITE_HOME}/work/cmg`에 저장됩니다. | 예 | 예 | 유효한 절대 경로입니다. |
| system.metastoragePath | | 클러스터 메타 정보를 저장하는 경로입니다. 기본적으로 데이터는 `{IGNITE_HOME}/work/metastorage`에 저장됩니다. | 예 | 예 | 유효한 절대 경로입니다. |
| system.partitionsBasePath | | 데이터 파티션을 저장하는 경로입니다. 기본적으로 파티션은 `{IGNITE_HOME}/work/partitions`에 저장됩니다. | 예 | 예 | 유효한 절대 경로입니다. |
| system.partitionsLogPath | | 파티션의 RAFT 로그를 저장하는 경로입니다. 기본적으로 이 로그는 `{system.partitionsBasePath}/log`에 저장됩니다. | 예 | 예 | 유효한 절대 경로입니다. |
| system.properties | | Ignite 컴포넌트가 사용하는 시스템 속성입니다. | 예 | 예 | 속성 배열입니다. |
