---
title: Catalog API
id: catalog-api
sidebar_position: 8
---

# Catalog API

Catalog API는 테이블 스키마, 인덱스, 분산 영역(distribution zone)을 관리합니다. 애플리케이션은 Java 애노테이션이나 플루언트 빌더(fluent builder)로 스키마를 정의하며, SQL 문을 작성하지 않고도 프로그래밍 방식으로 DDL을 수행합니다. 이 방식은 컴파일 시점 검증과 타입 안전성을 제공합니다.

## 핵심 개념 {#key-concepts}

카탈로그 퍼사드(facade)는 데이터베이스 객체를 생성, 수정, 삭제합니다. 테이블 정의는 컬럼, 기본 키, 인덱스, 콜로케이션(colocation) 전략을 지정합니다. 분산 영역은 클러스터 노드 전반의 데이터 배치를 제어합니다.

애노테이션은 선언적 스키마 정의를 제공합니다. @Table이 붙은 클래스는 테이블 정의가 됩니다. 카탈로그는 이런 클래스로부터 테이블을 자동으로 생성합니다. 애노테이션이 적합하지 않을 때는 플루언트 빌더가 프로그래밍 방식 대안을 제공합니다.

## 애노테이션 기반 테이블 {#annotation-based-tables}

애노테이션으로 테이블을 정의합니다:

```java
@Table("users")
public class User {
    @Id
    public Integer id;

    @Column
    public String name;

    @Column(nullable = false)
    public Integer age;

    @Column(length = 100)
    public String email;
}
```

애노테이션이 붙은 클래스로부터 테이블을 생성합니다:

```java
CompletableFuture<Table> tableFuture =
    ignite.catalog().createTableAsync(User.class);

Table table = tableFuture.join();
```

카탈로그는 애노테이션으로부터 DDL을 생성합니다.

## 키-값 테이블 정의 {#key-value-table-definitions}

키 클래스와 값 클래스를 분리해 테이블을 정의합니다:

```java
@Table("products")
public class ProductKey {
    @Id
    public Integer productId;
}

public class ProductValue {
    @Column
    public String name;

    @Column
    public Double price;

    @Column
    public String category;
}
```

테이블을 생성합니다:

```java
CompletableFuture<Table> tableFuture =
    ignite.catalog().createTableAsync(
        ProductKey.class,
        ProductValue.class
    );
```

## 컬럼 구성 {#column-configuration}

컬럼 속성을 구성합니다:

```java
@Table("items")
public class Item {
    @Id
    public Integer id;

    @Column(value = "item_name", nullable = false, length = 50)
    public String name;

    @Column(precision = 10, scale = 2)
    public BigDecimal price;

    @Column(columnDefinition = "VARCHAR(255) DEFAULT 'N/A'")
    public String description;
}
```

컬럼 애노테이션이 지원하는 속성:
- `value` - 컬럼 이름(기본값은 필드 이름)
- `nullable` - null 값 허용 여부(기본값 true)
- `length` - 문자열의 최대 길이
- `precision` - 숫자 정밀도
- `scale` - 숫자 스케일
- `columnDefinition` - 전체 SQL 타입 정의

## 복합 기본 키 {#composite-primary-keys}

여러 컬럼으로 구성된 기본 키를 정의합니다:

```java
@Table("orders")
public class Order {
    @Id
    public Integer customerId;

    @Id
    public Integer orderId;

    @Column
    public LocalDateTime orderDate;

    @Column
    public String status;
}
```

@Id 애노테이션이 붙은 필드가 복합 기본 키를 구성합니다.

## 기본 키 정렬 순서 {#primary-key-ordering}

기본 키의 정렬 순서를 지정합니다:

```java
@Table("events")
public class Event {
    @Id(SortOrder.ASC)
    public Integer categoryId;

    @Id(SortOrder.DESC)
    public Long timestamp;

    @Column
    public String message;
}
```

## 인덱스 정의 {#index-definitions}

테이블 애노테이션으로 인덱스를 추가합니다:

```java
@Table(
    value = "users",
    indexes = {
        @Index(
            value = "idx_email",
            columns = @ColumnRef("email")
        ),
        @Index(
            value = "idx_name_age",
            columns = {
                @ColumnRef("name"),
                @ColumnRef(value = "age", sort = SortOrder.DESC)
            }
        )
    }
)
public class User {
    @Id
    public Integer id;

    @Column
    public String name;

    @Column
    public Integer age;

    @Column
    public String email;
}
```

인덱스 애노테이션은 정렬 순서를 지정한 단일 인덱스와 복합 인덱스를 지원합니다.

## 콜로케이션 구성 {#colocation-configuration}

데이터 콜로케이션을 구성합니다:

```java
@Table(
    value = "orders",
    colocateBy = {
        @ColumnRef("customerId")
    }
)
public class Order {
    @Id
    public Integer customerId;

    @Id
    public Integer orderId;

    @Column
    public String product;
}
```

콜로케이션은 콜로케이션 키 값이 같은 행이 같은 노드에 저장되도록 보장합니다.

## 영역 구성 {#zone-configuration}

분산 영역을 정의합니다:

```java
@Table(
    value = "cache_data",
    zone = @Zone(
        value = "cache_zone",
        partitions = 64,
        replicas = 3,
        storageProfiles = "default"
    )
)
public class CacheRecord {
    @Id
    public String key;

    @Column
    public String value;
}
```

영역 애노테이션은 파티셔닝, 복제, 스토리지를 구성합니다.

## 플루언트 테이블 정의 {#fluent-table-definitions}

프로그래밍 방식으로 테이블을 만듭니다:

```java
TableDefinition definition = TableDefinition.builder("products")
    .columns(
        ColumnDefinition.column("id", ColumnType.INT32),
        ColumnDefinition.column("name", ColumnType.VARCHAR),
        ColumnDefinition.column("price", ColumnType.decimal(10, 2)),
        ColumnDefinition.column("category", ColumnType.varchar(50))
    )
    .primaryKey("id")
    .build();

ignite.catalog().createTableAsync(definition).join();
```

## 빌더를 사용한 인덱스 정의 {#index-definitions-with-builders}

테이블 정의에 인덱스를 추가합니다:

```java
TableDefinition definition = TableDefinition.builder("users")
    .columns(
        ColumnDefinition.column("id", ColumnType.INT32),
        ColumnDefinition.column("email", ColumnType.VARCHAR),
        ColumnDefinition.column("name", ColumnType.VARCHAR)
    )
    .primaryKey("id")
    .index("idx_email", IndexType.SORTED, ColumnSorted.column("email"))
    .index("idx_name", IndexType.SORTED, ColumnSorted.column("name"))
    .build();

ignite.catalog().createTableAsync(definition).join();
```

## 조건부 테이블 생성 {#conditional-table-creation}

테이블이 없을 때만 생성합니다:

```java
TableDefinition definition = TableDefinition.builder("cache_data")
    .columns(
        ColumnDefinition.column("key", ColumnType.VARCHAR),
        ColumnDefinition.column("value", ColumnType.VARCHAR)
    )
    .primaryKey("key")
    .ifNotExists()
    .build();

ignite.catalog().createTableAsync(definition).join();
```

## 테이블 삭제 {#table-deletion}

이름으로 테이블을 삭제합니다:

```java
ignite.catalog().dropTableAsync("products").join();
```

정규화된 이름(qualified name)으로 삭제합니다:

```java
QualifiedName tableName = QualifiedName.of("schema", "products");
ignite.catalog().dropTableAsync(tableName).join();
```

## 분산 영역 관리 {#distribution-zone-management}

분산 영역을 생성합니다:

```java
ZoneDefinition zone = ZoneDefinition.builder("fast_zone")
    .partitions(128)
    .replicas(2)
    .storageProfiles("ssd")
    .dataNodesAutoAdjustScaleUp(300)
    .dataNodesAutoAdjustScaleDown(600)
    .build();

ignite.catalog().createZoneAsync(zone).join();
```

영역 구성 옵션:
- `partitions` - 파티션 수
- `replicas` - 파티션당 복제본 수
- `storageProfiles` - 스토리지 프로파일 이름(여러 개는 쉼표로 구분)
- `dataNodesAutoAdjustScaleUp` - 확장 타임아웃(초 단위)
- `dataNodesAutoAdjustScaleDown` - 축소 타임아웃(초 단위)
- `filter` - 노드 필터 표현식
- `consistencyMode` - 일관성 모드

## 영역 삭제 {#zone-deletion}

분산 영역을 삭제합니다:

```java
ignite.catalog().dropZoneAsync("fast_zone").join();
```

## 스키마 이름 {#schema-names}

테이블 애노테이션에서 스키마를 지정합니다:

```java
@Table(value = "users", schemaName = "app_schema")
public class User {
    @Id
    public Integer id;

    @Column
    public String name;
}
```

스키마를 명시하지 않은 테이블은 기본적으로 PUBLIC 스키마를 사용합니다.

## 복합 영역 구성 {#complex-zone-configuration}

고급 옵션으로 영역을 구성합니다:

```java
ZoneDefinition zone = ZoneDefinition.builder("replicated_zone")
    .partitions(32)
    .replicas(5)
    .quorumSize(3)
    .storageProfiles("ssd,hdd")
    .distributionAlgorithm("rendezvous")
    .consistencyMode("strong")
    .filter("region == 'us-east'")
    .build();

ignite.catalog().createZoneAsync(zone).join();
```

## 참조 {#reference}

- 카탈로그 퍼사드: `org.apache.ignite.catalog.IgniteCatalog`
- 테이블 정의: `org.apache.ignite.catalog.definitions.TableDefinition`
- 컬럼 정의: `org.apache.ignite.catalog.definitions.ColumnDefinition`
- 인덱스 정의: `org.apache.ignite.catalog.definitions.IndexDefinition`
- 영역 정의: `org.apache.ignite.catalog.definitions.ZoneDefinition`

### 애노테이션 {#annotations}

- `@Table` - 클래스를 테이블 정의로 표시
- `@Column` - 컬럼 속성 구성
- `@Id` - 기본 키 컬럼 표시
- `@Index` - 테이블 인덱스 정의
- `@Zone` - 분산 영역 구성
- `@ColumnRef` - 인덱스와 콜로케이션에서 컬럼 참조

### IgniteCatalog 메서드 {#ignitecatalog-methods}

- `CompletableFuture<Table> createTableAsync(Class<?>)` - 애노테이션이 붙은 클래스로 생성
- `CompletableFuture<Table> createTableAsync(Class<?>, Class<?>)` - 키-값 클래스로 생성
- `CompletableFuture<Table> createTableAsync(TableDefinition)` - 정의로 생성
- `CompletableFuture<Void> dropTableAsync(String)` - 이름으로 테이블 삭제
- `CompletableFuture<Void> dropTableAsync(QualifiedName)` - 정규화된 이름으로 삭제
- `CompletableFuture<Void> createZoneAsync(ZoneDefinition)` - 분산 영역 생성
- `CompletableFuture<Void> dropZoneAsync(String)` - 영역 삭제

### TableDefinition 빌더 메서드 {#tabledefinition-builder-methods}

- `static Builder builder(String)` - 빌더 생성
- `columns(ColumnDefinition...)` - 컬럼 추가
- `primaryKey(String...)` - 기본 키 설정
- `index(String...)` - 지정한 컬럼에 인덱스 추가(기본 인덱스 타입 사용)
- `index(String, IndexType, ColumnSorted...)` - 타입과 정렬 컬럼을 지정한 이름 있는 인덱스 추가
- `colocateBy(String...)` - 콜로케이션 컬럼 설정
- `zone(String)` - 영역 이름 설정
- `ifNotExists()` - 없을 때만 생성
- `build()` - 정의 빌드

### ZoneDefinition 빌더 메서드 {#zonedefinition-builder-methods}

- `static Builder builder(String)` - 빌더 생성
- `partitions(int)` - 파티션 수 설정
- `replicas(int)` - 복제본 수 설정
- `quorumSize(int)` - 정족수 크기 설정
- `storageProfiles(String)` - 스토리지 프로파일 설정(단일 문자열, 여러 개는 쉼표로 구분)
- `distributionAlgorithm(String)` - 분산 알고리즘 설정
- `dataNodesAutoAdjustScaleUp(int)` - 확장 타임아웃 설정
- `dataNodesAutoAdjustScaleDown(int)` - 축소 타임아웃 설정
- `filter(String)` - 노드 필터 표현식 설정
- `consistencyMode(String)` - 일관성 모드 설정
- `build()` - 정의 빌드
