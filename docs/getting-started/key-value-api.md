---
title: Java API 사용하기
---

이 가이드는 Ignite 3 클러스터에 연결하는 Java 애플리케이션을 만드는 과정을 다루며, Ignite Java API로 데이터를 다루는 주요 패턴을 보여줍니다.

## 사전 요구 사항 {#prerequisites}

* JDK 17 이상
* Maven
* 최신 버전의 Docker와 Docker Compose

## Ignite 3 클러스터 설정 {#setting-up-ignite-3-cluster}

3개 노드로 구성된 Ignite 클러스터를 실행하는 Docker Compose 파일을 생성합니다:

```yaml
# docker-compose.yml
name: ignite3

x-ignite-def: &ignite-def
  image: apacheignite/ignite:3.1.0
  environment:
    JVM_MAX_MEM: "4g"
    JVM_MIN_MEM: "4g"
  configs:
    - source: node_config
      target: /opt/ignite/etc/ignite-config.conf

services:
  node1:
    <<: *ignite-def
    command: --node-name node1
    ports:
      - "10300:10300"  # REST API port
      - "10800:10800"  # Client port
  node2:
    <<: *ignite-def
    command: --node-name node2
    ports:
      - "10301:10300"
      - "10801:10800"
  node3:
    <<: *ignite-def
    command: --node-name node3
    ports:
      - "10302:10300"
      - "10802:10800"

configs:
  node_config:
    content: |
      ignite {
        network {
          port: 3344
          nodeFinder.netClusterNodes = ["node1:3344", "node2:3344", "node3:3344"]
        }
      }
```

### 클러스터 시작 및 초기화 {#starting-and-initializing-the-cluster}

1. 클러스터를 시작합니다:

```bash
docker compose up -d
```

2. Ignite CLI를 실행하고 클러스터를 초기화합니다:

```bash
docker run --rm -it --network=host -e LANG=C.UTF-8 -e LC_ALL=C.UTF-8 apacheignite/ignite:3.0.0 cli
```

3. CLI에서 기본 노드에 연결됐는지 확인합니다.
4. 클러스터를 초기화합니다:

```bash
cluster init --name=ignite3 --metastorage-group=node1,node2,node3
```

5. SQL 모드로 진입합니다:

```bash
sql
```

6. 샘플 테이블을 생성하고 데이터를 삽입합니다:

```bash
CREATE TABLE Person (id INT PRIMARY KEY, name VARCHAR);
INSERT INTO Person (id, name) VALUES (1, 'John');
```

7. SQL 모드와 CLI 도구를 종료합니다:

```bash
exit;
exit
```

## Java 프로젝트 설정 {#setting-up-your-java-project}

### Maven 프로젝트 생성 {#create-a-maven-project}

먼저 간단한 Maven 프로젝트를 생성합니다. 아래는 이번에 사용할 프로젝트 예시입니다.

```
ignite3-java-demo/
├── pom.xml
└── src/
    └── main/
        └── java/
            └── com/
                └── example/
                    └── Main.java
```

### Maven 의존성 구성 {#configure-maven-dependencies}

`pom.xml` 파일에 Ignite 클라이언트 의존성을 추가합니다:

```xml
<dependencies>
    <!-- Ignite 3 Client -->
    <dependency>
        <groupId>org.apache.ignite</groupId>
        <artifactId>ignite-client</artifactId>
        <version>3.1.0</version>
    </dependency>
</dependencies>
```

## Java 애플리케이션 작성 {#building-your-java-application}

이제 Ignite 클러스터에 연결해 다양한 데이터 작업을 수행하는 Java 애플리케이션을 만들어 보겠습니다.

### 메인 애플리케이션 클래스 {#main-application-class}

다음 코드로 `Main.java` 파일을 생성합니다:

:::tip
파일 위치는 위의 구조 예시를 참고하세요. 이 예시에는 전체 클래스 파일이 담겨 있습니다.
:::

```java
package com.example;

import org.apache.ignite.catalog.ColumnType;
import org.apache.ignite.catalog.definitions.ColumnDefinition;
import org.apache.ignite.catalog.definitions.TableDefinition;
import org.apache.ignite.client.IgniteClient;
import org.apache.ignite.table.KeyValueView;
import org.apache.ignite.table.RecordView;
import org.apache.ignite.table.Table;
import org.apache.ignite.table.Tuple;

/**
 * This example demonstrates connecting to an Ignite 3 cluster
 * and working with data using different table view patterns.
 */
public class Main {
    public static void main(String[] args) {
        // Create an array of connection addresses for fault tolerance
        String[] addresses = {
                "localhost:10800",
                "localhost:10801",
                "localhost:10802"
        };

        // Connect to the Ignite cluster using the client builder pattern
        try (IgniteClient client = IgniteClient.builder()
                .addresses(addresses)
                .build()) {

            System.out.println("Connected to the cluster: " + client.connections());

            // Demonstrate querying existing data using SQL API
            queryExistingTable(client);

            // Create a new table using Java API
            Table table = createTable(client);

            // Demonstrate different ways to interact with tables
            populateTableWithDifferentViews(table);

            // Query the new table using SQL API
            queryNewTable(client);
        }
    }

    /**
     * Queries the pre-created Person table using SQL
     */
    private static void queryExistingTable(IgniteClient client) {
        System.out.println("\n--- Querying Person table ---");
        client.sql().execute(null, "SELECT * FROM Person")
                .forEachRemaining(row -> System.out.println("Person: " + row.stringValue("name")));
    }

    /**
     * Creates a new table using the Java API
     */
    private static Table createTable(IgniteClient client) {
        System.out.println("\n--- Creating Person2 table ---");
        return client.catalog().createTable(
                TableDefinition.builder("Person2")
                        .ifNotExists()
                        .columns(
                                ColumnDefinition.column("ID", ColumnType.INT32),
                                ColumnDefinition.column("NAME", ColumnType.VARCHAR))
                        .primaryKey("ID")
                        .build());
    }

    /**
     * Demonstrates different ways to interact with tables
     */
    private static void populateTableWithDifferentViews(Table table) {
        System.out.println("\n--- Populating Person2 table using different views ---");

        // 1. Using RecordView with Tuples
        RecordView<Tuple> recordView = table.recordView();
        recordView.upsert(null, Tuple.create().set("id", 2).set("name", "Jane"));
        System.out.println("Added record using RecordView with Tuple");

        // 2. Using RecordView with POJOs
        RecordView<Person> pojoView = table.recordView(Person.class);
        pojoView.upsert(null, new Person(3, "Jack"));
        System.out.println("Added record using RecordView with POJO");

        // 3. Using KeyValueView with Tuples
        KeyValueView<Tuple, Tuple> keyValueView = table.keyValueView();
        keyValueView.put(null, Tuple.create().set("id", 4), Tuple.create().set("name", "Jill"));
        System.out.println("Added record using KeyValueView with Tuples");

        // 4. Using KeyValueView with Native Types
        KeyValueView<Integer, String> keyValuePojoView = table.keyValueView(Integer.class, String.class);
        keyValuePojoView.put(null, 5, "Joe");
        System.out.println("Added record using KeyValueView with Native Types");
    }

    /**
     * Queries the newly created Person2 table using SQL
     */
    private static void queryNewTable(IgniteClient client) {
        System.out.println("\n--- Querying Person2 table ---");
        client.sql().execute(null, "SELECT * FROM Person2")
                .forEachRemaining(row -> System.out.println("Person2: " + row.stringValue("name")));
    }

    /**
     * POJO class representing a Person
     */
    public static class Person {
        // Default constructor required for serialization
        public Person() { }

        public Person(Integer id, String name) {
            this.id = id;
            this.name = name;
        }

        Integer id;
        String name;
    }
}
```

## 애플리케이션 실행 {#running-the-application}

애플리케이션을 실행하려면 다음과 같이 하세요:

1. Ignite 클러스터가 실행 중인지 확인합니다
2. Java 애플리케이션을 컴파일하고 실행합니다:

```bash
mvn compile exec:java -Dexec.mainClass="com.example.Main"
```

## 예상 출력 {#expected-output}

다음과 비슷한 출력이 나타납니다:

```text
Connected to the cluster: Connections{active=1, total=1}

--- Querying Person table ---
Person: John

--- Creating Person2 table ---

--- Populating Person2 table using different views ---
Added record using RecordView with Tuple
Added record using RecordView with POJO
Added record using KeyValueView with Tuples
Added record using KeyValueView with Native Types

--- Querying Person2 table ---
Person2: Jane
Person2: Jack
Person2: Jill
Person2: Joe
```

## Ignite 3의 테이블 뷰 이해하기 {#understanding-table-views-in-ignite-3}

Ignite 3는 탄탄한 SQL API에 더해 테이블과 상호작용하는 다양한 뷰 패턴을 제공합니다. 아래 예시는 SQL 없이 프로젝트에서 Ignite 테이블을 다루는 방법을 보여줍니다. SQL로 작업하는 예시는 [SQL 다루기](/getting-started/work-with-sql) 튜토리얼을 참고하세요.

### RecordView 패턴 {#recordview-pattern}

RecordView는 테이블을 레코드 모음으로 다루므로 행 전체를 대상으로 한 작업에 적합합니다:

```java
// Get RecordView for Tuple objects (schema-less)
RecordView<Tuple> recordView = table.recordView();
recordView.upsert(null, Tuple.create().set("id", 2).set("name", "Jane"));

// Get RecordView for mapped POJO objects (type-safe)
RecordView<Person> pojoView = table.recordView(Person.class);
pojoView.upsert(null, new Person(3, "Jack"));
```

### KeyValueView 패턴 {#keyvalueview-pattern}

KeyValueView는 테이블을 키-값 저장소로 다루며, 단순 조회에 적합합니다:

```java
// Get KeyValueView for Tuple objects
KeyValueView<Tuple, Tuple> keyValueView = table.keyValueView();
keyValueView.put(null, Tuple.create().set("id", 4), Tuple.create().set("name", "Jill"));

// Get KeyValueView for native Java types
KeyValueView<Integer, String> keyValuePojoView = table.keyValueView(Integer.class, String.class);
keyValuePojoView.put(null, 5, "Joe");
```

## 정리 {#cleaning-up}

작업이 끝나면 다음 명령으로 클러스터를 중지합니다:

```bash
docker compose down
```

## 문제 해결 {#troubleshooting}

연결 문제가 발생하면 다음을 확인하세요:

* `docker compose ps` 명령으로 Docker 컨테이너가 실행 중인지 확인하세요
* 노출된 포트가 클라이언트 구성의 포트와 일치하는지 확인하세요
* `localhost` 인터페이스가 Docker 컨테이너 네트워크에 접근할 수 있는지 확인하세요

## 다음 단계 {#next-steps}

Ignite에 연결하고 데이터를 다루는 기본을 살펴봤다면 다음을 진행해 보세요:

* 트랜잭션 구현해 보기
* 더 복잡한 스키마와 데이터 타입 실험해 보기
* 데이터 파티셔닝 전략 살펴보기
* 분산 컴퓨트 기능 알아보기
