---
id: odbc-querying-data
title: ODBC로 데이터 쿼리 및 수정
sidebar_position: 4
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## 개요 {#overview}

이 페이지에서는 ODBC 드라이버로 클러스터에 연결하고 다양한 SQL 쿼리를 실행하는 방법을 설명합니다.

ODBC 드라이버는 DML(Data Modification Layer)을 지원하므로, ODBC 연결로 데이터를 수정할 수 있습니다.

## 테이블 생성 {#creating-tables}

ODBC 드라이버로 테이블을 만드는 가장 간단한 방법은 DDL 문을 사용하는 것입니다:

<Tabs groupId="languages">
<TabItem value="ddl" label="DDL">

```cpp
SQLHENV env;

// Allocate an environment handle
SQLAllocHandle(SQL_HANDLE_ENV, SQL_NULL_HANDLE, &env);

// Use ODBC ver 3.8
SQLSetEnvAttr(env, SQL_ATTR_ODBC_VERSION, reinterpret_cast<void*>(SQL_OV_ODBC3_80), 0);

SQLHDBC dbc;

// Allocate a connection handle
SQLAllocHandle(SQL_HANDLE_DBC, env, &dbc);

// Prepare the connection string
SQLCHAR connectStr[] = "Driver={Apache Ignite 3};ADDRESS=localhost:10800;SCHEMA=PUBLIC;";

// Connecting to the Cluster.
SQLDriverConnect(dbc, NULL, connectStr, SQL_NTS, NULL, 0, NULL, SQL_DRIVER_COMPLETE);

SQLHSTMT stmt;

// Allocate a statement handle
SQLAllocHandle(SQL_HANDLE_STMT, dbc, &stmt);

SQLCHAR query1[] = "CREATE TABLE Person ( "
    "id LONG PRIMARY KEY, "
    "firstName VARCHAR, "
    "lastName VARCHAR, "
    "salary FLOAT) "";

SQLExecDirect(stmt, query1, SQL_NTS);

SQLCHAR query2[] = "CREATE TABLE Organization ( "
    "id LONG PRIMARY KEY, "
    "name VARCHAR) "";

SQLExecDirect(stmt, query2, SQL_NTS);

SQLCHAR query3[] = "CREATE INDEX idx_organization_name ON Organization (name)";

SQLExecDirect(stmt, query3, SQL_NTS);
```

</TabItem>
</Tabs>

위 예시에서는 `Person`과 `Organization` 타입의 데이터를 담을 테이블 두 개를 정의했습니다. 두 타입 모두 SQL로 읽거나 업데이트할 특정 필드와 인덱스를 지정했습니다.

## 오류 처리 {#handling-errors}

아래 섹션에서는 ODBC를 사용할 때 발생할 수 있는 오류를 처리하는 방법을 다룹니다. 이 예시에서는 클러스터 연결 시 발생하는 문제를 처리합니다:

```c++
// Connecting to Ignite Cluster.
SQLRETURN ret = SQLDriverConnect(dbc, NULL, connectStr, SQL_NTS, NULL, 0, NULL, SQL_DRIVER_COMPLETE);

if (!SQL_SUCCEEDED(ret))
{
  SQLCHAR sqlstate[7] = { 0 };
  SQLINTEGER nativeCode;

  SQLCHAR errMsg[BUFFER_SIZE] = { 0 };
  SQLSMALLINT errMsgLen = static_cast<SQLSMALLINT>(sizeof(errMsg));

  SQLGetDiagRec(SQL_HANDLE_DBC, dbc, 1, sqlstate, &nativeCode, errMsg, errMsgLen, &errMsgLen);

  std::cerr << "Failed to connect to Ignite: "
            << reinterpret_cast<char*>(sqlstate) << ": "
            << reinterpret_cast<char*>(errMsg) << ", "
            << "Native error code: " << nativeCode
            << std::endl;

  // Releasing allocated handles.
  SQLFreeHandle(SQL_HANDLE_DBC, dbc);
  SQLFreeHandle(SQL_HANDLE_ENV, env);

  return;
}
```

## 데이터 쿼리 {#querying-data}

모든 준비가 끝났으면 이제 `ODBC API`로 `SQL SELECT` 쿼리를 실행할 수 있습니다.

```c++
SQLHSTMT stmt;

// Allocate a statement handle
SQLAllocHandle(SQL_HANDLE_STMT, dbc, &stmt);

SQLCHAR query[] = "SELECT firstName, lastName, salary, Organization.name FROM Person "
  "INNER JOIN Organization ON Person.orgId = Organization.id"
SQLSMALLINT queryLen = static_cast<SQLSMALLINT>(sizeof(queryLen));

SQLRETURN ret = SQLExecDirect(stmt, query, queryLen);

if (!SQL_SUCCEEDED(ret))
{
  SQLCHAR sqlstate[7] = { 0 };
  SQLINTEGER nativeCode;

  SQLCHAR errMsg[BUFFER_SIZE] = { 0 };
  SQLSMALLINT errMsgLen = static_cast<SQLSMALLINT>(sizeof(errMsg));

  SQLGetDiagRec(SQL_HANDLE_DBC, dbc, 1, sqlstate, &nativeCode, errMsg, errMsgLen, &errMsgLen);

  std::cerr << "Failed to perform SQL query: "
            << reinterpret_cast<char*>(sqlstate) << ": "
            << reinterpret_cast<char*>(errMsg) << ", "
            << "Native error code: " << nativeCode
            << std::endl;
}
else
{
  // Printing the result set.
  struct OdbcStringBuffer
  {
    SQLCHAR buffer[BUFFER_SIZE];
    SQLLEN resLen;
  };

  // Getting a number of columns in the result set.
  SQLSMALLINT columnsCnt = 0;
  SQLNumResultCols(stmt, &columnsCnt);

  // Allocating buffers for columns.
  std::vector<OdbcStringBuffer> columns(columnsCnt);

  // Binding columns. For simplicity we are going to use only
  // string buffers here.
  for (SQLSMALLINT i = 0; i < columnsCnt; ++i)
    SQLBindCol(stmt, i + 1, SQL_C_CHAR, columns[i].buffer, BUFFER_SIZE, &columns[i].resLen);

  // Fetching and printing data in a loop.
  ret = SQLFetch(stmt);
  while (SQL_SUCCEEDED(ret))
  {
    for (size_t i = 0; i < columns.size(); ++i)
      std::cout << std::setw(16) << std::left << columns[i].buffer << " ";

    std::cout << std::endl;

    ret = SQLFetch(stmt);
  }
}

// Releasing statement handle.
SQLFreeHandle(SQL_HANDLE_STMT, stmt);
```

:::note 컬럼 바인딩
위 예시에서는 모든 컬럼을 SQL_C_CHAR 컬럼에 바인딩합니다. 즉, 값을 가져올 때 모든 값이 문자열로 변환됩니다. 간결하게 설명하기 위한 것입니다. 값을 가져올 때 변환하는 작업은 상당히 느릴 수 있으므로, 기본적으로는 값을 저장된 형태 그대로 가져오는 것이 좋습니다.
:::

## 데이터 삽입 {#inserting-data}

클러스터에 새 데이터를 삽입하려면 ODBC 쪽에서 `SQL INSERT` 문을 사용할 수 있습니다.

```c++
SQLHSTMT stmt;

// Allocate a statement handle
SQLAllocHandle(SQL_HANDLE_STMT, dbc, &stmt);

SQLCHAR query[] =
	"INSERT INTO Person (id, orgId, firstName, lastName, resume, salary) "
	"VALUES (?, ?, ?, ?, ?, ?)";

SQLPrepare(stmt, query, static_cast<SQLSMALLINT>(sizeof(query)));

// Binding columns.
int64_t key = 0;
int64_t orgId = 0;
char name[1024] = { 0 };
SQLLEN nameLen = SQL_NTS;
double salary = 0.0;

SQLBindParameter(stmt, 1, SQL_PARAM_INPUT, SQL_C_SLONG, SQL_BIGINT, 0, 0, &key, 0, 0);
SQLBindParameter(stmt, 2, SQL_PARAM_INPUT, SQL_C_SLONG, SQL_BIGINT, 0, 0, &orgId, 0, 0);
SQLBindParameter(stmt, 3, SQL_PARAM_INPUT, SQL_C_CHAR, SQL_VARCHAR,	sizeof(name), sizeof(name), name, 0, &nameLen);
SQLBindParameter(stmt, 4, SQL_PARAM_INPUT, SQL_C_DOUBLE, SQL_DOUBLE, 0, 0, &salary, 0, 0);

// Filling cache.
key = 1;
orgId = 1;
strncpy(name, "John", sizeof(name));
salary = 2200.0;

SQLExecute(stmt);
SQLMoreResults(stmt);

++key;
orgId = 1;
strncpy(name, "Jane", sizeof(name));
salary = 1300.0;

SQLExecute(stmt);
SQLMoreResults(stmt);

++key;
orgId = 2;
strncpy(name, "Richard", sizeof(name));
salary = 900.0;

SQLExecute(stmt);
SQLMoreResults(stmt);

++key;
orgId = 2;
strncpy(name, "Mary", sizeof(name));
salary = 2400.0;

SQLExecute(stmt);

// Releasing statement handle.
SQLFreeHandle(SQL_HANDLE_STMT, stmt);
```

다음으로, 준비된 문(prepared statement) 없이 조직 데이터를 추가로 삽입합니다.

```c++
SQLHSTMT stmt;

// Allocate a statement handle
SQLAllocHandle(SQL_HANDLE_STMT, dbc, &stmt);

SQLCHAR query1[] = "INSERT INTO Organization (id, name) VALUES (1L, 'Some company')";

SQLExecDirect(stmt, query1, static_cast<SQLSMALLINT>(sizeof(query1)));

SQLFreeStmt(stmt, SQL_CLOSE);

SQLCHAR query2[] = "INSERT INTO Organization (id, name) VALUES (2L, 'Some other company')";

  SQLExecDirect(stmt, query2, static_cast<SQLSMALLINT>(sizeof(query2)));

// Releasing statement handle.
SQLFreeHandle(SQL_HANDLE_STMT, stmt);
```

:::warning 오류 검사
간결하게 하기 위해 위 예시 코드는 오류 반환 코드를 검사하지 않습니다. 프로덕션 환경에서는 오류 검사를 수행하는 것이 좋습니다.
:::

## 데이터 업데이트 {#updating-data}

이제 SQL `UPDATE` 문으로 클러스터에 저장된 일부 사람의 급여를 업데이트해 보겠습니다.

```c++
void AdjustSalary(SQLHDBC dbc, int64_t key, double salary)
{
  SQLHSTMT stmt;

  // Allocate a statement handle
  SQLAllocHandle(SQL_HANDLE_STMT, dbc, &stmt);

  SQLCHAR query[] = "UPDATE Person SET salary=? WHERE id=?";

  SQLBindParameter(stmt, 1, SQL_PARAM_INPUT,
      SQL_C_DOUBLE, SQL_DOUBLE, 0, 0, &salary, 0, 0);

  SQLBindParameter(stmt, 2, SQL_PARAM_INPUT, SQL_C_SLONG,
      SQL_BIGINT, 0, 0, &key, 0, 0);

  SQLExecDirect(stmt, query, static_cast<SQLSMALLINT>(sizeof(query)));

  // Releasing statement handle.
  SQLFreeHandle(SQL_HANDLE_STMT, stmt);
}

...
AdjustSalary(dbc, 3, 1200.0);
AdjustSalary(dbc, 1, 2500.0);
```

## 데이터 삭제 {#deleting-data}

마지막으로 SQL `DELETE` 문을 사용해 레코드 몇 개를 삭제해 보겠습니다.

```c++
void DeletePerson(SQLHDBC dbc, int64_t key)
{
  SQLHSTMT stmt;

  // Allocate a statement handle
  SQLAllocHandle(SQL_HANDLE_STMT, dbc, &stmt);

  SQLCHAR query[] = "DELETE FROM Person WHERE id=?";

  SQLBindParameter(stmt, 1, SQL_PARAM_INPUT, SQL_C_SLONG, SQL_BIGINT,
      0, 0, &key, 0, 0);

  SQLExecDirect(stmt, query, static_cast<SQLSMALLINT>(sizeof(query)));

  // Releasing statement handle.
  SQLFreeHandle(SQL_HANDLE_STMT, stmt);
}

...
DeletePerson(dbc, 1);
DeletePerson(dbc, 4);
```
