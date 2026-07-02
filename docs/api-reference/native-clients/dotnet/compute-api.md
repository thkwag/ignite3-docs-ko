---
title: Compute API
id: compute-api
sidebar_position: 6
---

# Compute API

Compute API는 클러스터 노드 전반에서 분산 작업을 실행합니다. 작업은 최고의 성능을 위해 데이터와 함께 배치되어 실행되며, 실행 컨텍스트로 전체 Ignite API에 접근합니다.

## 핵심 개념 {#key-concepts}

컴퓨트 작업(compute job)은 클러스터에 배포되어 IComputeJob을 구현하는 C# 클래스입니다. Compute API로 작업을 제출해 실행하며, API는 지정된 대상에 따라 작업을 적절한 노드로 라우팅합니다.

### 작업 대상 {#job-targets}

작업 대상은 작업이 실행될 위치를 제어합니다. 특정 노드나 노드 이름을 대상으로 지정하거나, 데이터와 함께 배치된 파티션을 대상으로 지정해 데이터 가까이에서 작업을 실행합니다. 클라이언트는 대상에 따라 작업 제출을 적절한 클러스터 노드로 라우팅합니다.

### 브로드캐스트 실행 {#broadcast-execution}

브로드캐스트 작업은 여러 노드에서 동시에 실행됩니다. 클러스터 전체 또는 노드의 일부에서 실행해야 하는 작업에 이 패턴을 사용합니다.

### 실행 추적 {#execution-tracking}

작업을 제출하면 진행 상황을 모니터링하고 결과를 가져올 수 있는 실행 핸들이 반환됩니다. 실행 인터페이스로 작업 상태를 조회하고, 우선순위를 변경하고, 완료를 기다릴 수 있습니다.

## 사용 예시 {#usage-examples}

### 기본 작업 실행 {#basic-job-execution}

```csharp
// Define job class (must be deployed to cluster)
public class HelloJob : IComputeJob<string, string>
{
    public IMarshaller<string>? InputMarshaller => null;
    public IMarshaller<string>? ResultMarshaller => null;

    public async ValueTask<string> ExecuteAsync(
        IJobExecutionContext context,
        string arg,
        CancellationToken cancellationToken)
    {
        return $"Hello, {arg}!";
    }
}

// Submit job
var compute = client.Compute;
var jobDescriptor = new JobDescriptor<string, string>(typeof(HelloJob));

var nodes = await client.GetClusterNodesAsync();
var target = JobTarget.Node(nodes[0]);

var execution = await compute.SubmitAsync(target, jobDescriptor, "World");
var result = await execution.GetResultAsync();

Console.WriteLine(result);  // "Hello, World!"
```

### 데이터 접근이 있는 작업 {#job-with-data-access}

```csharp
public class DataProcessingJob : IComputeJob<long, decimal>
{
    public IMarshaller<long>? InputMarshaller => null;
    public IMarshaller<decimal>? ResultMarshaller => null;

    public async ValueTask<decimal> ExecuteAsync(
        IJobExecutionContext context,
        long customerId,
        CancellationToken cancellationToken)
    {
        // Access Ignite APIs through context
        var tables = context.Ignite.Tables;
        var ordersTable = await tables.GetTableAsync("orders");
        var view = ordersTable.GetRecordView<Order>();

        // Execute SQL through context
        var sql = context.Ignite.Sql;
        var statement = new SqlStatement(
            "SELECT SUM(amount) FROM orders WHERE customer_id = ?");
        var resultSet = await sql.ExecuteAsync<SumResult>(
            null, statement, customerId);

        var sum = await resultSet.FirstOrDefaultAsync();
        return sum?.Total ?? 0m;
    }
}

// Submit job colocated with data
var compute = client.Compute;
var jobDescriptor = new JobDescriptor<long, decimal>(typeof(DataProcessingJob));

var target = JobTarget.Colocated("orders", 12345L);
var execution = await compute.SubmitAsync(target, jobDescriptor, 12345L);
var totalAmount = await execution.GetResultAsync();

Console.WriteLine($"Total orders: ${totalAmount}");
```

### 브로드캐스트 실행 {#broadcast-execution-1}

```csharp
public class DiagnosticsJob : IComputeJob<string, NodeInfo>
{
    public IMarshaller<string>? InputMarshaller => null;
    public IMarshaller<NodeInfo>? ResultMarshaller => null;

    public async ValueTask<NodeInfo> ExecuteAsync(
        IJobExecutionContext context,
        string arg,
        CancellationToken cancellationToken)
    {
        // Gather node information
        return new NodeInfo
        {
            NodeName = Environment.MachineName,
            Timestamp = DateTime.UtcNow,
            MemoryUsed = GC.GetTotalMemory(false)
        };
    }
}

// Broadcast to all nodes
var compute = client.Compute;
var jobDescriptor = new JobDescriptor<string, NodeInfo>(typeof(DiagnosticsJob));

var nodes = await client.GetClusterNodesAsync();
var target = BroadcastTarget.Nodes(nodes);

var execution = await compute.SubmitBroadcastAsync(
    target, jobDescriptor, "diagnostics");

// Get results from all nodes
foreach (var jobExecution in execution.JobExecutions)
{
    var nodeInfo = await jobExecution.GetResultAsync();
    Console.WriteLine($"{nodeInfo.NodeName}: {nodeInfo.MemoryUsed} bytes");
}
```

### 커스텀 마샬러를 사용하는 작업 {#job-with-custom-marshallers}

```csharp
public class ComplexDataJob : IComputeJob<CustomInput, CustomOutput>
{
    // Provide custom serialization
    public IMarshaller<CustomInput>? InputMarshaller => new CustomInputMarshaller();
    public IMarshaller<CustomOutput>? ResultMarshaller => new CustomOutputMarshaller();

    public async ValueTask<CustomOutput> ExecuteAsync(
        IJobExecutionContext context,
        CustomInput input,
        CancellationToken cancellationToken)
    {
        // Process complex input
        return new CustomOutput
        {
            ProcessedData = input.RawData.Select(x => x * 2).ToList()
        };
    }
}
```

### 작업 실행 모니터링 {#monitoring-job-execution}

```csharp
var compute = client.Compute;
var jobDescriptor = new JobDescriptor<string, string>(typeof(LongRunningJob));

var target = JobTarget.Node(nodes[0]);
var execution = await compute.SubmitAsync(target, jobDescriptor, "input");

// Monitor job state
while (true)
{
    var state = await execution.GetStateAsync();
    if (state == null)
    {
        Console.WriteLine("Job information expired");
        break;
    }

    Console.WriteLine($"Job state: {state.Status}");

    if (state.Status == JobStatus.Completed ||
        state.Status == JobStatus.Failed ||
        state.Status == JobStatus.Canceled)
    {
        break;
    }

    await Task.Delay(1000);
}

// Get final result
try
{
    var result = await execution.GetResultAsync();
    Console.WriteLine($"Result: {result}");
}
catch (Exception ex)
{
    Console.WriteLine($"Job failed: {ex.Message}");
}
```

### 작업 우선순위 변경 {#changing-job-priority}

```csharp
var execution = await compute.SubmitAsync(target, jobDescriptor, "input");

// Increase priority
var changed = await execution.ChangePriorityAsync(10);
if (changed == true)
{
    Console.WriteLine("Priority changed");
}
else if (changed == false)
{
    Console.WriteLine("Job already executing or completed");
}
else
{
    Console.WriteLine("Job not found (retention expired)");
}
```

### 콜로케이션 실행 {#colocated-execution}

```csharp
// Execute job on node that owns the data
var compute = client.Compute;
var jobDescriptor = new JobDescriptor<long, ProcessingResult>(typeof(ColocatedProcessor));

// Target partition that contains the key
var target = JobTarget.Colocated("customers", customerId);
var execution = await compute.SubmitAsync(target, jobDescriptor, customerId);
var result = await execution.GetResultAsync();
```

콜로케이션 실행은 데이터를 저장한 노드에서 작업을 실행해 네트워크 트래픽을 최소화합니다.

### 예외 처리 {#exception-handling}

```csharp
try
{
    var execution = await compute.SubmitAsync(target, jobDescriptor, "input");
    var result = await execution.GetResultAsync();
}
catch (IgniteException ex)
{
    Console.WriteLine($"Job execution failed: {ex.Message}");
}
catch (TimeoutException ex)
{
    Console.WriteLine($"Job timed out: {ex.Message}");
}
```

### 취소 지원 {#cancellation-support}

```csharp
using var cts = new CancellationTokenSource();
cts.CancelAfter(TimeSpan.FromSeconds(30));

try
{
    var execution = await compute.SubmitAsync(
        target, jobDescriptor, "input", cts.Token);
    var result = await execution.GetResultAsync();
}
catch (OperationCanceledException)
{
    Console.WriteLine("Job submission cancelled");
}
```

## 참조 {#reference}

### ICompute 인터페이스 {#icompute-interface}

작업 제출 메서드:

- **SubmitAsync&lt;TTarget, TArg, TResult&gt;(IJobTarget&lt;TTarget&gt; target, JobDescriptor&lt;TArg, TResult&gt; jobDescriptor, TArg arg, CancellationToken cancellationToken)** - 취소와 함께 작업을 대상에 제출합니다
- **SubmitAsync&lt;TTarget, TArg, TResult&gt;(IJobTarget&lt;TTarget&gt; target, JobDescriptor&lt;TArg, TResult&gt; jobDescriptor, TArg arg)** - 작업을 대상에 제출합니다

브로드캐스트 메서드:

- **SubmitBroadcastAsync&lt;TTarget, TArg, TResult&gt;(IBroadcastJobTarget&lt;TTarget&gt; target, JobDescriptor&lt;TArg, TResult&gt; jobDescriptor, TArg arg, CancellationToken cancellationToken)** - 취소와 함께 작업을 브로드캐스트합니다
- **SubmitBroadcastAsync&lt;TTarget, TArg, TResult&gt;(IBroadcastJobTarget&lt;TTarget&gt; target, JobDescriptor&lt;TArg, TResult&gt; jobDescriptor, TArg arg)** - 작업을 브로드캐스트합니다

맵리듀스 메서드:

- **SubmitMapReduceAsync&lt;TArg, TResult&gt;(TaskDescriptor&lt;TArg, TResult&gt; taskDescriptor, TArg arg, CancellationToken cancellationToken)** - 취소와 함께 맵리듀스 태스크를 제출합니다
- **SubmitMapReduceAsync&lt;TArg, TResult&gt;(TaskDescriptor&lt;TArg, TResult&gt; taskDescriptor, TArg arg)** - 맵리듀스 태스크를 제출합니다

### IComputeJob&lt;TArg, TResult&gt; 인터페이스 {#icomputejobtarg-tresult-interface}

속성:

- **InputMarshaller** - 작업 인수용 선택적 커스텀 마샬러
- **ResultMarshaller** - 작업 결과용 선택적 커스텀 마샬러

메서드:

- **ExecuteAsync(IJobExecutionContext context, TArg arg, CancellationToken cancellationToken)** - 서버에서 작업을 실행합니다

작업은 제출하기 전에 클러스터 노드에 배포되어 있어야 합니다. 작업 구현은 실행 컨텍스트로 전체 Ignite API에 접근합니다.

### IJobExecutionContext 인터페이스 {#ijobexecutioncontext-interface}

속성:

- **Ignite** - 서버 환경을 위한 전체 Ignite API 접근

컨텍스트를 사용해 작업 안에서 테이블에 접근하거나 SQL을 실행하거나 트랜잭션을 시작하거나 다른 작업을 수행할 수 있습니다. 모든 작업은 클러스터 노드의 서버 컨텍스트에서 실행됩니다.

### IJobExecution&lt;T&gt; 인터페이스 {#ijobexecutiont-interface}

속성:

- **Id** - 고유 작업 식별자(Guid)
- **Node** - 작업이 실행되는 클러스터 노드

메서드:

- **GetResultAsync()** - 작업 결과를 기다렸다가 가져옵니다
- **GetStateAsync()** - 현재 작업 상태를 가져옵니다(보존 기간이 만료되면 null 반환)
- **ChangePriorityAsync(int priority)** - 작업 우선순위를 변경합니다(변경되면 true, 실행 중이거나 완료됐으면 false, 찾을 수 없으면 null 반환)

실행 핸들은 제출된 작업을 추적합니다. 이를 사용해 진행 상황을 모니터링하거나 우선순위를 조정하거나 완료를 기다립니다.

### IJobTarget&lt;T&gt; 인터페이스 {#ijobtargett-interface}

속성:

- **Data** - 대상 데이터(노드, 파티션 등)

정적 팩토리 메서드(JobTarget 클래스):

- **JobTarget.Node(IClusterNode node)** - 특정 노드를 대상으로 지정합니다
- **JobTarget.AnyNode(IEnumerable&lt;IClusterNode&gt; nodes)** - 컬렉션에서 임의의 노드를 대상으로 지정합니다
- **JobTarget.AnyNode(params IClusterNode[] nodes)** - 배열에서 임의의 노드를 대상으로 지정합니다
- **JobTarget.Colocated(string tableName, TKey key)** - 키를 포함하는 파티션을 대상으로 지정합니다
- **JobTarget.Colocated(QualifiedName tableName, TKey key)** - 스키마로 정규화된 테이블 이름으로 키를 포함하는 파티션을 대상으로 지정합니다

### JobDescriptor&lt;TArg, TResult&gt; 클래스 {#jobdescriptortarg-tresult-class}

생성자:

- **JobDescriptor(Type type)** - IComputeJob&lt;TArg, TResult&gt;을 구현하는 작업 타입으로 디스크립터를 생성합니다
- **JobDescriptor(string jobClassName)** - 서버 측 실행을 위해 Java 작업 클래스 이름으로 디스크립터를 생성합니다

작업 타입은 IComputeJob&lt;TArg, TResult&gt;을 구현해야 합니다. .NET 작업에는 Type 생성자를, 서버의 Java 작업에는 string 생성자를 사용합니다.

### JobState 레코드 {#jobstate-record}

작업 상태 정보:

- **Id** - 작업 식별자(Guid)
- **Status** - 현재 작업 상태(JobStatus 열거형)
- **CreateTime** - 작업 생성 타임스탬프
- **StartTime** - 작업 시작 타임스탬프(아직 시작되지 않았으면 null)
- **FinishTime** - 작업 완료 타임스탬프(아직 완료되지 않았으면 null)

상태 정보는 클러스터 구성에 따라 만료될 수 있습니다. 상태 정보를 더 이상 사용할 수 없으면 GetStateAsync는 null을 반환합니다.

### JobStatus 열거형 {#jobstatus-enum}

가능한 작업 상태 값:

- **Queued** - 작업이 제출되어 실행 시작을 기다리는 중입니다
- **Executing** - 작업이 현재 실행 중입니다
- **Failed** - 작업이 실행 도중 예기치 않게 종료되었습니다
- **Completed** - 작업이 성공적으로 실행되어 결과를 반환했습니다
- **Canceling** - 작업이 취소 명령을 받았지만 아직 실행 중입니다
- **Canceled** - 작업이 성공적으로 취소되었습니다

### 모범 사례 {#best-practices}

**제출하기 전에 작업을 배포하세요.** 클라이언트가 작업을 제출하려면 먼저 클러스터 노드에 작업이 존재해야 합니다.

**작업이 특정 데이터에 접근할 때는 콜로케이션 실행을 사용하세요.** 이렇게 하면 컴퓨트 노드와 데이터 노드 간의 네트워크 전송이 사라집니다.

**작업이 한 가지 일에 집중하도록 하세요.** 각 작업은 특정 기능 하나를 수행해야 합니다. 복잡한 워크플로에는 여러 작업을 사용하세요.

**작업 안에서 예외를 처리하세요.** 처리되지 않은 예외는 작업을 실패시키고 클라이언트에 오류를 반환합니다.

**작업 직렬화를 고려하세요.** 작업 인수와 결과는 네트워크 경계를 넘나듭니다. 큰 데이터에는 효율적인 직렬화나 커스텀 마샬러를 사용하세요.

**오래 실행되는 작업을 모니터링하세요.** GetStateAsync로 진행 상황을 추적하고 장애를 조기에 감지하세요.
