---
id: jdbc
title: JDBC 드라이버
sidebar_position: 1
---

Apache Ignite는 JDBC 드라이버와 함께 제공되며, JDBC 쪽에서 `SELECT`, `INSERT`, `UPDATE`, `DELETE` 같은 표준 SQL 문으로 분산 데이터를 직접 처리할 수 있습니다. 드라이버 클래스 이름은 `org.apache.ignite.jdbc.IgniteJdbcDriver`입니다.

이 JDBC 드라이버 구현은 다음을 지원하지 않습니다:

* 다중 엔드포인트
* JDBC 연결 풀

참고:

* [지원하지 않는 필수 JDBC 기능](#unsupported-mandatory-jdbc-features)
* [지원하지 않는 선택적 JDBC 기능](#unsupported-optional-jdbc-features)
* [제한적으로 지원하는 JDBC 기능](#jdbc-features-with-limited-support)

## 설정하기 {#setting-up}

JDBC 드라이버는 클라이언트 커넥터를 사용해 클러스터와 통신합니다. 클라이언트 커넥터를 구성하는 방법은 [클라이언트 커넥터 구성](/develop/ignite-clients/) 문서에서 확인하세요.

Maven에서 JDBC 커넥터를 다음과 같이 추가합니다:

```xml
<dependency>
    <groupId>org.apache.ignite</groupId>
    <artifactId>ignite-jdbc</artifactId>
    <version>{version}</version>
</dependency>
```

다음은 IP 주소 `127.0.0.1`에서 대기 중인 클러스터 노드에 JDBC 연결을 여는 방법입니다:

```java
Connection conn = DriverManager.getConnection("jdbc:ignite:thin://127.0.0.1:10800");
```

드라이버는 클러스터 노드 중 하나에 연결하고 모든 쿼리를 그 노드로 전달해 최종 실행합니다. 해당 노드가 쿼리 분산과 결과 집계를 처리한 다음, 결과를 클라이언트 애플리케이션으로 다시 전송합니다.

JDBC 연결 문자열은 '?' 구분자 뒤에 이름-값 쌍 목록을 매개변수로 선택적으로 붙일 수 있습니다. 이름과 값은 '=' 기호로 구분하고, 여러 속성은 '&' 또는 ';' 중 하나로 구분합니다. 구분 기호는 세미콜론과 앰퍼샌드를 섞어 쓸 수 없으며 둘 중 하나로 통일해야 합니다.

```java
jdbc:ignite:thin://host[:port][,host[:port][/schema][[?parameter1=value1][&parameter2=value2],...]]
jdbc:ignite:thin://host[:port][,host[:port][/schema][[?parameter1=value1][;parameter2=value2],...]]
```

* `host`는 필수이며 연결할 클러스터 노드의 호스트를 지정합니다.
* `port`는 연결을 여는 데 사용할 포트입니다. 이 매개변수를 생략하면 기본값으로 10800을 사용합니다.
* `schema`는 접근할 스키마 이름입니다. 기본값은 PUBLIC입니다. 이 이름은 SQL ANSI-99 표준을 따라야 합니다. 따옴표로 묶지 않은 식별자는 대소문자를 구분하지 않고, 따옴표로 묶은 식별자는 대소문자를 구분합니다. 세미콜론 형식을 사용할 때는 schema라는 이름의 매개변수로 스키마를 지정할 수도 있습니다.
* `parameters`는 선택적 매개변수입니다. 다음 매개변수를 사용할 수 있습니다:
  * `connectionTimeZone` - 클라이언트 연결의 시간대 ID입니다. 클라이언트가 이 속성으로 서버 세션의 시간대를 변경할 수 있습니다. 쿼리에서 시간대를 명시적으로 지정하지 않은 경우 날짜 해석에 영향을 줍니다. 설정하지 않으면 클라이언트의 시스템 기본 시간대를 사용합니다.
  * `queryTimeout` - 드라이버가 `Statement` 객체 실행을 기다리는 시간(초)입니다. 0은 제한이 없다는 의미입니다. 기본값: `0`.
  * `connectionTimeout` - JDBC 클라이언트가 서버 응답을 기다리는 시간(밀리초)입니다. 0은 제한이 없다는 의미입니다. 기본값: `0`.
  * `reconnectThrottlingPeriod` - 재연결 스로틀링 기간(밀리초)입니다. 0은 제한이 없다는 의미입니다. 기본값: `30_000`.
  * `reconnectThrottlingRetries` - 재연결 스로틀링 재시도 횟수입니다. 0은 제한이 없다는 의미입니다. 기본값: `3`.
  * `username` - 클러스터에 기본 인증할 때 사용하는 사용자 이름입니다.
  * `password` - 클러스터에 기본 인증할 때 사용하는 사용자 비밀번호입니다.
  * `sslEnabled` - SSL 사용 여부를 결정합니다. 가능한 값: `true`, `false`. 기본값: `false`
    * `trustStorePath` - 클라이언트 측 트러스트스토어 경로입니다.
    * `trustStorePassword` - 트러스트스토어 비밀번호입니다.
    * `keyStorePath` - 클라이언트 측 키스토어 경로입니다.
    * `keyStorePassword` - 키스토어 비밀번호입니다.
    * `clientAuth` - SSL 클라이언트 인증입니다. 가능한 값: `NONE`, `OPTIONAL`, `REQUIRE`.
    * `ciphers` - 쉼표로 구분한 SSL 암호화 방식 목록입니다.

### 매개변수 우선순위 {#parameter-precedence}

같은 매개변수를 여러 방식으로 전달하면 JDBC 드라이버는 다음 순서로 우선순위를 적용합니다:

1. `Connection` 객체에 전달한 API 인수
2. 연결 문자열에서 마지막에 나온 매개변수 값
3. 연결 시 전달한 Properties 객체

## 트랜잭션 수행 {#performing-transactions}

JDBC 드라이버로 트랜잭션을 `commit`하거나 `rollback`할 수 있습니다. 트랜잭션에 대한 자세한 내용은 [트랜잭션 수행](/develop/work-with-data/transactions) 문서를 참고하세요.

다음은 트랜잭션을 커밋하는 방법입니다:

```java
// Open the JDBC connection.
Connection conn = DriverManager.getConnection("jdbc:ignite:thin://127.0.0.1:10800");

// Commit a transaction
conn.commit();
```

`setAutoCommit()` 메서드를 사용해 Apache Ignite가 트랜잭션을 자동으로 커밋하도록 구성할 수도 있습니다.

다음은 트랜잭션을 롤백하는 방법입니다:

```java
conn.rollback();
```

## 지원하지 않는 필수 JDBC 기능 {#unsupported-mandatory-jdbc-features}

다음 필수 JDBC 기능은 현재 지원하지 않습니다(알파벳순 정렬):

* java.sql.Connection#clearWarnings
* java.sql.Connection#getWarnings
* java.sql.Connection#prepareCall
* java.sql.PreparedStatement#getParameterMetaData
* java.sql.PreparedStatement#setAsciiStream
* java.sql.PreparedStatement#setBinaryStream
* java.sql.PreparedStatement#setCharacterStream
* java.sql.ResultSet#clearWarnings
* java.sql.ResultSet#getAsciiStream
* java.sql.ResultSet#getBinaryStream
* java.sql.ResultSet#getCharacterStream
* java.sql.ResultSet#getWarnings
* java.sql.ResultSet#setFetchDirection
* java.sql.Statement#clearWarnings
* java.sql.Statement#getWarnings
* java.sql.Statement#setEscapeProcessing
* java.sql.Statement#setFetchDirection
* java.sql.Statement#setMaxFieldSize

## 지원하지 않는 선택적 JDBC 기능 {#unsupported-optional-jdbc-features}

다음 선택적 JDBC 기능은 현재 지원하지 않습니다(알파벳순 정렬):

* java.sql.Connection#createArrayOf
* java.sql.Connection#createBlob
* java.sql.Connection#createClob
* java.sql.Connection#createNClob
* java.sql.Connection#createSQLXML
* java.sql.Connection#createStruct
* java.sql.Connection#getTypeMap
* java.sql.Connection#releaseSavepoint
* java.sql.Connection#setSavepoint
* java.sql.Connection#setTypeMap
* java.sql.Driver#getParentLogger
* java.sql.PreparedStatement#getMetaData
* java.sql.PreparedStatement#setArray
* java.sql.PreparedStatement#setBlob
* java.sql.PreparedStatement#setClob
* java.sql.PreparedStatement#setNCharacterStream
* java.sql.PreparedStatement#setNClob
* java.sql.PreparedStatement#setRef
* java.sql.PreparedStatement#setRowId
* java.sql.PreparedStatement#setSQLXML
* java.sql.PreparedStatement#setUnicodeStream
* java.sql.PreparedStatement#setURL
* java.sql.ResultSet#cancelRowUpdates
* java.sql.ResultSet#deleteRow
* java.sql.ResultSet#getArray
* java.sql.ResultSet#getBlob
* java.sql.ResultSet#getClob
* java.sql.ResultSet#getNCharacterStream
* java.sql.ResultSet#getNClob
* java.sql.ResultSet#getRef
* java.sql.ResultSet#getRowId
* java.sql.ResultSet#getSQLXML
* java.sql.ResultSet#getUnicodeStream
* java.sql.ResultSet#insertRow
* java.sql.ResultSet#moveToInsertRow
* java.sql.ResultSet#refreshRow
* java.sql.ResultSet#updateArray
* java.sql.ResultSet#updateAsciiStream
* java.sql.ResultSet#updateBigDecimal
* java.sql.ResultSet#updateBinaryStream
* java.sql.ResultSet#updateBlob
* java.sql.ResultSet#updateBoolean
* java.sql.ResultSet#updateByte
* java.sql.ResultSet#updateBytes
* java.sql.ResultSet#updateCharacterStream
* java.sql.ResultSet#updateClob
* java.sql.ResultSet#updateDate
* java.sql.ResultSet#updateDouble
* java.sql.ResultSet#updateFloat
* java.sql.ResultSet#updateInt
* java.sql.ResultSet#updateLong
* java.sql.ResultSet#updateNCharacterStream
* java.sql.ResultSet#updateNClob
* java.sql.ResultSet#updateNString
* java.sql.ResultSet#updateNull
* java.sql.ResultSet#updateObject
* java.sql.ResultSet#updateRef
* java.sql.ResultSet#updateRow
* java.sql.ResultSet#updateRowId
* java.sql.ResultSet#updateShort
* java.sql.ResultSet#updateSQLXML
* java.sql.ResultSet#updateString
* java.sql.ResultSet#updateTime
* java.sql.ResultSet#updateTimestamp
* java.sql.Statement#getGeneratedKeys
* java.sql.Statement#setCursorName
* java.sql.Statement#setPoolable

## 제한적으로 지원하는 JDBC 기능 {#jdbc-features-with-limited-support}

다음 JDBC 기능은 특정 상황에서만 지원합니다:

| 기능 | 지원 상황 |
|---------|-----------------|
| java.sql.Connection#prepareStatement | autoGeneratedKeys=Statement.NO_GENERATED_KEYS, resultSetType=ResultSet.TYPE_FORWARD_ONLY, resultSetConcurrency=ResultSet.CONCUR_READ_ONLY이고 columnIndexes와 columnNames가 null이거나 비어 있는 경우. |
| java.sql.Connection#rollback | 세이브포인트를 사용하지 않는 경우. |
| java.sql.Statement#execute | autoGeneratedKeys=Statement.NO_GENERATED_KEYS이고 columnIndexes와 columnNames가 null이거나 비어 있는 경우. |
| java.sql.Statement#executeUpdate | autoGeneratedKeys=Statement.NO_GENERATED_KEYS이고 columnIndexes와 columnNames가 null이거나 비어 있는 경우. |
| java.sql.Statement#getMoreResults | current=Statement.CLOSE_CURRENT_RESULT인 경우. |
