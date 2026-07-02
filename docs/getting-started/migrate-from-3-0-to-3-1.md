---
title: Apache Ignite 3.0에서 3.1로 마이그레이션
sidebar_label: 3.0에서 3.1로 마이그레이션
---

## 개요 {#overview}

이 가이드는 Apache Ignite 클러스터를 버전 3.0에서 버전 3.1로 마이그레이션하는 단계별 방법을 설명합니다. 영역 기반 복제 도입을 비롯한 3.1의 아키텍처 변경 사항 때문에, 마이그레이션하려면 새 3.1 클러스터를 만들고 내보내기/가져오기 과정으로 데이터를 옮겨야 합니다.

:::warning
이 마이그레이션은 클러스터 다운타임이 필요합니다.
:::

## 영역 기반 복제 {#zone-based-replication}

Apache Ignite 3.1은 3.0의 테이블 기반 복제 모델을 대체하는 영역 기반 복제(zone-based replication)를 도입합니다. 테이블 기반 복제는 계속 지원되지만 이후 릴리스에서 제거될 예정입니다.

### 테이블 기반 복제와 영역 기반 복제 비교 {#table-based-vs-zone-based-replication}

| 항목 | 3.0 테이블 기반 | 3.1 영역 기반 |
|--------|-----------------|----------------|
| RAFT 그룹 | 테이블마다 별도의 RAFT 그룹 생성 | 같은 영역의 테이블이 RAFT 그룹을 공유 |
| 예시(테이블 100개) | 별도의 RAFT 그룹 집합 100개 | 공유 RAFT 그룹 집합 1개 |
| 메모리 사용량 | 테이블이 많을수록 증가 | 크게 감소 |
| 스레드 오버헤드 | 높음(RAFT 그룹이 더 많음) | 낮음(RAFT 그룹이 더 적음) |

### 영역 기반 복제의 이점 {#benefits-of-zone-based-replication}

- **메모리 사용량 감소:** RAFT 그룹 수가 줄어들면 테이블이 많은 클러스터의 메모리 사용량이 낮아집니다
- **스레드 오버헤드 감소:** RAFT 그룹 수가 줄면 스레드 관리 복잡도가 낮아집니다
- **성능 향상:** 다중 테이블 워크로드에서 리소스 활용도가 개선됩니다
- **투명한 마이그레이션:** 사용자에게 노출되는 API나 쿼리 동작에는 변경이 없습니다

:::note
영역 기반 복제는 클러스터 내부의 최적화입니다. 애플리케이션은 코드 변경 없이 계속 동작합니다.
:::

## 1단계: 현재 환경 문서화 {#phase-1-document-current-environment}

### 1.1단계: 3.0 클러스터에 연결 {#step-11-connect-to-30-cluster}

CLI 도구를 사용해 Apache Ignite 3.0 클러스터에 연결하세요.

```bash
cd ignite3-cli-3.0.0/bin
./ignite3
```

연결한 후 SQL 실행 모드로 들어가세요.

```bash
sql
```

### 1.2단계: 모든 스키마 문서화 {#step-12-document-all-schemas}

클러스터의 모든 스키마를 조회하세요.

```sql
-- List all schemas
SELECT * FROM SYSTEM.SCHEMAS;
```

나중에 스키마를 재생성할 때 참고할 수 있도록 출력 결과를 파일로 저장하세요.

### 1.3단계: 모든 테이블 문서화 {#step-13-document-all-tables}

모든 스키마에 걸쳐 모든 테이블을 조회하세요.

```sql
-- List all tables
SELECT SCHEMA_NAME, TABLE_NAME
FROM SYSTEM.TABLES
WHERE TABLE_TYPE = 'TABLE'
ORDER BY SCHEMA_NAME, TABLE_NAME;
```

나중에 테이블을 재생성할 때 참고할 수 있도록 출력 결과를 파일로 저장하세요.

### 1.4단계: 테이블 스키마 문서화 {#step-14-document-table-schemas}

테이블마다 전체 스키마 정의를 기록하세요.

```sql
-- Get detailed schema for each table
SELECT
  SCHEMA_NAME,
  TABLE_NAME,
  COLUMN_NAME,
  TYPE,
  NULLABLE,
  COLUMN_DEFAULT
FROM SYSTEM.TABLE_COLUMNS
WHERE SCHEMA_NAME = 'YOUR_SCHEMA'
ORDER BY TABLE_NAME, ORDINAL_POSITION;
```

나중에 스키마를 재생성할 때 참고할 수 있도록 출력 결과를 파일로 저장하세요.

:::warning
모든 테이블의 정확한 CREATE TABLE 문을 기록하세요. 3.1에서 스키마를 재생성할 때 필요합니다.
:::

### 1.5단계: 분산 영역 문서화 {#step-15-document-distribution-zones}

현재 분산 영역 구성을 기록하세요.

```sql
-- Document distribution zones
SELECT * FROM SYSTEM.ZONES;
```

나중에 스키마를 재생성할 때 참고할 수 있도록 출력 결과를 파일로 저장하세요.

### 1.6단계: 데이터 양 계산 {#step-16-calculate-data-volume}

마이그레이션할 데이터 크기를 추정하세요.

```sql
-- Get row count for each table
SELECT
  TABLE_NAME,
  COUNT(*) as ROW_COUNT
FROM your_table
GROUP BY TABLE_NAME;
```

테이블마다 행 수를 저장하세요. 마이그레이션 후 데이터 무결성을 검증할 때 사용합니다.

### 1.7단계: 스키마 재생성 스크립트 작성 {#step-17-create-schema-recreation-script}

모든 CREATE TABLE 문을 담은 `schema-recreation.sql`이라는 SQL 스크립트 파일을 만드세요.

```sql
-- Example for a table:
CREATE TABLE analytics.events (
  id INT PRIMARY KEY,
  event_time TIMESTAMP NOT NULL,
  user_id VARCHAR(100),
  event_type VARCHAR(50),
  payload VARCHAR(4000)
) WITH (
  -- Document any table options here
);

-- Repeat for all tables
```

나중에 스키마를 재생성할 때 참고할 수 있도록 출력 결과를 파일로 저장하세요.

:::caution
CREATE TABLE 문에 모든 제약 조건, 인덱스, 테이블 옵션이 포함됐는지 확인하세요. 구성이 누락되면 성능이나 데이터 무결성 문제가 발생할 수 있습니다.
:::

## 2단계: 3.0 클러스터에서 데이터 내보내기 {#phase-2-export-data-from-30-cluster}

### 2.1단계: 내보내기 디렉터리 생성 {#step-21-create-export-directory}

접근 가능한 스토리지에 내보내기 파일을 저장할 디렉터리를 만드세요.

```bash
mkdir -p /backup/ignite-3.0-export
chmod 755 /backup/ignite-3.0-export
```

:::note
공유 네트워크 스토리지를 사용한다면 모든 노드에 이 위치에 대한 쓰기 권한이 있는지 확인하세요.
:::

### 2.2단계: 내보내기 형식 선택 {#step-22-choose-export-format}

Apache Ignite는 두 가지 내보내기 형식을 지원합니다.

| 형식 | 장점 | 적합한 용도 |
|--------|------------|----------|
| **CSV** | 사람이 읽기 쉽고 디버그가 편하며 여러 도구와 호환됨 | 소규모~중간 규모 데이터셋, 문제 해결 |
| **Parquet** | 파일 크기가 작고 I/O가 더 빠르며 대규모 데이터셋에 효율적 | 대규모 데이터셋, 프로덕션 마이그레이션 |

### 2.3단계: 테이블 데이터 내보내기 {#step-23-export-table-data}

`COPY INTO` 명령어로 테이블마다 데이터를 내보냅니다.

#### CSV 내보내기 {#csv-export}

```sql
-- Export with headers for easier import
COPY FROM (SELECT * FROM analytics.events)
INTO '/backup/ignite-3.0-export/analytics_events.csv'
FORMAT CSV
WITH 'header'='true';
```

큰 테이블은 청크 단위로 나눠 내보내세요.

```sql
-- Export in chunks by partition
COPY FROM (SELECT * FROM analytics.events WHERE id BETWEEN 0 AND 1000000)
INTO '/backup/ignite-3.0-export/analytics_events_part1.csv'
FORMAT CSV
WITH 'header'='true';
```

#### Parquet 내보내기(권장) {#parquet-export-recommended}

```sql
COPY FROM analytics.events (id, event_time, user_id, event_type, payload)
INTO '/backup/ignite-3.0-export/analytics_events.parquet'
FORMAT PARQUET;
```

### 2.4단계: 스크립트로 내보내기 자동화 {#step-24-automate-exports-with-script}

모든 테이블을 자동으로 내보내는 셸 스크립트를 작성하세요.

```bash
#!/bin/bash
# export-all-tables.sh

BACKUP_DIR="/backup/ignite-3.0-export"

# Array of tables to export (schema.table format)
TABLES=(
  "analytics.events"
  "analytics.users"
  "sales.orders"
  "sales.products"
)

for table in "${TABLES[@]}"; do
  schema=$(echo $table | cut -d'.' -f1)
  tbl=$(echo $table | cut -d'.' -f2)

  echo "Exporting ${table}..."

  ignite sql "COPY FROM (SELECT * FROM ${table}) \
    INTO '${BACKUP_DIR}/${schema}_${tbl}.parquet' \
    FORMAT PARQUET"

  if [ $? -eq 0 ]; then
    echo "${table} exported successfully"

    # Get row count for verification
    ignite sql "SELECT COUNT(*) as row_count FROM ${table}" > "${BACKUP_DIR}/${schema}_${tbl}.count"
  else
    echo "Failed to export ${table}"
    exit 1
  fi
done

echo "Export complete. Files in ${BACKUP_DIR}"
```

스크립트에 실행 권한을 부여하고 실행하세요.

```bash
chmod +x export-all-tables.sh
./export-all-tables.sh
```

### 2.5단계: 내보내기 검증 {#step-25-verify-exports}

모든 내보내기 파일이 정상적으로 생성됐는지 확인하세요.

```bash
# List all export files
ls -lh /backup/ignite-3.0-export/

# Verify file sizes are reasonable (not 0 bytes)
find /backup/ignite-3.0-export/ -size 0
```

:::caution
모든 내보내기 파일을 검증하기 전까지 다음 단계로 넘어가지 마세요. 내보내기 파일이 누락되거나 손상되면 데이터가 유실됩니다.
:::

### 2.6단계: 3.0 클러스터 중지 {#step-26-stop-30-cluster}

모든 내보내기를 검증했다면 클러스터의 모든 노드를 정상적으로 종료하세요.

```bash
# Stop all nodes gracefully
ignite node stop --node node1
ignite node stop --node node2
...
```

:::warning
3.0 클러스터를 중지한 후에는 3.1 클러스터에서 마이그레이션을 완전히 검증할 때까지 어떤 데이터도 삭제하지 마세요.
:::

## 3단계: 3.1 클러스터 구성 {#phase-3-set-up-31-cluster}

### 3.1단계: Apache Ignite 3.1 다운로드 {#step-31-download-apache-ignite-31}

[공식 웹사이트](https://ignite.apache.org/download.cgi)에서 Apache Ignite 3.1 배포판을 다운로드하세요.

### 3.2단계: 클러스터 노드 구성 {#step-32-configure-cluster-nodes}

구성 파일을 3.0 형식에서 3.1 형식으로 업데이트하세요.

#### 3.1의 구성 변경 사항 {#configuration-changes-in-31}

| 변경 유형 | 3.0 형식 | 3.1 형식 |
|-------------|------------|------------|
| 타임아웃 속성 | `timeout=5000` | `timeoutMillis=5000` |
| 영역 생성 | `CREATE ZONE myZone WITH STORAGE_PROFILES='default', REPLICAS=3;` | `CREATE ZONE myZone (REPLICAS 3) STORAGE PROFILES['default'];` |

:::tip
구성 변경 사항 전체 목록은 Apache Ignite 3.1 문서를 참고하세요.
:::

### 3.3단계: 클러스터 노드 시작 {#step-33-start-cluster-nodes}

클러스터의 각 노드를 시작하세요.

```bash
# Start each node (repeat for all nodes)
./bin/ignite3 node start --config ignite-config.conf
```

:::note
기본적으로 노드는 `etc/ignite-config.conf`에서 구성을 불러옵니다. `--config` 매개변수로 다른 구성 파일을 지정할 수 있습니다.
:::

### 3.4단계: 클러스터 초기화 {#step-34-initialize-the-cluster}

모든 노드를 시작했다면 아무 노드에서나 클러스터를 초기화하세요.

```bash
ignite cluster init --name=ignite-cluster
```

### 3.5단계: 클러스터 토폴로지 확인 {#step-35-verify-cluster-topology}

모든 노드가 클러스터에 속해 있는지 확인하세요.

```bash
ignite cluster topology
```

예상 출력에는 모든 노드가 ACTIVE 상태로 표시됩니다.

```
[name=node1, address=192.168.1.10:10800, state=ACTIVE]
[name=node2, address=192.168.1.11:10800, state=ACTIVE]
...
```

### 3.6단계: 스키마 재생성 {#step-36-recreate-schemas}

클러스터에 연결해 모든 스키마를 재생성하세요.

```sql
-- Create schemas
CREATE SCHEMA analytics;
CREATE SCHEMA sales;
```

### 3.7단계: 분산 영역 재생성 {#step-37-recreate-distribution-zones}

사용자 지정 분산 영역이 있다면 재생성하세요.

```sql
-- Create distribution zones (if customized)
CREATE ZONE analytics_zone (REPLICAS 3) STORAGE PROFILES['default'];
```

### 3.8단계: 테이블 재생성 {#step-38-recreate-tables}

저장해 둔 스키마 재생성 스크립트를 실행하세요.

```sql
CREATE TABLE analytics.events (
  id INT PRIMARY KEY,
  event_time TIMESTAMP NOT NULL,
  user_id VARCHAR(100),
  event_type VARCHAR(50),
  payload VARCHAR(4000)
);

-- Repeat for all tables
```

각 테이블이 올바르게 생성됐는지 확인하세요.

```sql
-- Verify table creation
SELECT * FROM SYSTEM.TABLES WHERE TABLE_NAME = 'EVENTS';
```

:::warning
3.1의 테이블 스키마가 3.0의 스키마와 정확히 일치하는지 확인하세요. 일치하지 않으면 가져오기가 실패합니다.
:::

## 4단계: 3.1 클러스터로 데이터 가져오기 {#phase-4-import-data-into-31-cluster}

### 4.1단계: 개별 테이블 가져오기 {#step-41-import-individual-tables}

`COPY FROM` 명령어로 테이블마다 데이터를 가져옵니다.

#### CSV 가져오기 {#csv-import}

```sql
COPY FROM '/backup/ignite-3.0-export/analytics_events.csv'
INTO analytics.events (id, event_time, user_id, event_type, payload)
FORMAT CSV
WITH 'header'='true', 'batchSize'='2048';
```

#### Parquet 가져오기(권장) {#parquet-import-recommended}

```sql
COPY FROM '/backup/ignite-3.0-export/analytics_events.parquet'
INTO analytics.events (id, event_time, user_id, event_type, payload)
FORMAT PARQUET
WITH 'batchSize'='2048';
```

### 4.2단계: 스크립트로 가져오기 자동화 {#step-42-automate-imports-with-script}

모든 테이블을 가져오는 셸 스크립트를 작성하세요.

```bash
#!/bin/bash
# import-all-tables.sh

BACKUP_DIR="/backup/ignite-3.0-export"

# Array of tables to import
TABLES=(
  "analytics.events:id,event_time,user_id,event_type,payload"
  "analytics.users:user_id,username,email,created_at"
  "sales.orders:order_id,customer_id,order_date,total"
  "sales.products:product_id,name,price,stock"
)

for entry in "${TABLES[@]}"; do
  table=$(echo $entry | cut -d':' -f1)
  columns=$(echo $entry | cut -d':' -f2)
  schema=$(echo $table | cut -d'.' -f1)
  tbl=$(echo $table | cut -d'.' -f2)

  echo "Importing ${table}..."

  ignite sql "COPY FROM '${BACKUP_DIR}/${schema}_${tbl}.parquet' \
    INTO ${table} (${columns}) \
    FORMAT PARQUET \
    WITH 'batchSize'='2048'"

  if [ $? -eq 0 ]; then
    echo "${table} imported successfully"

    # Verify row count
    actual_count=$(ignite sql "SELECT COUNT(*) FROM ${table}" | grep -oE '[0-9]+')
    expected_count=$(cat "${BACKUP_DIR}/${schema}_${tbl}.count" | grep -oE '[0-9]+')

    if [ "$actual_count" == "$expected_count" ]; then
      echo "Row count verified: ${actual_count}"
    else
      echo "Row count mismatch: expected ${expected_count}, got ${actual_count}"
      exit 1
    fi
  else
    echo "Failed to import ${table}"
    exit 1
  fi
done

echo "Import complete."
```

스크립트에 실행 권한을 부여하고 실행하세요.

```bash
chmod +x import-all-tables.sh
./import-all-tables.sh
```

### 4.3단계: 데이터 무결성 검증 {#step-43-verify-data-integrity}

가져오기가 끝나면 철저히 검증하세요.

#### 행 수 검증 {#row-count-verification}

```sql
-- Compare row counts
SELECT COUNT(*) FROM analytics.events;
```

3.0 클러스터에서 저장해 둔 행 수와 비교하세요.

#### 데이터 샘플링 {#data-sampling}

```sql
-- Spot check data
SELECT * FROM analytics.events LIMIT 10;

-- Verify no NULL values in NOT NULL columns
SELECT COUNT(*) FROM analytics.events
WHERE event_time IS NULL;

-- Check date ranges are preserved
SELECT MIN(event_time), MAX(event_time)
FROM analytics.events;
```

#### 검증 스크립트 작성 {#create-verification-script}

모든 테이블의 검증을 자동화하세요.

```bash
#!/bin/bash
# verify-migration.sh

echo "=== Migration Verification Report ==="
echo

TABLES=(
  "analytics.events"
  "analytics.users"
  "sales.orders"
  "sales.products"
)

BACKUP_DIR="/backup/ignite-3.0-export"

for table in "${TABLES[@]}"; do
  schema=$(echo $table | cut -d'.' -f1)
  tbl=$(echo $table | cut -d'.' -f2)

  echo "Table: ${table}"

  # Get current count
  current=$(ignite sql "SELECT COUNT(*) FROM ${table}" | grep -oE '[0-9]+')
  echo "  Current row count: ${current}"

  # Get expected count
  expected=$(cat "${BACKUP_DIR}/${schema}_${tbl}.count" | grep -oE '[0-9]+')
  echo "  Expected row count: ${expected}"

  if [ "$current" == "$expected" ]; then
    echo "  Status: PASS"
  else
    echo "  Status: FAIL"
  fi
  echo
done
```

:::caution
모든 검증 항목이 통과할 때까지 애플리케이션 전환을 진행하지 마세요.
:::

## 5단계: 클라이언트 애플리케이션 업데이트 {#phase-5-update-client-applications}

### 5.1단계: 연결 구성 업데이트 {#step-51-update-connection-configuration}

애플리케이션 구성이 3.1 클러스터를 가리키도록 업데이트하세요.

```properties
# Old 3.0 connection
ignite.endpoints=old-node1:10800,old-node2:10800,old-node3:10800

# New 3.1 connection
ignite.endpoints=new-node1:10800,new-node2:10800,new-node3:10800
```

### 5.2단계: API 변경 사항 검토 {#step-52-review-api-changes}

클라이언트 코드에서 지원 중단된 API가 있는지 확인하세요.

#### Java API 변경 사항 {#java-api-changes}

```java
// Deprecated in 3.1
ignite.clusterNodes()

// Replace with
ignite.cluster().nodes()
```

:::tip
API 변경 사항 전체 목록은 Apache Ignite 3.1 릴리스 노트를 참고하세요: https://ignite.apache.org/releases/release_notes.html
:::

### 5.3단계: 클라이언트 연결 테스트 {#step-53-test-client-connectivity}

프로덕션 트래픽을 전환하기 전에 연결을 테스트하세요.

```java
// Connection test
try (IgniteClient client = IgniteClient.builder()
    .addresses("new-node1:10800", "new-node2:10800", "new-node3:10800")
    .build()) {

    // Verify connectivity
    Collection<ClusterNode> nodes = client.cluster().nodes();
    System.out.println("Connected to " + nodes.size() + " nodes");

    // Test data access
    Table table = client.tables().table("analytics.events");
    RecordView<Tuple> view = table.recordView();

    Tuple record = view.get(null, Tuple.create().set("id", 1));
    System.out.println("Sample record retrieved: " + record);
}
```

연결이 확인되면 트래픽을 점진적으로 전환하세요.

## 6단계: 마이그레이션 후 검증 {#phase-6-post-migration-verification}

### 6.1단계: 영역 기반 복제 확인 {#step-61-verify-zone-based-replication}

클러스터 시작 로그를 확인해 영역 기반 복제가 활성화됐는지 확인하세요.

```bash
# Check node logs for confirmation
grep "Zone based replication" /path/to/node/logs/*.log
```

예상 출력:

```
Zone based replication: true
```

영역이 올바르게 구성됐는지 확인하세요.

```sql
SELECT * FROM SYSTEM.ZONES;
```
