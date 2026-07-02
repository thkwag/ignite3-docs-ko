---
title: Transactions API
id: transactions-api
sidebar_position: 4
---

# Transactions API

Transactions API는 테이블과 SQL 문에 걸친 작업에 명시적 트랜잭션 제어를 제공합니다. 트랜잭션은 원자적이고 일관되며 격리되고 내구성 있는 데이터 수정을 보장합니다.

## 핵심 개념 {#key-concepts}

### 트랜잭션 라이프사이클 {#transaction-lifecycle}

트랜잭션은 트랜잭션 팩터리로 시작합니다. 커밋되거나 롤백될 때까지 활성 상태로 유지됩니다. 트랜잭션 안의 작업은 그 트랜잭션이 만든 커밋되지 않은 변경을 봅니다. 다른 트랜잭션은 해당 트랜잭션이 시작되기 전의 데이터를 봅니다.

### 명시적 트랜잭션과 암시적 트랜잭션 {#explicit-vs-implicit-transactions}

**명시적 트랜잭션**은 수동 커밋이나 롤백이 필요합니다. 작업에 트랜잭션 포인터를 전달합니다. 이렇게 하면 트랜잭션 경계를 직접 제어할 수 있습니다.

**암시적 트랜잭션**은 각 작업이 끝난 뒤 자동으로 커밋됩니다. 암시적 트랜잭션을 쓰려면 작업에 `nullptr`를 전달합니다.

### 트랜잭션 격리 {#transaction-isolation}

트랜잭션은 스냅샷 격리를 사용합니다. 각 트랜잭션은 트랜잭션 시작 시점의 일관된 데이터 스냅샷을 봅니다. 트랜잭션 안의 변경은 그 트랜잭션에는 보이지만, 커밋 전까지 다른 트랜잭션에는 보이지 않습니다.

### 트랜잭션 옵션 {#transaction-options}

옵션으로 트랜잭션 동작을 구성합니다:

- **timeout** - 최대 트랜잭션 지속 시간
- **read_only** - 읽기 전용 워크로드에 맞춘 최적화

## 기본 사용법 {#basic-usage}

### 트랜잭션 시작 {#beginning-transactions}

기본 옵션으로 트랜잭션을 시작합니다:

```cpp
using namespace ignite;

auto transactions = client.get_transactions();
auto tx = transactions.begin();
```

옵션을 지정해 시작합니다:

```cpp
transaction_options opts;
opts.set_timeout_millis(30000);  // 30 seconds
opts.set_read_only(false);

auto tx = transactions.begin(opts);
```

비동기 시작을 사용합니다:

```cpp
transactions.begin_async([](ignite_result<transaction> result) {
    if (!result.has_error()) {
        auto tx = std::move(result).value();
        // Use transaction
    }
});
```

### 트랜잭션 커밋 {#committing-transactions}

변경을 저장하려면 커밋합니다:

```cpp
auto tx = transactions.begin();

// Perform operations
tx.commit();
```

비동기 커밋을 사용합니다:

```cpp
tx.commit_async([](ignite_result<void> result) {
    if (!result.has_error()) {
        std::cout << "Transaction committed" << std::endl;
    }
});
```

### 트랜잭션 롤백 {#rolling-back-transactions}

변경을 취소하려면 롤백합니다:

```cpp
auto tx = transactions.begin();

try {
    // Perform operations
    tx.commit();
} catch (const ignite_error& e) {
    tx.rollback();
    throw;
}
```

비동기 롤백을 사용합니다:

```cpp
tx.rollback_async([](ignite_result<void> result) {
    if (!result.has_error()) {
        std::cout << "Transaction rolled back" << std::endl;
    }
});
```

## 테이블 작업 {#table-operations}

### 레코드 뷰에서 트랜잭션 사용 {#using-transactions-with-record-views}

레코드 뷰 작업에 트랜잭션 포인터를 전달합니다:

```cpp
auto tx = client.get_transactions().begin();

auto table = client.get_tables().get_table("accounts").value();
auto view = table.get_record_binary_view();

try {
    ignite_tuple record{
        {"id", 42},
        {"name", "John Doe"},
        {"balance", 1000.0}
    };

    view.upsert(&tx, record);

    auto retrieved = view.get(&tx, ignite_tuple{{"id", 42}});

    tx.commit();
} catch (const ignite_error& e) {
    tx.rollback();
    throw;
}
```

### 키-값 뷰에서 트랜잭션 사용 {#using-transactions-with-key-value-views}

키-값 작업에 트랜잭션을 전달합니다:

```cpp
auto tx = client.get_transactions().begin();

auto table = client.get_tables().get_table("accounts").value();
auto view = table.get_key_value_binary_view();

try {
    ignite_tuple key{{"id", 42}};
    ignite_tuple value{{"name", "John Doe"}, {"balance", 1000.0}};

    view.put(&tx, key, value);
    auto retrieved = view.get(&tx, key);

    tx.commit();
} catch (const ignite_error& e) {
    tx.rollback();
    throw;
}
```

### 일괄 작업 {#batch-operations}

일괄 작업은 트랜잭션 안에서 실행됩니다:

```cpp
auto tx = client.get_transactions().begin();

std::vector<ignite_tuple> records{
    {{"id", 1}, {"name", "Alice"}, {"balance", 1000.0}},
    {{"id", 2}, {"name", "Bob"}, {"balance", 2000.0}},
    {{"id", 3}, {"name", "Charlie"}, {"balance", 3000.0}}
};

try {
    view.upsert_all(&tx, records);
    tx.commit();
} catch (const ignite_error& e) {
    tx.rollback();
    throw;
}
```

## SQL 작업 {#sql-operations}

### 트랜잭션에서 SQL 실행 {#executing-sql-in-transactions}

SQL 작업에 트랜잭션을 전달합니다:

```cpp
auto tx = client.get_transactions().begin();

try {
    auto sql = client.get_sql();

    sql.execute(&tx, nullptr,
        sql_statement("INSERT INTO accounts VALUES (?, ?, ?)"),
        {42, std::string("John Doe"), 1000.0});

    sql.execute(&tx, nullptr,
        sql_statement("UPDATE accounts SET balance = ? WHERE id = ?"),
        {1500.0, 42});

    tx.commit();
} catch (const ignite_error& e) {
    tx.rollback();
    throw;
}
```

### 여러 테이블에 걸친 트랜잭션 {#cross-table-transactions}

여러 테이블에 걸쳐 작업을 실행합니다:

```cpp
auto tx = client.get_transactions().begin();

try {
    auto sql = client.get_sql();

    // Debit from one account
    sql.execute(&tx, nullptr,
        sql_statement("UPDATE accounts SET balance = balance - ? WHERE id = ?"),
        {100.0, 1});

    // Credit to another account
    sql.execute(&tx, nullptr,
        sql_statement("UPDATE accounts SET balance = balance + ? WHERE id = ?"),
        {100.0, 2});

    tx.commit();
} catch (const ignite_error& e) {
    tx.rollback();
    throw;
}
```

## 트랜잭션 옵션 {#transaction-options-1}

### 타임아웃 구성 {#configuring-timeout}

최대 트랜잭션 지속 시간을 설정합니다:

```cpp
transaction_options opts;
opts.set_timeout_millis(60000);  // 60 seconds

auto tx = transactions.begin(opts);
```

타임아웃이 0이면 타임아웃이 없습니다:

```cpp
opts.set_timeout_millis(0);  // No timeout
```

### 읽기 전용 트랜잭션 {#read-only-transactions}

읽기 작업에 맞춰 최적화합니다:

```cpp
transaction_options opts;
opts.set_read_only(true);

auto tx = transactions.begin(opts);

// Only read operations allowed
auto result = view.get(&tx, key);

tx.commit();  // Lightweight commit for read-only
```

읽기 전용 트랜잭션은 쓰기 락과 충돌 감지를 피해 더 나은 성능을 제공합니다.

### 옵션 연쇄 {#chaining-options}

플루언트 API로 옵션 세터를 연쇄 호출합니다:

```cpp
transaction_options opts;
opts.set_timeout_millis(30000)
    .set_read_only(false);

auto tx = transactions.begin(opts);
```

## 트랜잭션 가시성 {#transaction-visibility}

### 커밋되지 않은 변경 {#uncommitted-changes}

변경은 트랜잭션 안에서 보입니다:

```cpp
auto tx = transactions.begin();

view.upsert(&tx, record);

// This sees the upserted record
auto result = view.get(&tx, key);

// Other transactions do not see it yet
```

### 다른 트랜잭션과의 격리 {#isolation-from-other-transactions}

각 트랜잭션은 일관된 스냅샷을 봅니다:

```cpp
// Transaction 1
auto tx1 = transactions.begin();
view.upsert(&tx1, record1);

// Transaction 2 (concurrent)
auto tx2 = transactions.begin();
auto result = view.get(&tx2, key);  // Does not see record1

tx1.commit();

// Transaction 2 still does not see record1 (snapshot isolation)
auto result2 = view.get(&tx2, key);  // Still does not see record1
```

## 비동기 트랜잭션 {#asynchronous-transactions}

### 비동기 시작 {#async-begin}

트랜잭션을 비동기로 시작합니다:

```cpp
transactions.begin_async([&](ignite_result<transaction> result) {
    if (!result.has_error()) {
        auto tx = std::move(result).value();

        view.upsert_async(&tx, record, [&](ignite_result<void> upsert_result) {
            if (!upsert_result.has_error()) {
                tx.commit_async([](ignite_result<void> commit_result) {
                    // Transaction committed
                });
            }
        });
    }
});
```

### 옵션과 함께 비동기 시작 {#async-begin-with-options}

비동기 시작에 옵션을 전달합니다:

```cpp
transaction_options opts;
opts.set_timeout_millis(30000);

transactions.begin_async(opts, [](ignite_result<transaction> result) {
    // Use transaction
});
```

## 오류 처리 {#error-handling}

### 커밋 실패 처리 {#handling-commit-failures}

커밋 실패는 충돌이나 제약 조건을 나타냅니다:

```cpp
auto tx = transactions.begin();

try {
    view.upsert(&tx, record);
    tx.commit();
} catch (const ignite_error& e) {
    std::cerr << "Commit failed: " << e.what_str() << std::endl;
    // Transaction already rolled back on commit failure
    throw;
}
```

### 작업 실패 처리 {#handling-operation-failures}

작업 오류가 나면 롤백합니다:

```cpp
auto tx = transactions.begin();

try {
    view.upsert(&tx, record1);
    view.upsert(&tx, record2);  // May throw
    tx.commit();
} catch (const ignite_error& e) {
    tx.rollback();
    std::cerr << "Operation failed: " << e.what_str() << std::endl;
    throw;
}
```

### 타임아웃 처리 {#timeout-handling}

트랜잭션은 구성된 지속 시간이 지나면 타임아웃됩니다:

```cpp
transaction_options opts;
opts.set_timeout_millis(1000);  // 1 second

auto tx = transactions.begin(opts);

try {
    // Long-running operation
    std::this_thread::sleep_for(std::chrono::seconds(2));
    tx.commit();  // Will fail due to timeout
} catch (const ignite_error& e) {
    // Handle timeout error
}
```

## 모범 사례 {#best-practices}

### 트랜잭션을 짧게 유지하기 {#keep-transactions-short}

충돌을 줄이려면 트랜잭션 지속 시간을 최소화합니다:

```cpp
// Good: Short transaction
auto tx = transactions.begin();
view.upsert(&tx, record);
tx.commit();

// Avoid: Long-running transaction
auto tx2 = transactions.begin();
perform_expensive_calculation();  // Do outside transaction
view.upsert(&tx2, result);
tx2.commit();
```

### 쿼리에는 읽기 전용 사용하기 {#use-read-only-for-queries}

읽기 전용 최적화를 활성화합니다:

```cpp
transaction_options opts;
opts.set_read_only(true);

auto tx = transactions.begin(opts);
auto results = view.get_all(&tx, keys);
tx.commit();
```

### 오류를 올바르게 처리하기 {#handle-errors-properly}

오류가 나면 항상 롤백합니다:

```cpp
auto tx = transactions.begin();
bool committed = false;

try {
    // Operations
    tx.commit();
    committed = true;
} catch (const ignite_error& e) {
    if (!committed) {
        tx.rollback();
    }
    throw;
}
```

### 자동 정리를 위한 RAII 사용 {#use-raii-for-automatic-cleanup}

트랜잭션을 RAII 헬퍼로 감쌉니다:

```cpp
class transaction_guard {
    transaction& tx_;
    bool committed_ = false;

public:
    explicit transaction_guard(transaction& tx) : tx_(tx) {}

    ~transaction_guard() {
        if (!committed_) {
            try {
                tx_.rollback();
            } catch (...) {
                // Log error
            }
        }
    }

    void commit() {
        tx_.commit();
        committed_ = true;
    }
};

// Usage
auto tx = transactions.begin();
transaction_guard guard(tx);

view.upsert(&tx, record);
guard.commit();  // Automatic rollback if not committed
```

## 참조 {#reference}

- [C++ API 문서](https://ignite.apache.org/releases/ignite3/cppdoc/)
- [트랜잭션 개념](../../../develop/work-with-data/transactions)
- [Client API](./client-api)
- [Tables API](./tables-api)
- [SQL API](./sql-api)
