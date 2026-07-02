---
title: SQL API
id: sql-api
sidebar_position: 3
---

# SQL API

SQL API는 Apache Ignite 클러스터를 대상으로 SQL 문과 스크립트를 실행합니다. 매개변수화된 쿼리, 페이지네이션, 트랜잭션 연동, 쿼리 취소를 지원합니다.

## 핵심 개념 {#key-concepts}

### SQL 문 실행 {#statement-execution}

단일 문 쿼리는 결과 집합을 반환합니다. 다중 문 스크립트는 여러 문을 실행하되 결과를 반환하지 않습니다. 쿼리와 DML 작업에는 문을, DDL 작업과 일괄 업데이트에는 스크립트를 사용하세요.

### 매개변수화된 쿼리 {#parameterized-queries}

매개변수를 사용하면 SQL 인젝션을 막고 쿼리 계획을 재사용할 수 있습니다. 물음표(`?`)를 자리표시자로 사용하세요. 매개변수 값은 실행 순서에 맞춰 `primitive` 값의 벡터로 전달합니다.

### 결과 집합 {#result-sets}

쿼리 결과는 행과 메타데이터를 담은 `result_set` 객체로 반환됩니다. 결과 집합은 대규모 쿼리에서 페이지네이션을 지원합니다. 각 페이지에는 행 묶음이 담깁니다. 추가 페이지는 명시적으로 가져옵니다.

### 트랜잭션 연동 {#transaction-integration}

명시적 트랜잭션 안에서 문을 실행하려면 트랜잭션 포인터를 전달합니다. 즉시 커밋되는 암시적 트랜잭션에는 `nullptr`를 전달합니다.

### 쿼리 취소 {#query-cancellation}

장시간 실행되는 쿼리를 취소하려면 `cancellation_token`을 전달합니다. 실행 전에 토큰을 생성하세요. 필요하면 다른 스레드에서 취소를 요청합니다.

## 기본 실행 {#basic-execution}

### 단순 쿼리 {#simple-query}

SELECT 문을 실행합니다:

```cpp
using namespace ignite;

auto sql = client.get_sql();
auto result = sql.execute(nullptr, nullptr, sql_statement("SELECT * FROM accounts"), {});

if (result.has_rowset()) {
    for (const auto& row : result.current_page()) {
        auto id = row.get<int64_t>("id");
        auto name = row.get<std::string>("name");
    }
}
```

### 매개변수화된 쿼리 {#parameterized-query}

값을 안전하게 바인딩하려면 매개변수를 사용합니다:

```cpp
sql_statement stmt("SELECT * FROM accounts WHERE balance > ? AND active = ?");
std::vector<primitive> params{1000.0, true};

auto result = sql.execute(nullptr, nullptr, stmt, params);
```

### DML 작업 {#dml-operations}

INSERT, UPDATE, DELETE를 실행합니다:

```cpp
// Insert
sql_statement insert("INSERT INTO accounts (id, name, balance) VALUES (?, ?, ?)");
std::vector<primitive> values{42, std::string("John Doe"), 1000.0};

auto result = sql.execute(nullptr, nullptr, insert, values);
std::cout << "Rows inserted: " << result.affected_rows() << std::endl;

// Update
sql_statement update("UPDATE accounts SET balance = ? WHERE id = ?");
auto result2 = sql.execute(nullptr, nullptr, update, {1500.0, 42});
std::cout << "Rows updated: " << result2.affected_rows() << std::endl;

// Delete
sql_statement del("DELETE FROM accounts WHERE id = ?");
auto result3 = sql.execute(nullptr, nullptr, del, {42});
std::cout << "Rows deleted: " << result3.affected_rows() << std::endl;
```

### DDL 작업 {#ddl-operations}

스키마 변경을 실행합니다:

```cpp
sql_statement ddl("CREATE TABLE new_table (id INT PRIMARY KEY, data VARCHAR)");
auto result = sql.execute(nullptr, nullptr, ddl, {});

// Check if DDL was applied
if (result.was_applied()) {
    std::cout << "Table created" << std::endl;
}
```

## SQL 문 {#sql-statements}

### SQL 문 구성 {#statement-configuration}

문 속성을 구성합니다:

```cpp
sql_statement stmt;
stmt.query("SELECT * FROM large_table");
stmt.schema("my_schema");
stmt.page_size(100);  // Rows per page
stmt.timeout(std::chrono::seconds(30));
stmt.timezone_id("America/New_York");
```

### SQL 문 속성 {#statement-properties}

**query()** - 실행할 SQL 텍스트(필수)

**schema()** - 기본 스키마 이름(기본값: "PUBLIC")

**page_size()** - 결과 페이지당 행 수(기본값: 1024)

**timeout()** - 쿼리 타임아웃(밀리초 단위, 기본값 0은 타임아웃 없음)

**timezone_id()** - 시간 함수에 사용할 시간대

**properties()** - 키-값 맵 형태의 추가 문 속성

### 빌더 패턴 {#builder-pattern}

구성 호출을 연쇄합니다:

```cpp
sql_statement stmt;
stmt.query("SELECT * FROM accounts")
    .schema("PUBLIC")
    .page_size(500)
    .timeout(std::chrono::seconds(10));
```

## 결과 집합 {#result-sets-1}

### 행 접근 {#accessing-rows}

현재 페이지를 순회합니다:

```cpp
auto result = sql.execute(nullptr, nullptr, stmt, {});

for (const auto& row : result.current_page()) {
    // Access columns by name
    auto id = row.get<int64_t>("id");
    auto name = row.get<std::string>("name");

    // Or by index
    auto id2 = row.get<int64_t>(0);
    auto name2 = row.get<std::string>(1);
}
```

### 페이지네이션 {#pagination}

대규모 결과 집합을 처리합니다:

```cpp
auto result = sql.execute(nullptr, nullptr, stmt, {});

// Process first page
for (const auto& row : result.current_page()) {
    // Process row
}

// Fetch and process remaining pages
while (result.has_more_pages()) {
    result.fetch_next_page();
    for (const auto& row : result.current_page()) {
        // Process row
    }
}
```

비동기 페이지네이션을 사용합니다:

```cpp
void process_page(result_set& result) {
    for (const auto& row : result.current_page()) {
        // Process row
    }

    if (result.has_more_pages()) {
        result.fetch_next_page_async([&](ignite_result<void> res) {
            if (!res.has_error()) {
                process_page(result);
            }
        });
    }
}

auto result = sql.execute(nullptr, nullptr, stmt, {});
process_page(result);
```

### 메타데이터 {#metadata}

결과 메타데이터에 접근합니다:

```cpp
auto result = sql.execute(nullptr, nullptr, stmt, {});
const auto& metadata = result.metadata();

for (const auto& column : metadata.columns()) {
    std::cout << "Column: " << column.name() << std::endl;
    std::cout << "Type: " << static_cast<int>(column.type()) << std::endl;
    std::cout << "Nullable: " << column.nullable() << std::endl;

    if (column.precision() != -1) {
        std::cout << "Precision: " << column.precision() << std::endl;
    }
    if (column.scale() != -1) {
        std::cout << "Scale: " << column.scale() << std::endl;
    }
}
```

이름으로 컬럼 인덱스를 찾습니다:

```cpp
int32_t col_index = metadata.index_of("balance");
```

### 결과 타입 확인 {#checking-result-type}

결과에 행이 담겼는지, 아니면 DML 결과인지 판별합니다:

```cpp
auto result = sql.execute(nullptr, nullptr, stmt, {});

if (result.has_rowset()) {
    // Query returned rows
    auto rows = result.current_page();
} else {
    // DML or DDL operation
    std::cout << "Affected rows: " << result.affected_rows() << std::endl;
}

// Check if conditional DDL was applied
if (result.was_applied()) {
    std::cout << "Statement applied successfully" << std::endl;
}
```

### 결과 집합 닫기 {#closing-result-sets}

리소스를 해제하려면 결과 집합을 명시적으로 닫습니다:

```cpp
auto result = sql.execute(nullptr, nullptr, stmt, {});
// Use result
result.close();
```

비동기 닫기를 사용합니다:

```cpp
result.close_async([](ignite_result<void> res) {
    if (!res.has_error()) {
        // Result closed
    }
});
```

## 스크립트 실행 {#script-execution}

### 다중 문 스크립트 {#multi-statement-scripts}

여러 문을 실행합니다:

```cpp
sql_statement script(R"(
    CREATE TABLE temp1 (id INT PRIMARY KEY, data VARCHAR);
    CREATE TABLE temp2 (id INT PRIMARY KEY, data VARCHAR);
    INSERT INTO temp1 VALUES (1, 'test');
)");

sql.execute_script(nullptr, script, {});
```

비동기 실행을 사용합니다:

```cpp
sql.execute_script_async(nullptr, script, {}, [](ignite_result<void> result) {
    if (!result.has_error()) {
        std::cout << "Script executed successfully" << std::endl;
    }
});
```

스크립트는 결과 집합을 반환하지 않습니다. 쿼리에는 개별 문을 사용하세요. 스크립트는 트랜잭션을 지원하지 않습니다.

## 트랜잭션 연동 {#transaction-integration-1}

### 명시적 트랜잭션 {#explicit-transactions}

트랜잭션 안에서 문을 실행합니다:

```cpp
auto tx = client.get_transactions().begin();

try {
    sql_statement update1("UPDATE accounts SET balance = balance - ? WHERE id = ?");
    sql.execute(&tx, nullptr, update1, {100.0, 1});

    sql_statement update2("UPDATE accounts SET balance = balance + ? WHERE id = ?");
    sql.execute(&tx, nullptr, update2, {100.0, 2});

    tx.commit();
} catch (const ignite_error& e) {
    tx.rollback();
    throw;
}
```

### 암시적 트랜잭션 {#implicit-transactions}

자동 커밋에는 `nullptr`를 전달합니다:

```cpp
// Each statement commits immediately
sql.execute(nullptr, nullptr, stmt, params);
```

## 쿼리 취소 {#query-cancellation-1}

### 취소 토큰 생성 {#creating-cancellation-tokens}

실행 전에 토큰을 생성합니다:

```cpp
cancel_handle handle;
cancellation_token token(&handle);
```

### 쿼리 취소하기 {#cancelling-queries}

다른 스레드에서 취소합니다:

```cpp
// Thread 1: Execute long query
auto result = sql.execute(nullptr, &token,
    sql_statement("SELECT * FROM huge_table"), {});

// Thread 2: Cancel query
handle.cancel();
```

비동기 실행과 함께 사용합니다:

```cpp
cancel_handle handle;
cancellation_token token(&handle);

sql.execute_async(nullptr, &token, stmt, {},
    [](ignite_result<result_set> result) {
        if (result.has_error()) {
            // May be cancellation error
        } else {
            // Process result
        }
    });

// Cancel if needed
handle.cancel();
```

## 비동기 실행 {#asynchronous-execution}

블로킹 없이 문을 실행합니다:

```cpp
sql.execute_async(nullptr, nullptr, stmt, params,
    [](ignite_result<result_set> result) {
        if (!result.has_error()) {
            auto rs = std::move(result).value();
            for (const auto& row : rs.current_page()) {
                // Process row
            }
        }
    });
```

스크립트를 비동기로 실행합니다:

```cpp
sql.execute_script_async(nullptr, script, {},
    [](ignite_result<void> result) {
        if (!result.has_error()) {
            std::cout << "Script completed" << std::endl;
        }
    });
```

## 데이터 타입 매핑 {#data-type-mapping}

C++ 타입은 SQL 타입에 매핑됩니다:

| C++ 타입 | SQL 타입 |
|----------|----------|
| `bool` | BOOLEAN |
| `int8_t` | TINYINT |
| `int16_t` | SMALLINT |
| `int32_t` | INTEGER |
| `int64_t` | BIGINT |
| `float` | REAL |
| `double` | DOUBLE |
| `std::string` | VARCHAR |
| `std::vector<std::byte>` | VARBINARY |
| `uuid` | UUID |
| `ignite_date` | DATE |
| `ignite_time` | TIME |
| `ignite_timestamp` | TIMESTAMP |
| `ignite_date_time` | DATETIME |
| `big_decimal` | DECIMAL |
| `big_integer` | DECIMAL |

## 오류 처리 {#error-handling}

SQL 오류를 처리합니다:

```cpp
try {
    auto result = sql.execute(nullptr, nullptr, stmt, params);
} catch (const ignite_error& e) {
    std::cerr << "SQL error: " << e.what_str() << std::endl;
}
```

비동기 작업의 경우:

```cpp
sql.execute_async(nullptr, nullptr, stmt, params,
    [](ignite_result<result_set> result) {
        if (result.has_error()) {
            std::cerr << "Error: " << result.error().what_str() << std::endl;
        } else {
            // Process result
        }
    });
```

## 참조 {#reference}

- [C++ API 문서](https://ignite.apache.org/releases/ignite3/cppdoc/)
- [SQL 참조](../../../sql)
- [Client API](./client-api)
- [Tables API](./tables-api)
- [Transactions API](./transactions-api)
