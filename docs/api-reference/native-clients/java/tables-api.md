---
title: Tables API
id: tables-api
sidebar_position: 3
---

# Tables API

Tables API는 Ignite 테이블에 저장된 데이터에 구조화된 접근을 제공합니다. 애플리케이션은 데이터를 서로 다른 관점으로 보여주는 뷰로 테이블과 상호작용합니다. 전체 행 작업에는 레코드 뷰(record view)를, 키 기반 접근 패턴에는 키-값 뷰(key-value view)를 사용합니다.

## 핵심 개념 {#key-concepts}

테이블은 타입이 지정된 컬럼을 가진 행에 데이터를 저장합니다. 이 API는 뷰로 세 가지 접근 패턴을 제공합니다. RecordView는 각 행을 완전한 레코드로 다룹니다. KeyValueView는 행을 키 부분과 값 부분으로 나눕니다. 둘 다 바이너리 Tuple 접근과 타입 지정 객체 매핑을 지원합니다.

작업은 선택적 트랜잭션 컨텍스트 안에서 실행됩니다. 자동 커밋 동작에는 null을 전달하고, 여러 작업에 걸친 원자성이 필요하면 Transaction을 전달합니다.

## 테이블 조회 {#table-discovery}

테이블 관리자로 테이블에 접근합니다:

```java
Table users = ignite.tables().table("users");
if (users == null) {
    System.out.println("Table does not exist");
}
```

스키마가 포함된 정규화된 이름(qualified name)의 경우:

```java
Table products = ignite.tables().table(QualifiedName.of("inventory", "products"));
```

모든 테이블을 비동기로 나열합니다:

```java
CompletableFuture<List<Table>> tablesFuture = ignite.tables().tablesAsync();
tablesFuture.thenAccept(tables -> {
    for (Table table : tables) {
        System.out.println(table.name());
    }
});
```

## 레코드 뷰 {#record-view}

RecordView 작업은 완전한 행을 다룹니다:

```java
RecordView<Tuple> view = table.recordView();

// Insert or update
Tuple record = Tuple.create()
    .set("id", 1)
    .set("name", "Alice")
    .set("age", 30);
view.upsert(null, record);

// Retrieve
Tuple key = Tuple.create().set("id", 1);
Tuple result = view.get(null, key);
System.out.println(result.stringValue("name"));

// Check existence
boolean exists = view.contains(null, key);

// Delete
boolean deleted = view.delete(null, key);
```

트랜잭션 밖에서 작업하려면 트랜잭션 매개변수로 null을 전달합니다.

## 타입 지정 레코드 뷰 {#typed-record-view}

타입 지정 뷰로 행을 Java 객체에 매핑합니다:

```java
public class User {
    public int id;
    public String name;
    public int age;
}

RecordView<User> view = table.recordView(User.class);

User user = new User();
user.id = 1;
user.name = "Alice";
user.age = 30;

view.upsert(null, user);

User key = new User();
key.id = 1;
User retrieved = view.get(null, key);
```

뷰는 객체 필드와 테이블 컬럼을 자동으로 매핑합니다.

## 키-값 뷰 {#key-value-view}

KeyValueView는 키 부분과 값 부분을 분리합니다:

```java
KeyValueView<Tuple, Tuple> view = table.keyValueView();

Tuple key = Tuple.create().set("id", 1);
Tuple value = Tuple.create()
    .set("name", "Alice")
    .set("age", 30);

view.put(null, key, value);

Tuple retrieved = view.get(null, key);
System.out.println(retrieved.stringValue("name"));

// Check for null vs missing
NullableValue<Tuple> nullable = view.getNullable(null, key);
if (nullable != null) {
    System.out.println("Found: " + nullable.get());
}
```

NullableValue는 존재하지 않는 항목과 null 값을 가진 항목을 구분합니다.

## 타입 지정 키-값 뷰 {#typed-key-value-view}

키와 값을 별도의 타입에 매핑합니다:

```java
public class ProductKey {
    public int id;
}

public class ProductValue {
    public String name;
    public double price;
}

KeyValueView<ProductKey, ProductValue> view =
    table.keyValueView(ProductKey.class, ProductValue.class);

ProductKey key = new ProductKey();
key.id = 100;

ProductValue value = new ProductValue();
value.name = "Widget";
value.price = 29.99;

view.put(null, key, value);

ProductValue retrieved = view.get(null, key);
```

## 일괄 처리 {#batch-operations}

여러 레코드를 한 번의 작업으로 처리합니다:

```java
RecordView<Tuple> view = table.recordView();

List<Tuple> records = Arrays.asList(
    Tuple.create().set("id", 1).set("name", "Alice"),
    Tuple.create().set("id", 2).set("name", "Bob"),
    Tuple.create().set("id", 3).set("name", "Carol")
);

view.upsertAll(null, records);

List<Tuple> keys = Arrays.asList(
    Tuple.create().set("id", 1),
    Tuple.create().set("id", 2)
);

List<Tuple> results = view.getAll(null, keys);
```

일괄 처리는 여러 작업의 네트워크 오버헤드를 줄입니다.

## 키-값 일괄 처리 {#key-value-batch-operations}

키-값 뷰도 비슷한 일괄 처리를 지원합니다:

```java
KeyValueView<Tuple, Tuple> view = table.keyValueView();

Map<Tuple, Tuple> entries = new HashMap<>();
entries.put(
    Tuple.create().set("id", 1),
    Tuple.create().set("name", "Alice")
);
entries.put(
    Tuple.create().set("id", 2),
    Tuple.create().set("name", "Bob")
);

view.putAll(null, entries);

Collection<Tuple> keys = Arrays.asList(
    Tuple.create().set("id", 1),
    Tuple.create().set("id", 2)
);

Map<Tuple, Tuple> results = view.getAll(null, keys);
```

## 조건부 작업 {#conditional-operations}

현재 값을 기준으로 작업을 실행합니다:

```java
KeyValueView<Tuple, Tuple> view = table.keyValueView();

Tuple key = Tuple.create().set("id", 1);
Tuple oldValue = Tuple.create().set("status", "pending");
Tuple newValue = Tuple.create().set("status", "active");

// Replace only if current value matches
boolean replaced = view.replace(null, key, oldValue, newValue);

if (replaced) {
    System.out.println("Value updated");
}
```

조건부 작업은 원자적 compare-and-set 동작을 제공합니다.

## 비동기 작업 {#asynchronous-operations}

모든 작업은 비동기 실행을 지원합니다:

```java
RecordView<Tuple> view = table.recordView();

Tuple record = Tuple.create()
    .set("id", 1)
    .set("name", "Alice");

CompletableFuture<Void> upsertFuture = view.upsertAsync(null, record);

Tuple key = Tuple.create().set("id", 1);
CompletableFuture<Tuple> getFuture = view.getAsync(null, key);

getFuture.thenAccept(result -> {
    System.out.println(result.stringValue("name"));
});
```

비동기 작업은 호출한 스레드를 차단하지 않고 즉시 반환됩니다.

## 파티션 정보 {#partition-information}

파티션 관리자로 파티션 메타데이터에 접근합니다:

```java
PartitionManager partitions = table.partitionManager();
CompletableFuture<Partition> partition =
    partitions.partitionAsync(Tuple.create().set("id", 1));

partition.thenAccept(p -> {
    System.out.println("Record belongs to partition: " + p.id());
});
```

파티션 정보로 콜로케이션된 컴퓨트 작업이 가능합니다.

## Tuple 생성 {#tuple-construction}

여러 방식으로 Tuple을 생성합니다:

```java
// Empty tuple
Tuple tuple1 = Tuple.create();

// With capacity hint
Tuple tuple2 = Tuple.create(10);

// From map
Map<String, Object> data = new HashMap<>();
data.put("id", 1);
data.put("name", "Alice");
Tuple tuple3 = Tuple.create(data);

// Copy existing
Tuple tuple4 = Tuple.copy(tuple3);
```

이름으로 값을 설정합니다:

```java
Tuple tuple = Tuple.create()
    .set("id", 1)
    .set("name", "Alice")
    .set("age", 30)
    .set("balance", 1000.50)
    .set("created", LocalDateTime.now());
```

## Tuple 값 접근 {#tuple-value-access}

타입별 메서드로 컬럼 이름을 지정해 값을 조회합니다:

```java
int id = tuple.intValue("id");
String name = tuple.stringValue("name");
Integer age = tuple.value("age");
LocalDateTime created = tuple.value("created");

// Access by index
Object value = tuple.value(0);
String columnName = tuple.columnName(0);
int columnIndex = tuple.columnIndex("name");
```

타입별 접근자는 프리미티브 타입의 박싱을 피합니다.

## 참조 {#reference}

- 테이블 관리: `org.apache.ignite.table.IgniteTables`
- 테이블 인터페이스: `org.apache.ignite.table.Table`
- 레코드 접근: `org.apache.ignite.table.RecordView<R>`
- 키-값 접근: `org.apache.ignite.table.KeyValueView<K, V>`
- 바이너리 레코드: `org.apache.ignite.table.Tuple`
- 파티션 정보: `org.apache.ignite.table.partition.PartitionManager`

### IgniteTables 메서드 {#ignitetables-methods}

- `List<Table> tables()` - 모든 테이블을 동기로 조회
- `CompletableFuture<List<Table>> tablesAsync()` - 모든 테이블을 비동기로 조회
- `Table table(String name)` - 단순 이름으로 테이블 조회
- `Table table(QualifiedName name)` - 정규화된 이름으로 테이블 조회
- `CompletableFuture<Table> tableAsync(String name)` - 테이블을 비동기로 조회
- `CompletableFuture<Table> tableAsync(QualifiedName name)` - 정규화된 이름으로 테이블을 비동기로 조회

### 테이블 뷰 메서드 {#table-view-methods}

- `RecordView<Tuple> recordView()` - 바이너리 레코드 뷰 조회
- `RecordView<R> recordView(Class<R>)` - 타입 지정 레코드 뷰 조회
- `RecordView<R> recordView(Mapper<R>)` - 사용자 정의 매퍼로 레코드 뷰 조회
- `KeyValueView<Tuple, Tuple> keyValueView()` - 바이너리 키-값 뷰 조회
- `KeyValueView<K, V> keyValueView(Class<K>, Class<V>)` - 타입 지정 키-값 뷰 조회
- `KeyValueView<K, V> keyValueView(Mapper<K>, Mapper<V>)` - 사용자 정의 매퍼로 키-값 뷰 조회

### RecordView CRUD 메서드 {#recordview-crud-methods}

- `R get(Transaction, R keyRec)` - 키로 레코드 조회
- `CompletableFuture<R> getAsync(Transaction, R keyRec)` - 비동기 조회
- `List<R> getAll(Transaction, Collection<R>)` - 여러 레코드 조회
- `CompletableFuture<List<R>> getAllAsync(Transaction, Collection<R>)` - 여러 레코드를 비동기 조회
- `boolean contains(Transaction, R keyRec)` - 존재 여부 확인
- `void upsert(Transaction, R rec)` - 레코드 삽입 또는 업데이트
- `CompletableFuture<Void> upsertAsync(Transaction, R rec)` - 비동기 upsert
- `void upsertAll(Transaction, Collection<R>)` - 여러 레코드 삽입 또는 업데이트
- `boolean delete(Transaction, R keyRec)` - 레코드 삭제
- `CompletableFuture<Boolean> deleteAsync(Transaction, R keyRec)` - 비동기 삭제

### KeyValueView 메서드 {#keyvalueview-methods}

- `V get(Transaction, K key)` - 키로 값 조회
- `CompletableFuture<V> getAsync(Transaction, K key)` - 비동기 조회
- `NullableValue<V> getNullable(Transaction, K key)` - null 구분과 함께 조회
- `Map<K, V> getAll(Transaction, Collection<K>)` - 여러 값 조회
- `void put(Transaction, K key, V value)` - 키-값 쌍 저장
- `CompletableFuture<Void> putAsync(Transaction, K key, V value)` - 비동기 저장
- `void putAll(Transaction, Map<K, V>)` - 여러 쌍 저장
- `boolean replace(Transaction, K key, V old, V new)` - 조건부 교체
- `void remove(Transaction, K key)` - 키로 제거
- `void removeAll(Transaction, Collection<K>)` - 여러 항목 제거
