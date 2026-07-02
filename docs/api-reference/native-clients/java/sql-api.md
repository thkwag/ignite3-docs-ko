---
title: SQL API
id: sql-api
sidebar_position: 5
---

# SQL API

SQL API는 Ignite 테이블에 대해 쿼리와 DML 문을 실행합니다. 애플리케이션은 표준 SQL 문법으로 데이터를 조회, 삽입, 수정, 삭제합니다. 이 API는 매개변수화된 쿼리, 준비된 문(prepared statement), 일괄 처리, 결과 스트리밍을 지원합니다.

## 핵심 개념 {#key-concepts}

SQL 실행은 IgniteSql 퍼사드(facade)가 담당합니다. 쿼리 결과는 ResultSet 커서로 스트리밍되며, 리소스를 해제하려면 반드시 닫아야 합니다. SQL 문은 타임아웃, 스키마, 페이지네이션 등 쿼리 동작을 구성합니다.

쿼리는 선택적 트랜잭션 컨텍스트 안에서 실행됩니다. 자동 커밋 실행에는 null을 전달하고, 여러 SQL 문에 걸친 원자성이 필요하면 Transaction을 전달합니다. 쿼리 매개변수는 물음표 자리표시자로 위치 기반 바인딩을 사용합니다.

## 기본 쿼리 실행 {#basic-query-execution}

매개변수를 사용해 쿼리를 실행합니다:

```java
try (ResultSet<SqlRow> rs = ignite.sql().execute(
    null,
    "SELECT name, age FROM users WHERE age > ?",
    25
)) {
    while (rs.hasNext()) {
        SqlRow row = rs.next();
        System.out.println(row.stringValue("name") + ": " + row.intValue("age"));
    }
}
```

서버 리소스를 해제하려면 ResultSet 인스턴스를 반드시 닫으세요.

## 준비된 문 {#prepared-statements}

반복 실행할 준비된 문을 만듭니다:

```java
Statement stmt = ignite.sql().createStatement(
    "SELECT * FROM users WHERE age > ? AND status = ?"
);

try (ResultSet<SqlRow> rs = ignite.sql().execute(
    null,
    stmt,
    30,
    "active"
)) {
    // Process results
}
```

문 빌더로 구성합니다:

```java
Statement stmt = ignite.sql().statementBuilder()
    .query("SELECT * FROM users WHERE age > ?")
    .defaultSchema("public")
    .queryTimeout(30, TimeUnit.SECONDS)
    .pageSize(1000)
    .build();
```

## 문 구성 {#statement-configuration}

빌더 옵션으로 문 동작을 구성합니다:

```java
Statement stmt = ignite.sql().statementBuilder()
    .query("SELECT * FROM products WHERE category = ?")
    .defaultSchema("inventory")
    .queryTimeout(60, TimeUnit.SECONDS)
    .pageSize(500)
    .timeZoneId(ZoneId.of("UTC"))
    .build();

try (ResultSet<SqlRow> rs = ignite.sql().execute(null, stmt, "electronics")) {
    // Process results
}
```

defaultSchema 설정은 쿼리에 스키마 이름이 없을 때 테이블을 어떻게 찾을지 결정합니다. queryTimeout 매개변수는 실행 시간을 제한합니다. pageSize는 대량 결과 집합의 일괄 처리 방식을 제어합니다.

## 결과 집합 처리 {#result-set-processing}

결과 메타데이터와 값에 접근합니다:

```java
try (ResultSet<SqlRow> rs = ignite.sql().execute(
    null,
    "SELECT id, name, created FROM users"
)) {
    ResultSetMetadata metadata = rs.metadata();
    System.out.println("Columns: " + metadata.columns().size());

    while (rs.hasNext()) {
        SqlRow row = rs.next();

        int id = row.intValue("id");
        String name = row.stringValue("name");
        LocalDateTime created = row.value("created");

        System.out.println(id + ": " + name + " created at " + created);
    }
}
```

컬럼 메타데이터는 타입 정보를 제공합니다:

```java
for (int i = 0; i < metadata.columns().size(); i++) {
    ColumnMetadata col = metadata.columns().get(i);
    System.out.println(col.name() + " " + col.type() +
        " nullable=" + col.nullable());
}
```

## DML 작업 {#dml-operations}

삽입, 수정, 삭제 문을 실행합니다:

```java
try (ResultSet<SqlRow> rs = ignite.sql().execute(
    null,
    "INSERT INTO users (id, name, age) VALUES (?, ?, ?)",
    1, "Alice", 30
)) {
    long affected = rs.affectedRows();
    System.out.println("Inserted " + affected + " rows");
}
```

DML 문의 영향받은 행 수를 확인합니다:

```java
try (ResultSet<SqlRow> rs = ignite.sql().execute(
    null,
    "UPDATE users SET status = ? WHERE age > ?",
    "senior", 60
)) {
    System.out.println("Updated " + rs.affectedRows() + " rows");
}
```

## DDL 작업 {#ddl-operations}

스키마 정의 문을 실행합니다:

```java
try (ResultSet<SqlRow> rs = ignite.sql().execute(
    null,
    "CREATE TABLE products (id INT PRIMARY KEY, name VARCHAR, price DECIMAL)"
)) {
    boolean applied = rs.wasApplied();
    System.out.println("DDL applied: " + applied);
}
```

DDL 문은 행 수 대신 적용 여부를 반환합니다.

## 일괄 처리 {#batch-operations}

서로 다른 매개변수로 여러 문을 실행합니다:

```java
BatchedArguments batch = BatchedArguments.create();

batch.add(1, "Alice");
batch.add(2, "Bob");
batch.add(3, "Carol");

long[] results = ignite.sql().executeBatch(null, "INSERT INTO users (id, name) VALUES (?, ?)", batch);
System.out.println("Inserted " + results.length + " batches");
```

일괄 처리는 비슷한 여러 문을 실행할 때 네트워크 오버헤드를 줄입니다.

## 타입 지정 결과 매핑 {#typed-result-mapping}

매퍼를 사용해 결과를 커스텀 타입으로 매핑합니다:

```java
class User {
    public int id;
    public String name;
    public int age;
}

try (ResultSet<User> rs = ignite.sql().execute(
    null,
    Mapper.of(User.class),
    "SELECT id, name, age FROM users WHERE age > ?",
    25
)) {
    while (rs.hasNext()) {
        User user = rs.next();
        System.out.println(user.name + " is " + user.age + " years old");
    }
}
```

매퍼는 컬럼 이름과 필드 이름을 기준으로 행을 객체로 자동 변환합니다.

## 비동기 실행 {#asynchronous-execution}

쿼리를 비동기로 실행합니다:

```java
CompletableFuture<AsyncResultSet<SqlRow>> future = ignite.sql().executeAsync(
    null,
    "SELECT * FROM users WHERE age > ?",
    30
);

future.thenAccept(rs -> {
    try (rs) {
        while (rs.hasNext()) {
            SqlRow row = rs.next();
            System.out.println(row.stringValue("name"));
        }
    }
});
```

비동기 실행은 호출한 스레드를 차단하지 않고 즉시 반환됩니다.

## 쿼리 취소 {#query-cancellation}

취소 핸들을 사용해 오래 실행되는 쿼리를 취소합니다:

```java
CancelHandle cancelHandle = CancelHandle.create();

CompletableFuture<AsyncResultSet<SqlRow>> future = ignite.sql().executeAsync(
    null,
    cancelHandle.token(),
    "SELECT * FROM large_table",
    new Object[0]
);

// Cancel after 5 seconds
CompletableFuture.delayedExecutor(5, TimeUnit.SECONDS)
    .execute(cancelHandle::cancel);
```

취소된 쿼리는 실행을 멈추고 리소스를 해제합니다.

## 트랜잭션 통합 {#transaction-integration}

트랜잭션 안에서 쿼리를 실행합니다:

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

같은 트랜잭션을 사용하는 모든 문은 일관된 데이터를 참조하며, 원자적으로 커밋됩니다.

## 결과 집합 타입 {#result-set-types}

ResultSet은 메타데이터로 결과 타입을 나타냅니다:

```java
try (ResultSet<SqlRow> rs = ignite.sql().execute(null, query)) {
    if (rs.hasRowSet()) {
        // SELECT query, process rows
        while (rs.hasNext()) {
            SqlRow row = rs.next();
            // Process row
        }
    } else {
        // DML or DDL
        if (rs.affectedRows() >= 0) {
            // DML operation
            System.out.println("Affected: " + rs.affectedRows());
        } else {
            // DDL operation
            System.out.println("Applied: " + rs.wasApplied());
        }
    }
}
```

## SqlRow 접근 {#sqlrow-access}

이름 또는 인덱스로 행 값에 접근합니다:

```java
SqlRow row = rs.next();

// By column name
int id = row.intValue("id");
String name = row.stringValue("name");
Double price = row.value("price");

// By index
Object value0 = row.value(0);
String column0 = row.columnName(0);

// Access metadata
ResultSetMetadata metadata = row.metadata();
int columnCount = row.columnCount();
```

SqlRow는 Tuple을 확장하며, Tuple의 모든 접근 메서드를 제공합니다.

## 참조 {#reference}

- SQL 퍼사드: `org.apache.ignite.sql.IgniteSql`
- 문: `org.apache.ignite.sql.Statement`
- 결과: `org.apache.ignite.sql.ResultSet<T>`
- 행: `org.apache.ignite.sql.SqlRow`
- 메타데이터: `org.apache.ignite.sql.ResultSetMetadata`, `org.apache.ignite.sql.ColumnMetadata`
- 일괄 처리: `org.apache.ignite.sql.BatchedArguments`

### IgniteSql 메서드 {#ignitesql-methods}

- `Statement createStatement(String query)` - 쿼리로 문 생성
- `Statement.StatementBuilder statementBuilder()` - 문 빌더 생성
- `ResultSet<SqlRow> execute(Transaction, String query, Object...)` - 매개변수와 함께 쿼리 실행
- `ResultSet<SqlRow> execute(Transaction, Statement, Object...)` - 준비된 문 실행
- `CompletableFuture<AsyncResultSet<SqlRow>> executeAsync(...)` - 비동기 실행
- `ResultSet<SqlRow> execute(Transaction, CancellationToken, String query, Object...)` - 취소 기능과 함께 실행
- `<R> ResultSet<R> execute(Transaction, Mapper<R>, String query, Object...)` - 결과 매핑과 함께 실행
- `long[] executeBatch(Transaction, String dmlQuery, BatchedArguments)` - 일괄 처리 실행
- `CompletableFuture<long[]> executeBatchAsync(Transaction, String query, BatchedArguments)` - 일괄 처리를 비동기로 실행

### 문 구성 {#statement-configuration-1}

- `String query()` - 쿼리 문자열 조회
- `long queryTimeout(TimeUnit)` - 타임아웃 조회
- `String defaultSchema()` - 기본 스키마 조회
- `int pageSize()` - 결과 페이지 크기 조회
- `ZoneId timeZoneId()` - 시간대 조회

### 문 빌더 메서드 {#statement-builder-methods}

- `query(String)` - 쿼리 문자열 설정
- `defaultSchema(String)` - 기본 스키마 설정
- `queryTimeout(long, TimeUnit)` - 쿼리 타임아웃 설정
- `pageSize(int)` - 결과 페이지 크기 설정
- `timeZoneId(ZoneId)` - 시간대 설정
- `build()` - 문 생성

### ResultSet 메서드 {#resultset-methods}

- `ResultSetMetadata metadata()` - 결과 메타데이터 조회
- `boolean hasRowSet()` - 행 포함 여부 확인
- `long affectedRows()` - 영향받은 행 수 조회
- `boolean wasApplied()` - DDL 적용 여부 확인
- `boolean hasNext()` - 다음 행 존재 여부 확인
- `T next()` - 다음 행 조회
- `void close()` - 결과 집합 닫기

### ResultSetMetadata 메서드 {#resultsetmetadata-methods}

- `List<ColumnMetadata> columns()` - 컬럼 메타데이터 목록 조회
- `int indexOf(String columnName)` - 이름으로 컬럼 인덱스 조회

### ColumnMetadata 메서드 {#columnmetadata-methods}

- `String name()` - 컬럼 이름
- `ColumnType type()` - 컬럼 타입
- `boolean nullable()` - NULL 허용 여부
- `int precision()` - 정밀도
- `int scale()` - 스케일
- `Class<?> valueClass()` - 값 클래스
- `ColumnOrigin origin()` - 컬럼 출처
