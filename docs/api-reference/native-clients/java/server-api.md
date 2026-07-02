---
title: Server API
id: server-api
sidebar_position: 2
---

# Server API

Ignite 인터페이스는 임베디드 클러스터 노드에 접근하는 기능을 제공합니다. 임베디드 방식을 사용하는 애플리케이션은 데이터를 저장하고 쿼리를 처리하며 클러스터 작업에 참여하는 완전한 클러스터 참여자로 동작합니다. 이는 데이터를 저장하지 않고 원격으로 연결하는 씬 클라이언트와 대비됩니다.

## 핵심 개념 {#key-concepts}

임베디드 노드는 애플리케이션 프로세스의 일부로 초기화됩니다. 노드는 시작 과정에서 클러스터에 합류하고, 모든 클러스터 서브시스템에 직접 접근할 수 있는 경로를 제공합니다. 노드가 데이터를 로컬에 저장하므로, 콜로케이션된 데이터에 접근하는 작업은 네트워크 홉 없이 실행됩니다.

Ignite 인터페이스는 모든 작업의 기본 진입점 역할을 합니다. 애플리케이션은 이 인터페이스로 테이블, SQL 엔진, 트랜잭션 관리자, 컴퓨트 기능, 카탈로그 관리에 대한 참조를 얻습니다.

## 노드 초기화 {#node-initialization}

IgniteServer의 start 메서드로 임베디드 노드를 시작합니다:

```java
IgniteServer server = IgniteServer.start(
    "myNode",
    Path.of("/config/ignite-config.conf"),
    Path.of("/work/dir")
);

server.initCluster(
    InitParameters.builder()
        .metaStorageNodes(server)
        .cmgNodes(server)
        .build()
);

Ignite ignite = server.api();
String nodeName = ignite.name();
System.out.println("Node started: " + nodeName);

// Use node for operations
```

start 메서드에는 노드 이름, 구성 파일 경로, 작업 디렉터리가 필요합니다. 노드 이름은 클러스터 내에서 고유해야 합니다. 시작한 뒤에는 클러스터를 초기화하고 api() 메서드로 Ignite API를 얻습니다.

## 리소스 접근 {#resource-access}

Ignite 인터페이스로 클러스터 리소스에 접근합니다:

```java
IgniteTables tables = ignite.tables();
IgniteSql sql = ignite.sql();
IgniteTransactions transactions = ignite.transactions();
IgniteCompute compute = ignite.compute();
IgniteCatalog catalog = ignite.catalog();
IgniteCluster cluster = ignite.cluster();
```

각 접근자는 해당 서브시스템의 퍼사드(facade)를 반환합니다. 이 퍼사드는 노드의 라이프사이클 동안 유효합니다.

## 테이블 작업 {#table-operations}

데이터 작업을 위한 테이블 참조를 얻습니다:

```java
Table users = ignite.tables().table("users");
if (users != null) {
    RecordView<Tuple> view = users.recordView();
    // Perform operations
}
```

table 메서드는 테이블이 존재하지 않으면 null을 반환합니다.

## SQL 실행 {#sql-execution}

SQL 퍼사드로 SQL 쿼리를 실행합니다:

```java
try (ResultSet<SqlRow> rs = ignite.sql().execute(
    null,
    "SELECT * FROM users WHERE age > ?",
    25
)) {
    while (rs.hasNext()) {
        SqlRow row = rs.next();
        System.out.println(row.stringValue("name"));
    }
}
```

자동 커밋으로 실행하려면 트랜잭션 매개변수로 null을 전달하세요.

## 트랜잭션 관리 {#transaction-management}

트랜잭션 퍼사드로 트랜잭션을 관리합니다:

```java
ignite.transactions().runInTransaction(tx -> {
    Table table = ignite.tables().table("accounts");
    RecordView<Tuple> view = table.recordView();

    Tuple key = Tuple.create().set("id", 1);
    Tuple record = view.get(tx, key);

    record.set("balance", record.intValue("balance") + 100);
    view.put(tx, record);
});
```

runInTransaction 메서드는 정상적으로 완료되면 자동으로 커밋하고, 예외가 발생하면 롤백합니다.

## 컴퓨트 작업 {#compute-operations}

분산 실행을 위한 컴퓨트 작업을 제출합니다:

```java
JobDescriptor<String, Integer> descriptor =
    JobDescriptor.of("com.example.WordCountJob");

CompletableFuture<JobExecution<Integer>> execution =
    ignite.compute().submitAsync(
        JobTarget.anyNode(ignite.cluster().nodes()),
        descriptor,
        "input text"
    );

Integer result = execution
    .thenCompose(JobExecution::resultAsync)
    .join();
```

컴퓨트 퍼사드는 지정한 대상 전략에 따라 클러스터 노드에 작업을 제출합니다.

## 카탈로그 관리 {#catalog-management}

카탈로그 퍼사드로 스키마 정의를 관리합니다:

```java
TableDefinition definition = TableDefinition.builder("products")
    .columns(
        ColumnDefinition.column("id", ColumnType.INT32),
        ColumnDefinition.column("name", ColumnType.STRING)
    )
    .primaryKey("id")
    .build();

ignite.catalog().createTableAsync(definition).join();
```

카탈로그 퍼사드는 DDL 문을 실행하지 않고 프로그래밍 방식으로 스키마를 관리합니다.

## 클러스터 정보 {#cluster-information}

클러스터 토폴로지 정보에 접근합니다:

```java
Collection<ClusterNode> nodes = ignite.cluster().nodes();
for (ClusterNode node : nodes) {
    NetworkAddress address = node.address();
    System.out.println("Node: " + node.name() + " at " + address.host() + ":" + address.port());
}

ClusterNode local = ignite.cluster().localNode();
System.out.println("Local node: " + local.name());
```

cluster().nodes() 메서드는 활성 상태인 모든 클러스터 구성원을 반환합니다. 클러스터 퍼사드는 로컬 노드 정보와 클러스터 전역 작업에 접근하는 기능을 제공합니다.

## 라이프사이클 관리 {#lifecycle-management}

리소스를 해제하려면 노드를 올바르게 종료합니다:

```java
IgniteServer server = IgniteServer.start("node1", configPath, workDir);
server.initCluster(InitParameters.builder()
    .metaStorageNodes(server)
    .cmgNodes(server)
    .build());

Ignite ignite = server.api();
// Use node

server.shutdown();
```

노드를 종료하면 로컬 서브시스템이 멈추고 노드가 클러스터에서 제거됩니다. IgniteServer는 shutdown() 메서드를 제공하지만, Ignite 인터페이스는 AutoCloseable을 구현하지 않는다는 점에 유의하세요.

## 참조 {#reference}

- 서버 인터페이스: `org.apache.ignite.IgniteServer`
- API 인터페이스: `org.apache.ignite.Ignite`
- 네트워크 타입: `org.apache.ignite.network.NetworkAddress`, `org.apache.ignite.network.ClusterNode`

### IgniteServer 메서드 {#igniteserver-methods}

- `static IgniteServer start(String nodeName, Path configPath, Path workDir)` - 임베디드 노드 시작
- `void initCluster(InitParameters parameters)` - 클러스터 초기화
- `Ignite api()` - Ignite API 퍼사드 조회
- `void shutdown()` - 노드 중지
- `String name()` - 노드 이름 반환

### Ignite API 메서드 {#ignite-api-methods}

- `String name()` - 노드 이름 반환
- `IgniteTables tables()` - 테이블 관리 접근
- `IgniteTransactions transactions()` - 트랜잭션 관리 접근
- `IgniteSql sql()` - SQL 쿼리 엔진 접근
- `IgniteCompute compute()` - 컴퓨트 작업 실행 접근
- `IgniteCatalog catalog()` - 카탈로그 관리 접근
- `IgniteCluster cluster()` - 클러스터 정보 접근

### 서브시스템 퍼사드 {#subsystem-facades}

- `IgniteTables` - 테이블 검색 및 접근
- `IgniteTransactions` - 트랜잭션 라이프사이클 관리
- `IgniteSql` - SQL 쿼리 실행
- `IgniteCompute` - 분산 작업 실행
- `IgniteCatalog` - 스키마 정의 관리
- `IgniteCluster` - 클러스터 토폴로지 및 노드 정보

### 네트워크 타입 {#network-types}

- `NetworkAddress` - 호스트와 포트로 구성된 네트워크 주소
  - `String host()` - 호스트 이름 반환
  - `int port()` - 포트 번호 반환
- `ClusterNode` - 클러스터의 노드
  - `String name()` - 노드 이름 반환
  - `NetworkAddress address()` - 네트워크 주소 반환
  - `UUID id()` - 노드 ID 반환
