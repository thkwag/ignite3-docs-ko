---
id: odbc
title: ODBC 드라이버
sidebar_position: 2
---

## 개요 {#overview}

Ignite 3에는 표준 SQL 쿼리와 네이티브 ODBC API로 분산 캐시에 저장된 데이터를 조회하고 수정할 수 있는 ODBC 드라이버가 포함되어 있습니다. ODBC 드라이버는 [클라이언트 연결 구성](/develop/ignite-clients/)을 사용합니다.

ODBC 드라이버는 연결 수준에서만 스레드 안전성을 제공합니다. 즉, 추가 동기화 없이 여러 스레드에서 같은 연결에 접근해서는 안 되지만, 스레드마다 별도의 연결을 만들어 동시에 사용할 수는 있습니다.

ODBC 드라이버는 ODBC API 버전 3.8을 구현합니다. ODBC에 대한 자세한 내용은 [ODBC 프로그래머 참조 문서](https://msdn.microsoft.com/en-us/library/ms714177.aspx)를 참고하세요.

## ODBC 드라이버 설치 {#installing-odbc-driver}

ODBC 드라이버를 사용하려면 ODBC 드라이버 관리자가 찾을 수 있도록 시스템에 등록해야 합니다.

### Windows에 설치하기 {#installing-on-windows}

#### 사전 요구 사항 {#prerequisites}

먼저 Microsoft Visual C++ 2017 Redistributable Package를 설치해야 합니다.

#### 설치 과정 {#installation-process}

제공된 설치 프로그램을 실행하고 안내를 따르세요.

### 클러스터 구성 {#configuring-the-cluster}

ODBC 드라이버는 클라이언트 커넥터를 사용해 클러스터와 통신합니다. 사용하려는 포트로 반드시 구성하세요. 예:

```
node config update clientConnector.port=10469
```

클라이언트 커넥터 구성에 대한 자세한 내용은 [클라이언트 커넥터 구성](/develop/ignite-clients/) 문서를 참고하세요.

### Linux에 설치하기 {#installing-on-linux}

Linux에서 ODBC 드라이버를 빌드하고 설치하려면 먼저 ODBC 드라이버 관리자를 설치해야 합니다. ODBC 드라이버는 [UnixODBC](http://www.unixodbc.org)로 테스트했습니다.

#### 사전 요구 사항 {#prerequisites-1}

먼저 다음 사전 요구 사항을 설치하세요:

- C++14 표준을 지원하는 [libstdc](https://gcc.gnu.org/onlinedocs/libstdc%2B%2B) 라이브러리
- [UnixODBC](http://www.unixodbc.org) 드라이버 관리자

#### 웹사이트에서 다운로드하기 {#download-from-website}

제공된 웹사이트에서 빌드된 rpm 또는 deb 패키지를 받을 수 있습니다. 이후 패키지를 로컬에 설치해 사용하세요.

## 지원하는 데이터 타입 {#supported-data-types}

다음 SQL 데이터 타입을 지원합니다:

- `SQL_CHAR`
- `SQL_VARCHAR`
- `SQL_LONGVARCHAR`
- `SQL_SMALLINT`
- `SQL_INTEGER`
- `SQL_FLOAT`
- `SQL_DOUBLE`
- `SQL_BIT`
- `SQL_TINYINT`
- `SQL_BIGINT`
- `SQL_BINARY`
- `SQL_VARBINARY`
- `SQL_LONGVARBINARY`
- `SQL_GUID`
- `SQL_DECIMAL`
- `SQL_TYPE_DATE`
- `SQL_TYPE_TIMESTAMP`
- `SQL_TYPE_TIME`

## pyodbc 사용하기 {#using-pyodbc}

Ignite는 [pyodbc](https://pypi.org/project/pyodbc/)와 함께 사용할 수 있습니다. Ignite 3에서 pyodbc를 사용하는 방법은 다음과 같습니다:

- pyodbc 설치하기:

```shell
pip3 install pyodbc
```

- 프로젝트에 pyodbc 가져오기:

```python
import pyodbc
```

- 데이터베이스에 연결하기:

```python
conn = pyodbc.connect('Driver={Apache Ignite 3};Address=127.0.0.1:10800;')
```

- 인코딩을 UTF-8로 설정하기:

```python
conn.setencoding(encoding='utf-8')
conn.setdecoding(sqltype=pyodbc.SQL_CHAR, encoding="utf-8")
conn.setdecoding(sqltype=pyodbc.SQL_WCHAR, encoding="utf-8")
```

- 데이터베이스에서 데이터 가져오기:

```python
cursor = conn.cursor()
cursor.execute('SELECT * FROM table_name')
```

pyodbc 사용에 대한 자세한 내용은 [공식 문서](https://github.com/mkleehammer/pyodbc/wiki)를 참고하세요.
