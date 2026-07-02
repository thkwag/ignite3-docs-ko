---
title: SQL API
id: sql-api
sidebar_position: 4
---

# SQL API

SQL API는 Ignite 테이블에 대해 SQL 쿼리와 스크립트를 실행합니다. 매개변수화된 쿼리, 타입 지정 결과 매핑, 메타데이터 접근을 지원하며, 쿼리 결과를 사용하기 위한 결과 집합과 데이터 리더 패턴을 모두 지원합니다.

## 핵심 개념 {#key-concepts}

Ignite 3의 SQL 쿼리는 Calcite 기반 SQL 엔진을 사용해 분산 테이블에 대해 실행됩니다. 쿼리는 여러 테이블에 걸칠 수 있고 클러스터 노드 전반의 분산 실행을 활용합니다.

### 결과 처리 {#result-handling}

쿼리 결과는 두 가지 인터페이스로 제공됩니다. IResultSet은 전체 메타데이터 접근을 갖춘 비동기 열거를 제공하며 LINQ 작업에 적합합니다. IgniteDbDataReader는 ADO.NET 패턴과 호환되는 순방향 전용 접근을 제공합니다.

### 트랜잭션 통합 {#transaction-integration}

모든 SQL 작업은 선택적 트랜잭션 매개변수를 받습니다. 자동 커밋 모드에는 null을 전달하고, 트랜잭션 범위 안에서 쿼리를 실행하려면 ITransaction을 전달합니다. 이렇게 하면 SQL 작업과 키-값 작업 전반의 일관성이 보장됩니다.

### 지연 로딩 {#lazy-loading}

결과 집합은 지연 로딩을 사용합니다. 행은 열거할 때만 클러스터에서 가져옵니다. 이는 큰 결과 집합의 메모리 사용량을 줄여 주지만, 결과 집합을 한 번만 열거할 수 있음을 의미합니다.

## 사용 예시 {#usage-examples}

### 기본 쿼리 실행 {#basic-query-execution}

```csharp
var sql = client.Sql;

// Execute query returning untyped tuples
var statement = new SqlStatement("SELECT * FROM customers WHERE region = ?");
var resultSet = await sql.ExecuteAsync(null, statement, "West");

await foreach (var row in resultSet)
{
    Console.WriteLine($"Customer: {row["name"]}, Email: {row["email"]}");
}
```

### 타입 지정 쿼리 결과 {#typed-query-results}

```csharp
public class CustomerDto
{
    public long Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
}

var statement = new SqlStatement("SELECT id, name, email FROM customers WHERE region = ?");
var resultSet = await sql.ExecuteAsync<CustomerDto>(null, statement, "West");

await foreach (var customer in resultSet)
{
    Console.WriteLine($"{customer.Name}: {customer.Email}");
}
```

### 매개변수화된 쿼리 {#parameterized-queries}

```csharp
// Positional parameters
var stmt = new SqlStatement(
    "SELECT * FROM orders WHERE customer_id = ? AND order_date > ?");
var results = await sql.ExecuteAsync(
    null, stmt, customerId, DateTime.UtcNow.AddDays(-30));

await foreach (var order in results)
{
    Console.WriteLine($"Order {order["order_id"]}: ${order["amount"]}");
}
```

### DML 작업 {#dml-operations}

```csharp
// Insert
var insertStmt = new SqlStatement(
    "INSERT INTO customers (id, name, email) VALUES (?, ?, ?)");
var insertResult = await sql.ExecuteAsync(
    null, insertStmt, 100L, "Alice", "alice@example.com");

Console.WriteLine($"Inserted {insertResult.AffectedRows} rows");

// Update
var updateStmt = new SqlStatement(
    "UPDATE customers SET email = ? WHERE id = ?");
var updateResult = await sql.ExecuteAsync(
    null, updateStmt, "alice@newdomain.com", 100L);

Console.WriteLine($"Updated {updateResult.AffectedRows} rows");

// Delete
var deleteStmt = new SqlStatement("DELETE FROM customers WHERE id = ?");
var deleteResult = await sql.ExecuteAsync(null, deleteStmt, 100L);

Console.WriteLine($"Deleted {deleteResult.AffectedRows} rows");
```

### DDL 작업 {#ddl-operations}

```csharp
// Create table
var createStmt = new SqlStatement(@"
    CREATE TABLE IF NOT EXISTS products (
        id BIGINT PRIMARY KEY,
        name VARCHAR,
        price DECIMAL(10, 2)
    )");

var result = await sql.ExecuteAsync(null, createStmt);
Console.WriteLine($"Table created: {result.WasApplied}");

// Drop table
var dropStmt = new SqlStatement("DROP TABLE IF EXISTS products");
await sql.ExecuteAsync(null, dropStmt);
```

### 데이터 리더 사용 {#using-data-reader}

```csharp
var statement = new SqlStatement("SELECT * FROM orders WHERE amount > ?");
using var reader = await sql.ExecuteReaderAsync(null, statement, 100.0);

while (await reader.ReadAsync())
{
    var orderId = reader.GetInt64(0);
    var amount = reader.GetDecimal(3);
    Console.WriteLine($"Order {orderId}: ${amount}");
}
```

### 일괄 실행 {#batch-execution}

```csharp
var statement = new SqlStatement(
    "INSERT INTO customers (id, name, email) VALUES (?, ?, ?)");

var argSets = new[]
{
    new object[] { 1L, "Alice", "alice@example.com" },
    new object[] { 2L, "Bob", "bob@example.com" },
    new object[] { 3L, "Carol", "carol@example.com" }
};

var affectedRows = await sql.ExecuteBatchAsync(null, statement, argSets);

for (int i = 0; i < affectedRows.Length; i++)
{
    Console.WriteLine($"Statement {i}: {affectedRows[i]} rows affected");
}
```

### 스크립트 실행 {#script-execution}

```csharp
var script = new SqlStatement(@"
    CREATE TABLE temp_data (id BIGINT PRIMARY KEY, value VARCHAR);
    INSERT INTO temp_data VALUES (1, 'test');
    INSERT INTO temp_data VALUES (2, 'data');
");

await sql.ExecuteScriptAsync(script);
Console.WriteLine("Script executed successfully");
```

### 메타데이터가 있는 쿼리 {#query-with-metadata}

```csharp
var statement = new SqlStatement("SELECT id, name, email, created_at FROM customers");
var resultSet = await sql.ExecuteAsync(null, statement);

if (resultSet.Metadata != null)
{
    Console.WriteLine("Columns:");
    foreach (var column in resultSet.Metadata.Columns)
    {
        Console.WriteLine($"  {column.Name}: {column.Type} " +
            $"(nullable: {column.Nullable}, precision: {column.Precision})");
    }
}

await foreach (var row in resultSet)
{
    // Process rows
}
```

### 트랜잭션 쿼리 {#transactional-queries}

```csharp
var tx = await client.Transactions.BeginAsync();
try
{
    // Query within transaction
    var selectStmt = new SqlStatement(
        "SELECT balance FROM accounts WHERE id = ?");
    var result = await sql.ExecuteAsync<Account>(tx, selectStmt, accountId);

    var accounts = await result.ToListAsync();
    var account = accounts[0];

    // Update within same transaction
    var updateStmt = new SqlStatement(
        "UPDATE accounts SET balance = ? WHERE id = ?");
    await sql.ExecuteAsync(tx, updateStmt, account.Balance - 100, accountId);

    await tx.CommitAsync();
}
catch
{
    await tx.RollbackAsync();
    throw;
}
```

### 취소 지원 {#cancellation-support}

```csharp
using var cts = new CancellationTokenSource();
cts.CancelAfter(TimeSpan.FromSeconds(30));

try
{
    var statement = new SqlStatement("SELECT * FROM large_table");
    var resultSet = await sql.ExecuteAsync(null, statement, cts.Token);

    await foreach (var row in resultSet.WithCancellation(cts.Token))
    {
        // Process rows
    }
}
catch (OperationCanceledException)
{
    Console.WriteLine("Query cancelled");
}
```

### 결과 수집 {#collecting-results}

```csharp
var statement = new SqlStatement("SELECT id, name FROM customers");
var resultSet = await sql.ExecuteAsync<CustomerDto>(null, statement);

// Collect to list
var customers = await resultSet.ToListAsync();

// Collect to dictionary
var customerMap = await resultSet.ToDictionaryAsync(
    c => c.Id,
    c => c.Name);

// Custom collection
var customResult = await resultSet.CollectAsync(
    constructor: size => new List<CustomerDto>(size),
    accumulator: (list, customer) => list.Add(customer));
```

## 참조 {#reference}

### ISql 인터페이스 {#isql-interface}

쿼리 실행 메서드:

- **ExecuteAsync(ITransaction?, SqlStatement, params object?[]?)** - IResultSet&lt;IIgniteTuple&gt;을 반환하는 쿼리를 실행합니다
- **ExecuteAsync(ITransaction?, SqlStatement, CancellationToken, params object?[]?)** - 취소 토큰 포함
- **ExecuteAsync&lt;T&gt;(ITransaction?, SqlStatement, params object?[]?)** - IResultSet&lt;T&gt;를 반환하는 쿼리를 실행합니다
- **ExecuteAsync&lt;T&gt;(ITransaction?, SqlStatement, CancellationToken, params object?[]?)** - 취소 토큰 포함

데이터 리더 메서드:

- **ExecuteReaderAsync(ITransaction?, SqlStatement, params object?[]?)** - 순방향 전용 데이터 리더를 반환합니다
- **ExecuteReaderAsync(ITransaction?, SqlStatement, CancellationToken, params object?[]?)** - 취소 토큰 포함

일괄 처리 및 스크립트 메서드:

- **ExecuteScriptAsync(SqlStatement, params object?[]?)** - 여러 문으로 이루어진 스크립트를 실행합니다
- **ExecuteScriptAsync(SqlStatement, CancellationToken, params object?[]?)** - 취소 토큰 포함
- **ExecuteBatchAsync(ITransaction?, SqlStatement, IEnumerable&lt;IEnumerable&lt;object?&gt;&gt;, CancellationToken)** - 여러 인수 집합으로 문을 실행합니다(DML 전용)

### IResultSet&lt;T&gt; 인터페이스 {#iresultsett-interface}

속성:

- **Metadata** - 결과 집합 메타데이터(DML/DDL 문의 경우 null)
- **HasRowSet** - 결과에 행이 포함되면 true(SELECT 쿼리)
- **AffectedRows** - DML 작업으로 영향받은 행 수(DDL은 0, 해당 없으면 -1)
- **WasApplied** - 조건부 DDL 문(CREATE IF NOT EXISTS)이 적용되었으면 true

열거:

- 비동기 반복을 위해 **IAsyncEnumerable&lt;T&gt;**를 구현합니다
- 한 번만 열거할 수 있습니다

수집 메서드:

- **ToListAsync()** - 모든 행을 리스트로 수집합니다
- **ToDictionaryAsync&lt;TK, TV&gt;(Func&lt;T, TK&gt; keySelector, Func&lt;T, TV&gt; valSelector, IEqualityComparer&lt;TK&gt;?)** - 딕셔너리로 수집합니다
- **CollectAsync&lt;TResult&gt;(Func&lt;int, TResult&gt; constructor, Action&lt;TResult, T&gt; accumulator)** - 커스텀 수집 로직

리소스 관리:

- **IAsyncDisposable**과 **IDisposable**을 구현합니다
- 열거가 완료되면 자동으로 해제됩니다

### IResultSetMetadata 인터페이스 {#iresultsetmetadata-interface}

속성:

- **Columns** - 결과 순서대로 정렬된 읽기 전용 컬럼 메타데이터 목록

메서드:

- **IndexOf(string columnName)** - 이름으로 컬럼 인덱스를 가져옵니다(찾을 수 없으면 -1 반환)

### IColumnMetadata 인터페이스 {#icolumnmetadata-interface}

속성:

- **Name** - 컬럼 이름
- **Type** - 컬럼 데이터 타입(ColumnType 열거형)
- **Precision** - 컬럼 정밀도(해당 없으면 -1)
- **Scale** - 숫자 타입의 컬럼 스케일
- **Nullable** - 컬럼이 null 값을 허용하는지 여부
- **Origin** - 별칭이 붙은 컬럼의 원본 컬럼 정보

정밀도의 의미는 타입에 따라 다릅니다. 숫자 타입에서는 십진 자릿수를, 문자열 타입에서는 최대 길이를 나타냅니다.

### IgniteDbDataReader 클래스 {#ignitedbdatareader-class}

ADO.NET 패턴을 구현하는 순방향 전용 데이터 리더:

- ADO.NET 호환성을 위해 **DbDataReader**를 확장합니다
- 행 단위 접근을 위해 **ReadAsync()**를 지원합니다
- 타입 지정 **Get*** 메서드(GetInt64, GetString, GetDecimal 등)를 제공합니다
- null 확인을 위해 **IsDBNull()**을 지원합니다
- 리소스 정리를 위해 **IAsyncDisposable**을 구현합니다

순방향 전용 접근이 필요하거나 ADO.NET 기반 도구와의 호환성이 필요할 때 사용합니다.

### SqlStatement 레코드 {#sqlstatement-record}

매개변수가 있는 SQL 문을 나타냅니다:

- **SqlStatement(string query)** - 쿼리 텍스트로 문을 생성합니다
- ? 자리표시자로 위치 매개변수를 지원합니다
- 매개변수는 실행 메서드에 별도로 전달됩니다

쿼리 텍스트는 매개변수 자리표시자로 ?를 사용해야 합니다. 매개변수는 순서대로 바인딩됩니다.
