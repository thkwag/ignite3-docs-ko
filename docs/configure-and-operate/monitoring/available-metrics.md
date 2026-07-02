---
id: available-metrics
title: 사용 가능한 메트릭
sidebar_label: 사용 가능한 메트릭
---

이 문서는 Ignite 3에서 사용할 수 있는 모든 메트릭을 나열합니다.

## client.handler

클라이언트 핸들러가 제공하는, 활성 클라이언트와 관련된 메트릭입니다.

| Metric name | Description |
|---|---|
| BytesReceived | 수신한 총 바이트 수입니다. |
| BytesSent | 전송한 총 바이트 수입니다. |
| ConnectionsInitiated | 시작한 총 연결 수입니다. |
| CursorsActive | 활성 커서 수입니다. |
| RequestsActive | 진행 중인 요청 수입니다. |
| RequestsProcessed | 처리한 총 요청 수입니다. |
| RequestsFailed | 실패한 총 요청 수입니다. |
| SessionsAccepted | 수락한 총 세션 수입니다. |
| SessionsActive | 현재 활성 세션 수입니다. |
| SessionsRejected | 핸드셰이크 오류로 거부된 총 세션 수입니다. |
| SessionsRejectedTls | TLS 핸드셰이크 오류로 거부된 총 세션 수입니다. |
| SessionsRejectedTimeout | 타임아웃으로 거부된 총 세션 수입니다. |
| TransactionsActive | 활성 트랜잭션 수입니다. |

## clock.service

| Metric name | Description |
|---|---|
| ClockSkewExceedingMaxClockSkew | 설정된 최대 클록 스큐(clock skew)를 초과해 관측된 클록 스큐입니다. |

## jvm

Ignite의 Java 가상 머신(JVM) 리소스 사용에 관한 메트릭입니다.

| Metric name | Description |
|---|---|
| UpTime | Java 가상 머신의 가동 시간(밀리초)입니다. |
| gc.CollectionTime | 모든 컬렉터에 걸쳐 합산한, 가비지 컬렉션에 소요된 총 시간의 근사치(밀리초)입니다. |
| memory.heap.Committed | 커밋된 힙 메모리 양입니다. |
| memory.heap.Init | 초기 힙 메모리 양입니다. |
| memory.heap.Max | 최대 힙 메모리 양입니다. |
| memory.heap.Used | 현재 사용 중인 힙 메모리 양입니다. |
| memory.non-heap.Committed | 커밋된 논힙(non-heap) 메모리 양입니다. |
| memory.non-heap.Init | 초기 논힙 메모리 양입니다. |
| memory.non-heap.Max | 최대 논힙 메모리 양입니다. |
| memory.non-heap.Used | 사용 중인 논힙 메모리 양입니다. |

## metastorage

| Metric name | Description |
|---|---|
| IdempotentCacheSize | 멱등 명령 결과 캐시의 현재 크기입니다. |
| SafeTimeLag | 로컬 메타스토리지의 SafeTime이 로컬 논리 시계보다 뒤처지는 시간(밀리초)입니다. |

## os

| Metric name | Description |
|---|---|
| CpuLoad | CPU 부하입니다. 값은 0.0에서 1.0 사이이며, 0.0은 CPU 부하가 없음을, 1.0은 CPU 부하 100%를 의미합니다. CPU 부하 정보를 사용할 수 없으면 음수 값을 반환합니다. |
| LoadAverage | 지난 1분간의 시스템 로드 평균입니다. 시스템 로드 평균은 사용 가능한 프로세서에 대기 중인 실행 가능 개체 수와 사용 가능한 프로세서에서 실행 중인 실행 가능 개체 수를 합산해 일정 기간에 걸쳐 평균한 값입니다. 로드 평균을 계산하는 방식은 운영 체제에 따라 다릅니다. 로드 평균을 사용할 수 없으면 음수 값을 반환합니다. |

## placement-driver

| Metric name | Description |
|---|---|
| ActiveLeasesCount | 현재 활성 리스 수입니다. |
| CurrentPendingAssignmentsSize | 모든 파티션에 걸친 보류 배정(pending assignment)의 현재 크기입니다. |
| CurrentStableAssignmentsSize | 모든 파티션에 걸친 안정 배정(stable assignment)의 현재 크기입니다. |
| LeasesCreated | 생성된 총 리스 수입니다. |
| LeasesProlonged | 연장된 총 리스 수입니다. |
| LeasesPublished | 발행된 총 리스 수입니다. |
| LeasesWithoutCandidates | 후보가 없는 상태로 현재 존재하는 리스의 총 수입니다. |

## raft

| Metric name | Description |
|---|---|
| raft.fsmcaller.disruptor.Stripes | 파티션의 상태 머신에서 스트라이프별 데이터 분산을 나타내는 히스토그램입니다. |
| raft.fsmcaller.disruptor.Batch | 파티션의 상태 머신에서 처리할 일괄 처리 크기를 나타내는 히스토그램입니다. |
| raft.logmanager.disruptor.Batch | 파티션의 RAFT 로그에서 처리할 일괄 처리 크기를 나타내는 히스토그램입니다. |
| raft.logmanager.disruptor.Stripes | 파티션의 RAFT 로그에서 스트라이프별 데이터 분산을 나타내는 히스토그램입니다. |
| raft.nodeimpl.disruptor.Batch | 파티션의 노드 작업에서 처리할 일괄 처리 크기를 나타내는 히스토그램입니다. |
| raft.nodeimpl.disruptor.Stripes | 파티션의 노드 작업에서 스트라이프별 데이터 분산을 나타내는 히스토그램입니다. |
| raft.readonlyservice.disruptor.Stripes | 파티션의 읽기 전용 작업에서 스트라이프별 데이터 분산을 나타내는 히스토그램입니다. |
| raft.readonlyservice.disruptor.Batch | 파티션의 읽기 전용 작업에서 처리할 일괄 처리 크기를 나타내는 히스토그램입니다. |

## resource.vacuum

| Metric name | Description |
|---|---|
| MarkedForVacuumTransactionMetaCount | 정리(vacuum) 대상으로 표시된 트랜잭션 메타 수입니다. |
| SkippedForFurtherProcessingUnfinishedTransactionCount | 정리기(vacuumizer)가 나중에 처리하도록 건너뛴 미완료 트랜잭션의 현재 수입니다. |
| VacuumizedPersistentTransactionMetaCount | 정리된 영속 트랜잭션 메타 수입니다. |
| VacuumizedVolatileTxnMetaCount | 정리된 휘발성 트랜잭션 메타 수입니다. |

## storage.aipersist.\{profile\}

:::note
`aipersist` 스토리지 엔진을 사용하는 각 [스토리지 프로파일](/configure-and-operate/configuration/config-storage-overview)은 개별 메트릭 익스포터를 제공합니다.
:::

| Metric name | Description |
|---|---|
| CpTotalPages | 현재 체크포인트에 포함된 페이지 수입니다. |
| CpEvictedPages | 현재 체크포인트에서 축출된 페이지 수입니다. |
| CpWrittenPages | 현재 체크포인트에서 기록된 페이지 수입니다. |
| CpSyncedPages | 현재 체크포인트에서 fsync가 완료된 페이지 수입니다. |
| CpWriteSpeed | 체크포인트 쓰기 속도이며, 초당 페이지 수로 표시합니다. 이 값은 최근 3회의 체크포인트와 현재 체크포인트를 평균한 값입니다. |
| CurrDirtyRatio | 현재 더티 페이지 비율(더티 페이지 수 대 전체 페이지 수)이며, 분수로 표현합니다. 이 분수는 현재 인메모리 영역의 각 세그먼트마다 계산되며, 그중 가장 높은 값이 "현재" 값이 됩니다. |
| LastEstimatedSpeedForMarkAll | 체크포인트가 끝날 때까지 모든 클린 페이지를 더티로 표시하는 속도를 마지막으로 추정한 값이며, 초당 페이지 수로 표시합니다. |
| MaxSize | 인메모리 영역의 최대 크기(바이트)입니다. |
| MarkDirtySpeed | 페이지를 더티로 표시하는 속도이며, 초당 페이지 수로 표시합니다. 이 값은 각각 0.25초인 최근 3개 구간과 0~0.25초 구간인 현재 구간을 합쳐(총 0.75~1.0초) 평균한 값입니다. |
| SpeedBasedThrottlingPercentage | 평균 표시 시간 중 스로틀링 시간이 차지하는 비율입니다(예: "quarter" = 0.25). |
| TargetDirtyRatio | 더티 페이지 비율(더티 페이지 수 대 전체 페이지 수)이며, 분수로 표현합니다. 이 비율에 도달하면 스로틀링이 시작됩니다. |
| ThrottleParkTime | 쓰기 작업의 대기(park) 시간이며, 나노초로 표시합니다. 이 값은 각각 0.25초인 최근 3개 구간과 0~0.25초 구간인 현재 구간을 합쳐(총 0.75~1.0초) 평균한 값입니다. 체크포인트 버퍼 보호 또는 클린 페이지 풀 보호를 위한 대기 기간을 정의합니다. |
| TotalAllocatedSize | 디스크에 할당된 페이지의 총 크기(바이트)입니다. |
| TotalUsedSize | 디스크에 할당된, 비어 있지 않은 페이지의 총 크기(바이트)입니다. |

## sql.client

SQL 클라이언트 메트릭입니다.

| Metric name | Description |
|---|---|
| OpenCursors | 현재 열려 있는 커서 수입니다. |

## sql.memory

| Metric name | Description |
|---|---|
| Limit | SQL 메모리 제한(바이트)입니다. |
| MaxReserved | 지금까지 SQL이 사용한 최대 메모리량(바이트)입니다. |
| Reserved | SQL이 현재 사용 중인 메모리량(바이트)입니다. |
| StatementLimit | SQL 문 하나당 메모리 제한(바이트)입니다. |

## sql.plan.cache

SQL 쿼리 계획 캐시에 관한 메트릭입니다.

| Metric name | Description |
|---|---|
| Hits | 쿼리 계획 캐시 히트의 총 수입니다. |
| Misses | 쿼리 계획 캐시 미스의 총 수입니다. |

## sql.queries

| Metric name | Description |
|---|---|
| Canceled | 취소된 총 쿼리 수입니다. |
| Failed | 실패한 총 쿼리 수입니다. 이 메트릭은 원인과 무관하게 성공하지 못한 모든 쿼리를 포함합니다. |
| Succeeded | 성공한 총 쿼리 수입니다. |
| TimedOut | 타임아웃으로 실패한 총 쿼리 수입니다. |

## tables.\{table_name\}

테이블 메트릭입니다.

| Metric name | Description |
|---|---|
| RwReads | 읽기-쓰기 트랜잭션 내에서 수행된 총 읽기 수입니다. |
| RoReads | 읽기 전용 트랜잭션 내에서 수행된 총 읽기 수입니다. |
| Writes | 이 테이블에 대한 총 쓰기 작업 수입니다. |

## thread.pools.\{thread-pool-executor-name\}

| Metric name | Description |
|---|---|
| ActiveCount | 작업을 실제로 실행 중인 스레드 수의 근사치입니다. |
| CompletedTaskCount | 실행을 완료한 작업의 총수의 근사치입니다. |
| CorePoolSize | 코어 스레드 수입니다. |
| KeepAliveTime | 스레드 유지 시간(keep-alive time)이며, 코어 풀 크기를 초과한 스레드가 종료되기 전까지 유휴 상태로 남아 있을 수 있는 시간입니다. |
| LargestPoolSize | 풀에 동시에 존재했던 스레드 수 중 가장 큰 값입니다. |
| MaximumPoolSize | 허용되는 최대 스레드 수입니다. |
| PoolSize | 풀에 있는 현재 스레드 수입니다. |
| TaskCount | 실행 예약된 작업의 총수의 근사치입니다. |
| QueueSize | 실행 큐의 현재 크기입니다. |

## topology.cluster

클러스터 토폴로지에 관한 메트릭입니다.

| Metric name | Description |
|---|---|
| ClusterId | 클러스터의 고유 식별자입니다. |
| ClusterName | 클러스터의 고유 이름입니다. |
| TotalNodes | 논리 토폴로지에 있는 총 노드 수입니다. |

## topology.local

노드 정보를 담은 메트릭입니다.

| Metric name | Description |
|---|---|
| NodeName | 노드의 고유 이름입니다. |
| NodeId | 노드의 고유 식별자입니다. |
| NodeVersion | 노드에서 실행 중인 Ignite 버전입니다. |

## transactions

트랜잭션 메트릭입니다.

| Metric name | Description |
|---|---|
| RwCommits | 읽기-쓰기 트랜잭션 커밋의 총 수입니다. |
| RoCommits | 읽기 전용 트랜잭션 커밋의 총 수입니다. |
| RwRollbacks | 읽기-쓰기 트랜잭션 롤백의 총 수입니다. |
| RoRollbacks | 읽기 전용 트랜잭션 롤백의 총 수입니다. |
| RwDuration | 읽기-쓰기 트랜잭션 지연 시간을 나타내는 히스토그램입니다. |
| RoDuration | 읽기 전용 트랜잭션 지연 시간을 나타내는 히스토그램입니다. |
| TotalRollbacks | 트랜잭션 롤백의 총 수입니다. |
| TotalCommits | 트랜잭션 커밋의 총 수입니다. |

## zones

| Metric name | Description |
|---|---|
| LocalUnrebalancedPartitionsCount | 이 노드로 이동해야 하는 파티션 수입니다. |
| TotalUnrebalancedPartitionsCount | 새 소유자로 이동해야 하는 총 파티션 수입니다. |
