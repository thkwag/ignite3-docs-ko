---
title: Python DB-API
id: python
sidebar_position: 3
---

# Python DB-API

Apache Ignite 3 Python 드라이버는 Python 애플리케이션을 위해 PEP 249(Python Database API Specification 2.0)를 구현합니다. 성능을 위해 네이티브 C++ 확장으로 뒷받침되는 표준 Python 인터페이스로 SQL 접근을 제공합니다.

## 설치 {#installation}

```bash
pip install pyignite_dbapi
```

## 연결 함수 {#connection-function}

```python
connect(address, **kwargs)
```

### 매개변수 {#parameters}

- `address` - `['host:port', 'host:port']` 형식의 노드 주소 목록

### 키워드 인수 {#keyword-arguments}

**연결 옵션**:
- `identity` - 인증에 사용할 사용자 이름
- `secret` - 인증에 사용할 비밀번호
- `schema` - 기본 스키마 이름(기본값: `'PUBLIC'`)
- `page_size` - 요청당 가져오는 행 수(기본값: `1024`)
- `timeout` - 네트워크 타임아웃(초 단위, 기본값: `30`)
- `autocommit` - 자동 커밋 모드 활성화(기본값: `True`)

**SSL 옵션**:
- `use_ssl` - SSL 연결 활성화(불리언)
- `ssl_keyfile` - PEM으로 인코딩된 개인 키 파일 경로
- `ssl_certfile` - PEM으로 인코딩된 인증서 파일 경로
- `ssl_ca_certfile` - PEM으로 인코딩된 CA 인증서 파일 경로

### 반환값 {#returns}

`Connection` 객체.

## Connection 객체 {#connection-object}

### 속성 {#attributes}

- `autocommit` - 자동 커밋 모드 조회 또는 설정(속성)

### 메서드 {#methods}

- `close()` - 연결과 관련된 모든 커서를 닫습니다
- `commit()` - 대기 중인 트랜잭션을 커밋합니다
- `rollback()` - 대기 중인 트랜잭션을 롤백합니다
- `cursor()` - 새 커서 객체를 생성해 반환합니다

### 컨텍스트 관리자 지원 {#context-manager-support}

```python
with pyignite_dbapi.connect(address=['localhost:10800']) as conn:
    # Use connection
    pass
# Connection automatically closes
```

## Cursor 객체 {#cursor-object}

### 속성 {#attributes-1}

- `arraysize` - `fetchmany()`가 반환하는 행 수(기본값: `1`)
- `description` - 결과 컬럼을 설명하는 7-튜플의 읽기 전용 시퀀스
- `rowcount` - 영향받거나 반환된 행 수(읽기 전용)
- `rownumber` - 현재 행 인덱스(읽기 전용, 0 기반)
- `connection` - 부모 연결 객체(읽기 전용)
- `lastrowid` - 항상 `None`(Ignite에서 미지원)

### 메서드 {#methods-1}

- `execute(query, params=None)` - 선택적 매개변수와 함께 SQL 쿼리를 실행합니다
- `executemany(query, params_list)` - 매개변수 시퀀스로 SQL 쿼리를 여러 번 실행합니다
- `fetchone()` - 다음 행을 튜플로 가져오거나 `None`을 반환합니다
- `fetchmany(size=None)` - 다음 `size`개 행을 튜플 목록으로 가져옵니다(`size`가 `None`이면 `arraysize`를 사용)
- `fetchall()` - 남은 모든 행을 튜플 목록으로 가져옵니다
- `close()` - 커서를 닫습니다
- `next()` / `__next__()` - 다음 행을 가져옵니다(이터레이터 프로토콜)

### 컨텍스트 관리자 지원 {#context-manager-support-1}

```python
with conn.cursor() as cursor:
    cursor.execute('SELECT * FROM users')
    # Use cursor
    pass
# Cursor automatically closes
```

## 컬럼 설명 {#column-description}

`cursor.description` 속성은 각 결과 컬럼마다 7-튜플의 시퀀스를 반환합니다.

1. `name` - 컬럼 이름(문자열)
2. `type_code` - Python 타입 상수
3. `display_size` - 표시 너비(정수 또는 `None`)
4. `internal_size` - 내부 저장 크기(정수 또는 `None`)
5. `precision` - 숫자 정밀도(정수 또는 `None`)
6. `scale` - 숫자 스케일(정수 또는 `None`)
7. `null_ok` - 컬럼의 NULL 허용 여부(불리언 또는 `None`)

## 타입 상수 {#type-constants}

모듈은 컬럼 설명을 위한 타입 상수를 제공합니다.

- `NULL` - None 타입
- `BOOLEAN` - 불리언 타입(bool)
- `INT` - 정수 타입(int)
- `FLOAT` - 부동소수점 타입(float)
- `NUMBER` - 십진 타입(decimal.Decimal)
- `DATE` - 날짜 타입(datetime.date)
- `TIME` - 시간 타입(datetime.time)
- `DATETIME` - datetime 타입(datetime.datetime)
- `DURATION` - 기간 타입(datetime.timedelta)
- `STRING` - 문자열 타입(str)
- `BINARY` - 바이너리 타입(bytes)
- `UUID` - UUID 타입(uuid.UUID)
- `TIMESTAMP` - 타임스탬프 타입(float 하위 클래스)

## 매개변수 스타일 {#parameter-style}

드라이버는 물음표(`?`) 매개변수 스타일을 사용합니다.

```python
cursor.execute('SELECT * FROM users WHERE id = ?', [101])
cursor.execute('INSERT INTO users (id, name) VALUES (?, ?)', [101, 'John'])
```

매개변수는 쿼리의 물음표에 위치 기준으로 바인딩됩니다.

## 사용 예시 {#usage-examples}

### 기본 연결 {#basic-connection}

```python
import pyignite_dbapi

conn = pyignite_dbapi.connect(address=['127.0.0.1:10800'])

try:
    cursor = conn.cursor()
    cursor.execute('SELECT id, name FROM users')

    for row in cursor:
        print(f"{row[0]}: {row[1]}")

    cursor.close()
finally:
    conn.close()
```

### 컨텍스트 관리자를 사용한 연결 {#connection-with-context-manager}

```python
import pyignite_dbapi

with pyignite_dbapi.connect(address=['127.0.0.1:10800']) as conn:
    with conn.cursor() as cursor:
        cursor.execute('SELECT id, name FROM users')

        for row in cursor:
            print(f"{row[0]}: {row[1]}")
```

### 인증을 사용한 연결 {#connection-with-authentication}

```python
conn = pyignite_dbapi.connect(
    address=['127.0.0.1:10800'],
    identity='admin',
    secret='password'
)
```

### SSL을 사용한 연결 {#connection-with-ssl}

```python
conn = pyignite_dbapi.connect(
    address=['127.0.0.1:10800'],
    use_ssl=True,
    ssl_certfile='/path/to/client.pem',
    ssl_keyfile='/path/to/client-key.pem',
    ssl_ca_certfile='/path/to/ca.pem'
)
```

### 여러 노드 주소 {#multiple-node-addresses}

```python
conn = pyignite_dbapi.connect(
    address=['node1:10800', 'node2:10800', 'node3:10800']
)
```

드라이버는 하나가 성공할 때까지 주소를 순서대로 연결 시도합니다.

### 매개변수화된 쿼리 {#parameterized-queries}

```python
cursor.execute(
    'SELECT * FROM users WHERE age > ? AND city = ?',
    [25, 'New York']
)

rows = cursor.fetchall()
```

### 매개변수를 사용한 삽입 {#insert-with-parameters}

```python
cursor.execute(
    'INSERT INTO users (id, name, email) VALUES (?, ?, ?)',
    [101, 'John Doe', 'john@example.com']
)

print(f"Rows affected: {cursor.rowcount}")
```

### 일괄 삽입 {#batch-insert}

```python
users = [
    (1, 'Alice', 'alice@example.com'),
    (2, 'Bob', 'bob@example.com'),
    (3, 'Charlie', 'charlie@example.com')
]

cursor.executemany(
    'INSERT INTO users (id, name, email) VALUES (?, ?, ?)',
    users
)

print(f"Rows affected: {cursor.rowcount}")
```

### 트랜잭션 제어 {#transaction-control}

```python
conn = pyignite_dbapi.connect(
    address=['127.0.0.1:10800'],
    autocommit=False
)

try:
    cursor = conn.cursor()
    cursor.execute('INSERT INTO accounts (id, balance) VALUES (?, ?)', [1, 1000])
    cursor.execute('INSERT INTO accounts (id, balance) VALUES (?, ?)', [2, 2000])

    conn.commit()
except Exception as e:
    conn.rollback()
    raise
finally:
    conn.close()
```

### 페치 전략 {#fetch-strategies}

```python
cursor.execute('SELECT * FROM large_table')

# Fetch one row at a time
row = cursor.fetchone()
if row:
    print(row)

# Fetch specific number of rows
cursor.arraysize = 100
rows = cursor.fetchmany(100)  # Fetch 100 rows

# Fetch all remaining rows
all_rows = cursor.fetchall()
```

### 이터레이터 프로토콜 {#iterator-protocol}

```python
cursor.execute('SELECT * FROM users')

for row in cursor:
    print(row)
```

### 컬럼 메타데이터 {#column-metadata}

```python
cursor.execute('SELECT id, name, created_at FROM users')

for col in cursor.description:
    print(f"Column: {col.name}")
    print(f"  Type: {col.type_code}")
    print(f"  Nullable: {col.null_ok}")
```

### 타입 처리 {#type-handling}

```python
import datetime
import uuid
from decimal import Decimal

# Insert various types
cursor.execute('''
    INSERT INTO products (id, uuid, name, price, created, active)
    VALUES (?, ?, ?, ?, ?, ?)
''', [
    1,
    uuid.uuid4(),
    'Widget',
    Decimal('19.99'),
    datetime.datetime.now(),
    True
])

# Retrieve and use typed values
cursor.execute('SELECT uuid, price, created FROM products WHERE id = ?', [1])
row = cursor.fetchone()

product_uuid = row[0]  # uuid.UUID
product_price = row[1]  # Decimal
product_created = row[2]  # datetime.datetime
```

### 오류 처리 {#error-handling}

```python
import pyignite_dbapi

try:
    conn = pyignite_dbapi.connect(address=['127.0.0.1:10800'])
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM nonexistent_table')
except pyignite_dbapi.DatabaseError as e:
    print(f"Database error: {e}")
except pyignite_dbapi.OperationalError as e:
    print(f"Connection error: {e}")
finally:
    if conn:
        conn.close()
```

## 예외 계층 {#exception-hierarchy}

모든 예외는 `Error`를 상속합니다.

```
Error (base exception)
├── Warning
├── InterfaceError
└── DatabaseError
    ├── DataError
    ├── OperationalError
    ├── IntegrityError
    ├── InternalError
    ├── ProgrammingError
    └── NotSupportedError
```

연결 객체나 모듈에서 예외에 접근하세요.

```python
try:
    cursor.execute(query)
except conn.DatabaseError as e:
    # Handle error
    pass

# Or
except pyignite_dbapi.DatabaseError as e:
    # Handle error
    pass
```

## Ignite 고유 동작 {#ignite-specific-behavior}

### 타입 매핑 {#type-mapping}

Python 타입은 SQL 타입으로 매핑됩니다.

| Python 타입 | SQL 타입 |
|-------------|----------|
| None | NULL |
| bool | BOOLEAN |
| int | BIGINT |
| float | DOUBLE |
| Decimal | DECIMAL |
| str | VARCHAR |
| bytes | VARBINARY |
| date | DATE |
| time | TIME |
| datetime | TIMESTAMP |
| timedelta | INTERVAL |
| UUID | UUID |

### 자동 커밋 기본값 {#autocommit-default}

자동 커밋의 기본값은 `True`입니다. 명시적인 트랜잭션 제어를 하려면 비활성화하세요.

```python
conn = pyignite_dbapi.connect(
    address=['127.0.0.1:10800'],
    autocommit=False
)
```

또는 연결 후에 변경하세요.

```python
conn.autocommit = False
```

### 페이지 크기 {#page-size}

드라이버는 결과를 페이지 단위로 가져옵니다(기본값: 1024행). 큰 결과 집합에서는 페이지 크기를 늘려 네트워크 오버헤드를 줄이세요.

```python
conn = pyignite_dbapi.connect(
    address=['127.0.0.1:10800'],
    page_size=4096
)
```

### 네트워크 타임아웃 {#network-timeout}

소켓 작업에 대한 네트워크 타임아웃을 구성합니다.

```python
conn = pyignite_dbapi.connect(
    address=['127.0.0.1:10800'],
    timeout=60  # 60 seconds
)
```

### 스레드 안전성 {#thread-safety}

모듈은 스레드 안전성 레벨 1(모듈 수준)을 제공합니다. 각 스레드에는 자체 연결이 필요합니다. 스레드 간에 연결을 공유하지 마세요.

### lastrowid 제한 사항 {#lastrowid-limitation}

`cursor.lastrowid` 속성은 항상 `None`을 반환합니다. Ignite는 DB-API 인터페이스로 자동 생성 키를 추적하지 않습니다.

## 연결 예시 {#connection-examples}

```python
# Basic
conn = pyignite_dbapi.connect(address=['127.0.0.1:10800'])

# With schema
conn = pyignite_dbapi.connect(
    address=['127.0.0.1:10800'],
    schema='analytics'
)

# With authentication
conn = pyignite_dbapi.connect(
    address=['127.0.0.1:10800'],
    identity='admin',
    secret='password'
)

# With SSL
conn = pyignite_dbapi.connect(
    address=['127.0.0.1:10800'],
    use_ssl=True,
    ssl_certfile='/opt/certs/client.pem',
    ssl_keyfile='/opt/certs/client-key.pem',
    ssl_ca_certfile='/opt/certs/ca.pem'
)

# Complete configuration
conn = pyignite_dbapi.connect(
    address=['node1:10800', 'node2:10800', 'node3:10800'],
    identity='admin',
    secret='password',
    schema='mySchema',
    page_size=2048,
    timeout=60,
    autocommit=False,
    use_ssl=True,
    ssl_certfile='/opt/certs/client.pem',
    ssl_keyfile='/opt/certs/client-key.pem',
    ssl_ca_certfile='/opt/certs/ca.pem'
)
```

## 참조 {#reference}

### 모듈 속성 {#module-attributes}

- `apilevel` - `'2.0'`(PEP 249 API 레벨)
- `threadsafety` - `1`(모듈 수준 스레드 안전성)
- `paramstyle` - `'qmark'`(물음표 매개변수 스타일)

### DB-API 준수 {#db-api-compliance}

- PEP 249 Database API Specification 2.0 준수
- Connection, Cursor 객체 구현
- 컨텍스트 관리자(with 문) 지원
- 커서에 대한 이터레이터 프로토콜 구현
- 표준 예외 계층 제공

### 제한 사항 {#limitations}

- 스레드 안전성 레벨 1(연결은 스레드 안전하지 않음)
- `lastrowid` 미지원(항상 `None` 반환)
- 바이너리 데이터는 `bytes` 타입을 사용해야 함(특수 Binary 생성자 없음)
- 날짜/시간 값은 표준 라이브러리 타입을 사용함(특수 생성자 없음)
