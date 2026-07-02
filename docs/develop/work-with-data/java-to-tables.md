---
id: java-to-tables
title: Java 클래스로 테이블 생성하기
---

## 개요 {#overview}

[SQL DDL](/sql/reference/language-definition/ddl)이 테이블 조작 명령어를 모두 지원하지만, 간단한 Java API를 사용하면 POJO에서 직접 테이블을 생성하고 인덱스를 구축할 수도 있습니다.

이 API는 사용자 정의 애노테이션과 간단한 빌더를 지원하며, Mapper 인터페이스와 매끄럽게 동작해 [KeyValueView와 RecordView](/develop/work-with-data/table-api) 사용을 돕습니다.

Java API를 사용하면 다음 작업을 수행할 수 있습니다.

* CREATE ZONE
* CREATE TABLE
* CREATE INDEX
* DROP ZONE
* DROP TABLE
* DROP INDEX
* CREATE SCHEMA
* DROP SCHEMA

`org.apache.ignite.catalog.annotations` 패키지에 있는 @Table 등의 애노테이션을 사용하세요.

## 예시 {#examples}

### KeyValueView와 호환되는 키-값 POJO {#key-value-pojo-compatible-with-keyvalueview}

아래 예시는 `KeyValueView`와 호환되는 POJO를 사용해 `kv_pojo`라는 테이블을 생성합니다.

```java
@Table(value = "kv_pojo",
        zone = @Zone(value = "zone_test", replicas = 2, storageProfiles = "default"),
        colocateBy = {@ColumnRef("id"), @ColumnRef("id_str")},
        indexes = @Index(value = "ix", columns = {@ColumnRef("f_name"), @ColumnRef("l_name")}))

public static class PojoKey {
    @Id
    Integer id;

    @Id(SortOrder.DEFAULT)
    @Column(value = "id_str", length = 20)
    String idStr;

    public PojoKey(Integer id, String idStr) {
        this.id = id;
        this.idStr = idStr;
    }
}

public static class PojoValue {
    @Column("f_name")
    private String firstName;

    @Column("l_name")
    private String lastName;

    public PojoValue(String firstName, String lastName) {
        this.firstName = firstName;
        this.lastName = lastName;
    }
}


public static void main(String[] args) {

    System.out.println("\nConnecting to server...");

    try (IgniteClient client = IgniteClient.builder()
            .addresses("127.0.0.1:10800")
            .build()
    ) {

        org.apache.ignite.table.Table myTable = client.catalog().createTable(PojoKey.class, PojoValue.class);

        KeyValueView<PojoKey, PojoValue> kvView = myTable.keyValueView(PojoKey.class, PojoValue.class);
        PojoKey key = new PojoKey(1, "sample");
        PojoValue putValue = new PojoValue("John", "Smith");
        kvView.put(null, key, putValue);

        PojoValue getValue = kvView.get(null, key);
        System.out.println(
                "\nRetrieved values:\n"
                        + "    Account ID: " + key.id + '\n'
                        + "    First name: " + getValue.firstName + '\n'
                        + "    Last name" + getValue.lastName);

    }
}
```

:::note
CLI 도구를 사용해 노드 구성에 [스토리지 프로파일](/configure-and-operate/configuration/config-storage-overview)을 생성해야 합니다.
:::

이 결과는 다음과 같은 여러 SQL 문을 실행한 것과 동일합니다.

```sql
CREATE ZONE IF NOT EXISTS zone_test WITH PARTITIONS=2, STORAGE_PROFILES='default';

CREATE TABLE IF NOT EXISTS kv_pojo (
	id int,
	id_str varchar(20),
	f_name varchar,
	l_name varchar,
	str varchar,
	PRIMARY KEY (id, id_str)
)
COLOCATE BY (id, id_str)
WITH PRIMARY_ZONE='ZONE';

CREATE INDEX ix (f_name, l_name desc nulls last);
```

### RecordView와 호환되는 단일 POJO {#single-pojo-compatible-with-recordview}

아래 예시는 `RecordView`와 호환되는 POJO를 사용해 `pojo_sample` 테이블을 생성합니다.

```java
@Table(value = "pojo_sample",
        zone = @Zone(value = "zone_test", replicas = 2, storageProfiles = "default"),
        colocateBy = {@ColumnRef("id"), @ColumnRef("id_str")},
        indexes = @Index(value = "ix_sample", columns = {@ColumnRef("f_name"), @ColumnRef("l_name")}))

public static class Pojo {
    @Id
    Integer id;

    @Id(SortOrder.DEFAULT)
    @Column(value = "id_str", length = 20)
    String idStr;

    @Column("f_name")
    String firstName;

    @Column("l_name")
    String lastName;

    String str;
}

public static void main(String[] args) {

    System.out.println("\nConnecting to server...");

    try (IgniteClient client = IgniteClient.builder()
            .addresses("127.0.0.1:10800")
            .build()
    ) {

        org.apache.ignite.table.Table myTable = client.catalog().createTable(Pojo.class);

        RecordView<Tuple> view = myTable.recordView();
        Tuple insertTuple = Tuple.create()
                .set("id", 1)
                .set("id_str", "sample")
                .set("f_name", "John")
                .set("l_name", "Smith");
        view.insert(null, insertTuple);

        Tuple getTuple = view.get(null, insertTuple);
        System.out.println(
                "\nRetrieved record: " +
                        getTuple.stringValue("f_name")
        );
    }
}
```

### @Table 애노테이션의 대안인 빌더 {#the-builder-alternative-to-the-table-annotation}

아래 예시는 Java 클래스로 테이블을 생성하는 대신 빌더를 사용해 테이블을 생성합니다.

:::note
빌더를 사용할 때는 필드에 `@Id`와 `@Column` 애노테이션만 사용할 수 있습니다.
:::

```java
IgniteCatalog catalog = client.catalog();

catalog.createTable(
        TableDefinition.builder("sampleTable3")
                .primaryKey("myKey")
                .columns(
                        column("myKey", ColumnType.INT32),
                        column("myValue", ColumnType.VARCHAR)
                )
                .build()
);

Table myTable = client.tables().table("sampleTable3");
myTable.keyValueView().put(null, Tuple.create().set("myKey", 1), Tuple.create().set("myValue", "John"));

Tuple value = myTable.keyValueView().get(null, Tuple.create().set("myKey", 1));
System.out.println(
        "\nRetrieved value:\n" +
        value.stringValue("myValue")
);
```

## 다음 단계 {#next-steps}

Java API로 테이블을 생성했다면, [SQL 명령어](/sql/reference/language-definition/ddl)로 테이블을 조작할 수 있습니다.
