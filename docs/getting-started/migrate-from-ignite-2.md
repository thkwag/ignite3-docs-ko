---
title: Ignite 2에서 마이그레이션
---

이 섹션에서는 Apache Ignite 2 클러스터의 모든 구성 요소를 마이그레이션할 Apache Ignite 3 클러스터를 구성하는 방법을 설명합니다.

## 구성 마이그레이션 {#configuration-migration}

생성한 클러스터를 마이그레이션 대상인 Apache Ignite 2 클러스터와 일치하도록 구성해야 합니다.

Apache Ignite 2의 클러스터 구성은 XML 빈이지만 Apache Ignite 3에서는 HOCON 형식입니다. 또한 버전 3의 구성 구조 상당수가 버전 2와 다릅니다.

Apache Ignite 3에서 구성 파일에는 `ignite`라는 단일 루트 "노드"가 있습니다. 모든 구성 섹션은 이 노드의 자식, 손자 등에 해당합니다.

:::note
Apache Ignite 3에서는 JSON 또는 HOCON 형식으로 구성을 작성하고 유지할 수 있습니다.
:::

예시:

```json
{
    "ignite" : {
        "network" : {
            "nodeFinder" : {
                "netClusterNodes" : ["localhost:3344"]
            },
            "port" : 3344
        },
        "storage" : {
            "profiles" : [
                {
                    "name" : "persistent",
                    "engine" : "aipersist"
                }
            ]
        },
        "nodeAttributes.nodeAttributes" : {
            "region" : "US",
            "storage" : "SSD"
        }
    }
}
```

환경을 마이그레이션할 때 Apache Ignite 3 구성은 클러스터, 노드, 분산 영역(distribution zone) 구성으로 나뉩니다.

### 노드 구성 {#node-configuration}

노드 구성에는 로컬에서 실행 중인 노드에 대한 정보가 저장됩니다.

#### 스토리지 구성 {#storage-configuration}

Apache Ignite 3의 스토리지 구성 방식은 Apache Ignite 2와 완전히 다릅니다.

* 먼저 **스토리지 엔진(storage engine)** 속성을 구성합니다. 여기에는 페이지 크기나 체크포인트 빈도 같은 속성이 포함될 수 있습니다.
* 그다음 사용할 특정 스토리지를 정의하는 **스토리지 프로파일(storage profile)**을 생성합니다.
* 그다음 스토리지 프로파일을 사용해 **분산 영역**을 생성합니다. 분산 영역은 클러스터 전체에서 데이터를 어디에 어떻게 저장할지 정의해 스토리지를 세밀하게 조정하는 데 활용할 수 있습니다.
* 마지막으로 각 **테이블**을 분산 영역에 배정하거나 스토리지 프로파일에 직접 배정할 수 있습니다.

참고:

* 코드로 구성할 수 있는 것은 테이블과 분산 영역뿐입니다. 스토리지 프로파일과 엔진은 노드 구성을 업데이트하고 노드를 재시작해야 구성할 수 있습니다.
* 커스텀 어피니티 함수는 분산 영역으로 대체됩니다.
* 외부 스토리지는 SQL로 구성해야 하는 캐시 스토리지로 지원됩니다.

#### 클라이언트 구성 {#client-configuration}

Apache Ignite 3의 모든 클라이언트는 씬 클라이언트(thin client)이며 비슷한 `clientConnector` 구성을 사용합니다. 클라이언트 커넥터 구성에 대한 자세한 내용은 [Apache Ignite 클라이언트](/develop/ignite-clients/) 섹션을 참고하세요.

#### 네트워크 구성 {#network-configuration}

노드 네트워크 구성은 이제 [노드 구성](/configure-and-operate/reference/node-configuration)의 `network` 섹션에서 수행합니다.

#### REST API 구성 {#rest-api-configuration}

REST API는 Apache Ignite 3의 중요한 부분입니다. 클러스터·노드 구성, SQL 요청 실행 등 다양한 용도로 사용할 수 있습니다.

REST 속성은 [노드 구성](/configure-and-operate/reference/node-configuration)에서 구성할 수 있습니다.

### 클러스터 구성 {#cluster-configuration}

클러스터 구성은 클러스터의 모든 노드에 적용됩니다. 구성을 적용한 노드로부터 클러스터 전체에 자동으로 전파됩니다.

#### 이벤트 처리 {#handling-events}

Apache Ignite 3에서는 이벤트 구성이 단순화되었습니다. 다음 두 가지 구성으로 나뉩니다.

* 이벤트 **채널**은 수집 대상을 정의합니다.
* 이벤트 **싱크**는 데이터를 보낼 대상을 정의합니다.

현재 릴리스에서는 `log` 싱크만 지원합니다. 이벤트 구성 방법은 [이벤트](/develop/work-with-data/events) 섹션을 참고하세요.

#### 메트릭 수집 {#metrics-collection}

Apache Ignite 3는 기본적으로 메트릭이 비활성화되어 있습니다.

모든 메트릭은 메트릭 소스별로 그룹화되며, 클러스터 구성에서 메트릭 소스 단위로 활성화합니다.

그러면 Apache Ignite JMX 빈에서 이 메트릭을 확인할 수 있습니다.

메트릭 구성 방법은 [메트릭 구성](/configure-and-operate/configuration/metrics-configuration) 문서를 참고하세요.

## 코드 마이그레이션 {#code-migration}

Apache Ignite 2용으로 작성한 코드는 그대로 재사용할 수 없지만, 대부분의 개념이 비슷하게 유지되므로 코드 마이그레이션에 그리 오랜 시간이 걸리지 않습니다.

### 콜로케이션 컴퓨트와 파티션 로컬 쿼리 {#collocated-compute-and-partition-local-queries}

Apache Ignite 2에서는 작업 컨텍스트에 `setPartition`을 지정한 `ComputeTask`를 사용해 컴퓨트 작업을 특정 파티션에 고정할 수 있었습니다. Ignite 3는 같은 결과를 얻는 두 가지 방식을 제공하며, 두 방식 모두 파티션을 소유한 노드에서 작업을 실행한 뒤 `__PARTITION_ID` 가상 SQL 컬럼으로 해당 파티션의 행만 조회하는 원리를 사용합니다.

#### 옵션 1: 테이블 파티션에 브로드캐스트(권장) {#option-1-broadcast-to-table-partitions-recommended}

`BroadcastJobTarget.table()`을 `JobExecutionContext.partition()`과 함께 사용하세요. 이 방식이 권장되는 이유는 Ignite가 각 작업 인스턴스를 해당 파티션을 현재 보유한 노드로 라우팅하고, `context.partition()`이 항상 null이 아니어서 로컬 실행이 보장되기 때문입니다.

```java
JobDescriptor<Void, Long> job = JobDescriptor.builder(PartitionQueryJob.class)
        .units(deploymentUnit)
        .build();

Collection<Long> partitionCounts = client.compute()
        .execute(BroadcastJobTarget.table("Person"), job, null);

long total = partitionCounts.stream().mapToLong(Long::longValue).sum();
```

작업 내부에서 `context.partition()`을 읽어 이 인스턴스에 배정된 파티션을 가져온 뒤, `__PARTITION_ID`로 행을 필터링하세요.

```java
public class PartitionQueryJob implements ComputeJob<Void, Long> {
    @Override
    public CompletableFuture<Long> executeAsync(JobExecutionContext context, Void arg) {
        Partition partition = context.partition(); // non-null with BroadcastJobTarget.table()

        long count = 0;
        try (ResultSet<SqlRow> rs = context.ignite().sql().execute(
                null,
                "SELECT COUNT(*) FROM Person WHERE __PARTITION_ID = ?",
                partition.id()
        )) {
            if (rs.hasNext()) {
                count = rs.next().longValue(0);
            }
        }
        return CompletableFuture.completedFuture(count);
    }
}
```

실행 가능한 전체 버전은 examples 모듈의 `ComputeBroadcastExample`을 참고하세요.

#### 옵션 2: 파티션 분산 기반 맵리듀스 {#option-2-mapreduce-over-partition-distribution}

`MapReduceTask`의 분할 단계에서 `PartitionDistribution`을 사용해 파티션을 나열한 뒤, 파티션마다 하나의 작업을 해당 프라이머리 복제본 노드로 전달하세요.

```java
public class PersonCountByPartitionTask implements MapReduceTask<Void, Long, Long, Long> {
    @Override
    public CompletableFuture<List<MapReduceJob<Long, Long>>> splitAsync(
            TaskExecutionContext context, Void input) {
        JobDescriptor<Long, Long> jobDescriptor = JobDescriptor.builder(PartitionPersonCountJob.class)
                .build();

        Map<Partition, ClusterNode> primaryReplicas = context.ignite().tables()
                .table("Person")
                .partitionDistribution()
                .primaryReplicas();

        List<MapReduceJob<Long, Long>> jobs = new ArrayList<>();
        for (Map.Entry<Partition, ClusterNode> entry : primaryReplicas.entrySet()) {
            jobs.add(MapReduceJob.<Long, Long>builder()
                    .jobDescriptor(jobDescriptor)
                    .nodes(Set.of(entry.getValue()))
                    .args(entry.getKey().id())
                    .build());
        }
        return CompletableFuture.completedFuture(jobs);
    }

    @Override
    public CompletableFuture<Long> reduceAsync(TaskExecutionContext context, Map<UUID, Long> results) {
        return CompletableFuture.completedFuture(
                results.values().stream().mapToLong(Long::longValue).sum());
    }
}
```

각 작업은 파티션 ID를 인수로 받아 해당 파티션만 조회합니다.

```java
public class PartitionPersonCountJob implements ComputeJob<Long, Long> {
    @Override
    public CompletableFuture<Long> executeAsync(JobExecutionContext context, Long partitionId) {
        long count = 0;
        try (ResultSet<SqlRow> rs = context.ignite().sql().execute(
                null,
                "SELECT COUNT(*) FROM Person WHERE __PARTITION_ID = ?",
                partitionId
        )) {
            if (rs.hasNext()) {
                count = rs.next().longValue(0);
            }
        }
        return CompletableFuture.completedFuture(count);
    }
}
```

실행 가능한 전체 버전은 examples 모듈의 `ComputePartitionQueryMapReduceExample`을 참고하세요.

:::note
`PartitionDistribution.primaryReplicas()`는 특정 시점의 파티션 위치를 캡처합니다. 분할 단계와 작업 실행 사이에 파티션이 재배정되면 작업이 프라이머리가 아닌 노드에서 실행될 수 있고, 이 경우 SQL 쿼리는 로컬로 실행되지 않습니다. 로컬 실행을 반드시 보장해야 한다면 `BroadcastJobTarget.table()`(옵션 1)을 사용하세요.
:::

#### 로컬 쿼리 실행 방법 {#how-to-run-a-local-query}

두 방식 모두 `__PARTITION_ID` 가상 컬럼(타입 `BIGINT`)을 사용해 쿼리를 단일 파티션의 행으로 제한합니다. 이 방식으로 노드 간 데이터 이동 없이 Ignite 2의 콜로케이션 쿼리와 동등한 효과를 얻을 수 있습니다.

```sql
SELECT * FROM Person WHERE __PARTITION_ID = ?
```

쿼리 매개변수로 `partition.id()`가 반환하는 파티션 ID(옵션 1) 또는 작업 인수로 전달되는 `long` ID(옵션 2)를 전달하세요.
