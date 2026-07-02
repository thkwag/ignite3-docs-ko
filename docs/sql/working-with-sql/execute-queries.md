---
id: execute-queries
title: SQL 쿼리 실행
sidebar_label: 쿼리 실행
---

# Java SQL API

Java 프로젝트에서는 Java SQL API를 사용해 SQL 문을 실행하고 결과를 가져올 수 있습니다.

## 테이블 생성 {#creating-tables}

다음은 클러스터에 새 테이블을 생성하는 예시입니다.

```java
client.sql().executeScript(
        "CREATE TABLE CITIES ("
                + "ID   INT PRIMARY KEY,"
                + "NAME VARCHAR);"

                + "CREATE TABLE ACCOUNTS ("
                + "    ACCOUNT_ID INT PRIMARY KEY,"
                + "    CITY_ID    INT,"
                + "    FIRST_NAME VARCHAR,"
                + "    LAST_NAME  VARCHAR,"
                + "    BALANCE    DOUBLE)"
);
```

### 시퀀스 사용 {#using-sequences}

테이블을 생성할 때 SQL 시퀀스를 사용하면 기본 키 컬럼에 시퀀스에서 생성한 값을 자동으로 채우도록 지정할 수 있습니다.

```java
client.sql().execute(null, "CREATE SEQUENCE IF NOT EXISTS defaultSequence;");
client.sql().execute(null, "CREATE TABLE IF NOT EXISTS Person (ID BIGINT DEFAULT NEXTVAL('defaultSequence') PRIMARY KEY, "
        + "CITY_ID BIGINT, "
        + "NAME VARCHAR, "
        + "AGE INT, "
        + "COMPANY VARCHAR);");


client.sql().execute(null,
        "INSERT INTO Person (CITY_ID, NAME, AGE, COMPANY) VALUES " +
                "(1, 'Alice', 30, 'Google'), " +
                "(2, 'Bob', 40, 'Meta'), " +
                "(3, 'Charlie', 25, 'Spotify')");
```

## 테이블 채우기 {#filling-tables}

Apache Ignite 3에서는 행을 하나씩 추가하거나 일괄로 추가해 테이블을 채울 수 있습니다. 두 경우 모두 `INSERT` 문을 작성한 다음 실행합니다.

```java
rowsAdded = Arrays.stream(client.sql().executeBatch(tx,
                "INSERT INTO ACCOUNTS (ACCOUNT_ID, CITY_ID, FIRST_NAME, LAST_NAME, BALANCE) values (?, ?, ?, ?, ?)",
                BatchedArguments.of(1, 1, "John", "Doe", 1000.0d)
                        .add(2, 1, "Jane", "Roe", 2000.0d)
                        .add(3, 2, "Mary", "Major", 1500.0d)
                        .add(4, 3, "Richard", "Miles", 1450.0d)))
        .sum();

System.out.println("\nAdded accounts: " + rowsAdded);
```

## 특정 파티션 대상 SELECT {#partition-specific-selects}

SELECT 연산을 실행할 때 시스템 컬럼 `__part`를 사용하면 특정 파티션의 데이터만 `SELECT`할 수 있습니다. 파티션 정보를 확인하려면 `__part` 컬럼을 명시적으로 포함하는 SELECT 요청을 사용하세요.

```sql
SELECT city_id, id, "__part"  FROM Person;
```

파티션을 알고 나면 `WHERE` 절에서 사용합니다.

```sql
SELECT city_id, id FROM Person WHERE "__part"=23;
```

## 테이블에서 데이터 가져오기 {#getting-data-from-tables}

테이블에서 데이터를 가져오려면 `SELECT` 문을 실행해 결과 집합을 얻습니다. SqlRow는 컬럼 이름 또는 컬럼 인덱스로 컬럼 값에 접근할 수 있습니다. 이후 결과를 순회하며 데이터를 가져옵니다.

:::note
`try-with-resources` 문을 사용하거나 `close()` 메서드를 직접 호출해 항상 `ResultSet`을 닫으세요.
:::

```java
try (ResultSet<SqlRow> rs = client.sql().execute(null,
        "SELECT a.FIRST_NAME, a.LAST_NAME, c.NAME FROM ACCOUNTS a "
                + "INNER JOIN CITIES c on c.ID = a.CITY_ID ORDER BY a.ACCOUNT_ID")) {
    while (rs.hasNext()) {
        SqlRow row = rs.next();

        System.out.println("    "
                + row.stringValue(0) + ", "
                + row.stringValue(1) + ", "
                + row.stringValue(2));
    }
}
```

## SQL 스크립트 {#sql-scripts}

기본 API는 SQL 문을 한 번에 하나씩 실행합니다. 대량의 SQL 문은 `executeScript()` 메서드에 전달하세요. 이 문들은 Apache Ignite 2의 `SET STREAMING` 명령과 비슷하게 일괄로 묶여 실행되며, 한 번에 많은 쿼리를 실행할 때 성능을 크게 높입니다. 이 문들은 순서대로 실행됩니다.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="java" label="Java">

```java
String script = "CREATE TABLE IF NOT EXISTS Person (id int primary key, name varchar, age int default 0);"
              + "INSERT INTO Person (id, name, age) VALUES ('1', 'John', '46');";
client.sql().executeScript(script);
```

</TabItem>
</Tabs>

:::note
각 문의 실행은 첫 페이지를 반환할 준비가 되면 완료된 것으로 간주합니다. 따라서 대용량 데이터 집합을 다룰 때는 같은 스크립트 안의 이후 문이 SELECT 문에 영향을 줄 수 있습니다.
:::

### 쿼리 취소 {#query-cancellation}

쿼리를 취소하려면 취소 토큰을 생성해 실행 메서드에 전달하세요.

<Tabs>
<TabItem value="java" label="Java">

```java
CancelHandle cancelHandle = CancelHandle.create();
CancellationToken cancelToken = cancelHandle.token();

client.sql().executeAsync(
        null, cancelToken,
        "SELECT a.FIRST_NAME, b.LAST_NAME " +
                "FROM ACCOUNTS a, ACCOUNTS b, ACCOUNTS c ORDER BY a.ACCOUNT_ID"
);
```

</TabItem>
<TabItem value="cpp" label="C++">

```cpp
std::shared_ptr<cancel_handle> handle = cancel_handle::create();
std::shared_ptr<cancellation_token> token = handle->get_token();

client.get_sql().execute(nullptr, token.get(), "CREATE TABLE IF NOT EXISTS Person (id int primary key, name varchar, age int);", {});
```

</TabItem>
</Tabs>

쿼리를 제출한 후에는 언제든 `cancel()` 또는 `cancelAsync()` 메서드를 사용해 같은 `cancelHandle` 객체의 토큰을 사용하는 모든 쿼리를 취소할 수 있습니다. 예시:

<Tabs>
<TabItem value="java" label="Java">

```java
CompletableFuture<Void> cancelled = cancelHandle.cancelAsync();
cancelled.get(5, TimeUnit.SECONDS);

System.out.println("\nIs query cancelled: " + cancelled.isDone());
```

</TabItem>
<TabItem value="dotnet" label=".NET">

```csharp
var cts = new CancellationTokenSource();
await using var resultSet = await Client.Sql.ExecuteAsync(null, "CREATE TABLE IF NOT EXISTS Person (id int primary key)", cts.Token);
await cts.CancelAsync();
```

</TabItem>
<TabItem value="cpp" label="C++">

```cpp
handle->cancel_async(ignite_result<void> cancellationResult) {
// Handle cancellationResult here
});
```

</TabItem>
</Tabs>

쿼리를 취소하는 또 다른 방법은 SQL [KILL QUERY](/sql/reference/data-types-and-functions/operational-commands#kill-query) 명령을 사용하는 것입니다. 쿼리 ID는 `SQL_QUERIES` [시스템 뷰](/configure-and-operate/monitoring/metrics-system-views)에서 조회할 수 있습니다.
