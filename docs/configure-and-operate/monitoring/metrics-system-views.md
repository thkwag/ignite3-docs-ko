---
id: metrics-system-views
title: 시스템 뷰
sidebar_label: 시스템 뷰
---

Ignite는 클러스터 상태 정보와 각 구성 요소의 상태를 실시간으로 파악할 수 있는 여러 내장 SQL 뷰를 제공합니다. 이러한 뷰는 SYSTEM 스키마에서 사용할 수 있습니다.

## 데이터 가져오기 {#getting-data}

Ignite에서 시스템 뷰에 접근할 때는 다른 테이블에서와 마찬가지로 SQL로 시스템 뷰에서 데이터를 조회합니다. 예를 들어 사용 가능한 모든 시스템 뷰 목록은 다음과 같이 가져올 수 있습니다.

```sql
SELECT * FROM system.system_views
```

조인을 사용해 여러 뷰의 데이터를 결합할 수도 있습니다. 아래 예시는 `SYSTEM_VIEWS` 뷰에서 찾은 뷰의 모든 컬럼을 반환합니다.

```sql
SELECT svc.*
  FROM system.system_view_columns svc
  JOIN system.system_views sv ON svc.view_id = sv.id
 WHERE sv.name = 'SYSTEM_VIEWS'
```

## 사용 가능한 뷰 {#available-views}

### COMPUTE_TASKS

| 컬럼 | 데이터 타입 | 설명 |
|---|---|---|
| COORDINATOR_NODE_ID | STRING | 태스크의 코디네이터 노드 ID. |
| COMPUTE_TASK_ID | STRING | 컴퓨트 태스크 ID. |
| COMPUTE_TASK_STATUS | STRING | 태스크 상태. |
| COMPUTE_TASK_CREATE_TIME | TIMESTAMP WITH LOCAL TIME ZONE | 태스크 생성 타임스탬프. |
| COMPUTE_TASK_START_TIME | TIMESTAMP WITH LOCAL TIME ZONE | 태스크 시작 타임스탬프. |
| COMPUTE_TASK_FINISH_TIME | TIMESTAMP WITH LOCAL TIME ZONE | 태스크 종료 타임스탬프. |
| ID | STRING | *지원 중단*. 컴퓨트 태스크 ID. |
| STATUS | STRING | *지원 중단*. 태스크 상태. |
| CREATE_TIME | TIMESTAMP WITH LOCAL TIME ZONE | *지원 중단*. 태스크 생성 타임스탬프. |
| START_TIME | TIMESTAMP WITH LOCAL TIME ZONE | *지원 중단*. 태스크 시작 타임스탬프. |
| FINISH_TIME | TIMESTAMP WITH LOCAL TIME ZONE | *지원 중단*. 태스크 종료 타임스탬프. |

### GLOBAL_PARTITION_STATES

| 컬럼 | 데이터 타입 | 설명 |
|---|---|---|
| ZONE_NAME | STRING | 파티션이 속한 분산 영역(distribution zone)의 이름. |
| TABLE_ID | INT32 | 파티션에 저장된 테이블의 ID. |
| SCHEMA_NAME | STRING | 테이블이 속한 스키마의 이름. |
| TABLE_NAME | STRING | 파티션에 저장된 테이블의 이름. |
| PARTITION_ID | INT32 | 파티션의 고유 식별자. |
| PARTITION_STATE | STRING | 파티션 상태. 가능한 값: `AVAILABLE`, `DEGRADED`, `READ_ONLY`, `UNAVAILABLE`. 자세한 내용은 [재해 복구](/configure-and-operate/operations/disaster-recovery-partitions) 문서를 참고하세요. |
| ZONE_ID | INT32 | 영역의 고유 식별자. |
| SCHEMA_ID | INT32 | 스키마의 고유 식별자. |
| STATE | STRING | *지원 중단*. 파티션 상태. 가능한 값: `AVAILABLE`, `DEGRADED`, `READ_ONLY`, `UNAVAILABLE`. |

### GLOBAL_ZONE_PARTITION_STATES

| 컬럼 | 데이터 타입 | 설명 |
|---|---|---|
| ZONE_NAME | STRING | 영역의 이름. |
| ZONE_ID | INT32 | 영역의 내부 식별자. |
| PARTITION_ID | INT32 | 파티션의 식별자. |
| PARTITION_STATE | STRING | 파티션의 현재 상태. 가능한 값: `AVAILABLE`(모든 복제본이 정상), `DEGRADED`(정상 복제본이 있고 과반수를 이룸), `READ_ONLY`(정상 복제본이 있지만 과반수를 이루지 못함), `UNAVAILABLE`(정상 복제본이 없음). |

### INDEXES

| 컬럼 | 데이터 타입 | 설명 |
|---|---|---|
| INDEX_ID | INT32 | 인덱스의 고유 식별자. |
| INDEX_NAME | STRING | 인덱스의 이름. |
| TABLE_ID | INT32 | 테이블의 고유 식별자. |
| TABLE_NAME | STRING | 테이블의 이름. |
| SCHEMA_ID | INT32 | 스키마의 고유 식별자. |
| SCHEMA_NAME | STRING | 스키마의 이름. |
| INDEX_TYPE | STRING | 인덱스의 유형. 가능한 값: `HASH`, `SORTED`. |
| IS_UNIQUE_INDEX | BOOLEAN | 인덱스가 고유한지 여부. |
| INDEX_COLUMNS | STRING | 인덱싱된 컬럼 목록. |
| INDEX_STATE | STRING | 인덱스의 현재 상태. 가능한 값: `REGISTERED`(인덱스가 등록되어 빌드 시작을 기다리는 중), `BUILDING`(인덱스를 빌드하는 중), `AVAILABLE`(인덱스 빌드가 끝나 사용할 준비가 됨), `STOPPING`(DROP INDEX 명령이 실행되어 인덱스가 실행 중인 트랜잭션이 끝나기를 기다리는 중). |
| TYPE | STRING | *지원 중단*. 인덱스의 유형. 가능한 값: `HASH`, `SORTED`. |
| IS_UNIQUE | BOOLEAN | *지원 중단*. 인덱스가 고유한지 여부. |
| COLUMNS | STRING | *지원 중단*. 인덱싱된 컬럼 목록. |
| STATUS | STRING | *지원 중단*. 인덱스의 현재 상태. |

### INDEX_COLUMNS

| 컬럼 | 데이터 타입 | 설명 |
|---|---|---|
| SCHEMA_ID | INT32 | 스키마의 고유 식별자. |
| SCHEMA_NAME | STRING | 스키마의 이름. |
| TABLE_ID | INT32 | 테이블의 고유 식별자. |
| TABLE_NAME | STRING | 테이블의 이름. |
| INDEX_ID | INT32 | 인덱스의 고유 식별자. |
| INDEX_NAME | STRING | 인덱스의 이름. |
| COLUMN_NAME | STRING | 컬럼 이름. |
| COLUMN_ORDINAL | INT32 | 인덱스 정의에서 컬럼의 순번. |
| COLUMN_COLLATION | STRING | 컬럼의 콜레이션 규칙. |

### LOCAL_ZONE_PARTITION_STATES

| 컬럼 | 데이터 타입 | 설명 |
|---|---|---|
| NODE_NAME | STRING | 파티션 상태를 보고하는 노드의 이름. |
| ZONE_NAME | STRING | 영역의 이름. |
| ZONE_ID | INT32 | 영역의 내부 식별자. |
| ESTIMATED_ROWS | INT64 | 로컬 노드의 이 파티션에 저장된 대략적인 행 수. |
| PARTITION_ID | INT32 | 파티션의 식별자. |
| PARTITION_STATE | STRING | 로컬 파티션의 현재 상태. 가능한 값: `UNAVAILABLE`(파티션이 아직 시작되지 않았거나 중지되는 중), `HEALTHY`(상태 머신이 정상인, 살아 있는 파티션), `INITIALIZING`(파티션이 지금 시작되는 중), `INSTALLING_SNAPSHOT`(파티션이 리더로부터 RAFT 스냅샷을 설치하는 중), `CATCHING_UP`(파티션이 따라잡는 중이며, 아직 로그의 일부가 복제되지 않았음을 뜻함), `BROKEN`(파티션이 손상된 상태이며, 대개 상태 머신에서 예외가 발생했음을 뜻함). |

### LOCKS

현재 활성 상태인 락을 나열하는 노드 시스템 뷰입니다.

| 컬럼 | 데이터 타입 | 설명 |
|---|---|---|
| OWNING_NODE_ID | STRING | 락을 소유한 노드의 ID. |
| TRANSACTION_ID | STRING | 락을 생성한 트랜잭션의 ID. |
| OBJECT_ID | STRING | 락이 걸린 객체의 ID. |
| LOCK_MODE | STRING | [락 모드](https://cwiki.apache.org/confluence/pages/viewpage.action?pageId=211885498#IEP91:Transactionprotocol-Lockingmodel). 가능한 값: IS(의도 공유 락), S(공유 락), IX(의도 배타 락), SIX(공유 의도 배타 락), X(배타 락). |
| TX_ID | STRING | *지원 중단*. 락을 생성한 트랜잭션의 ID. |
| MODE | STRING | *지원 중단*. 락 모드. |

### LOCAL_PARTITION_STATES

| 컬럼 | 데이터 타입 | 설명 |
|---|---|---|
| NODE_NAME | STRING | 파티션이 저장된 노드의 이름. |
| ZONE_NAME | STRING | 파티션이 속한 분산 영역의 이름. |
| TABLE_ID | INT32 | 파티션에 저장된 테이블의 ID. |
| SCHEMA_NAME | STRING | 테이블이 속한 스키마의 이름. |
| TABLE_NAME | STRING | 파티션에 저장된 테이블의 이름. |
| PARTITION_ID | INT32 | 파티션의 고유 식별자. |
| PARTITION_STATE | STRING | 파티션 상태. 가능한 값: `HEALTHY`, `INITIALIZING`, `INSTALLING_SNAPSHOT`, `CATCHING_UP`, `UNAVAILABLE`, `BROKEN`. 자세한 내용은 [재해 복구](/configure-and-operate/operations/disaster-recovery-partitions#local-partition-states) 문서를 참고하세요. |
| ESTIMATED_ROWS | INT64 | 파티션의 추정 행 수. |
| ZONE_ID | INT32 | 영역의 고유 식별자. |
| SCHEMA_ID | INT32 | 스키마의 고유 식별자. |
| STATE | STRING | *지원 중단*. 파티션 상태. |

### SCHEMAS

| 컬럼 | 데이터 타입 | 설명 |
|---|---|---|
| SCHEMA_ID | INT32 | 스키마의 고유 식별자. |
| SCHEMA_NAME | STRING | 스키마의 이름. |

### SQL_QUERIES

| 컬럼 | 데이터 타입 | 설명 |
|---|---|---|
| INITIATOR_NODE | STRING | 쿼리를 시작한 노드의 이름. |
| QUERY_ID | STRING | 쿼리 ID. |
| USERNAME | STRING | 쿼리를 시작한 사용자의 이름. |
| QUERY_PHASE | STRING | 쿼리 단계: INITIALIZATION(쿼리 등록과 파싱), OPTIMIZATION(쿼리 검증과 계획 최적화), EXECUTION(쿼리 계획 실행). |
| QUERY_TYPE | STRING | 쿼리 유형: DDL, DML, QUERY, SCRIPT 중 하나. |
| QUERY_DEFAULT_SCHEMA | STRING | 쿼리 실행에 사용된 기본 스키마의 이름. |
| SQL | STRING | SQL 쿼리의 표현식. |
| QUERY_START_TIME | TIMESTAMP | 쿼리가 시작된 날짜와 시각. |
| TRANSACTION_ID | STRING | 쿼리가 실행된 트랜잭션의 ID. |
| PARENT_QUERY_ID | STRING | 쿼리를 시작한 스크립트의 ID(쿼리가 스크립트로 시작되지 않았다면 NULL). |
| QUERY_STATEMENT_ORDINAL | INT32 | 쿼리의 순번. |
| ID | STRING | *지원 중단*. 쿼리 ID. |
| PHASE | STRING | *지원 중단*. 쿼리 단계. |
| TYPE | STRING | *지원 중단*. 쿼리 유형. |
| SCHEMA | STRING | *지원 중단*. 쿼리 실행에 사용된 기본 스키마의 이름. |
| START_TIME | TIMESTAMP | *지원 중단*. 쿼리가 시작된 날짜와 시각. |
| PARENT_ID | STRING | *지원 중단*. 쿼리를 시작한 스크립트의 ID. |
| STATEMENT_NUM | INT32 | *지원 중단*. 쿼리의 순번. |

### SQL_CACHED_QUERY_PLANS

| 컬럼 | 데이터 타입 | 설명 |
|---|---|---|
| NODE_ID | STRING | 계획이 캐시된 노드의 ID. |
| PLAN_ID | STRING | 준비된 계획의 내부 식별자. |
| CATALOG_VERSION | INT32 | 쿼리를 준비할 때 사용된 카탈로그 버전. |
| QUERY_DEFAULT_SCHEMA | STRING | 쿼리 준비 중에 적용된 기본 스키마. |
| SQL | STRING | 쿼리의 정규화된 SQL 텍스트. |
| QUERY_TYPE | STRING | 쿼리 유형. |
| QUERY_PLAN | STRING | 선택된 쿼리 계획의 직렬화 표현 또는 EXPLAIN 표현. |
| QUERY_PREPARE_TIME | TIMESTAMP WITH LOCAL TIME ZONE | 노드에서 계획이 준비된 시각. |

### SYSTEM_VIEWS

사용 가능한 시스템 뷰를 설명합니다.

| 컬럼 | 데이터 타입 | 설명 |
|---|---|---|
| VIEW_ID | INT32 | 시스템 뷰 ID. |
| SCHEMA_NAME | STRING | 사용되는 스키마 이름. 기본값은 `SYSTEM`입니다. |
| VIEW_NAME | STRING | 시스템 뷰 이름. |
| VIEW_TYPE | STRING | 시스템 뷰 유형. 가능한 값: NODE(노드별 정보를 제공하는 뷰. 모든 노드에서 데이터를 수집해 뷰에 나타냅니다), CLUSTER(클러스터 전체 정보를 제공하는 뷰. 클러스터를 대표하도록 선택된 한 노드에서 데이터를 수집합니다). |
| ID | INT32 | *지원 중단*. 시스템 뷰 ID. |
| SCHEMA | STRING | *지원 중단*. 사용되는 스키마 이름. 기본값은 `SYSTEM`입니다. |
| NAME | STRING | *지원 중단*. 시스템 뷰 이름. |
| TYPE | STRING | *지원 중단*. 시스템 뷰 유형. |

### SYSTEM_VIEW_COLUMNS

사용 가능한 시스템 뷰 컬럼을 설명합니다.

| 컬럼 | 데이터 타입 | 설명 |
|---|---|---|
| VIEW_ID | INT32 | 시스템 뷰 ID. |
| VIEW_NAME | STRING | 컬럼 이름. |
| COLUMN_TYPE | STRING | 컬럼 타입. [지원되는 타입](/sql/reference/data-types-and-functions/data-types) 중 하나일 수 있습니다. |
| IS_NULLABLE_COLUMN | BOOLEAN | 컬럼이 비어 있을 수 있는지 정의합니다. |
| COLUMN_PRECISION | INT32 | 최대 자릿수. |
| COLUMN_SCALE | INT32 | 최대 소수 자릿수. |
| COLUMN_LENGTH | INT32 | 값의 최대 길이. 문자열 값은 문자 수, 바이너리 값은 바이트 수입니다. |
| NAME | STRING | *지원 중단*. 컬럼 이름. |
| TYPE | STRING | *지원 중단*. 컬럼 타입. |
| NULLABLE | BOOLEAN | *지원 중단*. 컬럼이 비어 있을 수 있는지 정의합니다. |
| PRECISION | INT32 | *지원 중단*. 최대 자릿수. |
| SCALE | INT32 | *지원 중단*. 최대 소수 자릿수. |
| LENGTH | INT32 | *지원 중단*. 값의 최대 길이. |

### TABLES

| 컬럼 | 데이터 타입 | 설명 |
|---|---|---|
| SCHEMA_NAME | STRING | 테이블이 사용하는 스키마. |
| TABLE_NAME | STRING | 테이블 이름. |
| TABLE_ID | INT32 | 테이블의 고유 식별자. |
| TABLE_PK_INDEX_ID | INT32 | 기본 키 인덱스의 식별자. |
| ZONE_NAME | STRING | 테이블이 속한 분산 영역. |
| STORAGE_PROFILE | STRING | 테이블이 사용하는 스토리지 프로파일. |
| TABLE_COLOCATION_COLUMNS | STRING | 데이터를 함께 배치하는 데 사용되는 컬럼의 이름. |
| SCHEMA_ID | STRING | 테이블이 사용하는 스키마의 식별자. |
| ZONE_ID | STRING | 테이블이 속한 영역의 식별자. |
| IS_CACHE | BOOLEAN | 캐시인지 정의합니다. |
| SCHEMA | STRING | *지원 중단*. 테이블이 사용하는 스키마. |
| NAME | STRING | *지원 중단*. 테이블 이름. |
| ID | INT32 | *지원 중단*. 테이블의 고유 식별자. |
| PK_INDEX_ID | INT32 | *지원 중단*. 기본 키 인덱스의 식별자. |
| COLOCATION_KEY_INDEX | STRING | *지원 중단*. 데이터를 함께 배치하는 데 사용되는 컬럼의 이름. |
| ZONE | STRING | *지원 중단*. 테이블이 속한 분산 영역. |

### TABLE_COLUMNS

| 컬럼 | 데이터 타입 | 설명 |
|---|---|---|
| SCHEMA_NAME | STRING | 테이블이 사용하는 스키마. |
| TABLE_NAME | STRING | 테이블 이름. |
| TABLE_ID | INT32 | 테이블의 고유 식별자. |
| COLUMN_NAME | STRING | 컬럼 이름. |
| COLUMN_TYPE | STRING | 컬럼 데이터 타입. |
| IS_NULLABLE_COLUMN | BOOLEAN | 컬럼이 `NULL`일 수 있는지 여부. |
| COLUMN_PRECISION | INT32 | 값의 정밀도. 데이터 타입에 해당하지 않으면 0. |
| COLUMN_SCALE | INT32 | 값의 스케일. 데이터 타입에 해당하지 않으면 0. |
| COLUMN_LENGTH | INT32 | 값의 길이(바이트 단위). |
| COLUMN_ORDINAL | INT32 | 컬럼의 순번. |
| SCHEMA_ID | INT32 | 시퀀스가 사용하는 스키마의 ID. |
| PK_COLUMN_ORDINAL | INT32 | 기본 키에서 컬럼의 0부터 시작하는 위치. 컬럼이 기본 키에 속하지 않으면 `NULL`. |
| COLOCATION_COLUMN_ORDINAL | INT32 | 콜로케이션 키에서 컬럼의 0부터 시작하는 위치. 컬럼이 기본 키에 속하지 않으면 `NULL`. |
| SCHEMA | STRING | *지원 중단*. 테이블이 사용하는 스키마. |
| TYPE | STRING | *지원 중단*. 컬럼 데이터 타입. |
| NULLABLE | BOOLEAN | *지원 중단*. 컬럼이 `NULL`일 수 있는지 여부. |
| PREC | INT32 | *지원 중단*. 값의 정밀도. |
| SCALE | INT32 | *지원 중단*. 값의 스케일. |
| LENGTH | INT32 | *지원 중단*. 값의 길이(바이트 단위). |

### TRANSACTIONS

:::note
이 뷰는 현재 활성 상태인 트랜잭션만 보여줍니다.
:::

| 컬럼 | 데이터 타입 | 설명 |
|---|---|---|
| COORDINATOR_NODE_ID | STRING | 트랜잭션의 코디네이터 노드 이름. |
| TRANSACTION_STATE | STRING | 트랜잭션 상태. 읽기 전용 트랜잭션의 경우 값이 항상 null(비어 있음)입니다. 읽기-쓰기 트랜잭션의 경우 가능한 값은 PENDING(트랜잭션 진행 중)과 FINISHING(트랜잭션 종료 처리 중)입니다. |
| TRANSACTION_ID | STRING | 트랜잭션 ID. |
| TRANSACTION_START_TIME | TIMESTAMP | 트랜잭션의 시작 시각. |
| TRANSACTION_TYPE | STRING | 트랜잭션 유형: READ_ONLY 또는 READ_WRITE. |
| TRANSACTION_PRIORITY | STRING | 트랜잭션 간 충돌을 해소하는 데 사용되는 트랜잭션 우선순위. 현재 이 값은 사용자가 직접 설정할 수 없습니다. 가능한 값은 LOW와 NORMAL(기본값)입니다. |
| STATE | STRING | *지원 중단*. 트랜잭션 상태. |
| ID | STRING | *지원 중단*. 트랜잭션 ID. |
| START_TIME | TIMESTAMP | *지원 중단*. 트랜잭션의 시작 시각. |
| TYPE | STRING | *지원 중단*. 트랜잭션 유형. |
| PRIORITY | STRING | *지원 중단*. 트랜잭션 우선순위. |

### ZONES

| 컬럼 | 데이터 타입 | 설명 |
|---|---|---|
| ZONE_NAME | STRING | 분산 영역의 이름. |
| ZONE_PARTITIONS | INT32 | 분산 영역의 파티션 수. |
| ZONE_REPLICAS | STRING | 분산 영역에서 각 파티션의 복제본 수. |
| DATA_NODES_AUTO_ADJUST_SCALE_UP | INT32 | 새 노드가 합류한 시점과 분산 영역 조정이 시작되는 시점 사이의 지연 시간(초). |
| DATA_NODES_AUTO_ADJUST_SCALE_DOWN | INT32 | 노드가 클러스터에서 이탈한 시점과 분산 영역 조정이 시작되는 시점 사이의 지연 시간(초). |
| DATA_NODES_FILTER | STRING | 분산 영역이 사용할 노드를 지정하는 필터. |
| IS_DEFAULT_ZONE | BOOLEAN | 이 분산 영역이 기본으로 사용되는지 정의합니다. |
| ZONE_CONSISTENCY_MODE | STRING | 영역의 일관성 모드. 가능한 값: `STRONG_CONSISTENCY`, `HIGH_AVAILABILITY`. |
| ZONE_ID | INT32 | 영역의 고유 식별자. |
| NAME | STRING | *지원 중단*. 분산 영역의 이름. |
| PARTITIONS | INT32 | *지원 중단*. 분산 영역의 파티션 수. |
| REPLICAS | STRING | *지원 중단*. 분산 영역에서 각 파티션의 복제본 수. |
| CONSISTENCY_MODE | STRING | *지원 중단*. 영역의 일관성 모드. |

### ZONE_STORAGE_PROFILES

| 컬럼 | 데이터 타입 | 설명 |
|---|---|---|
| ZONE_NAME | STRING | 분산 영역의 이름. |
| STORAGE_PROFILE | STRING | 분산 영역이 사용하는 스토리지 프로파일의 이름. |
| IS_DEFAULT_PROFILE | BOOLEAN | 이 스토리지 프로파일이 기본으로 사용되는지 정의합니다. |
| ZONE_ID | INT32 | 영역의 고유 식별자. |
