---
title: Transactions API
id: transactions-api
sidebar_position: 6
---

# Transactions API

Transactions API는 여러 테이블이나 여러 작업에 걸친 연산에 ACID 보장을 제공합니다. 애플리케이션은 반드시 함께 성공하거나 함께 실패해야 하는 관련 업데이트를 실행할 때 트랜잭션으로 데이터 일관성을 확보합니다.

## 핵심 개념 {#key-concepts}

읽기-쓰기 트랜잭션은 직렬화 가능 격리(SERIALIZABLE isolation)로 실행됩니다. 트랜잭션 안의 작업은 트랜잭션이 시작된 시점의 데이터를 일관된 뷰로 참조합니다. 변경 내용은 커밋 전까지 다른 트랜잭션에 보이지 않습니다.

이 API는 명시적 트랜잭션 관리와 클로저 기반 암묵적 트랜잭션을 지원합니다. 클로저 기반 트랜잭션은 정상 완료 시 자동으로 커밋하고 예외 발생 시 롤백하므로, 상용구 코드를 줄입니다.

트랜잭션은 타임아웃을 구성할 수 있습니다. 읽기-쓰기 트랜잭션의 기본값은 30초입니다. 읽기 전용 트랜잭션은 쓰기 오버헤드를 없애 읽기 작업에 최적화합니다.

## 암묵적 트랜잭션 {#implicit-transactions}

runInTransaction으로 라이프사이클을 자동으로 관리합니다:

```java
ignite.transactions().runInTransaction(tx -> {
    RecordView<Tuple> view = ignite.tables().table("accounts").recordView();

    Tuple key = Tuple.create().set("id", 1);
    Tuple record = view.get(tx, key);

    int balance = record.intValue("balance");
    record.set("balance", balance + 100);

    view.put(tx, record);
});
```

클로저가 정상적으로 완료되면 트랜잭션이 자동으로 커밋됩니다. 예외가 발생하면 자동 롤백됩니다.

## 트랜잭션의 반환 값 {#return-values-from-transactions}

트랜잭션 클로저에서 값을 반환합니다:

```java
int newBalance = ignite.transactions().runInTransaction(tx -> {
    RecordView<Tuple> view = ignite.tables().table("accounts").recordView();

    Tuple key = Tuple.create().set("id", 1);
    Tuple record = view.get(tx, key);

    int balance = record.intValue("balance") + 100;
    record.set("balance", balance);
    view.put(tx, record);

    return balance;
});

System.out.println("New balance: " + newBalance);
```

## 명시적 트랜잭션 {#explicit-transactions}

트랜잭션 라이프사이클을 명시적으로 관리합니다:

```java
Transaction tx = ignite.transactions().begin();
try {
    RecordView<Tuple> view = ignite.tables().table("accounts").recordView();

    Tuple key = Tuple.create().set("id", 1);
    Tuple record = view.get(tx, key);

    record.set("balance", record.intValue("balance") + 100);
    view.put(tx, record);

    tx.commit();
} catch (Exception e) {
    tx.rollback();
    throw e;
}
```

명시적 관리는 커밋 시점과 오류 처리를 직접 제어할 수 있게 합니다.

## 읽기 전용 트랜잭션 {#read-only-transactions}

읽기 전용 트랜잭션으로 읽기 작업을 최적화합니다:

```java
TransactionOptions options = new TransactionOptions().readOnly(true);

ignite.transactions().runInTransaction(options, tx -> {
    RecordView<Tuple> view = ignite.tables().table("users").recordView();

    Tuple key = Tuple.create().set("id", 1);
    Tuple record = view.get(tx, key);

    System.out.println("User: " + record.stringValue("name"));
});
```

읽기 전용 트랜잭션은 쓰기 조율 오버헤드를 없애 읽기 작업의 성능을 높입니다.

## 트랜잭션 타임아웃 {#transaction-timeouts}

트랜잭션 타임아웃을 구성합니다:

```java
TransactionOptions options = new TransactionOptions().timeoutMillis(60000);

Transaction tx = ignite.transactions().begin(options);
```

타임아웃을 초과한 트랜잭션은 자동으로 롤백됩니다. 이렇게 하면 오래 실행되는 트랜잭션이 다른 작업을 차단하는 것을 막습니다.

## 다중 테이블 트랜잭션 {#multi-table-transactions}

여러 테이블에 걸쳐 작업을 실행합니다:

```java
ignite.transactions().runInTransaction(tx -> {
    RecordView<Tuple> accounts = ignite.tables().table("accounts").recordView();
    RecordView<Tuple> history = ignite.tables().table("history").recordView();

    Tuple accountKey = Tuple.create().set("id", 1);
    Tuple account = accounts.get(tx, accountKey);

    int balance = account.intValue("balance");
    account.set("balance", balance - 50);
    accounts.put(tx, account);

    Tuple historyRecord = Tuple.create()
        .set("account_id", 1)
        .set("amount", -50)
        .set("timestamp", LocalDateTime.now());
    history.put(tx, historyRecord);
});
```

두 작업은 함께 커밋되거나 함께 롤백됩니다.

## 비동기 트랜잭션 {#asynchronous-transactions}

트랜잭션을 비동기로 생성합니다:

```java
ignite.transactions().beginAsync().thenCompose(tx ->
    ignite.tables().tableAsync("accounts")
        .thenCompose(table -> {
            RecordView<Tuple> view = table.recordView();
            Tuple key = Tuple.create().set("id", 1);
            return view.getAsync(tx, key)
                .thenCompose(record -> {
                    record.set("balance", record.intValue("balance") + 100);
                    return view.putAsync(tx, record);
                })
                .thenCompose(v -> tx.commitAsync());
        })
).exceptionally(ex -> {
    return null;
});
```

비동기 트랜잭션을 사용하면 논블로킹으로 트랜잭션을 처리할 수 있습니다.

## 비동기 트랜잭션 클로저 {#async-transaction-closures}

논블로킹 트랜잭션 실행에는 비동기 클로저를 사용합니다:

```java
CompletableFuture<Integer> resultFuture =
    ignite.transactions().runInTransactionAsync(tx ->
        ignite.tables().tableAsync("accounts")
            .thenCompose(table -> {
                RecordView<Tuple> view = table.recordView();
                Tuple key = Tuple.create().set("id", 1);
                return view.getAsync(tx, key);
            })
            .thenApply(record -> {
                int balance = record.intValue("balance") + 100;
                record.set("balance", balance);
                return balance;
            })
    );

resultFuture.thenAccept(balance ->
    System.out.println("New balance: " + balance)
);
```

## SQL과 트랜잭션 {#sql-and-transactions}

트랜잭션 안에서 SQL을 실행합니다:

```java
ignite.transactions().runInTransaction(tx -> {
    try (ResultSet<SqlRow> rs = ignite.sql().execute(
        tx,
        "SELECT balance FROM accounts WHERE id = ?",
        1
    )) {
        SqlRow row = rs.next();
        int balance = row.intValue("balance");

        ignite.sql().execute(
            tx,
            "UPDATE accounts SET balance = ? WHERE id = ?",
            balance + 100,
            1
        ).close();
    }
});
```

같은 트랜잭션 안의 SQL 문과 테이블 작업은 일관된 데이터를 참조합니다.

## 트랜잭션 상태 {#transaction-status}

트랜잭션 속성을 확인합니다:

```java
Transaction tx = ignite.transactions().begin();

boolean readOnly = tx.isReadOnly();
System.out.println("Read-only: " + readOnly);

// Use transaction
tx.commit();
```

## 멱등 작업 {#idempotent-operations}

커밋과 롤백 작업은 멱등합니다:

```java
Transaction tx = ignite.transactions().begin();
try {
    // Operations
    tx.commit();
} finally {
    tx.rollback(); // Safe even if already committed
}
```

이미 완료된 트랜잭션에 커밋이나 롤백을 호출해도 아무 효과가 없습니다.

## 오류 처리 {#error-handling}

트랜잭션 관련 예외를 처리합니다:

```java
try {
    ignite.transactions().runInTransaction(tx -> {
        // Operations
    });
} catch (RetriableTransactionException e) {
    // Transaction can be retried
    System.err.println("Retry transaction: " + e.getMessage());
} catch (TransactionException e) {
    // Transaction error
    System.err.println("Transaction failed: " + e.getMessage());
}
```

RetriableTransactionException은 재시도하면 성공할 수 있는 충돌을 나타냅니다. 그 밖의 TransactionException 하위 타입은 재시도할 수 없는 오류를 나타냅니다.

## 예외 타입 {#exception-types}

일반적인 트랜잭션 예외:

```java
try {
    ignite.transactions().runInTransaction(tx -> {
        // Operations
    });
} catch (IncompatibleSchemaException e) {
    // Schema changed during transaction
    System.err.println("Schema incompatible: " + e.getMessage());
} catch (MismatchingTransactionOutcomeException e) {
    // Inconsistent commit/rollback across replicas
    System.err.println("Outcome mismatch: " + e.getMessage());
}
```

IncompatibleSchemaException은 트랜잭션 실행 중에 테이블 스키마가 바뀌면 발생합니다. MismatchingTransactionOutcomeException은 트랜잭션 결과가 일관되지 않음을 나타냅니다.

## 참조 {#reference}

- 트랜잭션 관리자: `org.apache.ignite.tx.IgniteTransactions`
- 트랜잭션 핸들: `org.apache.ignite.tx.Transaction`
- 구성: `org.apache.ignite.tx.TransactionOptions`
- 예외: `org.apache.ignite.tx.TransactionException`, `org.apache.ignite.tx.RetriableTransactionException`, `org.apache.ignite.tx.IncompatibleSchemaException`, `org.apache.ignite.tx.MismatchingTransactionOutcomeException`

### IgniteTransactions 메서드 {#ignitetransactions-methods}

- `Transaction begin()` - 기본값으로 트랜잭션 시작
- `Transaction begin(TransactionOptions)` - 구성과 함께 시작
- `CompletableFuture<Transaction> beginAsync()` - 비동기 시작
- `CompletableFuture<Transaction> beginAsync(TransactionOptions)` - 구성과 함께 비동기 시작
- `void runInTransaction(Consumer<Transaction>)` - 트랜잭션 안에서 실행
- `<T> T runInTransaction(Function<Transaction, T>)` - 반환 값과 함께 실행
- `void runInTransaction(TransactionOptions, Consumer<Transaction>)` - 옵션과 함께 실행
- `<T> T runInTransaction(TransactionOptions, Function<Transaction, T>)` - 옵션과 반환 값과 함께 실행
- `<T> CompletableFuture<T> runInTransactionAsync(Function<Transaction, CompletableFuture<T>>)` - 비동기 실행

### Transaction 메서드 {#transaction-methods}

- `void commit()` - 트랜잭션 커밋
- `CompletableFuture<Void> commitAsync()` - 비동기 커밋
- `void rollback()` - 트랜잭션 롤백
- `CompletableFuture<Void> rollbackAsync()` - 비동기 롤백
- `boolean isReadOnly()` - 읽기 전용 상태 확인

### TransactionOptions 구성 {#transactionoptions-configuration}

- `readOnly(boolean)` - 읽기 전용 모드 설정
- `timeoutMillis(long)` - 트랜잭션 타임아웃(밀리초) 설정

### 트랜잭션 격리 {#transaction-isolation}

읽기-쓰기 트랜잭션은 직렬화 가능 격리를 사용합니다. 각 트랜잭션은 첫 읽기나 쓰기 접근에서 락을 획득하고, 트랜잭션이 커밋되거나 롤백될 때까지 락을 유지합니다. 변경 내용은 커밋 전까지 동시 트랜잭션에 보이지 않습니다. 읽기 전용 트랜잭션은 락을 획득하지 않고 데이터의 스냅샷 뷰를 제공합니다.

### 트랜잭션 모범 사례 {#transaction-best-practices}

- 라이프사이클 자동 관리에는 암묵적 트랜잭션(runInTransaction)을 사용하세요
- 작업 차단을 막으려면 적절한 타임아웃을 구성하세요
- 데이터를 읽기만 하는 작업에는 읽기 전용 트랜잭션을 사용하세요
- RetriableTransactionException은 작업을 재시도해 처리하세요
- 락 경합을 최소화하려면 트랜잭션을 짧게 유지하세요
- 트랜잭션 안에서 사용자 상호작용이나 느린 작업을 피하세요
