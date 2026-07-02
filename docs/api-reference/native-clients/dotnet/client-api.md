---
title: Client API
id: client-api
sidebar_position: 1
---

# Client API

Client API는 연결을 관리하고 Ignite 3의 모든 기능에 접근할 수 있게 합니다. IIgniteClient는 .NET 애플리케이션에서 Ignite 클러스터와 상호작용하는 진입점 역할을 합니다.

## 핵심 개념 {#key-concepts}

IIgniteClient는 클러스터 노드와의 연결을 관리하고 테이블, SQL, 트랜잭션, 컴퓨트 등 다른 Ignite API에 접근할 수 있게 합니다. 클라이언트는 고가용성과 부하 분산을 위해 여러 노드와의 연결을 자동으로 유지합니다.

### 연결 관리 {#connection-management}

클라이언트는 클러스터 노드와 연결 풀을 유지합니다. 구성에 여러 엔드포인트를 지정하면 클라이언트가 사용 가능한 모든 노드에 연결하고 요청을 분산합니다. 노드에 장애가 발생하면 클라이언트는 구성된 재연결 간격을 사용해 자동으로 재연결합니다.

### 스레드 안전성 {#thread-safety}

IIgniteClient의 모든 작업은 스레드 안전합니다. 애플리케이션 전체에서 클라이언트 인스턴스 하나를 공유하고, 추가 동기화 없이 여러 스레드에서 메서드를 호출할 수 있습니다.

## 사용 예시 {#usage-examples}

### 기본 연결 {#basic-connection}

```csharp
using Apache.Ignite;

var cfg = new IgniteClientConfiguration("localhost:10800");
using var client = await IgniteClient.StartAsync(cfg);
```

### 다중 엔드포인트 {#multiple-endpoints}

```csharp
var cfg = new IgniteClientConfiguration
{
    Endpoints = { "node1:10800", "node2:10800", "node3:10800" }
};
using var client = await IgniteClient.StartAsync(cfg);
```

### 연결 라이프사이클 {#connection-lifecycle}

```csharp
var cfg = new IgniteClientConfiguration("localhost:10800")
{
    SocketTimeout = TimeSpan.FromSeconds(60),
    HeartbeatInterval = TimeSpan.FromSeconds(30),
    ReconnectInterval = TimeSpan.FromSeconds(10)
};

using var client = await IgniteClient.StartAsync(cfg);

// Check active connections
var connections = client.GetConnections();
foreach (var conn in connections)
{
    Console.WriteLine($"Connected to {conn.Node.Name}");
}
```

### 로깅 구성 {#logging-configuration}

```csharp
using Microsoft.Extensions.Logging;

var loggerFactory = LoggerFactory.Create(builder =>
    builder.AddConsole().SetMinimumLevel(LogLevel.Debug));

var cfg = new IgniteClientConfiguration("localhost:10800")
{
    LoggerFactory = loggerFactory
};

using var client = await IgniteClient.StartAsync(cfg);
```

### 작업 타임아웃 {#operation-timeout}

```csharp
var cfg = new IgniteClientConfiguration("localhost:10800")
{
    OperationTimeout = TimeSpan.FromSeconds(30)
};

using var client = await IgniteClient.StartAsync(cfg);
```

이 타임아웃은 개별 작업에 적용됩니다. 오래 실행되는 쿼리나 트랜잭션은 클러스터에 여러 차례 왕복하지 않는 한 영향을 받지 않습니다.

### 재시도 정책 {#retry-policy}

```csharp
using Apache.Ignite;

var cfg = new IgniteClientConfiguration("localhost:10800")
{
    RetryPolicy = new RetryReadPolicy()
};

using var client = await IgniteClient.StartAsync(cfg);
```

재시도 정책은 실패한 요청을 자동으로 재시도하는 동작을 제어합니다. RetryReadPolicy는 읽기 작업만 재시도하고, RetryNonePolicy는 재시도를 비활성화합니다.

### 핵심 API 접근 {#accessing-core-apis}

```csharp
using var client = await IgniteClient.StartAsync(cfg);

// Tables API
var tables = client.Tables;
var table = await tables.GetTableAsync("my_table");

// SQL API
var sql = client.Sql;
var resultSet = await sql.ExecuteAsync(null, "SELECT * FROM my_table");

// Transactions API
var transactions = client.Transactions;
var tx = await transactions.BeginAsync();

// Compute API
var compute = client.Compute;
```

## 참조 {#reference}

### IIgniteClient 인터페이스 {#iigniteclient-interface}

메인 클라이언트 인터페이스는 다음을 제공합니다:

- **Configuration** - 시작 시 사용한 클라이언트 구성 접근
- **GetConnections()** - 클러스터 노드와의 활성 연결 반환
- **Tables** - 테이블 관리 및 데이터 작업 접근
- **Sql** - SQL 쿼리 실행
- **Transactions** - 트랜잭션 관리
- **Compute** - 분산 컴퓨트

### IgniteClientConfiguration

구성 속성:

- **Endpoints** - 연결할 클러스터 노드 주소 목록
- **LoggerFactory** - 진단용 Microsoft.Extensions.Logging.ILoggerFactory
- **SocketTimeout** - 핸드셰이크와 하트비트를 포함한 소켓 작업 타임아웃(기본값: 30초)
- **OperationTimeout** - 개별 작업 타임아웃(기본값: 무한)
- **HeartbeatInterval** - 하트비트 메시지 간격(기본값: 30초)
- **ReconnectInterval** - 백그라운드 재연결 시도 간격(기본값: 30초)
- **RetryPolicy** - 실패한 요청 재시도 정책(기본값: RetryReadPolicy)
- **SslStreamFactory** - SSL이 필요할 때 SSL 스트림을 생성하는 팩토리
- **Authenticator** - 클러스터 접근을 위한 인증기

### 상수 {#constants}

- **DefaultPort** - 10800
- **DefaultSocketTimeout** - 30초
- **DefaultHeartbeatInterval** - 30초
- **DefaultReconnectInterval** - 30초
