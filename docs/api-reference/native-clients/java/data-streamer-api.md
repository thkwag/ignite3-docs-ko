---
title: Data Streamer API
id: data-streamer-api
sidebar_position: 4
---

# Data Streamer API

Data Streamer API는 Ignite 테이블에 고처리량 데이터 적재를 제공합니다. 애플리케이션은 리액티브 발행자로 데이터를 스트리밍하며, 이 발행자는 레코드를 일괄 처리해 네트워크 전송과 처리를 효율화합니다. 이 방식은 개별 put 작업보다 높은 성능을 냅니다.

## 핵심 개념 {#key-concepts}

데이터 스트리밍은 배압(backpressure)을 인식하는 데이터 전달을 위해 Java Flow API를 사용합니다. 발행자는 작업 유형과 페이로드를 담은 항목을 생성합니다. 스트리머는 항목을 일괄 처리해 적절한 노드로 보내고, 파티션 전반에서 작업을 병렬로 실행합니다.

RecordView와 KeyValueView는 모두 DataStreamerTarget을 구현하므로, 두 뷰 타입 어느 쪽으로든 스트리밍할 수 있습니다. 묶음 크기, 병렬성, 재시도 동작을 제어하려면 DataStreamerOptions로 스트리밍 동작을 구성합니다.

## 기본 스트리밍 {#basic-streaming}

Flow 발행자로 데이터를 스트리밍합니다:

```java
RecordView<Tuple> view = table.recordView();

// Create publisher
List<DataStreamerItem<Tuple>> items = Arrays.asList(
    DataStreamerItem.of(Tuple.create().set("id", 1).set("name", "Alice")),
    DataStreamerItem.of(Tuple.create().set("id", 2).set("name", "Bob")),
    DataStreamerItem.of(Tuple.create().set("id", 3).set("name", "Carol"))
);

SubmissionPublisher<DataStreamerItem<Tuple>> publisher =
    new SubmissionPublisher<>();

// Stream data
CompletableFuture<Void> future = view.streamData(
    publisher,
    DataStreamerOptions.DEFAULT
);

// Submit items
items.forEach(publisher::submit);
publisher.close();

future.join();
```

모든 항목이 처리되면 작업이 완료됩니다.

## 스트림 옵션 {#stream-options}

옵션으로 스트리밍 동작을 구성합니다:

```java
DataStreamerOptions options = DataStreamerOptions.builder()
    .pageSize(1000)
    .perPartitionParallelOperations(4)
    .autoFlushInterval(1000)
    .retryLimit(3)
    .build();

CompletableFuture<Void> future = view.streamData(publisher, options);
```

pageSize 매개변수는 묶음 크기를 제어합니다. 값이 클수록 처리량은 늘지만 메모리를 더 사용합니다. perPartitionParallelOperations 설정은 파티션당 동시 작업 수를 결정합니다.

## 작업 유형 {#operation-types}

각 항목의 작업 유형을 지정합니다:

```java
List<DataStreamerItem<Tuple>> items = Arrays.asList(
    DataStreamerItem.of(
        Tuple.create().set("id", 1).set("name", "Alice"),
        DataStreamerOperationType.PUT
    ),
    DataStreamerItem.of(
        Tuple.create().set("id", 2).set("status", "active"),
        DataStreamerOperationType.PUT
    ),
    DataStreamerItem.removed(
        Tuple.create().set("id", 3)
    ),
    DataStreamerItem.of(
        Tuple.create().set("id", 4).set("name", "David")
    )
);
```

사용 가능한 작업:
- PUT: 레코드 삽입 또는 업데이트(`of()` 메서드 사용 시 기본값)
- REMOVE: 레코드 제거(`removed()` 메서드 또는 명시적 `DataStreamerOperationType.REMOVE` 사용)

## 사용자 정의 발행자 {#custom-publishers}

외부 소스에서 스트리밍하려면 사용자 정의 발행자를 구현합니다:

```java
class FilePublisher implements Flow.Publisher<DataStreamerItem<Tuple>> {
    private final Path file;

    public FilePublisher(Path file) {
        this.file = file;
    }

    public void subscribe(Flow.Subscriber<? super DataStreamerItem<Tuple>> subscriber) {
        subscriber.onSubscribe(new Flow.Subscription() {
            private BufferedReader reader;

            public void request(long n) {
                try {
                    if (reader == null) {
                        reader = Files.newBufferedReader(file);
                    }

                    for (long i = 0; i < n; i++) {
                        String line = reader.readLine();
                        if (line == null) {
                            reader.close();
                            subscriber.onComplete();
                            return;
                        }

                        String[] parts = line.split(",");
                        Tuple tuple = Tuple.create()
                            .set("id", Integer.parseInt(parts[0]))
                            .set("name", parts[1]);

                        subscriber.onNext(DataStreamerItem.of(tuple));
                    }
                } catch (IOException e) {
                    subscriber.onError(e);
                }
            }

            public void cancel() {
                try {
                    if (reader != null) {
                        reader.close();
                    }
                } catch (IOException e) {
                    // Ignore
                }
            }
        });
    }
}
```

발행자는 시스템에 과부하를 주지 않도록 배압 신호를 존중해야 합니다.

## 수신기 기반 스트리밍 {#receiver-based-streaming}

수신기로 서버 노드에서 사용자 정의 처리 로직을 실행합니다:

```java
class AggregationReceiver
    implements DataStreamerReceiver<Tuple, String, Integer> {

    @Override
    public CompletableFuture<List<Integer>> receive(
        List<Tuple> items,
        DataStreamerReceiverContext context,
        String arg
    ) {
        Table table = context.ignite().tables().table("aggregates");
        RecordView<Tuple> view = table.recordView();

        Map<String, Integer> counts = new HashMap<>();
        for (Tuple item : items) {
            String category = item.stringValue("category");
            counts.merge(category, 1, Integer::sum);
        }

        for (Map.Entry<String, Integer> entry : counts.entrySet()) {
            Tuple record = Tuple.create()
                .set("category", entry.getKey())
                .set("count", entry.getValue());
            view.put(null, record);
        }

        return CompletableFuture.completedFuture(
            Collections.singletonList(counts.size())
        );
    }
}
```

수신기를 등록하고 사용합니다:

```java
DataStreamerReceiverDescriptor<Tuple, String, Integer> descriptor =
    DataStreamerReceiverDescriptor.<Tuple, String, Integer>builder(
        "com.example.AggregationReceiver"
    ).build();

SubmissionPublisher<Tuple> publisher = new SubmissionPublisher<>();

CompletableFuture<Void> future = view.streamData(
    publisher,
    descriptor,
    tuple -> tuple.value("id"),
    tuple -> tuple,
    "aggregation-arg",
    null,
    DataStreamerOptions.DEFAULT
);

// Submit items
List<Tuple> items = Arrays.asList(
    Tuple.create().set("id", 1).set("category", "A"),
    Tuple.create().set("id", 2).set("category", "B")
);
items.forEach(publisher::submit);
publisher.close();

future.join();
```

수신기는 서버 노드에서 묶음을 처리하므로, 집계나 복잡한 변환 같은 사용자 정의 로직을 수행할 수 있습니다.

## 오류 처리 {#error-handling}

반환된 future로 스트리밍 오류를 처리합니다:

```java
CompletableFuture<Void> future = view.streamData(publisher, options);

future.exceptionally(ex -> {
    if (ex instanceof DataStreamerException) {
        System.err.println("Streaming failed: " + ex.getMessage());
    }
    return null;
});
```

실패한 묶음을 자동으로 재시도하려면 DataStreamerOptions.retryLimit로 재시도 동작을 구성합니다.

## 자동 플러시 간격 {#auto-flush-interval}

적은 양의 스트림을 위해 주기적 플러시를 구성합니다:

```java
DataStreamerOptions options = DataStreamerOptions.builder()
    .autoFlushInterval(500)
    .build();
```

스트리머는 지정한 간격(밀리초)이 지나면 완료되지 않은 묶음을 플러시합니다. 이렇게 하면 처리량이 적은 상황에서 데이터가 무기한 버퍼에 남아 있는 것을 막습니다.

## 키-값 뷰 스트리밍 {#key-value-view-streaming}

Entry 페이로드로 키-값 뷰에 스트리밍합니다:

```java
KeyValueView<Tuple, Tuple> kvView = table.keyValueView();

List<DataStreamerItem<Map.Entry<Tuple, Tuple>>> items = Arrays.asList(
    DataStreamerItem.of(Map.entry(
        Tuple.create().set("id", 1),
        Tuple.create().set("name", "Alice")
    )),
    DataStreamerItem.of(Map.entry(
        Tuple.create().set("id", 2),
        Tuple.create().set("name", "Bob")
    ))
);

SubmissionPublisher<DataStreamerItem<Map.Entry<Tuple, Tuple>>> publisher =
    new SubmissionPublisher<>();

CompletableFuture<Void> future = kvView.streamData(publisher, DataStreamerOptions.DEFAULT);

items.forEach(publisher::submit);
publisher.close();

future.join();
```

## 성능 고려 사항 {#performance-considerations}

구성을 튜닝해 스트리밍 처리량을 최적화합니다:

```java
DataStreamerOptions options = DataStreamerOptions.builder()
    .pageSize(10000)
    .perPartitionParallelOperations(8)
    .retryLimit(5)
    .build();
```

페이지 크기가 클수록 묶음당 오버헤드는 줄지만 메모리 사용량은 늘어납니다. 병렬성이 높으면 멀티코어 시스템에서 처리량이 향상되지만 리소스 경합이 생길 수 있습니다.

## 참조 {#reference}

- 스트리밍 인터페이스: `org.apache.ignite.table.DataStreamerTarget<T>`
- 구성: `org.apache.ignite.table.DataStreamerOptions`
- 스트림 항목: `org.apache.ignite.table.DataStreamerItem<T>`
- 사용자 정의 처리: `org.apache.ignite.table.DataStreamerReceiver<T, A, R>`
- 수신기 컨텍스트: `org.apache.ignite.table.DataStreamerReceiverContext`
- 수신기 디스크립터: `org.apache.ignite.table.DataStreamerReceiverDescriptor<T, A, R>`

### DataStreamerTarget 메서드 {#datastreamertarget-methods}

- `CompletableFuture<Void> streamData(Publisher<DataStreamerItem<T>>, DataStreamerOptions)` - 테이블로 데이터 스트리밍
- `<E, V, A, R> CompletableFuture<Void> streamData(Publisher<E>, DataStreamerReceiverDescriptor<V, A, R>, Function<E, T>, Function<E, V>, A, Subscriber<R>, DataStreamerOptions)` - 사용자 정의 수신기와 함께 스트리밍

### DataStreamerOptions 구성 {#datastreameroptions-configuration}

- `pageSize` - 묶음당 항목 수(기본값: 1000)
- `perPartitionParallelOperations` - 파티션당 동시 작업 수(기본값: 1)
- `autoFlushInterval` - 자동 플러시 간격(밀리초, 기본값: 5000)
- `retryLimit` - 실패한 묶음의 재시도 횟수(기본값: 16)

### DataStreamerItem 작업 {#datastreameritem-operations}

- `PUT` - 레코드 삽입 또는 업데이트
- `REMOVE` - 레코드 제거

### DataStreamerReceiver 인터페이스 {#datastreamerreceiver-interface}

- `CompletableFuture<List<R>> receive(List<T>, DataStreamerReceiverContext, A)` - 서버에서 묶음 처리
- `Marshaller<T, byte[]> payloadMarshaller()` - 사용자 정의 페이로드 직렬화
- `Marshaller<A, byte[]> argumentMarshaller()` - 사용자 정의 인수 직렬화
- `Marshaller<R, byte[]> resultMarshaller()` - 사용자 정의 결과 직렬화
