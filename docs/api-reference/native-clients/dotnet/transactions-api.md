---
title: Transactions API
id: transactions-api
sidebar_position: 5
---

# Transactions API

Transactions API는 여러 테이블에 걸친 여러 작업을 조율하기 위한 ACID 트랜잭션 지원을 제공합니다. 트랜잭션은 분산 데이터 수정에 대해 원자성, 일관성, 격리성, 내구성을 보장합니다.

## 핵심 개념 {#key-concepts}

트랜잭션은 여러 작업을 하나의 원자적 단위로 묶습니다. 모든 작업이 성공해 함께 커밋되거나, 모든 작업이 실패해 함께 롤백됩니다.

### 트랜잭션 라이프사이클 {#transaction-lifecycle}

Transactions API로 트랜잭션을 시작하고, 트랜잭션 객체를 데이터 작업에 전달한 다음, 끝나면 명시적으로 커밋하거나 롤백합니다. 트랜잭션은 사용 후 반드시 해제해야 합니다.

### 자동 커밋 모드 {#auto-commit-mode}

트랜잭션 매개변수로 null을 받는 작업은 자동 커밋 모드로 실행됩니다. 각 작업은 완료 직후 즉시 커밋됩니다. 조율이 필요 없는 단일 작업에 사용합니다.

### 트랜잭션 범위 {#transaction-scope}

여러 작업을 트랜잭션 범위에 포함하려면 같은 트랜잭션 객체를 여러 작업에 전달합니다. 작업은 서로 다른 테이블에 걸칠 수 있고 키-값 작업과 SQL 작업을 섞을 수 있습니다.

## 사용 예시 {#usage-examples}

### 기본 트랜잭션 {#basic-transaction}

```csharp
var transactions = client.Transactions;
var tx = await transactions.BeginAsync();

try
{
    var table = await client.Tables.GetTableAsync("accounts");
    var view = table.GetRecordView<Account>();

    // Multiple operations in transaction
    var account1 = new Account { Id = 1 };
    var account1Data = await view.GetAsync(tx, account1);

    var account2 = new Account { Id = 2 };
    var account2Data = await view.GetAsync(tx, account2);

    // Update balances
    account1Data.Value.Balance -= 100;
    account2Data.Value.Balance += 100;

    await view.UpsertAsync(tx, account1Data.Value);
    await view.UpsertAsync(tx, account2Data.Value);

    // Commit transaction
    await tx.CommitAsync();
}
catch
{
    await tx.RollbackAsync();
    throw;
}
finally
{
    await tx.DisposeAsync();
}
```

### using 문 패턴 {#using-statement-pattern}

```csharp
var transactions = client.Transactions;

await using (var tx = await transactions.BeginAsync())
{
    var table = await client.Tables.GetTableAsync("orders");
    var view = table.GetRecordView<Order>();

    var order = new Order
    {
        OrderId = 1000,
        CustomerId = 5,
        Amount = 99.99m,
        Status = "pending"
    };

    await view.UpsertAsync(tx, order);
    await tx.CommitAsync();
}
```

### 예외 처리가 있는 트랜잭션 {#transaction-with-exception-handling}

```csharp
try
{
    await using var tx = await client.Transactions.BeginAsync();

    var table = await client.Tables.GetTableAsync("inventory");
    var view = table.GetRecordView<Product>();

    var product = new Product { Id = 100 };
    var productData = await view.GetAsync(tx, product);

    if (!productData.HasValue)
    {
        throw new Exception("Product not found");
    }

    if (productData.Value.Stock < 10)
    {
        throw new Exception("Insufficient stock");
    }

    productData.Value.Stock -= 10;
    await view.UpsertAsync(tx, productData.Value);

    await tx.CommitAsync();
}
catch (Exception ex)
{
    Console.WriteLine($"Transaction failed: {ex.Message}");
    // Transaction automatically rolls back on exception
}
```

### RunInTransactionAsync 패턴 {#runintransactionasync-pattern}

```csharp
var transactions = client.Transactions;

// With return value
var newBalance = await transactions.RunInTransactionAsync(async tx =>
{
    var table = await client.Tables.GetTableAsync("accounts");
    var view = table.GetRecordView<Account>();

    var account = new Account { Id = 1 };
    var accountData = await view.GetAsync(tx, account);

    accountData.Value.Balance += 50;
    await view.UpsertAsync(tx, accountData.Value);

    return accountData.Value.Balance;
});

Console.WriteLine($"New balance: {newBalance}");

// Without return value
await transactions.RunInTransactionAsync(async tx =>
{
    var table = await client.Tables.GetTableAsync("logs");
    var view = table.GetRecordView<LogEntry>();

    var entry = new LogEntry
    {
        Id = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
        Message = "Transaction completed",
        Timestamp = DateTime.UtcNow
    };

    await view.UpsertAsync(tx, entry);
});
```

RunInTransactionAsync 메서드는 성공 시 자동으로 커밋하고 예외 발생 시 롤백합니다. 해제도 자동으로 처리합니다.

### 키-값 작업과 SQL 작업 혼합 {#mixing-key-value-and-sql-operations}

```csharp
await using var tx = await client.Transactions.BeginAsync();

// Key-value operation
var accountsTable = await client.Tables.GetTableAsync("accounts");
var accountsView = accountsTable.GetRecordView<Account>();

var account = new Account { Id = 1 };
var accountData = await accountsView.GetAsync(tx, account);
accountData.Value.Balance -= 100;
await accountsView.UpsertAsync(tx, accountData.Value);

// SQL operation in same transaction
var sql = client.Sql;
var insertStmt = new SqlStatement(
    "INSERT INTO transactions (account_id, amount, timestamp) VALUES (?, ?, ?)");
await sql.ExecuteAsync(tx, insertStmt, 1L, -100.0m, DateTime.UtcNow);

await tx.CommitAsync();
```

### 여러 테이블에 걸친 트랜잭션 {#cross-table-transaction}

```csharp
await using var tx = await client.Transactions.BeginAsync();

// Update orders table
var ordersTable = await client.Tables.GetTableAsync("orders");
var ordersView = ordersTable.GetRecordView<Order>();

var order = new Order
{
    OrderId = 2000,
    CustomerId = 10,
    Amount = 199.99m,
    Status = "confirmed"
};
await ordersView.UpsertAsync(tx, order);

// Update inventory table
var inventoryTable = await client.Tables.GetTableAsync("inventory");
var inventoryView = inventoryTable.GetRecordView<Product>();

var product = new Product { Id = 500 };
var productData = await inventoryView.GetAsync(tx, product);
productData.Value.Stock -= 1;
await inventoryView.UpsertAsync(tx, productData.Value);

await tx.CommitAsync();
```

### 읽기 전용 트랜잭션 {#read-only-transaction}

```csharp
var options = new TransactionOptions(ReadOnly: true);
await using var tx = await client.Transactions.BeginAsync(options);

var table = await client.Tables.GetTableAsync("products");
var view = table.GetRecordView<Product>();

// Read operations only
var product1 = await view.GetAsync(tx, new Product { Id = 1 });
var product2 = await view.GetAsync(tx, new Product { Id = 2 });

// No commit needed for read-only transactions
// Transaction automatically closes on dispose
```

읽기 전용 트랜잭션은 성능 이점을 제공하고 실수로 인한 수정을 방지할 수 있습니다.

### 트랜잭션 타임아웃 {#transaction-timeout}

```csharp
var options = new TransactionOptions(ReadOnly: false, TimeoutMillis: 30000);

await using var tx = await client.Transactions.BeginAsync(options);

try
{
    // Perform operations
    var table = await client.Tables.GetTableAsync("data");
    var view = table.GetRecordView<DataRecord>();

    // ... operations ...

    await tx.CommitAsync();
}
catch (IgniteException ex)
{
    Console.WriteLine($"Transaction timeout or conflict: {ex.Message}");
    throw;
}
```

## 참조 {#reference}

### ITransactions 인터페이스 {#itransactions-interface}

메서드:

- **ValueTask&lt;ITransaction&gt; BeginAsync()** - 기본 옵션으로 새 트랜잭션을 시작합니다
- **ValueTask&lt;ITransaction&gt; BeginAsync(TransactionOptions options)** - 지정한 옵션으로 새 트랜잭션을 시작합니다
- **Task&lt;T&gt; RunInTransactionAsync&lt;T&gt;(Func&lt;ITransaction, Task&lt;T&gt;&gt; func, TransactionOptions options = default)** - 트랜잭션 안에서 함수를 실행하고 결과를 반환합니다
- **Task RunInTransactionAsync(Func&lt;ITransaction, Task&gt; func, TransactionOptions options = default)** - 트랜잭션 안에서 함수를 실행합니다(반환값 없음)

RunInTransactionAsync 메서드는 트랜잭션 라이프사이클을 자동으로 처리합니다. 성공적으로 완료되면 커밋하고 예외가 발생하면 롤백합니다. 트랜잭션은 함수가 완료된 후 해제됩니다.

### ITransaction 인터페이스 {#itransaction-interface}

속성:

- **bool IsReadOnly** - 트랜잭션이 읽기 전용인지 여부

메서드:

- **Task CommitAsync()** - 트랜잭션을 커밋해 모든 변경을 영구적으로 반영합니다
- **Task RollbackAsync()** - 트랜잭션을 롤백해 모든 변경을 버립니다

리소스 관리:

- **IAsyncDisposable**과 **IDisposable**을 구현합니다
- 사용 후 반드시 해제해야 합니다
- 명시적 커밋 없이 해제하면 자동 롤백이 발생합니다

### TransactionOptions 레코드 구조체 {#transactionoptions-record-struct}

트랜잭션 동작을 구성하는 읽기 전용 레코드 구조체입니다. 명명된 매개변수로 생성합니다:

```csharp
new TransactionOptions(ReadOnly: true)
new TransactionOptions(ReadOnly: false, TimeoutMillis: 30000)
```

매개변수:

- **ReadOnly** (bool) - 트랜잭션을 읽기 전용으로 표시합니다(기본값: false). 읽기 전용 트랜잭션은 특정 시점의 데이터에 대한 스냅샷 뷰를 제공합니다. 락이 없어 일반 트랜잭션보다 성능이 좋지만 데이터 수정을 허용하지 않습니다.
- **TimeoutMillis** (long) - 밀리초 단위 트랜잭션 타임아웃(기본값: 0). 값이 0이면 ignite.transaction.timeout 구성 속성으로 설정된 기본 타임아웃을 사용합니다.

타임아웃은 트랜잭션이 자동 롤백되기 전까지 활성 상태로 유지될 수 있는 시간을 제어합니다.

### 모범 사례 {#best-practices}

**항상 트랜잭션을 해제하세요.** using 문이나 명시적 해제를 사용합니다. 해제되지 않은 트랜잭션은 클러스터 리소스를 붙잡고 있습니다.

**해제하기 전에 명시적으로 커밋하세요.** 해제 시 암묵적으로 롤백되면 로직 오류가 감춰질 수 있습니다.

**트랜잭션을 짧게 유지하세요.** 그러면 락 경합이 줄고 처리량이 향상됩니다. 오래 실행되는 트랜잭션은 클러스터 성능에 영향을 줍니다.

**예외를 올바르게 처리하세요.** 그래야 작업이 실패할 때 롤백이 확실히 일어납니다. 트랜잭션 로직을 try-catch 블록으로 감싸세요.

**자동 라이프사이클 관리로 충분한 간단한 경우에는 RunInTransactionAsync를 사용하세요.** 이렇게 하면 상용구 코드가 줄고 정리가 확실하게 이루어집니다.

**조율해야 하는 모든 작업에 트랜잭션을 전달하세요.** 관련된 작업에서 null과 트랜잭션 매개변수를 섞으면 원자성이 깨집니다.
