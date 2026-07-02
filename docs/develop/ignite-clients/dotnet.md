---
id: dotnet-client
title: .NET 클라이언트
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Ignite 3 클라이언트는 표준 소켓 연결로 클러스터에 연결합니다. Ignite 2.x와 달리 Ignite 3에는 씬 클라이언트(thin client)와 씩 클라이언트(thick client)의 구분이 없으며, 모든 클라이언트가 씬 클라이언트입니다.

클라이언트는 클러스터 토폴로지에 합류하지 않고, 데이터를 전혀 보유하지 않으며, 컴퓨트 연산의 대상으로도 사용되지 않습니다.

## 시작하기 {#getting-started}

### 사전 요구 사항 {#prerequisites}

C# 씬 클라이언트를 사용하려면 .NET 8.0 이상이 필요합니다.

### 설치 {#installation}

C# 클라이언트는 NuGet으로 제공됩니다. 추가하려면 `add package` 명령어를 사용하세요:

```bash
dotnet add package Apache.Ignite --version 3.0.0
```

## 클러스터에 연결 {#connecting-to-cluster}

클라이언트를 초기화하려면 `IgniteClient` 클래스를 사용하고 구성 정보를 전달합니다:

<Tabs groupId="languages">
<TabItem value="dotnet" label=".NET">

```csharp
var clientCfg = new IgniteClientConfiguration
{
  Endpoints = { "127.0.0.1" }
};
using var client = await IgniteClient.StartAsync(clientCfg);
```

</TabItem>
</Tabs>

## 인증 {#authentication}

인증 정보를 전달하려면 `IgniteClient` 빌더에 전달합니다:

<Tabs groupId="languages">
<TabItem value="dotnet" label=".NET">

```csharp
var cfg = new IgniteClientConfiguration("127.0.0.1:10800")
{
	Authenticator = new BasicAuthenticator
	{
		Username = "myUser",
		Password = "myPassword"
	}
};
IIgniteClient client = await IgniteClient.StartAsync(cfg);
```

</TabItem>
</Tabs>

### 제한 사항 {#limitations}

이러한 매핑에 사용할 수 있는 사용자 타입에는 제한이 있습니다. 일부 제한은 공통이고, 일부는 사용하는 프로그래밍 언어에 따라 달라지는 플랫폼별 제한입니다.

- 평면 필드 구조만 지원합니다. 즉, 사용자 객체를 중첩할 수 없습니다. Ignite 테이블, 그리고 그에 따른 튜플 자체가 평면 구조이기 때문입니다.
- 필드는 Ignite 타입에 매핑해야 합니다.
- 사용자 타입의 모든 필드는 테이블 컬럼에 매핑하거나 명시적으로 제외해야 합니다.
- 테이블의 모든 컬럼은 사용자 타입의 어떤 필드에 매핑해야 합니다.
- *.NET 전용*: 모든 필드를 Ignite 타입에 매핑할 수 있는 한 어떤 타입(class, struct, record)이든 지원합니다.

### 사용 예시 {#usage-examples}

<Tabs groupId="languages">
<TabItem value="dotnet" label=".NET">

```csharp
public class Account
{
  public long Id { get; set; }
  public long Balance { get; set; }

  [NotMapped]
  public Guid UnmappedId { get; set; }
}
```

</TabItem>
</Tabs>

## 의존성 주입 사용 {#using-dependency-injection}

Ignite 클라이언트는 클라이언트 인스턴스를 초기화할 때 [의존성 주입](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection)을 지원합니다.

이 방식으로 DI 컨테이너에서 클라이언트를 더 간단하게 초기화할 수 있습니다:

- DI 컨테이너에 `IgniteClientGroup`을 등록합니다:

```cpp
builder.Services.AddSingleton<IgniteClientGroup>(_ => new IgniteClientGroup(
    new IgniteClientGroupConfiguration
    {
        Size = 3,
        ClientConfiguration = new("localhost"),
    }));
```

- 메서드에서 생성한 그룹의 인스턴스를 사용합니다:

```cpp
public async Task<IActionResult> Index([FromServices] IgniteClientGroup igniteGroup)
{
    IIgnite ignite = await igniteGroup.GetIgniteAsync();
    var tables = await ignite.Tables.GetTablesAsync();
    return Ok(tables);
}
```

## SQL API {#sql-api}

Ignite 3는 SQL 중심으로 설계되었으며, SQL API가 데이터를 다루는 기본 방법입니다. 지원하는 SQL 문에 대한 자세한 내용은 [SQL 참조](/sql/reference/language-definition/ddl) 섹션에서 확인할 수 있습니다. SQL 요청은 다음과 같이 보낼 수 있습니다:

<Tabs groupId="languages">
<TabItem value="dotnet" label=".NET">

```csharp
IResultSet<IIgniteTuple> resultSet = await client.Sql.ExecuteAsync(transaction: null, "select name from tbl where id = ?", 42);
List<IIgniteTuple> rows = await resultSet.ToListAsync();
IIgniteTuple row = rows.Single();
Debug.Assert(row["name"] as string == "John Doe");
```

</TabItem>
</Tabs>

### 일괄 SQL 실행 {#batch-sql-execution}

지정한 DML 문을 인수 집합마다 한 번씩 실행하고, 실행할 때마다 영향받은 행 수를 반환할 수 있습니다.

:::note
`INSERT`, `UPDATE`, `DELETE` 문만 지원합니다.
:::

일괄 실행을 수행하려면 다음 매개변수로 `ExecuteBatchAsync()` 메서드를 구현해야 합니다:

```csharp
Task<long[]> ExecuteBatchAsync(
    ITransaction? transaction,
    SqlStatement statement,
    IEnumerable<IEnumerable<object?>> args,
    CancellationToken cancellationToken = default
);
```

#### 매개변수 {#parameters}

- `transaction` - 일괄 처리를 실행할 선택적 트랜잭션.
- `statement` - `args`의 각 항목에 대해 실행할 SQL 문.
- `args` - 인수 목록의 컬렉션. 문은 내부 컬렉션마다 한 번씩 실행됩니다. 비어 있거나 빈 행을 포함해서는 안 됩니다.
- `cancellationToken` - 작업을 취소하는 토큰.

#### 예시 {#example}

이 예시는 업데이트 횟수 배열을 반환합니다. 각 요소는 `args`의 해당 항목에 대해 문을 실행하여 영향받은 행 수에 대응합니다. 반환된 배열의 길이는 인수 집합의 개수와 같습니다.

```csharp
long[] res = await sql.ExecuteBatchAsync(
    transaction: null,
    statement: "INSERT INTO Person (Id, Name) VALUES (?, ?)",
    args:
    [
        [1, "Alice"],
        [2, "Bob" ],
        [3, "Charlie"]
    ]
);
// res => [1, 1, 1]
```

### SQL 스크립트 {#sql-scripts}

기본 API는 SQL 문을 한 번에 하나씩 실행합니다. 큰 SQL 문을 실행하려면 `executeScript()` 메서드에 전달하세요. 이렇게 전달한 문은 순서대로 실행됩니다.

<Tabs groupId="languages">
<TabItem value="dotnet" label=".NET">

```csharp
string script =
    "CREATE TABLE IF NOT EXISTS Person (id int primary key, city_id int, name varchar, age int, company varchar);" +
    "INSERT INTO Person (1,3, 'John', 43, 'Sample')";

await Client.Sql.ExecuteScriptAsync(script);
```

</TabItem>
</Tabs>

:::note
각 문의 실행은 첫 페이지를 반환할 준비가 되면 완료된 것으로 간주합니다. 따라서 큰 데이터 집합을 다룰 때는 같은 스크립트 내 뒤쪽 문이 SELECT 문에 영향을 줄 수 있습니다.
:::

## 트랜잭션 {#transactions}

Ignite 3의 모든 테이블 작업은 트랜잭션으로 처리됩니다. 모든 Table API와 SQL API 호출의 첫 번째 인수로 명시적 트랜잭션을 전달할 수 있습니다. 명시적 트랜잭션을 전달하지 않으면 호출마다 암시적 트랜잭션이 생성됩니다.

트랜잭션은 다음과 같이 명시적으로 전달할 수 있습니다:

<Tabs groupId="languages">
<TabItem value="dotnet" label=".NET">

```csharp
var accounts = table.GetKeyValueView<long, Account>();
await accounts.PutAsync(transaction: null, 42, new Account(16_000));

await using ITransaction tx = await client.Transactions.BeginAsync();

(Account account, bool hasValue) = await accounts.GetAsync(tx, 42);
account = account with { Balance = account.Balance + 500 };

await accounts.PutAsync(tx, 42, account);

Debug.Assert((await accounts.GetAsync(tx, 42)).Value.Balance == 16_500);

await tx.RollbackAsync();

Debug.Assert((await accounts.GetAsync(null, 42)).Value.Balance == 16_000);

public record Account(decimal Balance);
```

</TabItem>
</Tabs>

## Table API {#table-api}

특정 테이블에서 테이블 작업을 실행하려면 해당 테이블의 특정 뷰를 가져와 그 메서드 중 하나를 사용합니다. 새 테이블은 SQL API로만 만들 수 있습니다.

테이블을 다룰 때는 내부적으로 키-값 쌍의 집합인 내장 Tuple 타입을 사용하거나, 타입 지정 접근을 위해 데이터를 직접 정의한 타입에 매핑할 수 있습니다. 테이블은 다음과 같이 다룹니다:

### 테이블 인스턴스 가져오기 {#getting-a-table-instance}

테이블 인스턴스를 얻으려면 `ITables.GetTableAsync(string name)`을 사용합니다. `ITables.GetTablesAsync` 메서드로 기존 테이블을 모두 나열할 수도 있습니다.

<Tabs groupId="languages">
<TabItem value="dotnet" label=".NET">

```csharp
var existingTables = await Client.Tables.GetTablesAsync();
var firstTable = existingTables[0];

var myTable = await Client.Tables.GetTableAsync("MY_TABLE");
```

</TabItem>
</Tabs>

### 기본 테이블 작업 {#basic-table-operations}

테이블을 가져왔으면 테이블 레코드를 어떻게 다룰지 선택할 수 있도록 특정 뷰를 가져와야 합니다.

#### 튜플 레코드 뷰 {#tuple-record-view}

튜플 레코드 뷰입니다. 테이블 튜플을 직접 다루는 데 사용합니다.

<Tabs groupId="languages">
<TabItem value="dotnet" label=".NET">

```csharp
IRecordView<IIgniteTuple> view = table.RecordBinaryView;

IIgniteTuple fullRecord = new IgniteTuple
{
  ["id"] = 42,
  ["name"] = "John Doe"
};

await view.UpsertAsync(transaction: null, fullRecord);

IIgniteTuple keyRecord = new IgniteTuple { ["id"] = 42 };
(IIgniteTuple value, bool hasValue) = await view.GetAsync(transaction: null, keyRecord);

Debug.Assert(hasValue);
Debug.Assert(value.FieldCount == 2);
Debug.Assert(value["id"] as int? == 42);
Debug.Assert(value["name"] as string == "John Doe");
```

</TabItem>
</Tabs>

#### 레코드 뷰 {#record-view}

사용자 타입에 매핑된 레코드 뷰입니다. 테이블 튜플에 매핑된 사용자 객체로 테이블을 다루는 데 사용합니다.

<Tabs groupId="languages">
<TabItem value="dotnet" label=".NET">

```csharp
var pocoView = table.GetRecordView<Poco>();

await pocoView.UpsertAsync(transaction: null, new Poco(42, "John Doe"));
var (value, hasValue) = await pocoView.GetAsync(transaction: null, new Poco(42));

Debug.Assert(hasValue);
Debug.Assert(value.Name == "John Doe");

public record Poco(long Id, string? Name = null);
```

</TabItem>
</Tabs>

#### 키-값 튜플 뷰 {#key-value-tuple-view}

튜플 키-값 뷰입니다. 키 튜플과 값 튜플을 분리해 테이블을 다루는 데 사용합니다.

<Tabs groupId="languages">
<TabItem value="dotnet" label=".NET">

```csharp
IKeyValueView<IIgniteTuple, IIgniteTuple> kvView = table.KeyValueBinaryView;

IIgniteTuple key = new IgniteTuple { ["id"] = 42 };
IIgniteTuple val = new IgniteTuple { ["name"] = "John Doe" };

await kvView.PutAsync(transaction: null, key, val);
(IIgniteTuple? value, bool hasValue) = await kvView.GetAsync(transaction: null, key);

Debug.Assert(hasValue);
Debug.Assert(value.FieldCount == 1);
Debug.Assert(value["name"] as string == "John Doe");
```

</TabItem>
</Tabs>

#### 키-값 뷰 {#key-value-view}

사용자 객체를 사용하는 키-값 뷰입니다. 테이블 튜플에 매핑된 키 사용자 객체와 값 사용자 객체로 테이블을 다루는 데 사용합니다.

<Tabs groupId="languages">
<TabItem value="dotnet" label=".NET">

```csharp
IKeyValueView<long, Poco> kvView = table.GetKeyValueView<long, Poco>();

await kvView.PutAsync(transaction: null, 42, new Poco(Id: 0, Name: "John Doe"));
(Poco? value, bool hasValue) = await kvView.GetAsync(transaction: null, 42);

Debug.Assert(hasValue);
Debug.Assert(value.Name == "John Doe");

public record Poco(long Id, string? Name = null);
```

</TabItem>
</Tabs>

## 데이터 스트리밍 {#streaming-data}

대량의 데이터를 스트리밍하려면 데이터 스트리머를 사용하세요. 데이터 스트리밍은 데이터를 더 빠르고 효율적으로 적재하고, 정리하고, 최적으로 분산하는 방법을 제공합니다. 데이터 스트리머는 데이터 스트림을 받아 데이터 항목을 클러스터 전체에 분산하고, 처리는 그곳에서 이루어집니다. 데이터 스트리밍은 모든 테이블 뷰에서 사용할 수 있습니다.

![Data Streaming](/img/data_streaming.png)

데이터 스트리밍은 최소 한 번(at-least-once) 전달을 보장합니다.

### Data Streamer API 사용 {#using-data-streamer-api}

<Tabs groupId="languages">
<TabItem value="dotnet" label=".NET">

```csharp
var options = DataStreamerOptions.Default with { PageSize = 10 };
var data = Enumerable.Range(0, Count).Select(x => new IgniteTuple { ["id"] = 1L, ["name"] = "foo" }).ToList();

await TupleView.StreamDataAsync(data.ToAsyncEnumerable(), options);
```

</TabItem>
</Tabs>

## 클라이언트 메트릭 {#client-metrics}

.NET 클라이언트는 `Apache.Ignite` 미터 이름으로 `System.Diagnostics.Metrics` API를 통해 메트릭을 노출합니다. 예를 들어, [dotnet-counters](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-counters) 도구로 Ignite 메트릭에 접근하는 방법은 다음과 같습니다:

```bash
dotnet-counters monitor --counters Apache.Ignite,System.Runtime --process-id PID
```

리스너를 만들어 코드에서 메트릭을 가져올 수도 있습니다:

```csharp
var listener = new MeterListener();
listener.InstrumentPublished = (instrument, meterListener) =>
{
    if (instrument.Meter.Name == "Apache.Ignite")
    {
        meterListener.EnableMeasurementEvents(instrument);
    }
};
listener.SetMeasurementEventCallback<int>(
    (instrument, measurement, tags, state) => Console.WriteLine($"{instrument.Name}: {measurement}"));

listener.Start();
```

### 사용 가능한 .NET 메트릭 {#available-net-metrics}

| 메트릭 이름 | 설명 |
|-------------|-------------|
| connections-active | 현재 활성 연결 수. |
| connections-established | 수립된 연결 수. |
| connections-lost | 끊어진 연결 수. |
| connections-lost-timeout | 타임아웃으로 끊어진 연결 수. |
| handshakes-failed | 실패한 핸드셰이크 수. |
| handshakes-failed-timeout | 타임아웃으로 실패한 핸드셰이크 수. |
| requests-active | 현재 활성 요청 수. |
| requests-sent | 전송된 요청 수. |
| requests-completed | 완료된 요청 수. 요청은 응답을 받으면 완료됩니다. |
| requests-retried | 요청 재시도 수. |
| requests-failed | 실패한 요청 수. |
| bytes-sent | 전송된 바이트 수. |
| bytes-received | 수신된 바이트 수. |
| streamer-batches-sent | 전송된 데이터 스트리머 묶음 수. |
| streamer-items-sent | 전송된 데이터 스트리머 항목 수. |
| streamer-batches-active | 전송 중인 데이터 스트리머 묶음 수. |
| streamer-items-queued | 대기 중인 데이터 스트리머 항목 수. |

## 로깅 {#logging}

로깅을 활성화하려면 `IgniteClientConfiguration.LoggerFactory` 속성을 `Microsoft.Extensions.Logging.ILoggerFactory` 표준 API의 인스턴스로 설정하세요. 자세한 내용은 [.NET의 표준 로깅](https://docs.microsoft.com/en-us/dotnet/core/extensions/logging)을 참고하세요.

### 예시 {#examples}

아래 예시는 `Microsoft.Extensions.Logging.Console` 패키지로 콘솔 로깅을 구성하는 방법을 보여줍니다:

<Tabs groupId="languages">
<TabItem value="dotnet" label=".NET">

```csharp
var cfg = new IgniteClientConfiguration
{
    LoggerFactory = LoggerFactory.Create(builder => builder.AddConsole().SetMinimumLevel(LogLevel.Debug))
};
```

</TabItem>
</Tabs>

또는 `Serilog.Extensions.Logging`과 `Serilog.Sinks.Console` 패키지로 [Serilog](https://serilog.net/)를 사용해 로깅을 구성하는 방법은 다음과 같습니다:

<Tabs groupId="languages">
<TabItem value="dotnet" label=".NET">

```csharp
var cfg = new IgniteClientConfiguration
{
    LoggerFactory = LoggerFactory.Create(builder =>
        builder.AddSerilog(new LoggerConfiguration()
            .MinimumLevel.Debug()
            .WriteTo.Console()
            .CreateLogger()))
};
```

</TabItem>
</Tabs>
