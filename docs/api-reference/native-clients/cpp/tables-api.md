---
title: Tables API
id: tables-api
sidebar_position: 2
---

# Tables API

Tables API는 테이블 데이터에 CRUD 작업을 제공합니다. 레코드 뷰와 키-값 뷰로 바이너리 튜플 작업과 타입 지정 C++ 객체 작업을 모두 지원합니다.

## 핵심 개념 {#key-concepts}

### 테이블 접근 {#table-access}

테이블은 클라이언트에서 얻은 `tables` 인터페이스로 접근합니다. 각 테이블은 접근 패턴별로 여러 뷰 유형을 제공합니다.

### 뷰 유형 {#view-types}

Apache Ignite는 두 가지 뷰 범주를 제공합니다:

**레코드 뷰**는 전체 행 데이터를 다룹니다. 하나의 튜플이나 객체가 기본 키를 포함한 모든 컬럼을 담습니다. 완전한 레코드를 다룰 때는 레코드 뷰를 사용하세요.

**키-값 뷰**는 기본 키 컬럼과 값 컬럼을 분리합니다. 작업 시 키와 값 튜플 또는 객체를 따로 사용합니다. 도메인 모델이 키와 데이터를 분리한다면 키-값 뷰를 사용하세요.

### 바이너리 작업과 타입 지정 작업 {#binary-vs-typed-operations}

**바이너리 뷰**는 스키마를 몰라도 컬럼에 동적으로 접근할 수 있도록 `ignite_tuple`을 사용합니다. 컬럼 값은 런타임에 이름이나 인덱스로 접근합니다.

**타입 지정 뷰**는 컴파일 시점 타입 안전성을 갖춘 C++ 구조체나 클래스를 사용합니다. 타입 변환은 `convert_to_tuple`과 `convert_from_tuple` 템플릿 특수화로 이루어집니다.

### 트랜잭션 지원 {#transaction-support}

모든 뷰 작업은 선택적 `transaction*` 매개변수를 받습니다. 암시적 트랜잭션에는 `nullptr`를 전달합니다. 명시적으로 트랜잭션을 제어하려면 트랜잭션 객체를 전달합니다.

## 테이블 가져오기 {#getting-tables}

### 단일 테이블 조회 {#retrieve-a-single-table}

이름으로 테이블을 가져옵니다:

```cpp
using namespace ignite;

auto tables = client.get_tables();
auto table = tables.get_table("my_table");

if (table.has_value()) {
    // Use table
}
```

정규화된 이름으로 테이블을 가져옵니다:

```cpp
auto table = tables.get_table("my_schema.my_table");
```

비동기 조회를 사용합니다:

```cpp
tables.get_table_async("my_table", [](ignite_result<std::optional<table>> result) {
    if (!result.has_error()) {
        auto table = std::move(result).value();
        if (table.has_value()) {
            // Use table
        }
    }
});
```

### 모든 테이블 나열 {#list-all-tables}

모든 테이블을 조회합니다:

```cpp
auto all_tables = tables.get_tables();
for (const auto& table : all_tables) {
    std::cout << table.get_name() << std::endl;
}
```

비동기 조회를 사용합니다:

```cpp
tables.get_tables_async([](ignite_result<std::vector<table>> result) {
    if (!result.has_error()) {
        auto all_tables = std::move(result).value();
        // Process tables
    }
});
```

## 레코드 뷰 {#record-views}

### 바이너리 레코드 뷰 {#binary-record-view}

튜플을 직접 다룹니다:

```cpp
auto table = tables.get_table("accounts").value();
auto view = table.get_record_binary_view();

// Insert a record
ignite_tuple record{
    {"id", 42},
    {"name", "John Doe"},
    {"balance", 1000.0}
};

view.upsert(nullptr, record);

// Retrieve a record
ignite_tuple key{{"id", 42}};
auto result = view.get(nullptr, key);

if (result.has_value()) {
    auto balance = result->get<double>("balance");
}
```

### 타입 지정 레코드 뷰 {#typed-record-view}

C++ 타입을 다룹니다:

```cpp
struct account {
    int64_t id;
    std::string name;
    double balance;
};

// Define type conversion (typically in a header)
namespace ignite {
    template<>
    struct convert_to_tuple<account> {
        static ignite_tuple to_tuple(const account& obj) {
            return ignite_tuple{
                {"id", obj.id},
                {"name", obj.name},
                {"balance", obj.balance}
            };
        }
    };

    template<>
    struct convert_from_tuple<account> {
        static account from_tuple(const ignite_tuple& tuple) {
            return account{
                tuple.get<int64_t>("id"),
                tuple.get<std::string>("name"),
                tuple.get<double>("balance")
            };
        }
    };
}

// Use typed view
auto table = tables.get_table("accounts").value();
auto view = table.get_record_view<account>();

account new_account{42, "John Doe", 1000.0};
view.upsert(nullptr, new_account);

account key{42};
auto result = view.get(nullptr, key);
```

### 레코드 뷰 작업 {#record-view-operations}

**기본 작업:**

```cpp
// Insert (fails if exists)
bool inserted = view.insert(nullptr, record);

// Upsert (insert or replace)
view.upsert(nullptr, record);

// Replace (fails if not exists)
bool replaced = view.replace(nullptr, record);

// Replace with old value check
bool replaced = view.replace(nullptr, old_record, new_record);

// Get and replace atomically
auto old_record = view.get_and_replace(nullptr, new_record);

// Get and upsert atomically
auto old_record = view.get_and_upsert(nullptr, record);
```

**삭제 작업:**

```cpp
// Remove by key
bool removed = view.remove(nullptr, key);

// Remove exact match
bool removed = view.remove_exact(nullptr, full_record);

// Remove and return old value
auto old_record = view.get_and_remove(nullptr, key);
```

**일괄 작업:**

```cpp
std::vector<ignite_tuple> records = {record1, record2, record3};

// Get multiple records
auto results = view.get_all(nullptr, keys);

// Insert multiple (returns skipped records)
auto skipped = view.insert_all(nullptr, records);

// Upsert multiple
view.upsert_all(nullptr, records);

// Remove multiple (returns non-existent keys)
auto non_existent = view.remove_all(nullptr, keys);

// Remove exact multiple
auto not_matched = view.remove_all_exact(nullptr, records);
```

## 키-값 뷰 {#key-value-views}

### 바이너리 키-값 뷰 {#binary-key-value-view}

키와 값을 분리합니다:

```cpp
auto table = tables.get_table("accounts").value();
auto view = table.get_key_value_binary_view();

// Put a key-value pair
ignite_tuple key{{"id", 42}};
ignite_tuple value{
    {"name", "John Doe"},
    {"balance", 1000.0}
};

view.put(nullptr, key, value);

// Get value by key
auto result = view.get(nullptr, key);

// Check key existence
bool exists = view.contains(nullptr, key);
```

### 타입 지정 키-값 뷰 {#typed-key-value-view}

키와 값에 별도의 C++ 타입을 사용합니다:

```cpp
struct account_key {
    int64_t id;
};

struct account_data {
    std::string name;
    double balance;
};

// Define conversions for both types
// (Similar to record view example)

auto table = tables.get_table("accounts").value();
auto view = table.get_key_value_view<account_key, account_data>();

account_key key{42};
account_data data{"John Doe", 1000.0};

view.put(nullptr, key, data);
auto result = view.get(nullptr, key);
```

### 키-값 뷰 작업 {#key-value-view-operations}

**기본 작업:**

```cpp
// Put (insert or replace)
view.put(nullptr, key, value);

// Put if absent
bool inserted = view.put_if_absent(nullptr, key, value);

// Get and put atomically
auto old_value = view.get_and_put(nullptr, key, value);

// Replace
bool replaced = view.replace(nullptr, key, value);

// Replace with old value check
bool replaced = view.replace(nullptr, key, old_value, new_value);

// Get and replace atomically
auto old_value = view.get_and_replace(nullptr, key, value);

// Check existence
bool exists = view.contains(nullptr, key);
```

**삭제 작업:**

```cpp
// Remove by key
bool removed = view.remove(nullptr, key);

// Remove with value check
bool removed = view.remove(nullptr, key, expected_value);

// Remove and return value
auto old_value = view.get_and_remove(nullptr, key);
```

**일괄 작업:**

```cpp
std::vector<std::pair<K, V>> pairs = {{key1, val1}, {key2, val2}};

// Get multiple values
auto values = view.get_all(nullptr, keys);

// Put multiple pairs
view.put_all(nullptr, pairs);

// Remove multiple keys
auto non_existent = view.remove_all(nullptr, keys);

// Remove multiple pairs with value checks
auto not_matched = view.remove_all(nullptr, pairs);
```

## Ignite 튜플 {#ignite-tuple}

### 튜플 생성 {#creating-tuples}

초기화 리스트를 사용합니다:

```cpp
ignite_tuple tuple{
    {"id", 42},
    {"name", "John"},
    {"active", true}
};
```

용량 힌트를 지정해 생성합니다:

```cpp
ignite_tuple tuple(10); // Reserve space for 10 columns
tuple.set("id", 42);
tuple.set("name", "John");
```

### 값 접근 {#accessing-values}

이름으로 접근합니다:

```cpp
auto id = tuple.get<int64_t>("id");
auto name = tuple.get<std::string>("name");

// Or use primitive wrapper
auto value = tuple.get("id"); // Returns primitive
```

인덱스로 접근합니다:

```cpp
auto id = tuple.get<int64_t>(0);
auto name = tuple.get<std::string>(1);
```

### 컬럼 메타데이터 {#column-metadata}

컬럼 정보를 조회합니다:

```cpp
int32_t count = tuple.column_count();
std::string name = tuple.column_name(0);
int32_t index = tuple.column_ordinal("id");
```

### 컬럼 이름 {#column-names}

컬럼 이름은 대소문자를 구분하지 않으며, 따옴표로 감싸지 않으면 대문자로 정규화됩니다:

```cpp
tuple.set("ID", 42);
tuple.set("id", 42);  // Same as above
tuple.set("Id", 42);  // Same as above

// Use quotes for case-sensitive names
tuple.set("\"Id\"", 42);  // Different from above
```

## 비동기 작업 {#asynchronous-operations}

모든 작업에는 `_async` 접미사가 붙은 비동기 변형이 있습니다:

```cpp
view.get_async(nullptr, key, [](ignite_result<std::optional<ignite_tuple>> result) {
    if (!result.has_error()) {
        auto tuple = std::move(result).value();
        if (tuple.has_value()) {
            // Use tuple
        }
    }
});

view.upsert_async(nullptr, record, [](ignite_result<void> result) {
    if (!result.has_error()) {
        // Operation succeeded
    }
});
```

## 트랜잭션 연동 {#transaction-integration}

명시적 트랜잭션을 사용합니다:

```cpp
auto tx = client.get_transactions().begin();

try {
    view.upsert(&tx, record1);
    view.upsert(&tx, record2);
    tx.commit();
} catch (const ignite_error& e) {
    tx.rollback();
    throw;
}
```

## 참조 {#reference}

- [C++ API 문서](https://ignite.apache.org/releases/ignite3/cppdoc/)
- [Client API](./client-api)
- [SQL API](./sql-api)
- [Transactions API](./transactions-api)
