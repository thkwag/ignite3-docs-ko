---
title: Data Streamer API
id: data-streamer-api
sidebar_position: 3
---

# Data Streamer API

Data Streamer API는 Ignite 테이블에 고처리량 대량 데이터 적재 기능을 제공합니다. 데이터를 자동으로 페이지 단위로 묶어 클러스터 노드에 분산하며, 필요하면 커스텀 수신기로 서버 측에서 처리합니다.

## 핵심 개념 {#key-concepts}

데이터 스트리밍은 레코드를 페이지 단위로 묶어 클러스터에 일괄 전송함으로써 대량 적재를 최적화합니다. 이렇게 하면 네트워크 왕복 횟수가 줄고 파티션 간 병렬 처리가 가능해집니다.

### 스트리밍 대상 {#streaming-targets}

IRecordView와 IKeyValueView는 모두 IDataStreamerTarget을 구현하므로 모든 테이블 뷰에 데이터를 직접 스트리밍할 수 있습니다. 스트리머는 데이터를 올바른 파티션 노드로 자동 라우팅합니다.

### 서버 측 수신기 {#server-side-receivers}

수신기는 스트리밍되는 데이터의 각 페이지에 대해 서버에서 커스텀 로직을 실행합니다. 수신기를 사용하면 적재 중에 데이터를 변환하거나 집계를 수행하거나 커스텀 병합 로직을 구현할 수 있습니다. 수신기는 최고의 성능을 위해 데이터와 함께 배치되어 실행됩니다.

### 페이지 기반 처리 {#page-based-processing}

스트리머는 DataStreamerOptions.PageSize를 기준으로 입력 데이터를 페이지로 나눕니다. 각 페이지는 적절한 클러스터 노드로 전송되며, 그 노드에서 수신기가 페이지 안의 모든 항목을 함께 처리합니다. 이러한 일괄 처리로 오버헤드가 줄고 효율적인 대량 작업이 가능해집니다.

## 사용 예시 {#usage-examples}

### 기본 스트리밍 {#basic-streaming}

```csharp
var table = await client.Tables.GetTableAsync("events");
var view = table.GetRecordView<Event>();

// Generate data asynchronously
async IAsyncEnumerable<Event> GenerateEvents()
{
    for (int i = 0; i < 100000; i++)
    {
        yield return new Event
        {
            Id = i,
            Timestamp = DateTime.UtcNow,
            Type = "sensor_reading",
            Value = Random.Shared.NextDouble() * 100
        };
    }
}

// Stream the data
await view.StreamDataAsync(GenerateEvents());
```

### 옵션을 사용한 스트리밍 {#streaming-with-options}

```csharp
var options = new DataStreamerOptions
{
    PageSize = 1000,  // Items per page
    RetryLimit = 16,  // Retry failed pages
    AutoFlushInterval = TimeSpan.FromSeconds(1)
};

await view.StreamDataAsync(GenerateEvents(), options);
```

### 키-값 뷰로 스트리밍 {#streaming-to-key-value-view}

```csharp
var table = await client.Tables.GetTableAsync("metrics");
var kvView = table.GetKeyValueView<MetricKey, MetricValue>();

async IAsyncEnumerable<KeyValuePair<MetricKey, MetricValue>> GenerateMetrics()
{
    for (int i = 0; i < 50000; i++)
    {
        var key = new MetricKey { MetricId = i };
        var value = new MetricValue
        {
            Name = $"metric_{i}",
            Value = Random.Shared.NextDouble()
        };
        yield return new KeyValuePair<MetricKey, MetricValue>(key, value);
    }
}

await kvView.StreamDataAsync(GenerateMetrics());
```

### 커스텀 서버 측 수신기 {#custom-server-side-receiver}

```csharp
// Define receiver that processes data on the server
public class AggregatingReceiver : IDataStreamerReceiver<SensorReading, string, int>
{
    public IMarshaller<SensorReading>? PayloadMarshaller => null;
    public IMarshaller<string>? ArgumentMarshaller => null;
    public IMarshaller<int>? ResultMarshaller => null;

    public async ValueTask<IList<int>?> ReceiveAsync(
        IList<SensorReading> page,
        string arg,
        IDataStreamerReceiverContext context,
        CancellationToken cancellationToken)
    {
        // Process page on the server
        var sum = 0;
        var table = await context.Ignite.Tables.GetTableAsync("sensor_data");
        var view = table.GetRecordView<SensorReading>();

        foreach (var reading in page)
        {
            // Custom merge logic
            var existing = await view.GetAsync(null, new SensorReading { SensorId = reading.SensorId });
            if (existing.HasValue)
            {
                reading.Value += existing.Value.Value;
            }
            await view.UpsertAsync(null, reading);
            sum += (int)reading.Value;
        }

        return new[] { sum };
    }
}

// Register and use receiver
var receiverDescriptor = new ReceiverDescriptor<SensorReading, string, int>(
    "AggregatingReceiver");

var results = view.StreamDataAsync(
    data: GenerateReadings(),
    receiver: receiverDescriptor,
    keySelector: r => new SensorReading { SensorId = r.SensorId },
    payloadSelector: r => r,
    receiverArg: "aggregate_mode",
    options: new DataStreamerOptions { PageSize = 100 });

await foreach (var sum in results)
{
    Console.WriteLine($"Page sum: {sum}");
}
```

### 오류 처리 {#error-handling}

```csharp
var options = new DataStreamerOptions
{
    PageSize = 500,
    RetryLimit = 16
};

try
{
    await view.StreamDataAsync(GenerateEvents(), options);
    Console.WriteLine("Streaming completed successfully");
}
catch (Exception ex)
{
    Console.WriteLine($"Streaming failed: {ex.Message}");
    // Handle failure (page that failed after retries)
}
```

### 취소를 사용한 스트리밍 {#streaming-with-cancellation}

```csharp
using var cts = new CancellationTokenSource();
cts.CancelAfter(TimeSpan.FromMinutes(5));

try
{
    await view.StreamDataAsync(
        GenerateEvents(),
        options: new DataStreamerOptions { PageSize = 1000 },
        cancellationToken: cts.Token);
}
catch (OperationCanceledException)
{
    Console.WriteLine("Streaming cancelled");
}
```

### 변환을 사용한 스트리밍 {#streaming-with-transformations}

```csharp
async IAsyncEnumerable<Event> GenerateAndTransform()
{
    await foreach (var rawEvent in LoadFromExternalSource())
    {
        // Transform during generation
        yield return new Event
        {
            Id = rawEvent.Id,
            Timestamp = DateTime.UtcNow,
            Type = NormalizeType(rawEvent.Type),
            Value = rawEvent.Value * 1.5
        };
    }
}

await view.StreamDataAsync(GenerateAndTransform());
```

## 참조 {#reference}

### IDataStreamerTarget&lt;T&gt; 인터페이스 {#idatastreamertargett-interface}

기본 스트리밍 메서드:

- **StreamDataAsync(IAsyncEnumerable&lt;T&gt; data, DataStreamerOptions?, CancellationToken)** - 원시 데이터 항목을 스트리밍합니다
- **StreamDataAsync(IAsyncEnumerable&lt;DataStreamerItem&lt;T&gt;&gt; data, DataStreamerOptions?, CancellationToken)** - 연산 타입과 함께 스트리밍합니다

수신기 기반 스트리밍:

- **StreamDataAsync&lt;TSource, TPayload, TArg, TResult&gt;** - 페이지마다 결과를 반환하는 수신기로 스트리밍합니다
- **StreamDataAsync&lt;TSource, TPayload, TArg&gt;** - 결과가 없는 수신기로 스트리밍합니다

매개변수:
- **data** - 스트리밍할 항목의 비동기 시퀀스
- **receiver** - 서버 측 수신기 디스크립터
- **keySelector** - 소스 항목에서 키를 추출하는 함수
- **payloadSelector** - 소스 항목에서 페이로드를 추출하는 함수
- **receiverArg** - 수신기에 전달되는 인수
- **options** - 스트리밍 구성
- **cancellationToken** - 취소 지원

### DataStreamerOptions 클래스 {#datastreameroptions-class}

구성 속성:

- **PageSize** - 페이지당 항목 수(기본값: 1000)
- **RetryLimit** - 실패한 페이지에 대한 최대 재시도 횟수(기본값: 16)
- **AutoFlushInterval** - 페이지를 자동으로 플러시하는 시간 간격

페이지 크기는 일괄 처리의 세분성을 제어합니다. 페이지가 클수록 네트워크 오버헤드는 줄지만 메모리 사용량이 늘고 파티션 간 병렬성이 떨어집니다.

### IDataStreamerReceiver&lt;TItem, TArg, TResult&gt; 인터페이스 {#idatastreamerreceivertitem-targ-tresult-interface}

속성:

- **PayloadMarshaller** - 페이로드 항목용 선택적 커스텀 마샬러
- **ArgumentMarshaller** - 인수용 선택적 커스텀 마샬러
- **ResultMarshaller** - 결과용 선택적 커스텀 마샬러

메서드:

- **ReceiveAsync(IList&lt;TItem&gt; page, TArg arg, IDataStreamerReceiverContext context, CancellationToken)** - 서버에서 페이지 단위 항목을 처리합니다

수신기는 파티션을 소유한 서버 노드에서 실행됩니다. PageSize로 제어되는 페이지 단위 항목을 전달받아 컨텍스트로 전체 Ignite API에 접근하면서 처리하며, 필요하면 결과를 반환합니다.

### IDataStreamerReceiverContext 인터페이스 {#idatastreamerreceivercontext-interface}

속성:

- **Ignite** - 서버 측 작업을 위한 전체 Ignite 클라이언트 API 접근

컨텍스트를 사용해 데이터 처리 중에 테이블에 접근하거나 SQL을 실행하거나 다른 작업을 수행할 수 있습니다. 컨텍스트는 서버 환경 안에서 동작합니다.

### ReceiverDescriptor 클래스 {#receiverdescriptor-class}

서버 측 수신기를 설명합니다:

- **ReceiverDescriptor&lt;TPayload, TArg, TResult&gt;(string className)** - 클래스 이름으로 디스크립터를 생성합니다
- **ReceiverDescriptor&lt;TArg&gt;(string className)** - 결과가 없는 수신기용 디스크립터를 생성합니다

수신기는 스트리밍 전에 서버에 배포되어 있어야 합니다. 클래스 이름은 서버에서 수신기 구현을 식별합니다.

### DataStreamerItem&lt;T&gt; 타입 {#datastreameritemt-type}

스트리밍된 항목을 연산 타입과 함께 감쌉니다:

- **Data** - 데이터 항목
- **OperationType** - 수행할 연산(Put, Remove)

단일 스트림에서 삽입, 갱신, 삭제가 섞인 연산을 스트리밍해야 할 때 사용합니다.
