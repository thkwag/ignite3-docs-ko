---
title: JDBC 드라이버
id: jdbc
sidebar_position: 1
---

# JDBC 드라이버

Apache Ignite 3 JDBC 드라이버는 Java 애플리케이션을 위해 JDBC 4.x 표준을 구현합니다. 씬 클라이언트(thin client) 프로토콜로 클러스터 노드에 직접 연결하며, 서버 측 라이브러리가 필요하지 않습니다.

## 연결 문자열 형식 {#connection-string-format}

```
jdbc:ignite:thin://host[:port][,host[:port]][/schema][?param=value[&param=value]]
```

드라이버는 장애 조치(failover)를 위해 여러 호스트 주소를 지원합니다. 한 노드를 사용할 수 없게 되면 드라이버는 목록의 다음 주소로 자동으로 연결을 시도합니다.

기본 포트: 10800
기본 스키마: PUBLIC

## 구성 매개변수 {#configuration-parameters}

### 연결 매개변수 {#connection-parameters}

- `connectionTimeout` - 소켓 연결 타임아웃(밀리초 단위, 기본값: 0, 타임아웃 없음)
- `connectionTimeZone` - 타임스탬프 변환에 사용할 ZoneId 문자열(기본값: 시스템 시간대)
- `queryTimeout` - 기본 쿼리 타임아웃(초 단위, 기본값: 타임아웃 없음)

### 인증 {#authentication}

기본 인증(basic authentication)은 사용자 이름과 비밀번호 자격 증명을 사용합니다.

- `username` - 인증 사용자 이름
- `password` - 인증 비밀번호

### SSL 구성 {#ssl-configuration}

인증서 기반 인증으로 SSL을 활성화합니다.

- `sslEnabled` - SSL을 활성화하려면 `true`로 설정(기본값: `false`)
- `trustStorePath` - 신뢰할 인증서가 담긴 Java 트러스트스토어 파일 경로
- `trustStorePassword` - 트러스트스토어 비밀번호
- `keyStorePath` - 클라이언트 개인 키와 인증서가 담긴 Java 키스토어 파일 경로
- `keyStorePassword` - 키스토어 비밀번호
- `ciphers` - 허용할 암호화 방식(cipher) 목록(쉼표로 구분)

### 스키마 선택 {#schema-selection}

- `schema` - 쿼리에 사용할 기본 스키마(기본값: `PUBLIC`)

## 매개변수 우선순위 {#parameter-precedence}

같은 매개변수가 여러 위치에 나타나면 드라이버는 다음 순서(높은 우선순위부터 낮은 순서)로 적용합니다.

1. Connection 객체 메서드 호출(예: `setNetworkTimeout()`)
2. 연결 문자열의 마지막 항목
3. `DriverManager.getConnection()`에 전달된 Properties 객체

## 드라이버 등록 {#driver-registration}

드라이버는 Java Service Provider Interface(SPI)를 사용해 자동으로 등록됩니다. 필요하면 명시적으로 로드하세요.

```java
Class.forName("org.apache.ignite.jdbc.IgniteJdbcDriver");
```

## 사용 예시 {#usage-examples}

### 기본 연결 {#basic-connection}

```java
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

String url = "jdbc:ignite:thin://localhost:10800";

try (Connection conn = DriverManager.getConnection(url)) {
    try (Statement stmt = conn.createStatement()) {
        try (ResultSet rs = stmt.executeQuery("SELECT id, name FROM users")) {
            while (rs.next()) {
                int id = rs.getInt("id");
                String name = rs.getString("name");
                System.out.println(id + ": " + name);
            }
        }
    }
}
```

### 인증을 사용한 연결 {#connection-with-authentication}

```java
String url = "jdbc:ignite:thin://localhost:10800?username=admin&password=secret";

try (Connection conn = DriverManager.getConnection(url)) {
    // Execute queries
}
```

Properties를 사용하는 대안:

```java
String url = "jdbc:ignite:thin://localhost:10800";
Properties props = new Properties();
props.setProperty("username", "admin");
props.setProperty("password", "secret");

try (Connection conn = DriverManager.getConnection(url, props)) {
    // Execute queries
}
```

### SSL을 사용한 연결 {#connection-with-ssl}

```java
String url = "jdbc:ignite:thin://localhost:10800" +
    "?sslEnabled=true" +
    "&trustStorePath=/path/to/truststore.jks" +
    "&trustStorePassword=changeit" +
    "&keyStorePath=/path/to/keystore.jks" +
    "&keyStorePassword=changeit";

try (Connection conn = DriverManager.getConnection(url)) {
    // Execute queries over SSL
}
```

### 여러 노드 주소 {#multiple-node-addresses}

```java
String url = "jdbc:ignite:thin://node1:10800,node2:10800,node3:10800/mySchema";

try (Connection conn = DriverManager.getConnection(url)) {
    // Connection attempts nodes in order until one succeeds
}
```

### 준비된 문 {#prepared-statements}

```java
String sql = "INSERT INTO users (id, name, email) VALUES (?, ?, ?)";

try (Connection conn = DriverManager.getConnection(url);
     PreparedStatement pstmt = conn.prepareStatement(sql)) {

    pstmt.setInt(1, 101);
    pstmt.setString(2, "John Doe");
    pstmt.setString(3, "john@example.com");

    int rowsAffected = pstmt.executeUpdate();
}
```

### 일괄 처리 작업 {#batch-operations}

```java
String sql = "INSERT INTO users (id, name) VALUES (?, ?)";

try (Connection conn = DriverManager.getConnection(url);
     PreparedStatement pstmt = conn.prepareStatement(sql)) {

    conn.setAutoCommit(false);

    for (int i = 0; i < 1000; i++) {
        pstmt.setInt(1, i);
        pstmt.setString(2, "User " + i);
        pstmt.addBatch();
    }

    int[] results = pstmt.executeBatch();
    conn.commit();
}
```

### 트랜잭션 제어 {#transaction-control}

```java
try (Connection conn = DriverManager.getConnection(url)) {
    conn.setAutoCommit(false);

    try (Statement stmt = conn.createStatement()) {
        stmt.executeUpdate("INSERT INTO accounts (id, balance) VALUES (1, 1000)");
        stmt.executeUpdate("INSERT INTO accounts (id, balance) VALUES (2, 2000)");

        conn.commit();
    } catch (SQLException e) {
        conn.rollback();
        throw e;
    }
}
```

### 쿼리 타임아웃 {#query-timeout}

```java
try (Connection conn = DriverManager.getConnection(url);
     Statement stmt = conn.createStatement()) {

    stmt.setQueryTimeout(30); // 30 seconds

    try (ResultSet rs = stmt.executeQuery("SELECT * FROM large_table")) {
        // Process results
    }
}
```

### 페치 크기 구성 {#fetch-size-configuration}

```java
try (Connection conn = DriverManager.getConnection(url);
     Statement stmt = conn.createStatement()) {

    stmt.setFetchSize(2048); // Fetch 2048 rows per page (default: 1024)

    try (ResultSet rs = stmt.executeQuery("SELECT * FROM large_table")) {
        while (rs.next()) {
            // Process rows in pages of 2048
        }
    }
}
```

## Ignite 고유 동작 {#ignite-specific-behavior}

### 타입 매핑 {#type-mapping}

드라이버는 JDBC 사양에 따라 SQL 타입을 Java 타입으로 매핑합니다.

| SQL 타입 | Java 타입 |
|----------|-----------|
| BOOLEAN | boolean / Boolean |
| TINYINT | byte / Byte |
| SMALLINT | short / Short |
| INTEGER | int / Integer |
| BIGINT | long / Long |
| FLOAT | float / Float |
| REAL | float / Float |
| DOUBLE | double / Double |
| DECIMAL | java.math.BigDecimal |
| DATE | java.sql.Date |
| TIME | java.sql.Time |
| TIMESTAMP | java.sql.Timestamp |
| CHAR | String |
| VARCHAR | String |
| BINARY | byte[] |
| VARBINARY | byte[] |
| UUID | java.util.UUID |

### 결과 집합 특성 {#result-set-characteristics}

- **유형**: `TYPE_FORWARD_ONLY`(커서가 앞으로만 이동)
- **동시성**: `CONCUR_READ_ONLY`(결과를 업데이트할 수 없음)
- **유지성(holdability)**: 연결이나 문 단위로 구성 가능

### 페이지네이션 {#pagination}

드라이버는 결과를 페이지 단위로 가져옵니다(기본값: 페이지당 1024행). 큰 결과 집합에서는 페치 크기를 늘려 네트워크 왕복을 줄이세요.

```java
stmt.setFetchSize(4096);
```

### 문 취소 {#statement-cancellation}

다른 스레드에서 오래 실행되는 쿼리를 취소합니다.

```java
Statement stmt = conn.createStatement();

// In another thread
stmt.cancel();
```

드라이버는 상관 토큰(correlation token)을 사용해 특정 쿼리를 식별하고 취소합니다.

### 네트워크 타임아웃 {#network-timeout}

쿼리 타임아웃과 별개로 네트워크 수준 타임아웃을 설정합니다.

```java
conn.setNetworkTimeout(executor, 5000); // 5 seconds
```

쿼리 타임아웃은 서버 측 실행 시간을 제어합니다. 네트워크 타임아웃은 소켓 읽기/쓰기 작업을 제어합니다.

## 연결 문자열 예시 {#connection-string-examples}

```
# Basic
jdbc:ignite:thin://localhost:10800

# With schema
jdbc:ignite:thin://localhost:10800/analytics

# With authentication
jdbc:ignite:thin://localhost:10800?username=admin&password=secret

# With SSL
jdbc:ignite:thin://localhost:10800?sslEnabled=true&trustStorePath=/opt/certs/truststore.jks&trustStorePassword=changeit

# Multiple nodes with timeouts
jdbc:ignite:thin://node1:10800,node2:10800,node3:10800?connectionTimeout=5000&queryTimeout=60

# Complete configuration
jdbc:ignite:thin://node1:10800,node2:10800/mySchema?username=admin&password=secret&sslEnabled=true&trustStorePath=/opt/certs/truststore.jks&trustStorePassword=changeit&keyStorePath=/opt/certs/keystore.jks&keyStorePassword=changeit&connectionTimeout=5000&queryTimeout=60
```

## 참조 {#reference}

### 드라이버 클래스 {#driver-class}

`org.apache.ignite.jdbc.IgniteJdbcDriver`

### JDBC 준수 {#jdbc-compliance}

- JDBC 4.x 사양 준수
- `java.sql.Connection`, `Statement`, `PreparedStatement`, `ResultSet` 지원
- 스키마 검색을 위한 `DatabaseMetaData` 구현
- 컬럼 정보를 위한 `ResultSetMetaData` 지원

### 제한 사항 {#limitations}

- 결과 집합은 순방향 전용(스크롤 불가)
- 결과 집합은 읽기 전용(ResultSet API로 업데이트 불가)
- `CallableStatement` 미지원(저장 프로시저 없음)
- `lastRowid`는 항상 null 반환(자동 생성 키 추적 없음)
