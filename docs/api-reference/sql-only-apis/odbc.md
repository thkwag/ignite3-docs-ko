---
title: ODBC 드라이버
id: odbc
sidebar_position: 2
---

# ODBC 드라이버

Apache Ignite 3 ODBC 드라이버는 C 및 C++ 애플리케이션을 위해 ODBC 3.8 표준을 구현합니다. 서버 측 라이브러리 없이 표준 ODBC API로 SQL 접근을 제공합니다.

## 연결 문자열 형식 {#connection-string-format}

```
DRIVER={Apache Ignite 3};ADDRESS=host:port;param=value;param=value
```

매개변수는 세미콜론으로 구분된 키-값 쌍입니다. 드라이버는 `ADDRESS`를 지정하거나 `HOST`와 `PORT`를 모두 지정해야 합니다.

기본 포트: 10800
기본 스키마: PUBLIC

## 구성 매개변수 {#configuration-parameters}

### 연결 매개변수 {#connection-parameters}

- `DRIVER` - ODBC 드라이버 이름(필수): `{Apache Ignite 3}`
- `ADDRESS` - `host:port` 형식의 호스트와 포트(쉼표로 구분해 여러 개 지정 가능)
- `HOST` - 호스트 주소(ADDRESS의 대안)
- `PORT` - 포트 번호(ADDRESS의 대안, 기본값: 10800)

### 인증 {#authentication}

- `IDENTITY` - 인증에 사용할 사용자 이름
- `SECRET` - 인증에 사용할 비밀번호

### 스키마 선택 {#schema-selection}

- `SCHEMA` - 쿼리에 사용할 기본 스키마(기본값: `PUBLIC`)

### 성능 튜닝 {#performance-tuning}

- `PAGE_SIZE` - 요청당 가져오는 행 수(기본값: 1024)
- `TIMEZONE` - 타임스탬프 변환에 사용할 클라이언트 시간대

### SSL 구성 {#ssl-configuration}

- `SSL_MODE` - SSL 연결 모드: `disable` 또는 `require`(기본값: `disable`)
- `SSL_KEY_FILE` - PEM으로 인코딩된 개인 키 파일 경로
- `SSL_CERT_FILE` - PEM으로 인코딩된 인증서 파일 경로
- `SSL_CA_FILE` - PEM으로 인코딩된 CA 인증서 파일 경로

## DSN 구성 {#dsn-configuration}

시스템의 ODBC 관리자에서 데이터 원본 이름(DSN)을 구성하세요.

### Windows

ODBC 데이터 원본 관리자(`odbcad32.exe`)를 사용하세요.

1. ODBC 데이터 원본 관리자를 엽니다
2. 새 데이터 원본을 추가합니다
3. "Apache Ignite 3" 드라이버를 선택합니다
4. 연결 매개변수를 구성합니다
5. 연결을 테스트합니다

### Linux

`/etc/odbc.ini` 또는 `~/.odbc.ini`를 편집하세요.

```ini
[IgniteDS]
Driver=Apache Ignite 3
ADDRESS=localhost:10800
SCHEMA=PUBLIC
```

`/etc/odbcinst.ini`에서 드라이버 위치를 구성하세요.

```ini
[Apache Ignite 3]
Description=Apache Ignite 3 ODBC Driver
Driver=/usr/local/lib/libignite-odbc.so
```

### macOS

`~/Library/ODBC/odbc.ini`를 편집하세요.

```ini
[IgniteDS]
Driver=Apache Ignite 3
ADDRESS=localhost:10800
SCHEMA=PUBLIC
```

`~/Library/ODBC/odbcinst.ini`에서 드라이버를 구성하세요.

```ini
[Apache Ignite 3]
Description=Apache Ignite 3 ODBC Driver
Driver=/usr/local/lib/libignite-odbc.dylib
```

## 사용 예시 {#usage-examples}

### 기본 연결 {#basic-connection}

```c
#include <sql.h>
#include <sqlext.h>

SQLHENV env;
SQLHDBC dbc;
SQLHSTMT stmt;

// Allocate environment
SQLAllocHandle(SQL_HANDLE_ENV, SQL_NULL_HANDLE, &env);
SQLSetEnvAttr(env, SQL_ATTR_ODBC_VERSION, (void*)SQL_OV_ODBC3, 0);

// Allocate connection
SQLAllocHandle(SQL_HANDLE_DBC, env, &dbc);

// Connect
SQLCHAR connStr[] = "DRIVER={Apache Ignite 3};ADDRESS=localhost:10800";
SQLDriverConnect(dbc, NULL, connStr, SQL_NTS, NULL, 0, NULL, SQL_DRIVER_NOPROMPT);

// Allocate statement
SQLAllocHandle(SQL_HANDLE_STMT, dbc, &stmt);

// Execute query
SQLExecDirect(stmt, (SQLCHAR*)"SELECT id, name FROM users", SQL_NTS);

// Fetch results
SQLINTEGER id;
SQLCHAR name[256];
SQLLEN idLen, nameLen;

SQLBindCol(stmt, 1, SQL_C_LONG, &id, 0, &idLen);
SQLBindCol(stmt, 2, SQL_C_CHAR, name, sizeof(name), &nameLen);

while (SQLFetch(stmt) == SQL_SUCCESS) {
    printf("%d: %s\n", id, name);
}

// Cleanup
SQLFreeHandle(SQL_HANDLE_STMT, stmt);
SQLDisconnect(dbc);
SQLFreeHandle(SQL_HANDLE_DBC, dbc);
SQLFreeHandle(SQL_HANDLE_ENV, env);
```

### DSN 연결 {#dsn-connection}

```c
SQLCHAR dsn[] = "DSN=IgniteDS";
SQLConnect(dbc, dsn, SQL_NTS, NULL, 0, NULL, 0);
```

### 인증을 사용한 연결 {#connection-with-authentication}

```c
SQLCHAR connStr[] = "DRIVER={Apache Ignite 3};ADDRESS=localhost:10800;IDENTITY=admin;SECRET=password";
SQLDriverConnect(dbc, NULL, connStr, SQL_NTS, NULL, 0, NULL, SQL_DRIVER_NOPROMPT);
```

### SSL을 사용한 연결 {#connection-with-ssl}

```c
SQLCHAR connStr[] =
    "DRIVER={Apache Ignite 3};"
    "ADDRESS=localhost:10800;"
    "SSL_MODE=require;"
    "SSL_CERT_FILE=/path/to/client.pem;"
    "SSL_KEY_FILE=/path/to/client-key.pem;"
    "SSL_CA_FILE=/path/to/ca.pem";

SQLDriverConnect(dbc, NULL, connStr, SQL_NTS, NULL, 0, NULL, SQL_DRIVER_NOPROMPT);
```

### 준비된 문 {#prepared-statements}

```c
SQLCHAR sql[] = "INSERT INTO users (id, name, email) VALUES (?, ?, ?)";
SQLPrepare(stmt, sql, SQL_NTS);

SQLINTEGER id = 101;
SQLCHAR name[] = "John Doe";
SQLCHAR email[] = "john@example.com";
SQLLEN idLen = 0, nameLen = SQL_NTS, emailLen = SQL_NTS;

SQLBindParameter(stmt, 1, SQL_PARAM_INPUT, SQL_C_LONG, SQL_INTEGER, 0, 0, &id, 0, &idLen);
SQLBindParameter(stmt, 2, SQL_PARAM_INPUT, SQL_C_CHAR, SQL_VARCHAR, 0, 0, name, 0, &nameLen);
SQLBindParameter(stmt, 3, SQL_PARAM_INPUT, SQL_C_CHAR, SQL_VARCHAR, 0, 0, email, 0, &emailLen);

SQLExecute(stmt);
```

### 일괄 처리 작업 {#batch-operations}

```c
#define ARRAY_SIZE 100

SQLINTEGER ids[ARRAY_SIZE];
SQLCHAR names[ARRAY_SIZE][256];
SQLLEN idLens[ARRAY_SIZE];
SQLLEN nameLens[ARRAY_SIZE];

// Set array size
SQLULEN arraySize = ARRAY_SIZE;
SQLSetStmtAttr(stmt, SQL_ATTR_PARAMSET_SIZE, (SQLPOINTER)arraySize, 0);

// Bind arrays
SQLBindParameter(stmt, 1, SQL_PARAM_INPUT, SQL_C_LONG, SQL_INTEGER, 0, 0, ids, 0, idLens);
SQLBindParameter(stmt, 2, SQL_PARAM_INPUT, SQL_C_CHAR, SQL_VARCHAR, 256, 0, names, 256, nameLens);

// Populate arrays
for (int i = 0; i < ARRAY_SIZE; i++) {
    ids[i] = i;
    sprintf((char*)names[i], "User %d", i);
    idLens[i] = 0;
    nameLens[i] = SQL_NTS;
}

// Execute batch
SQLCHAR sql[] = "INSERT INTO users (id, name) VALUES (?, ?)";
SQLExecDirect(stmt, sql, SQL_NTS);
```

### 트랜잭션 제어 {#transaction-control}

```c
// Disable auto-commit
SQLSetConnectAttr(dbc, SQL_ATTR_AUTOCOMMIT, SQL_AUTOCOMMIT_OFF, 0);

// Execute multiple statements
SQLExecDirect(stmt, (SQLCHAR*)"INSERT INTO accounts (id, balance) VALUES (1, 1000)", SQL_NTS);
SQLExecDirect(stmt, (SQLCHAR*)"INSERT INTO accounts (id, balance) VALUES (2, 2000)", SQL_NTS);

// Commit
SQLEndTran(SQL_HANDLE_DBC, dbc, SQL_COMMIT);

// Or rollback on error
// SQLEndTran(SQL_HANDLE_DBC, dbc, SQL_ROLLBACK);

// Re-enable auto-commit
SQLSetConnectAttr(dbc, SQL_ATTR_AUTOCOMMIT, SQL_AUTOCOMMIT_ON, 0);
```

### 오류 처리 {#error-handling}

```c
SQLRETURN ret = SQLExecDirect(stmt, (SQLCHAR*)"SELECT * FROM invalid_table", SQL_NTS);

if (!SQL_SUCCEEDED(ret)) {
    SQLCHAR sqlState[6];
    SQLINTEGER nativeError;
    SQLCHAR message[SQL_MAX_MESSAGE_LENGTH];
    SQLSMALLINT messageLen;

    SQLGetDiagRec(SQL_HANDLE_STMT, stmt, 1, sqlState, &nativeError,
                  message, sizeof(message), &messageLen);

    printf("Error: %s (%d): %s\n", sqlState, nativeError, message);
}
```

### 메타데이터 쿼리 {#metadata-queries}

```c
// List tables
SQLTables(stmt, NULL, 0, NULL, 0, NULL, 0, (SQLCHAR*)"TABLE", SQL_NTS);

// List columns for a table
SQLColumns(stmt, NULL, 0, NULL, 0, (SQLCHAR*)"users", SQL_NTS, NULL, 0);

// Get result metadata
SQLCHAR columnName[256];
SQLSMALLINT nameLen, dataType, decimalDigits, nullable;
SQLULEN columnSize;

for (SQLSMALLINT i = 1; i <= columnCount; i++) {
    SQLDescribeCol(stmt, i, columnName, sizeof(columnName), &nameLen,
                   &dataType, &columnSize, &decimalDigits, &nullable);

    printf("Column %d: %s, Type: %d, Size: %lu\n",
           i, columnName, dataType, columnSize);
}
```

## Ignite 고유 동작 {#ignite-specific-behavior}

### 타입 매핑 {#type-mapping}

ODBC SQL 타입은 C 타입으로 매핑됩니다.

| SQL 타입 | ODBC SQL 타입 | C 타입 |
|----------|---------------|--------|
| BOOLEAN | SQL_BIT | SQL_C_BIT |
| TINYINT | SQL_TINYINT | SQL_C_STINYINT |
| SMALLINT | SQL_SMALLINT | SQL_C_SSHORT |
| INTEGER | SQL_INTEGER | SQL_C_SLONG |
| BIGINT | SQL_BIGINT | SQL_C_SBIGINT |
| FLOAT | SQL_FLOAT | SQL_C_FLOAT |
| REAL | SQL_REAL | SQL_C_FLOAT |
| DOUBLE | SQL_DOUBLE | SQL_C_DOUBLE |
| DECIMAL | SQL_DECIMAL | SQL_C_CHAR |
| DATE | SQL_TYPE_DATE | SQL_C_TYPE_DATE |
| TIME | SQL_TYPE_TIME | SQL_C_TYPE_TIME |
| TIMESTAMP | SQL_TYPE_TIMESTAMP | SQL_C_TYPE_TIMESTAMP |
| CHAR | SQL_CHAR | SQL_C_CHAR |
| VARCHAR | SQL_VARCHAR | SQL_C_CHAR |
| BINARY | SQL_BINARY | SQL_C_BINARY |
| VARBINARY | SQL_VARBINARY | SQL_C_BINARY |
| UUID | SQL_GUID | SQL_C_GUID |

### 결과 집합 특성 {#result-set-characteristics}

- **커서 유형**: 앞으로만 이동(SQL_CURSOR_FORWARD_ONLY)
- **동시성**: 읽기 전용
- **스크롤 가능 여부**: 불가(커서가 앞으로만 이동)

### 페이지네이션 {#pagination}

드라이버는 결과를 페이지 단위로 가져옵니다. 성능을 위해 페이지 크기를 구성하세요.

```c
// Set page size before executing query
SQLUINTEGER pageSize = 2048;
SQLSetStmtAttr(stmt, SQL_ATTR_ROW_ARRAY_SIZE, (SQLPOINTER)pageSize, 0);
```

기본 페이지 크기: 1024행.

### 연결 타임아웃 {#connection-timeout}

핸들 할당 단계에서 연결 타임아웃을 설정합니다.

```c
// Set 5-second connection timeout
SQLINTEGER timeout = 5;
SQLSetConnectAttr(dbc, SQL_ATTR_CONNECTION_TIMEOUT, (SQLPOINTER)timeout, 0);
```

### 쿼리 타임아웃 {#query-timeout}

문에 쿼리 타임아웃을 설정합니다.

```c
// Set 30-second query timeout
SQLINTEGER timeout = 30;
SQLSetStmtAttr(stmt, SQL_ATTR_QUERY_TIMEOUT, (SQLPOINTER)timeout, 0);
```

## 연결 문자열 예시 {#connection-string-examples}

```
# Basic
DRIVER={Apache Ignite 3};ADDRESS=localhost:10800

# With schema
DRIVER={Apache Ignite 3};ADDRESS=localhost:10800;SCHEMA=analytics

# With authentication
DRIVER={Apache Ignite 3};ADDRESS=localhost:10800;IDENTITY=admin;SECRET=password

# With SSL
DRIVER={Apache Ignite 3};ADDRESS=localhost:10800;SSL_MODE=require;SSL_CERT_FILE=/opt/certs/client.pem;SSL_KEY_FILE=/opt/certs/client-key.pem;SSL_CA_FILE=/opt/certs/ca.pem

# Multiple nodes
DRIVER={Apache Ignite 3};ADDRESS=node1:10800,node2:10800,node3:10800

# Complete configuration
DRIVER={Apache Ignite 3};ADDRESS=node1:10800,node2:10800;SCHEMA=mySchema;IDENTITY=admin;SECRET=password;PAGE_SIZE=2048;SSL_MODE=require;SSL_CERT_FILE=/opt/certs/client.pem;SSL_KEY_FILE=/opt/certs/client-key.pem;SSL_CA_FILE=/opt/certs/ca.pem
```

## 참조 {#reference}

### ODBC 준수 {#odbc-compliance}

- ODBC 3.8 사양 준수
- 핵심 함수 구현(레벨 1)
- SQLConnect, SQLDriverConnect, SQLExecDirect, SQLPrepare, SQLExecute 지원
- SQLBindCol, SQLBindParameter, SQLFetch 지원
- 진단을 위한 SQLGetInfo, SQLGetDiagRec 지원
- 메타데이터 함수 구현: SQLTables, SQLColumns, SQLPrimaryKeys

### 지원하는 ODBC 함수 {#supported-odbc-functions}

**연결 관리**:
- SQLAllocHandle, SQLFreeHandle
- SQLConnect, SQLDriverConnect, SQLDisconnect

**문 관리**:
- SQLAllocStmt, SQLFreeStmt
- SQLPrepare, SQLExecute, SQLExecDirect
- SQLCloseCursor

**결과 처리**:
- SQLBindCol, SQLFetch
- SQLRowCount
- SQLDescribeCol, SQLNumResultCols

**매개변수 바인딩**:
- SQLBindParameter
- SQLNumParams

**트랜잭션 제어**:
- SQLEndTran (커밋/롤백)
- SQLSetConnectAttr (자동 커밋 모드)

**메타데이터**:
- SQLTables, SQLColumns
- SQLPrimaryKeys, SQLForeignKeys
- SQLGetInfo, SQLGetTypeInfo

### 제한 사항 {#limitations}

- 스크롤 가능 커서 미지원(앞으로만 이동)
- 위치 지정 업데이트/삭제 미지원(읽기 전용 결과)
- 비동기 실행 미지원
- 북마크 미지원
- 여러 활성 문에는 여러 문 핸들이 필요함
