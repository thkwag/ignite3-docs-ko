---
title: ADO.NET API
id: ado-net-api
sidebar_position: 5
---

Apache Ignite는 `DbConnection`, `DbCommand`, `DbDataReader` 등 [ADO.NET](https://learn.microsoft.com/en-us/dotnet/framework/data/adonet/ado-net-overview) 클래스를 구현하며,
표준 ADO.NET 컴포넌트로 Ignite SQL과 상호작용할 수 있습니다.

## 시작하기 {#getting-started}

### 사전 요구 사항 {#prerequisites}

C# 씬 클라이언트를 사용하려면 .NET 8.0 이상이 필요합니다.

### 설치 {#installation}

C# 클라이언트는 NuGet으로 제공됩니다. 추가하려면 `add package` 명령을 사용하세요:

```bash
dotnet add package Apache.Ignite --version {version}
```

## 클러스터에 연결 {#connecting-to-cluster}

Apache Ignite 클러스터에 연결하려면 연결 문자열로 새 연결을 생성합니다:

```csharp
var connStr = "Endpoints=localhost:10800";
```

연결 문자열은 다음 매개변수를 사용합니다:

| 매개변수 | 설명 |
|-----------|-------------|
| Endpoints | 필수. 포트를 포함한 서버 주소를 쉼표로 구분한 목록입니다. |
| SocketTimeout | 소켓 작업 타임아웃 기간을 `hh:mm:ss` 형식으로 지정합니다. 기본값은 30초입니다. |
| OperationTimeout | 작업 타임아웃 기간을 `hh:mm:ss` 형식으로 지정합니다. 기본적으로 타임아웃이 없습니다. |
| HeartbeatInterval | 연결을 유지하기 위한 하트비트 메시지 간격을 `hh:mm:ss.f` 형식으로 지정합니다. 기본값은 30초입니다. |
| ReconnectInterval | 재연결 시도 간격을 `hh:mm:ss` 형식으로 지정합니다. 기본값은 30초입니다. |
| SslEnabled | SSL 암호화를 활성화/비활성화하는 불리언 값입니다. 기본값은 `False`입니다. |
| Username | 인증에 사용할 사용자 이름입니다. |
| Password | 인증에 사용할 비밀번호입니다. |

아래 예시는 모든 매개변수를 포함한 전체 연결 문자열을 보여줍니다

```text
Endpoints=localhost:10800,localhost:10801;SocketTimeout=00:00:10;OperationTimeout=00:03:30;
HeartbeatInterval=00:00:05.5;ReconnectInterval=00:01:00;SslEnabled=True;Username=user;Password=pass
```

연결 문자열을 사용해 `IgniteDbConnection` 클래스로 Ignite 클러스터에 연결을 맺을 수 있습니다:

```csharp
var connStr = "Endpoints=localhost:10800";
await using var conn = new IgniteDbConnection(connStr);
await conn.OpenAsync();
```

## SQL 명령 실행 {#executing-sql-commands}

`IgniteDbConnection.CreateCommand` 메서드로 명령을 생성한 뒤 [실행 명령](https://learn.microsoft.com/en-us/dotnet/framework/data/adonet/executing-a-command) 중 하나로 실행할 수 있습니다.

아래 예시는 명령이 행을 반환하지 않는 경우로, `ExecuteNonQueryAsync` 명령을 사용합니다.

```csharp
DbCommand cmd = conn.CreateCommand();
cmd.CommandText = "DROP TABLE IF EXISTS Person";
await cmd.ExecuteNonQueryAsync();
```

## 클러스터에서 데이터 읽기 {#reading-data-from-cluster}

[데이터 리더](https://learn.microsoft.com/en-us/dotnet/framework/data/adonet/retrieving-data-using-a-datareader)를 사용하는 방식과 비슷하게 클러스터에서 데이터를 가져올 수 있습니다.

아래 예시는 클러스터에서 데이터를 가져오는 방법을 보여줍니다:

```csharp
DbCommand cmd = conn.CreateCommand();
cmd.CommandText = "SELECT * FROM Person";
await using var reader = await cmd.ExecuteReaderAsync();

while (await reader.ReadAsync())
{
    Console.WriteLine($"Person [ID={reader.GetInt32(0)}, Name={reader.GetString(1)}]");
}
```

## 매개변수 사용 {#using-parameters}

:::note
Apache Ignite는 입력 매개변수만 지원합니다. 매개변수 타입은 SQL 쿼리 컨텍스트에서 자동으로 추론되므로 명시적으로 지정할 필요가 없습니다.
:::

Apache Ignite는 위치 매개변수를 사용하는 매개변수화된 쿼리를 지원합니다. `IgniteDbConnection.CreateParameter()` 메서드로 쿼리 텍스트의 `?` 자리표시자를 대체할 매개변수를 생성할 수 있습니다.

아래 예시는 쿼리에 매개변수를 지정하는 방법을 보여줍니다:

```csharp
DbCommand cmd = conn.CreateCommand();
cmd.CommandText = "INSERT INTO Person (ID, Name) VALUES (?, ?)";

DbParameter idParam = cmd.CreateParameter();
idParam.Value = 1;
cmd.Parameters.Add(idParam);

DbParameter nameParam = cmd.CreateParameter();
nameParam.Value = "John Doe";
cmd.Parameters.Add(nameParam);

await cmd.ExecuteNonQueryAsync();
```

매개변수는 쿼리에 나타나는 순서와 정확히 같은 순서로 추가해야 합니다. 첫 번째 `?`는 처음 추가한 매개변수에, 두 번째 `?`는 두 번째로 추가한 매개변수에 대응하는 식입니다.

null 값을 전달하려면 매개변수 값을 `null`로 설정하세요:

```csharp
DbParameter param = cmd.CreateParameter();
param.Value = null;
cmd.Parameters.Add(param);
```

## 트랜잭션 {#transactions}

:::note
Apache Ignite는 사용자 정의 격리 수준을 지원하지 않습니다. 모든 트랜잭션은 사실상 `Serializable`입니다.
:::

`DbConnection.BeginTransaction` 메서드로 트랜잭션을 시작할 수 있습니다.

트랜잭션이 커밋되기 전까지는 데이터베이스에 어떤 데이터도 커밋되지 않습니다. 롤백 메서드로 모든 변경 사항을 취소할 수 있습니다:

```csharp
await using DbTransaction tx = await conn.BeginTransactionAsync();
cmd.Transaction = tx;
// ...
// Commit the transaction.
await tx.CommitAsync();
// Roll back the transaction if needed.
// await tx.RollbackAsync();
```

## 전체 예시 {#full-example}

아래 예시는 ADO.NET으로 Apache Ignite 클러스터를 다루는 방법을 보여줍니다:

```csharp
var connStr = $"Endpoints=localhost:10800";
await using var conn = new IgniteDbConnection(connStr);
await conn.OpenAsync();

DbCommand createTableCmd = conn.CreateCommand();
createTableCmd.CommandText = "CREATE TABLE IF NOT EXISTS Person (ID INT PRIMARY KEY, Name VARCHAR)";
await createTableCmd.ExecuteNonQueryAsync();

DbCommand insertCmd = conn.CreateCommand();
insertCmd.CommandText = "INSERT INTO Person (ID, Name) VALUES (?, ?)";

await using DbTransaction tx = await conn.BeginTransactionAsync();
insertCmd.Transaction = tx;

DbParameter idParam = insertCmd.CreateParameter();
insertCmd.Parameters.Add(idParam);

DbParameter nameParam = insertCmd.CreateParameter();
insertCmd.Parameters.Add(nameParam);

for (var i = 1; i <= 3; i++)
{
    idParam.Value = i;
    nameParam.Value = "Person " + i;
    await insertCmd.ExecuteNonQueryAsync();
}

await tx.CommitAsync();

DbCommand selectCmd = conn.CreateCommand();
selectCmd.CommandText = "SELECT * FROM Person WHERE ID > ?";

DbParameter selectParam = selectCmd.CreateParameter();
selectParam.Value = 1;
selectCmd.Parameters.Add(selectParam);

await using var reader = await selectCmd.ExecuteReaderAsync();

for (var i = 0; i < reader.FieldCount; i++)
{
    Console.WriteLine($"{reader.GetName(i)}: {reader.GetFieldType(i)}");
}

while (await reader.ReadAsync())
{
    int id = reader.GetInt32(0);
    string name = reader.GetString(1);

    Console.WriteLine($"Person [ID={id}, Name={name}]");
}
```
