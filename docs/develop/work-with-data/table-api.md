---
id: table-api
title: Table API
---

특정 테이블에서 테이블 작업을 실행하려면 해당 테이블의 특정 뷰를 가져와 그 메서드 중 하나를 사용해야 합니다. 새 테이블은 SQL API로만 생성할 수 있습니다.

Apache Ignite는 사용자 객체를 테이블 튜플에 매핑하는 기능을 지원합니다. 덕분에 어떤 프로그래밍 언어로 생성한 객체든 키-값 작업에 직접 사용할 수 있습니다.

## Apache Ignite의 테이블 뷰 {#table-views-in-apache-ignite}

### 튜플 뷰와 키-값 뷰 {#tuple-and-key-value-views}

테이블을 다룰 때 Apache Ignite는 두 가지 방식을 제공합니다. 데이터를 직접 다루거나, 데이터를 클래스에 매핑하는 방식입니다. 직접 다루는 방식은 데이터 튜플을 처리합니다. 클래스에 매핑하는 방식에서는 데이터베이스 상호작용에 필요할 때마다 데이터가 이 클래스로, 또는 클래스로부터 변환됩니다.

### 레코드 뷰와 키-값 뷰 {#record-and-key-value-views}

뷰를 생성할 때 `RecordView` 또는 `KeyValueView`를 만들 수 있습니다. 이 두 뷰 유형의 주요 차이는 사용하는 API입니다.

RecordView에서는 테이블에서 수정하거나 조회할 행에 대한 모든 정보를 담은 단일 "레코드"를 만들어 서버로 보냅니다. 이 레코드에는 기본 키를 포함한 모든 필드가 들어 있어야 합니다.

KeyValueView에서는 키-값 매핑을 다룹니다. 키 객체가 기본 키 필드(하나 또는 여러 개)를 담고 값 객체가 데이터 필드를 담는 딕셔너리라고 생각하면 됩니다. 이 방식은 기본 키가 도메인 객체와 직접 관련이 없어 도메인 객체에 기본 키를 추가하지 않으려는 경우에 유용합니다.

## 데이터 타입 지원 {#data-type-support}

### 시간 및 날짜 데이터 타입 {#time-and-date-data-types}

테이블 뷰 작업에는 JavaTime API만 지원됩니다. 다음 데이터 타입은 지원되지 않습니다:

- `java.util.Date`
- `java.sql.Date`
- `java.sql.Time`
- `java.sql.Timestamp`

대신 다음 데이터 타입을 사용하세요:

- `java.time.LocalDate`
- `java.time.LocalTime`
- `java.time.LocalDateTime`
- `java.time.Instant`

## 테이블 인스턴스 가져오기 {#getting-a-table-instance}

먼저 테이블 인스턴스를 가져옵니다. 테이블 인스턴스를 얻으려면 `IgniteTables.table(String)` 메서드를 사용하세요. `IgniteTables.tables()` 메서드로 기존 테이블을 모두 나열할 수도 있습니다.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="java" label="Java">

```java
IgniteTables tableApi = client.tables();
List<Table> existingTables = tableApi.tables();
Table firstTable = existingTables.get(0);
```

</TabItem>
<TabItem value="net" label=".NET">

```csharp
var existingTables = await Client.Tables.GetTablesAsync();
var firstTable = existingTables[0];

var myTable = await Client.Tables.GetTableAsync("MY_TABLE");
```

</TabItem>
<TabItem value="cpp" label="C++">

```cpp
using namespace ignite;

auto table_api = client.get_tables();
std::vector<table> existing_tables = table_api.get_tables();
table first_table = existing_tables.front();

std::optional<table> my_table = table_api.get_table("MY_TABLE");
```

</TabItem>
</Tabs>

기본적으로 스키마 이름을 지정하지 않으면 `PUBLIC` 스키마가 사용됩니다. 정규화된 이름을 지정하면 지정한 스키마에서 테이블을 가져옵니다.

### 정규화된 테이블 이름 객체 {#qualified-table-name-object}

테이블 이름을 문자열로 지정하는 대신, 정규화된 전체 테이블 이름을 담는 `QualifiedName` 객체를 생성할 수 있습니다. Apache Ignite는 정규화된 이름을 만드는 두 가지 메서드를 제공합니다:

- `parse` 메서드로 정규화된 전체 테이블 이름을 파싱할 수 있습니다:

<Tabs>
<TabItem value="java" label="Java">

```java
QualifiedName qualifiedTableName = QualifiedName.parse("PUBLIC.Person");
Table myTable = tableApi.table(qualifiedTableName);
```

</TabItem>
</Tabs>

- `of` 메서드로 스키마 이름과 테이블 이름을 따로 제공할 수 있습니다:

<Tabs>
<TabItem value="java" label="Java">

```java
QualifiedName qualifiedTableName = QualifiedName.of("PUBLIC", "MY_TABLE");
Table myTable = tableApi.table(qualifiedTableName);
```

</TabItem>
</Tabs>

제공하는 이름은 SQL의 식별자 구문 규칙을 따라야 합니다:

- 식별자는 "Lu", "Ll", "Lt", "Lm", "Lo", "Nl" 유니코드 카테고리의 문자 또는 `U+0331`(밑줄)로 시작해야 합니다;
- 식별자 문자(첫 번째 문자 제외)는 `U+00B7`(가운뎃점)이거나 "Mn", "Mc", "Nd", "Pc", "Cf" 유니코드 카테고리의 문자일 수 있습니다;
- 그 밖의 문자를 포함하는 식별자는 `U+2033`(큰따옴표)으로 감싸야 합니다;
- 식별자 안의 큰따옴표는 큰따옴표 2개로 이스케이프해야 합니다.

따옴표로 감싸지 않은 이름은 모두 대문자로 변환됩니다. 이 경우 `Person`과 `PERSON` 이름은 동일합니다. 이를 피하려면 이름을 이스케이프한 따옴표로 감싸세요. 예를 들어 `\"Person\"`은 대소문자를 구분하는 `Person` 이름으로 인코딩됩니다. 이름에 `U+2033`(큰따옴표) 기호가 들어 있으면 `""`(큰따옴표 2개)로 이스케이프해야 합니다.

예를 들면 다음과 같습니다:

```
// Case-insensitive table `MY_TABLE` in a case-insensitive `PUBLIC` schema.
QualifiedName.parse("public.my_table"))

// Case-sensitive table `my_table` in a case-sensitive `public` schema.
QualifiedName.parse("\"public\".\"my_table\""))

// Same as above, but with comma as separator that needs to be surrounded by quote characters.
QualifiedName.of("\"public\"","\"my_table\""))

// Case-sensitive name my"table.
QualifiedName.parse("\"my\"\"table\""));

// Case-sensitive table name `public.my_table` in a default schema.
QualifiedName.parse("\"public.my_table\""));
```

## 기본 테이블 작업 {#basic-table-operations}

테이블을 가져왔다면, 테이블 레코드를 어떻게 다룰지 선택할 수 있도록 특정 뷰를 가져와야 합니다.

### 튜플 레코드 뷰 {#tuple-record-view}

튜플 레코드 뷰로 테이블 튜플을 직접 다룰 수 있습니다. 튜플 뷰에서 데이터를 조회할 때는 다양한 메서드를 사용해 튜플에 저장된 타입별 데이터를 가져올 수 있습니다. 전체 메서드 목록은 Tuple 객체 javadoc에 있습니다.

<Tabs>
<TabItem value="java" label="Java">

```java
RecordView<Tuple> accounts = client.tables().table("accounts").recordView();

System.out.println("\nInserting a record into the 'accounts' table...");

Tuple newAccountTuple = Tuple.create()
        .set("accountNumber", 123456)
        .set("firstName", "Val")
        .set("lastName", "Kulichenko")
        .set("balance", 100.00d);

accounts.insert(null, newAccountTuple);

System.out.println("\nRetrieving a record using RecordView API...");

Tuple accountNumberTuple = Tuple.create().set("accountNumber", 123456);

Tuple accountTuple = accounts.get(null, accountNumberTuple);

System.out.println(
        "\nRetrieved record:\n"
                + "    Account Number: " + accountTuple.intValue("accountNumber") + '\n'
                + "    Owner: " + accountTuple.stringValue("firstName") + " " + accountTuple.stringValue("lastName") + '\n'
                + "    Balance: $" + accountTuple.doubleValue("balance"));
```

</TabItem>
<TabItem value="net" label=".NET">

```csharp
IRecordView<IIgniteTuple> view = table.RecordBinaryView;

IIgniteTuple fullRecord = new IgniteTuple
{
  ["id"] = 42,
  ["name"] = "John Doe"
};

await view.UpsertAsync(transaction: null, fullRecord);

IIgniteTuple keyRecord = new IgniteTuple { ["id"] = 42 };
(IIgniteTuple value, bool hasValue) = await view.GetAsync(transaction: null, keyRecord);

Debug.Assert(hasValue);
Debug.Assert(value.FieldCount == 2);
Debug.Assert(value["id"] as int? == 42);
Debug.Assert(value["name"] as string == "John Doe");
```

</TabItem>
<TabItem value="cpp" label="C++">

```cpp
record_view<ignite_tuple> view = table.get_record_binary_view();

ignite_tuple record{
  {"id", 42},
  {"name", "John Doe"}
};

view.upsert(nullptr, record);
std::optional<ignite_tuple> res_record = view.get(nullptr, {"id", 42});

assert(res_record.has_value());
assert(res_record->column_count() == 2);
assert(res_record->get<std::int64_t>("id") == 42);
assert(res_record->get<std::string>("name") == "John Doe");
```

</TabItem>
</Tabs>

### 레코드 뷰 {#record-view}

레코드 뷰는 사용자 정의 타입에 매핑되며, 테이블 튜플에 매핑된 사용자 객체로 테이블 작업을 수행합니다.

타입 변환기를 생성하세요:

```java
static class CityIdConverter implements TypeConverter<String, Integer> {

    @Override
    public String  toObjectType(Integer columnValue) {
        return columnValue.toString();
    }

    @Override
    public Integer toColumnType(String cityId) {
        return Integer.parseInt(cityId);
    }
}
```

그런 다음 매퍼를 빌드하고 `RecordView`를 가져오세요:

```java
public static void main(String[] args) throws Exception {
    var mapper = Mapper.builder(Person.class)
            .automap()
            .map("cityId", "city_id", new CityIdConverter())
            .build();

    try (IgniteClient client = IgniteClient.builder()
            .addresses("127.0.0.1:10800")
            .build()
    ) {
        RecordView<Person> view = client.tables()
                .table("person")
                .recordView(mapper);


        Person myPerson = new Person(2, "2", "John Doe", 40, "Apache");

        view.upsert(null, myPerson);
    }
}
```

테이블 튜플에 매핑된 사용자 정의 객체로 테이블 작업을 수행하세요:

<Tabs>
<TabItem value="java" label="Java">

```java
RecordView<Account> accounts = client.tables()
        .table("accounts")
        .recordView(Account.class);

System.out.println("\nInserting a record into the 'accounts' table...");

Account newAccount = new Account(
        123456,
        "Val",
        "Kulichenko",
        100.00d
);

accounts.insert(null, newAccount);

System.out.println("\nRetrieving a record using RecordView API...");

Account account = accounts.get(null, new Account(123456));

System.out.println(
        "\nRetrieved record:\n"
            + "    Account Number: " + account.accountNumber + '\n'
            + "    Owner: " + account.firstName + " " + account.lastName + '\n'
            + "    Balance: $" + account.balance);
```

</TabItem>
<TabItem value="net" label=".NET">

```csharp
var pocoView = table.GetRecordView<Poco>();

await pocoView.UpsertAsync(transaction: null, new Poco(42, "John Doe"));
var (value, hasValue) = await pocoView.GetAsync(transaction: null, new Poco(42));

Debug.Assert(hasValue);
Debug.Assert(value.Name == "John Doe");

public record Poco(long Id, string? Name = null);
```

</TabItem>
<TabItem value="cpp" label="C++">

```cpp
record_view<person> view = table.get_record_view<person>();

person record(42, "John Doe");

view.upsert(nullptr, record);
std::optional<person> res_record = view.get(nullptr, person{42});

assert(res.has_value());
assert(res->id == 42);
assert(res->name == "John Doe");
```

</TabItem>
</Tabs>

### 키-값 튜플 뷰 {#key-value-tuple-view}

튜플 키-값 뷰입니다. 키 튜플과 값 튜플을 따로 사용해 테이블을 조작할 수 있습니다. 튜플 뷰에서 데이터를 조회할 때는 다양한 메서드를 사용해 튜플에 저장된 타입별 데이터를 가져올 수 있습니다. 전체 메서드 목록은 Tuple 객체 javadoc에 있습니다.

<Tabs>
<TabItem value="java" label="Java">

```java
KeyValueView<Tuple, Tuple> kvView = client.tables().table("accounts").keyValueView();

System.out.println("\nInserting a key-value pair into the 'accounts' table...");

Tuple key = Tuple.create()
        .set("accountNumber", 123456);

Tuple value = Tuple.create()
        .set("firstName", "Val")
        .set("lastName", "Kulichenko")
        .set("balance", 100.00d);

kvView.put(null, key, value);

System.out.println("\nRetrieving a value using KeyValueView API...");

value = kvView.get(null, key);

System.out.println(
        "\nRetrieved value:\n"
                + "    Account Number: " + key.intValue("accountNumber") + '\n'
                + "    Owner: " + value.stringValue("firstName") + " " + value.stringValue("lastName") + '\n'
                + "    Balance: $" + value.doubleValue("balance"));
```

</TabItem>
<TabItem value="net" label=".NET">

```csharp
IKeyValueView<IIgniteTuple, IIgniteTuple> kvView = table.KeyValueBinaryView;

IIgniteTuple key = new IgniteTuple { ["id"] = 42 };
IIgniteTuple val = new IgniteTuple { ["name"] = "John Doe" };

await kvView.PutAsync(transaction: null, key, val);
(IIgniteTuple? value, bool hasValue) = await kvView.GetAsync(transaction: null, key);

Debug.Assert(hasValue);
Debug.Assert(value.FieldCount == 1);
Debug.Assert(value["name"] as string == "John Doe");
```

</TabItem>
<TabItem value="cpp" label="C++">

```cpp
key_value_view<ignite_tuple, ignite_tuple> kv_view = table.get_key_value_binary_view();

ignite_tuple key_tuple{{"id", 42}};
ignite_tuple val_tuple{{"name", "John Doe"}};

kv_view.put(nullptr, key_tuple, val_tuple);
std::optional<ignite_tuple> res_tuple = kv_view.get(nullptr, key_tuple);

assert(res_tuple.has_value());
assert(res_tuple->column_count() == 2);
assert(res_tuple->get<std::int64_t>("id") == 42);
assert(res_tuple->get<std::string>("name") == "John Doe");
```

</TabItem>
</Tabs>


### 키-값 뷰 {#key-value-view}

사용자 객체를 사용하는 키-값 뷰입니다. 테이블 튜플에 매핑된 키·값 사용자 객체로 테이블을 조작할 수 있습니다.

<Tabs>
<TabItem value="java" label="Java">

```java
KeyValueView<AccountKey, Account> kvView = client.tables()
        .table("accounts")
        .keyValueView(AccountKey.class, Account.class);
System.out.println("\nInserting a key-value pair into the 'accounts' table...");

AccountKey key = new AccountKey(123456);

Account value = new Account(
        "Val",
        "Kulichenko",
        100.00d
);

kvView.put(null, key, value);

System.out.println("\nRetrieving a value using KeyValueView API...");

value = kvView.get(null, key);


System.out.println(
        "\nRetrieved value:\n"
            + "    Account Number: " + key.accountNumber + '\n'
            + "    Owner: " + value.firstName + " " + value.lastName + '\n'
            + "    Balance: $" + value.balance);
```

</TabItem>
<TabItem value="net" label=".NET">

```csharp
IKeyValueView<long, Poco> kvView = table.GetKeyValueView<long, Poco>();

await kvView.PutAsync(transaction: null, 42, new Poco(Id: 0, Name: "John Doe"));
(Poco? value, bool hasValue) = await kvView.GetAsync(transaction: null, 42);

Debug.Assert(hasValue);
Debug.Assert(value.Name == "John Doe");

public record Poco(long Id, string? Name = null);
```

</TabItem>
<TabItem value="cpp" label="C++">

```cpp
key_value_view<person, person> kv_view = table.get_key_value_view<person, person>();

kv_view.put(nullptr, {42}, {"John Doe"});
std::optional<person> res = kv_view.get(nullptr, {42});

assert(res.has_value());
assert(res->id == 42);
assert(res->name == "John Doe");
```

</TabItem>
</Tabs>

## Criteria 쿼리 {#criterion-queries}

Apache Ignite는 테이블에서 데이터를 조회하는 데 사용할 수 있는 Criteria 쿼리를 제공합니다. Criteria 쿼리는 모든 뷰 유형에서 동작하며, 지정한 쿼리에 맞는 데이터를 반환합니다.

아래 예시는 암시적 트랜잭션에서 쿼리를 실행하는 방법을 보여줍니다:

<Tabs>
<TabItem value="java" label="Java">

```java
try (Cursor<Entry<Tuple, Tuple>> cursor = table.keyValueView().query(
        null, // Implicit transaction
        // Query criteria
        and(
                columnValue("name", equalTo("John Doe")),
                columnValue("age", greaterThan(20))
        )
)) {
    // Process query results (keeping original cursor iteration pattern)
    // As an example, println all matched values.
    while (cursor.hasNext()) {
        printRecord(cursor.next());
    }
}
```

</TabItem>
</Tabs>

비교 쿼리는 `query()` 메서드를 사용하고 `columnValue` 메서드에 비교 기준을 제공해 지정합니다.

특정 트랜잭션을 지정해 그 트랜잭션에서 쿼리를 실행할 수도 있습니다.

<Tabs>
<TabItem value="java" label="Java">

```java
try (Cursor<Entry<Tuple, Tuple>> cursor = table.keyValueView().query(
        transaction,
        // Query criteria
        and(
                columnValue("name", equalTo("John Doe")),
                columnValue("age", greaterThan(20))
        )
)) {
    // Process query results
    // As an example, println all matched values.
    while (cursor.hasNext()) {
        printRecord(cursor.next());
    }

    // Commit transaction if all operations succeed
    transaction.commit();
} catch (Exception e) {
    // Rollback transaction on error
    transaction.rollback();
    throw new RuntimeException("Transaction failed", e);
}
```

</TabItem>
</Tabs>

### 비동기 쿼리 {#asynchronous-queries}

`queryAsync` 메서드를 사용해 쿼리를 비동기로 실행할 수도 있습니다. 이렇게 하면 스레드를 차단하지 않고 쿼리가 실행됩니다. 예를 들어 위 쿼리를 비동기로 실행할 수 있습니다:

<Tabs>
<TabItem value="java" label="Java">

```java
public static void performQueryAsync(Table table) {
    System.out.println("[ Example 3 ] Performing asynchronous query");

    AsyncCursor<Entry<Tuple, Tuple>> result = table.keyValueView().queryAsync(
                    null, // Implicit transaction
                    and(
                            columnValue("name", equalTo("John Doe")),
                            columnValue("age", greaterThan(20))
                    )
            )
            .join();

    for (Entry<Tuple, Tuple> tupleTupleEntry : result.currentPage()) {
        printRecord(tupleTupleEntry);
    }
}
```

</TabItem>
</Tabs>

이 작업은 `thenCompose()` 메서드를 사용해 사용자 정의 `fetchAllRowsInto()` 메서드에서 쿼리 결과를 비동기로 처리합니다. 이 메서드는 다음과 같은 형태일 수 있습니다:


### 비교 표현식 {#comparison-expressions}

Criteria 쿼리에서는 다음 표현식을 지원합니다:

| 표현식 | 설명 | 예시 |
|------------|-------------|---------|
| `equalTo` | 객체가 값과 같은지 확인합니다. | `columnValue("City", equalTo("New York"))` |
| `notEqualTo` | 객체가 값과 같지 않은지 확인합니다. | `columnValue("City", notEqualTo("New York"))` |
| `greaterThan` | 객체가 값보다 큰지 확인합니다. | `columnValue("Salary", greaterThan(10000))` |
| `greaterThanOrEqualTo` | 객체가 값보다 크거나 같은지 확인합니다. | `columnValue("Salary", greaterThanOrEqualTo(10000))` |
| `lessThan` | 객체가 값보다 작은지 확인합니다. | `columnValue("Salary", lessThan(10000))` |
| `lessThanOrEqualTo` | 객체가 값보다 작거나 같은지 확인합니다. | `columnValue("Salary", lessThanOrEqualTo(10000))` |
| `nullValue` | 객체가 null인지 확인합니다. | `columnValue("City", nullValue()` |
| `notNullValue` | 객체가 null이 아닌지 확인합니다. | `columnValue("City", notNullValue())` |
| `in` | 객체가 컬렉션에 있는지 확인합니다. | `columnValue("City", in("New York", "Washington"))` |
| `notIn` | 객체가 컬렉션에 없는지 확인합니다. | `columnValue("City", notIn("New York", "Washington"))` |

### 비교 연산자 {#comparison-operators}

Criteria 쿼리에서는 다음 연산자를 지원합니다:

| 연산자 | 설명 | 예시 |
|----------|-------------|---------|
| `not` | 조건을 부정합니다. | `not(columnValue("City", equalTo("New York")))` |
| `and` | 여러 조건을 동시에 평가할 때 사용합니다. | `and(columnValue("City", equalTo("New York")), columnValue("Salary", greaterThan(10000)))` |
| `or` | 하나 이상의 조건이 일치하는지 평가할 때 사용합니다. | `or(columnValue("City", equalTo("New York")), columnValue("Salary", greaterThan(10000)))` |


## 파티션 API {#partition-api}

파티션 `id`를 가져오려면 해당 `key` 값을 전달하고 다음 [메서드](https://ignite.apache.org/releases/ignite3/3.2.0/javadoc/org/apache/ignite/table/partition/PartitionDistribution.html#partition(org.apache.ignite.table.Tuple))를 사용하세요:

```java
Table table = client.tables().table("PUBLIC.Person");
RecordView<Tuple> personTableView = table.recordView();

personTableView.upsert(null, Tuple.create().set("id", 1).set("name", "John Doe"));

PartitionDistribution partDistribution = table.partitionDistribution();
Partition partition = table.partitionDistribution().partitionAsync(Tuple.create().set("id", 1)).join();

long partitionId = partition.id();
```

`PartitionManager` API는 이제 지원 중단되었으며 향후 릴리스에서 제거될 예정이므로, 대신 `PartitionDistribution` [API](https://ignite.apache.org/releases/ignite3/3.2.0/javadoc/org/apache/ignite/table/partition/PartitionDistribution.html#partition(org.apache.ignite.table.Tuple))를 사용하세요.

```java
Table table = client.tables().table(YOUR_TABLE_NAME);
PartitionDistribution partDistribution = table.partitionDistribution();
```

데이터 파티셔닝에 대한 자세한 내용은 [데이터 파티션 문서](/configure-and-operate/storage/data-partitioning)를 참고하세요.
