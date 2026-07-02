---
title: Criteria API
id: criteria-api
sidebar_position: 9
---

# Criteria API

Criteria API는 테이블 작업에 사용할 타입 안전 쿼리 조건자(predicate)를 만듭니다. 애플리케이션은 문자열 기반 SQL 대신 Java 코드로 쿼리를 구성합니다. 이 방식은 쿼리 구성에 컴파일 시점 검증과 IDE 지원을 제공합니다.

## 핵심 개념 {#key-concepts}

Criteria 쿼리는 조건자로 테이블 데이터를 필터링합니다. 조건자는 컬럼 조건을 논리 연산자로 결합합니다. 이 API는 동등 비교, 범위, null 검사, 패턴 매칭 등 일반적인 비교 연산을 지원합니다.

RecordView와 KeyValueView는 모두 CriteriaQuerySource를 구현하므로, 어떤 뷰 타입에서든 Criteria 쿼리를 실행할 수 있습니다. 결과는 커서를 통해 스트리밍되며, 리소스를 해제하려면 커서를 반드시 닫아야 합니다.

## 기본 Criteria 쿼리 {#basic-criteria-queries}

간단한 동등 조건으로 쿼리합니다:

```java
RecordView<Tuple> view = table.recordView();

Criteria criteria = Criteria.columnValue(
    "age",
    Condition.equalTo(30)
);

try (Cursor<Tuple> cursor = view.query(null, criteria, null, null)) {
    for (Tuple record : cursor) {
        System.out.println(record.stringValue("name"));
    }
}
```

서버 리소스를 해제하려면 커서를 항상 닫으세요.

## 비교 조건 {#comparison-conditions}

다양한 비교 연산자를 사용합니다:

```java
// Greater than
Criteria criteria1 = Criteria.columnValue("age", Condition.greaterThan(25));

// Greater or equal
Criteria criteria2 = Criteria.columnValue("age", Condition.greaterThanOrEqualTo(25));

// Less than
Criteria criteria3 = Criteria.columnValue("age", Condition.lessThan(65));

// Less or equal
Criteria criteria4 = Criteria.columnValue("age", Condition.lessThanOrEqualTo(65));

// Not equal
Criteria criteria5 = Criteria.columnValue("status", Condition.notEqualTo("inactive"));
```

## null 검사 {#null-checks}

null 값이나 null이 아닌 값을 확인합니다:

```java
// IS NULL
Criteria nullCriteria = Criteria.columnValue("middleName", Condition.nullValue());

try (Cursor<Tuple> cursor = view.query(null, nullCriteria, null)) {
    for (Tuple record : cursor) {
        System.out.println(record.stringValue("name"));
    }
}

// IS NOT NULL
Criteria notNullCriteria = Criteria.columnValue("email", Condition.notNullValue());
```

## IN 조건 {#in-conditions}

여러 값과 대조합니다:

```java
Criteria criteria = Criteria.columnValue(
    "category",
    Condition.in("electronics", "appliances", "gadgets")
);

try (Cursor<Tuple> cursor = view.query(null, criteria, null, null)) {
    for (Tuple record : cursor) {
        System.out.println(record.stringValue("name"));
    }
}

// NOT IN
Criteria notInCriteria = Criteria.columnValue(
    "status",
    Condition.notIn("deleted", "archived")
);
```

## AND 조건 {#and-conditions}

여러 조건을 AND로 결합합니다:

```java
Criteria ageCriteria = Criteria.columnValue("age", Condition.greaterThan(25));
Criteria statusCriteria = Criteria.columnValue("status", Condition.equalTo("active"));

Criteria combined = Criteria.and(ageCriteria, statusCriteria);

try (Cursor<Tuple> cursor = view.query(null, combined, null, null)) {
    for (Tuple record : cursor) {
        System.out.println(record.stringValue("name"));
    }
}
```

레코드가 AND Criteria를 충족하려면 모든 조건이 일치해야 합니다.

## OR 조건 {#or-conditions}

조건을 OR로 결합합니다:

```java
Criteria junior = Criteria.columnValue("age", Condition.lessThan(30));
Criteria senior = Criteria.columnValue("age", Condition.greaterThan(60));

Criteria combined = Criteria.or(junior, senior);

try (Cursor<Tuple> cursor = view.query(null, combined, null, null)) {
    for (Tuple record : cursor) {
        System.out.println(record.stringValue("name") + ": " +
            record.intValue("age"));
    }
}
```

조건 중 하나라도 일치하는 레코드가 OR Criteria를 충족합니다.

## 복합 조건자 {#complex-predicates}

AND와 OR 조건을 중첩합니다:

```java
Criteria youngActive = Criteria.and(
    Criteria.columnValue("age", Condition.lessThan(30)),
    Criteria.columnValue("status", Condition.equalTo("active"))
);

Criteria seniorActive = Criteria.and(
    Criteria.columnValue("age", Condition.greaterThan(60)),
    Criteria.columnValue("status", Condition.equalTo("active"))
);

Criteria combined = Criteria.or(youngActive, seniorActive);

try (Cursor<Tuple> cursor = view.query(null, combined, null, null)) {
    for (Tuple record : cursor) {
        System.out.println(record.stringValue("name"));
    }
}
```

## 타입 지정 Criteria 쿼리 {#typed-criteria-queries}

타입 지정 뷰를 Criteria로 쿼리합니다:

```java
public class User {
    public int id;
    public String name;
    public int age;
    public String status;
}

RecordView<User> view = table.recordView(User.class);

Criteria criteria = Criteria.and(
    Criteria.columnValue("age", Condition.greaterThan(25)),
    Criteria.columnValue("status", Condition.equalTo("active"))
);

try (Cursor<User> cursor = view.query(null, criteria, null, null)) {
    for (User user : cursor) {
        System.out.println(user.name + " is " + user.age + " years old");
    }
}
```

## 키-값 뷰 쿼리 {#key-value-view-queries}

키-값 뷰를 Criteria로 쿼리합니다:

```java
KeyValueView<Tuple, Tuple> view = table.keyValueView();

Criteria criteria = Criteria.columnValue("category", Condition.equalTo("electronics"));

try (Cursor<Entry<Tuple, Tuple>> cursor = view.query(null, criteria, null, null)) {
    for (Entry<Tuple, Tuple> entry : cursor) {
        Tuple key = entry.getKey();
        Tuple value = entry.getValue();
        System.out.println("Product " + key.intValue("id") + ": " +
            value.stringValue("name"));
    }
}
```

키-값 쿼리는 키와 값을 담은 Entry 인스턴스를 반환합니다.

## 쿼리 옵션 {#query-options}

쿼리 동작을 구성합니다:

```java
CriteriaQueryOptions options = CriteriaQueryOptions.builder()
    .pageSize(100)
    .build();

try (Cursor<Tuple> cursor = view.query(null, criteria, null, options)) {
    for (Tuple record : cursor) {
        // Process records
    }
}
```

쿼리 옵션은 결과 페이지네이션과 페치 동작을 제어합니다.

## 비동기 쿼리 {#asynchronous-queries}

Criteria 쿼리를 비동기로 실행합니다:

```java
Criteria criteria = Criteria.columnValue("age", Condition.greaterThan(30));

CompletableFuture<AsyncCursor<Tuple>> cursorFuture =
    view.queryAsync(null, criteria, null, null);

cursorFuture.thenAccept(cursor -> {
    for (Tuple record : cursor.currentPage()) {
        System.out.println(record.stringValue("name"));
    }
    cursor.closeAsync();
});
```

비동기 쿼리는 차단 없이 즉시 반환됩니다. 결과에 접근하려면 currentPage()를, 리소스를 해제하려면 closeAsync()를 사용합니다.

## 트랜잭션 통합 {#transaction-integration}

트랜잭션 안에서 쿼리를 실행합니다:

```java
ignite.transactions().runInTransaction(tx -> {
    RecordView<Tuple> view = table.recordView();

    Criteria criteria = Criteria.columnValue("balance", Condition.greaterThan(1000));

    try (Cursor<Tuple> cursor = view.query(tx, criteria, null, null)) {
        for (Tuple record : cursor) {
            int balance = record.intValue("balance");
            record.set("balance", balance * 1.05);
            view.upsert(tx, record);
        }
    }
});
```

트랜잭션 안의 쿼리는 일관된 데이터 스냅샷을 참조합니다.

## 범위 쿼리 {#range-queries}

범위 쿼리를 위해 조건을 결합합니다:

```java
Criteria rangeCriteria = Criteria.and(
    Criteria.columnValue("price", Condition.greaterThanOrEqualTo(10.0)),
    Criteria.columnValue("price", Condition.lessThanOrEqualTo(50.0))
);

try (Cursor<Tuple> cursor = view.query(null, rangeCriteria, null, null)) {
    for (Tuple record : cursor) {
        System.out.println(record.stringValue("name") + ": $" +
            record.doubleValue("price"));
    }
}
```

## 여러 컬럼 조건 {#multiple-column-conditions}

여러 컬럼에 대해 쿼리합니다:

```java
Criteria criteria = Criteria.and(
    Criteria.columnValue("category", Condition.equalTo("electronics")),
    Criteria.columnValue("inStock", Condition.equalTo(true)),
    Criteria.columnValue("price", Condition.lessThan(1000.0)),
    Criteria.columnValue("rating", Condition.greaterThanOrEqualTo(4.0))
);

try (Cursor<Tuple> cursor = view.query(null, criteria, null, null)) {
    for (Tuple record : cursor) {
        System.out.println(record.stringValue("name"));
    }
}
```

## 커서 순회 {#cursor-iteration}

커서 결과를 처리합니다:

```java
Criteria criteria = Criteria.columnValue("status", Condition.equalTo("pending"));

try (Cursor<Tuple> cursor = view.query(null, criteria, null, null)) {
    while (cursor.hasNext()) {
        Tuple record = cursor.next();
        System.out.println(record.stringValue("orderId"));
    }
}
```

커서는 Iterator를 구현하므로 표준 순회 패턴을 사용할 수 있습니다.

## 참조 {#reference}

- Criteria 빌더: `org.apache.ignite.table.criteria.Criteria`
- 조건: `org.apache.ignite.table.criteria.Condition`
- 쿼리 소스: `org.apache.ignite.table.criteria.CriteriaQuerySource<R>`
- 쿼리 옵션: `org.apache.ignite.table.criteria.CriteriaQueryOptions`
- 컬럼 참조: `org.apache.ignite.table.criteria.Column`

### Criteria 팩토리 메서드 {#criteria-factory-methods}

- `static Criteria columnValue(String, Condition)` - 컬럼 조건 생성
- `static Criteria and(Criteria...)` - AND로 결합
- `static Criteria or(Criteria...)` - OR로 결합

### Condition 팩토리 메서드 {#condition-factory-methods}

- `static Condition equalTo(Object)` - 동등 비교
- `static Condition notEqualTo(Object)` - 부등 비교
- `static Condition greaterThan(Object)` - 초과
- `static Condition greaterThanOrEqualTo(Object)` - 이상
- `static Condition lessThan(Object)` - 미만
- `static Condition lessThanOrEqualTo(Object)` - 이하
- `static Condition in(Object...)` - IN 절
- `static Condition notIn(Object...)` - NOT IN 절
- `static Condition nullValue()` - IS NULL
- `static Condition notNullValue()` - IS NOT NULL

### CriteriaQuerySource 메서드 {#criteriaquerysource-methods}

- `Cursor<R> query(Transaction, Criteria, String, CriteriaQueryOptions)` - 쿼리 실행
- `CompletableFuture<AsyncCursor<R>> queryAsync(Transaction, Criteria, String, CriteriaQueryOptions)` - 비동기 쿼리

### CriteriaQueryOptions 구성 {#criteriaqueryoptions-configuration}

- `pageSize(int)` - 결과 페이지 크기 설정
- `build()` - 옵션 빌드

### 커서 작업 {#cursor-operations}

- `boolean hasNext()` - 결과가 더 있는지 확인
- `R next()` - 다음 결과 조회
- `void close()` - 커서를 닫고 리소스 해제
