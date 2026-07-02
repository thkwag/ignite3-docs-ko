---
title: Compute API
id: compute-api
sidebar_position: 7
---

# Compute API

Compute API는 클러스터 노드에서 사용자 정의 코드를 실행합니다. 애플리케이션은 선택한 노드에서 실행되어 결과를 반환하는 작업을 제출합니다. 이 기능으로 데이터 지역성을 살린 처리, 분산 알고리즘, 클러스터 전반의 워크로드 분산이 가능합니다.

## 핵심 개념 {#key-concepts}

컴퓨트 작업은 ComputeJob 인터페이스를 구현합니다. 작업 디스크립터(job descriptor)는 어떤 클래스를 실행할지와 그 클래스를 어디서 찾을지를 식별합니다. 작업 타깃은 특정 노드, 사용 가능한 임의 노드, 테이블 파티션과 콜로케이션(colocation)된 위치 같은 전략으로 실행 위치를 지정합니다.

작업은 비동기로 실행되며 JobExecution 핸들을 반환합니다. 이 핸들로 결과를 조회하고, 상태를 모니터링하고, 실행을 취소하거나 우선순위를 조정합니다. 브로드캐스트 작업은 여러 노드에서 실행되어 결과를 집계합니다.

## 작업 구현 {#job-implementation}

사용자 정의 처리를 위해 ComputeJob을 구현합니다:

```java
public class WordCountJob implements ComputeJob<String, Integer> {
    @Override
    public CompletableFuture<Integer> executeAsync(
        JobExecutionContext context,
        String text
    ) {
        int count = text.split("\\s+").length;
        return CompletableFuture.completedFuture(count);
    }
}
```

작업은 실행 컨텍스트와 인수를 받습니다. 비동기 처리를 위해 CompletableFuture를 반환합니다.

## 작업 제출 {#job-submission}

디스크립터와 타깃을 지정해 작업을 제출합니다:

```java
JobDescriptor<String, Integer> descriptor =
    JobDescriptor.builder("com.example.WordCountJob").build();

CompletableFuture<JobExecution<Integer>> executionFuture =
    ignite.compute().submitAsync(
        JobTarget.anyNode(ignite.clusterNodes()),
        descriptor,
        "the quick brown fox"
    );

Integer result = executionFuture
    .thenCompose(JobExecution::resultAsync)
    .join();

System.out.println("Word count: " + result);
```

submitAsync 메서드는 작업이 타깃 노드에서 실행되는 동안 즉시 반환됩니다.

## 작업 타깃 {#job-targets}

특정 실행 위치를 지정합니다:

```java
// Execute on specific node
ClusterNode node = ignite.cluster().localNode();
JobTarget target = JobTarget.node(node);

// Execute on any node from set
Collection<ClusterNode> nodes = ignite.clusterNodes();
JobTarget target = JobTarget.anyNode(nodes);

// Execute on all nodes (broadcast)
BroadcastJobTarget target = BroadcastJobTarget.nodes(nodes);
```

워크로드 특성과 데이터 지역성 요구 사항에 따라 타깃을 선택합니다.

## 콜로케이션 실행 {#colocated-execution}

데이터와 콜로케이션된 위치에서 작업을 실행합니다:

```java
JobDescriptor<Integer, String> descriptor =
    JobDescriptor.builder("com.example.DataProcessor").build();

Tuple key = Tuple.create().set("id", 100);
QualifiedName tableName = QualifiedName.of("products");

JobTarget target = JobTarget.colocated(tableName, key, Mapper.of(Tuple.class));

CompletableFuture<JobExecution<String>> execution =
    ignite.compute().submitAsync(target, descriptor, 100);
```

콜로케이션 실행은 데이터를 저장한 노드에서 작업을 실행해 네트워크 오버헤드를 없앱니다.

## 작업 컨텍스트 {#job-context}

작업 안에서 클러스터 리소스에 접근합니다:

```java
public class DataProcessorJob implements ComputeJob<Integer, String> {
    @Override
    public CompletableFuture<String> executeAsync(
        JobExecutionContext context,
        Integer productId
    ) {
        Ignite ignite = context.ignite();
        Table table = ignite.tables().table("products");
        RecordView<Tuple> view = table.recordView();

        Tuple key = Tuple.create().set("id", productId);
        Tuple record = view.get(null, key);

        return CompletableFuture.completedFuture(
            record.stringValue("name")
        );
    }
}
```

JobExecutionContext는 Ignite 인스턴스, 파티션 정보, 배포 단위, 취소 상태에 대한 접근을 제공합니다.

## 작업 취소 {#job-cancellation}

CancellationToken으로 실행 중인 작업을 취소합니다:

```java
CancelHandle cancelHandle = CancelHandle.create();

CompletableFuture<JobExecution<Integer>> executionFuture =
    ignite.compute().submitAsync(
        target,
        descriptor,
        input,
        cancelHandle.token()
    );

// Cancel the job
cancelHandle.cancel();
System.out.println("Cancellation requested");
```

취소된 작업은 실행을 멈추고 리소스를 해제합니다. 작업 구현 안에서는 context.isCancelled()로 취소 상태를 확인합니다.

## 취소 토큰 {#cancellation-tokens}

작업 안에서 취소에 응답합니다:

```java
public class CancellableJob implements ComputeJob<String, Integer> {
    @Override
    public CompletableFuture<Integer> executeAsync(
        JobExecutionContext context,
        String input
    ) {
        return CompletableFuture.supplyAsync(() -> {
            int count = 0;
            for (String word : input.split("\\s+")) {
                if (context.isCancelled()) {
                    throw new CancellationException("Job cancelled");
                }
                count++;
            }
            return count;
        });
    }
}
```

오래 실행되는 작업 도중에는 주기적으로 취소 상태를 확인합니다.

## 작업 우선순위 {#job-priority}

작업 우선순위를 동적으로 조정합니다:

```java
JobExecution<Integer> execution = executionFuture.join();

execution.changePriorityAsync(10).thenAccept(changed -> {
    if (changed) {
        System.out.println("Priority updated");
    }
});
```

우선순위가 높은 작업은 큐에서 우선순위가 낮은 작업보다 먼저 실행됩니다.

## 작업 상태 {#job-status}

작업 실행 상태를 모니터링합니다:

```java
JobExecution<Integer> execution = executionFuture.join();

execution.stateAsync().thenAccept(state -> {
    System.out.println("Job state: " + state);
});

execution.idAsync().thenAccept(id -> {
    System.out.println("Job ID: " + id);
});
```

작업 상태에는 큐 대기, 실행 중, 완료, 취소됨, 실패가 있습니다.

## 브로드캐스트 실행 {#broadcast-execution}

여러 노드에서 작업을 실행합니다:

```java
JobDescriptor<String, Integer> descriptor =
    JobDescriptor.builder("com.example.MetricsCollector").build();

Collection<ClusterNode> nodes = ignite.clusterNodes();

CompletableFuture<BroadcastExecution<Integer>> broadcastFuture =
    ignite.compute().submitAsync(
        BroadcastJobTarget.nodes(nodes),
        descriptor,
        "collect"
    );

BroadcastExecution<Integer> broadcast = broadcastFuture.join();

// Get individual job executions by node
Map<ClusterNode, JobExecution<Integer>> executions = broadcast.executions();

for (Map.Entry<ClusterNode, JobExecution<Integer>> entry : executions.entrySet()) {
    Integer result = entry.getValue().resultAsync().join();
    System.out.println("Node " + entry.getKey().name() + ": " + result);
}
```

브로드캐스트 실행은 모든 타깃 노드의 결과를 반환합니다.

## 브로드캐스트 결과 수집 {#broadcast-results-collection}

모든 브로드캐스트 결과에 비동기로 접근합니다:

```java
BroadcastExecution<Integer> broadcast = broadcastFuture.join();

CompletableFuture<List<Integer>> allResults = broadcast.resultsAsync();

List<Integer> values = allResults.join();

int total = values.stream().mapToInt(Integer::intValue).sum();
System.out.println("Total: " + total);
```

## 배포 단위 {#deployment-units}

배포 단위에서 작업을 참조합니다:

```java
DeploymentUnit unit = new DeploymentUnit("my-jobs", "1.0.0");

JobDescriptor<String, Integer> descriptor =
    JobDescriptor.builder("com.example.CustomJob")
        .units(unit)
        .build();

CompletableFuture<JobExecution<Integer>> execution =
    ignite.compute().submitAsync(target, descriptor, "input");
```

배포 단위는 버전을 관리하는 작업 배포와 격리를 가능하게 합니다.

## 사용자 정의 직렬화 {#custom-serialization}

작업 인수와 결과에 사용자 정의 마샬러를 구현합니다:

```java
public class CustomJob implements ComputeJob<MyData, MyResult> {
    @Override
    public CompletableFuture<MyResult> executeAsync(
        JobExecutionContext context,
        MyData input
    ) {
        // Process input
        return CompletableFuture.completedFuture(new MyResult());
    }

    @Override
    public Marshaller<MyData, byte[]> inputMarshaller() {
        return new MyDataMarshaller();
    }

    @Override
    public Marshaller<MyResult, byte[]> resultMarshaller() {
        return new MyResultMarshaller();
    }
}
```

사용자 정의 마샬러는 비표준 타입의 직렬화를 제어합니다.

## 맵리듀스 태스크 {#map-reduce-tasks}

맵리듀스 연산을 실행합니다:

```java
public class WordCountTask implements MapReduceTask<String, String, Map<String, Integer>, Map<String, Integer>> {
    @Override
    public String name() {
        return "word-count";
    }

    @Override
    public CompletableFuture<List<MapReduceJob<String, Map<String, Integer>>>>
        splitAsync(TaskExecutionContext context, String input) {

        List<MapReduceJob<String, Map<String, Integer>>> jobs = new ArrayList<>();
        String[] lines = input.split("\n");

        for (String line : lines) {
            jobs.add(new WordCountJob(line));
        }

        return CompletableFuture.completedFuture(jobs);
    }

    @Override
    public CompletableFuture<Map<String, Integer>> reduceAsync(
        TaskExecutionContext context,
        List<Map<String, Integer>> results
    ) {
        Map<String, Integer> combined = new HashMap<>();
        for (Map<String, Integer> result : results) {
            result.forEach((word, count) ->
                combined.merge(word, count, Integer::sum)
            );
        }
        return CompletableFuture.completedFuture(combined);
    }
}
```

맵리듀스 태스크를 제출합니다:

```java
TaskDescriptor<String, Map<String, Integer>> taskDescriptor =
    TaskDescriptor.builder(new WordCountTask()).build();

CompletableFuture<JobExecution<Map<String, Integer>>> execution =
    ignite.compute().executeMapReduceAsync(
        taskDescriptor,
        "line one\nline two\nline three"
    );

Map<String, Integer> wordCounts = execution
    .thenCompose(JobExecution::resultAsync)
    .join();
```

## 오류 처리 {#error-handling}

컴퓨트 예외를 처리합니다:

```java
try {
    JobExecution<Integer> execution = executionFuture.join();
    Integer result = execution.resultAsync().join();
} catch (CompletionException e) {
    if (e.getCause() instanceof ComputeException) {
        System.err.println("Compute error: " + e.getCause().getMessage());
    } else if (e.getCause() instanceof NodeNotFoundException) {
        System.err.println("Target node not found");
    }
}
```

## 참조 {#reference}

- 컴퓨트 퍼사드: `org.apache.ignite.compute.IgniteCompute`
- 작업 인터페이스: `org.apache.ignite.compute.ComputeJob<T, R>`
- 작업 실행: `org.apache.ignite.compute.JobExecution<R>`
- 작업 타깃팅: `org.apache.ignite.compute.JobTarget`
- 작업 디스크립터: `org.apache.ignite.compute.JobDescriptor<T, R>`
- 작업 컨텍스트: `org.apache.ignite.compute.JobExecutionContext`
- 브로드캐스트 실행: `org.apache.ignite.compute.BroadcastExecution<R>`
- 맵리듀스: `org.apache.ignite.compute.task.MapReduceTask<I, M, T, R>`
- 태스크 디스크립터: `org.apache.ignite.compute.task.TaskDescriptor<I, R>`
- 배포: `org.apache.ignite.deployment.DeploymentUnit`

### IgniteCompute 메서드 {#ignitecompute-methods}

- `<T, R> CompletableFuture<JobExecution<R>> submitAsync(JobTarget, JobDescriptor<T, R>, T)` - 작업 제출
- `<T, R> CompletableFuture<JobExecution<R>> submitAsync(JobTarget, JobDescriptor<T, R>, T, CancellationToken)` - 취소 기능과 함께 제출
- `<T, R> CompletableFuture<BroadcastExecution<R>> submitAsync(BroadcastJobTarget, JobDescriptor<T, R>, T)` - 브로드캐스트 제출
- `<T, R> CompletableFuture<JobExecution<R>> executeMapReduceAsync(TaskDescriptor<T, R>, T)` - 맵리듀스 실행

### JobExecution 메서드 {#jobexecution-methods}

- `CompletableFuture<R> resultAsync()` - 작업 결과 조회
- `CompletableFuture<JobState> stateAsync()` - 작업 상태 조회
- `CompletableFuture<UUID> idAsync()` - 작업 ID 조회
- `CompletableFuture<Boolean> changePriorityAsync(int)` - 우선순위 변경

### JobTarget 팩토리 메서드 {#jobtarget-factory-methods}

- `static JobTarget node(ClusterNode)` - 특정 노드 타깃팅
- `static JobTarget anyNode(ClusterNode...)` - 집합에서 임의 노드 타깃팅
- `static JobTarget colocated(QualifiedName, Object, Mapper)` - 데이터와 콜로케이션된 위치 타깃팅

### BroadcastJobTarget 팩토리 메서드 {#broadcastjobtarget-factory-methods}

- `static BroadcastJobTarget nodes(Collection<ClusterNode>)` - 지정한 모든 노드 타깃팅

### JobExecutionContext 메서드 {#jobexecutioncontext-methods}

- `Ignite ignite()` - Ignite 인스턴스 조회
- `boolean isCancelled()` - 작업 취소 여부 확인
- `int partition()` - 콜로케이션 작업의 파티션 번호 조회
- `List<DeploymentUnit> deploymentUnits()` - 배포 단위 조회

### BroadcastExecution 메서드 {#broadcastexecution-methods}

- `Map<ClusterNode, JobExecution<R>> executions()` - 노드별 작업 실행 조회
- `CompletableFuture<List<R>> resultsAsync()` - 모든 결과를 비동기로 조회

### ComputeJob 인터페이스 {#computejob-interface}

- `CompletableFuture<R> executeAsync(JobExecutionContext, T)` - 작업 실행
- `Marshaller<T, byte[]> inputMarshaller()` - 사용자 정의 입력 직렬화
- `Marshaller<R, byte[]> resultMarshaller()` - 사용자 정의 결과 직렬화
