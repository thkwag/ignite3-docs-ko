---
id: system-views
title: 시스템 뷰
sidebar_label: 시스템 뷰
---

# 시스템 뷰

Ignite는 클러스터 상태 정보와 각 구성 요소의 상태를 실시간으로 파악할 수 있는 여러 내장 SQL 뷰를 제공합니다. 이러한 뷰는 SYSTEM 스키마에서 사용할 수 있습니다.

## 데이터 가져오기 {#getting-data}

Ignite에서 시스템 뷰에 접근할 때는 다른 테이블에서와 마찬가지로 SQL로 시스템 뷰에서 데이터를 조회합니다. 예를 들어 사용 가능한 모든 시스템 뷰 목록은 다음과 같이 가져올 수 있습니다.

```sql
SELECT id, schema, name FROM system.system_views WHERE type = 'NODE'
```

조인을 사용해 여러 뷰의 데이터를 결합할 수도 있습니다. 아래 예시는 `SYSTEM_VIEWS` 뷰에서 찾은 뷰의 모든 컬럼을 반환합니다.

```sql
SELECT svc.*
  FROM system.system_view_columns svc
  JOIN system.system_views sv ON svc.view_id = sv.id
 WHERE sv.name = 'SYSTEM_VIEWS'
```

## 사용 가능한 뷰 {#available-views}

### SYSTEM_VIEWS

사용 가능한 시스템 뷰를 설명합니다.

| 컬럼 | 데이터 타입 | 설명 |
|--------|-----------|-------------|
| ID | INT32 | 시스템 뷰 ID. |
| SCHEMA | STRING | 사용되는 스키마 이름. 기본값은 `SYSTEM`입니다. |
| NAME | STRING | 시스템 뷰 이름. |
| TYPE | STRING | 시스템 뷰 유형. 가능한 값:<br/>- NODE - 노드별 정보를 제공하는 뷰. 모든 노드에서 데이터를 수집해 뷰에 나타냅니다.<br/>- CLUSTER - 클러스터 전체 정보를 제공하는 뷰. 클러스터를 대표하도록 선택된 한 노드에서 데이터를 수집합니다. |

### SYSTEM_VIEW_COLUMNS

사용 가능한 시스템 뷰 컬럼을 설명합니다.

| 컬럼 | 데이터 타입 | 설명 |
|--------|-----------|-------------|
| VIEW_ID | INT32 | 시스템 뷰 ID. |
| NAME | STRING | 컬럼 이름. |
| TYPE | STRING | 컬럼 타입. [지원되는 타입](/sql/reference/data-types-and-functions/data-types) 중 하나일 수 있습니다. |
| NULLABLE | BOOLEAN | 컬럼이 비어 있을 수 있는지 정의합니다. |
| PRECISION | INT32 | 최대 자릿수. |
| SCALE | INT32 | 최대 소수 자릿수. |
| LENGTH | INT32 | 값의 최대 길이. 문자열 값은 문자 수, 바이너리 값은 바이트 수입니다. |

### SYSTEM.ZONES

| 컬럼 | 데이터 타입 | 설명 |
|--------|-----------|-------------|
| NAME | STRING | 분산 영역(distribution zone)의 이름. |
| PARTITIONS | INT32 | 분산 영역의 파티션 수. |
| REPLICAS | STRING | 분산 영역에서 각 파티션의 복제본 수. |
| DATA_NODES_AUTO_ADJUST_SCALE_UP | INT32 | 새 노드가 합류한 시점과 분산 영역 조정이 시작되는 시점 사이의 지연 시간(초). |
| DATA_NODES_AUTO_ADJUST_SCALE_DOWN | INT32 | 노드가 클러스터에서 이탈한 시점과 분산 영역 조정이 시작되는 시점 사이의 지연 시간(초). |
| DATA_NODES_FILTER | STRING | 분산 영역이 사용할 노드를 지정하는 필터. |
| IS_DEFAULT_ZONE | BOOLEAN | 이 분산 영역이 기본으로 사용되는지 정의합니다. |

### SQL_CACHED_QUERY_PLANS

| 컬럼 | 데이터 타입 | 설명 |
|--------|-----------|-------------|
| NODE_ID | STRING | 계획이 캐시된 노드의 ID. |
| PLAN_ID | STRING | 준비된 계획의 내부 식별자. |
| CATALOG_VERSION | INT32 | 쿼리를 준비할 때 사용된 카탈로그 버전. |
| QUERY_DEFAULT_SCHEMA | STRING | 쿼리 준비 중에 적용된 기본 스키마. |
| SQL | STRING | 쿼리의 정규화된 SQL 텍스트. |
| QUERY_TYPE | STRING | 쿼리 유형. |
| QUERY_PLAN | STRING | 선택된 쿼리 계획의 직렬화 표현 또는 EXPLAIN 표현. |
| QUERY_PREPARE_TIME | TIMESTAMP WITH LOCAL TIME ZONE | 노드에서 계획이 준비된 시각. |
