---
id: python
title: Python Database API 드라이버
sidebar_position: 5
---

Apache Ignite 3 클라이언트는 표준 소켓 연결로 클러스터에 연결합니다. 클라이언트는 클러스터 토폴로지에 합류하지 않고, 데이터를 전혀 보유하지 않으며, 컴퓨트 연산의 대상으로도 사용되지 않습니다.

Apache Ignite DB API 드라이버는 [Python Database API](https://peps.python.org/pep-0249/)를 사용합니다.

## 시작하기 {#getting-started}

### 사전 요구 사항 {#prerequisites}

Python 드라이버를 실행하려면 다음이 필요합니다:

- 드라이버 빌드용 CMake 3.18 이상
- Python 3.9 이상(3.9, 3.10, 3.11, 3.12에서 테스트함)
- 실행 중인 Ignite 3 노드에 접근할 수 있는 권한

### 제한 사항 {#limitations}

현재 릴리스에서는 SQL 문의 스크립트 실행을 지원하지 않습니다.

### 설치 {#installation}

Python DB API 드라이버를 설치하려면 pip에서 다운로드하세요.

```
pip install pyignite3_dbapi
```

이후 프로젝트에서 `pyignite3_dbapi`를 가져와 사용할 수 있습니다.

## 클러스터에 연결 {#connecting-to-cluster}

클러스터에 연결하려면 `connect()` 메서드를 사용하세요:

```python
addr = ['127.0.0.1:10800']
return pyignite_dbapi.connect(address=addr, timeout=10)
```

클러스터 작업을 마쳤다면 연결을 반드시 닫으세요.

```python
conn.close()
```

또는 `with` 문을 사용하면 더 이상 필요하지 않을 때 연결을 자동으로 닫을 수 있습니다:

```python
with pyignite_dbapi.connect(address=addr, timeout=10) as conn:
    conn.cursor()
```

### 연결에 SSL 구성하기 {#configuring-ssl-for-connection}

클러스터에 안전하게 연결하려면 키 파일과 인증서를 제공해 SSL을 활성화할 수 있습니다. 예:

```python
def create_ssl_connection():
  """Create SSL-enabled connection to GridGain cluster."""
  addr = ['127.0.0.1:10800']
  return pyignite_dbapi.connect(
      address=addr,
      timeout=10,
      use_ssl=True,
      ssl_keyfile='<path_to_ssl_keyfile.pem>',
      ssl_certfile='<path_to_ssl_certfile.pem>',
      # Optional: ssl_ca_certfile='<path_to_ssl_ca_certfile.pem>'
  )
```

:::note
인증서 파일과 키 경로는 모두 시스템에 맞는 문자열 형식으로 제공해야 합니다.
:::

### 인증 구성하기 {#configuring-authorization}

클러스터가 [기본 인증](/configure-and-operate/configuration/config-authentication)을 사용하는 경우, 인증을 받으려면 사용자 `identity`와 `secret`을 제공해야 합니다. 예:

```python
def create_authenticated_connection():
  """Create authenticated connection to GridGain cluster."""
  addr = ['127.0.0.1:10800']
  return pyignite_dbapi.connect(
      address=addr,
      timeout=10,
      identity='user',
      secret='password'
  )
```

### 데이터 접근 구성하기 {#configuring-data-access}

데이터 접근 방식을 세밀하게 조정하려면 선택적 속성을 구성할 수 있습니다.

| 구성 이름 | 설명 |
|--------------------|-------------|
| schema | 기본으로 사용할 스키마 이름입니다. 기본값: 'PUBLIC'. |
| page_size | 단일 요청으로 주고받을 수 있는 최대 행 수입니다. 기본값: 1024 |

다음 예시는 이 속성들을 설정하는 방법을 보여줍니다:

```python
def create_configured_connection():
  """Create authenticated connection to GridGain cluster."""
  addr = ['127.0.0.1:10800']
  return conn = pyignite_dbapi.connect(
    address=addr,
    timeout=10,
    schema='CUSTOM',
    page_size=2048
  )
```

## 커서 객체 가져오기 {#getting-cursor-object}

Python 클라이언트에서 테이블을 다루려면 연결 객체에서 가져올 수 있는 `cursor` 객체를 사용합니다:

```python
conn.cursor()
```

연결과 마찬가지로 커서를 가져올 때도 `with` 문을 사용할 수 있습니다:

```python
with conn.cursor() as cursor:
```

## 단일 쿼리 실행 {#executing-single-query}

커서 객체로 `execute` 명령을 사용해 SQL 문을 실행할 수 있습니다:

```python
# Create table
cursor.execute('''
          CREATE TABLE Person(
              id INT PRIMARY KEY,
              name VARCHAR,
              age INT
          )
      ''')
```

## 일괄 쿼리 실행 {#executing-a-batched-query}

`executemany` 명령을 사용하면 매개변수 묶음으로 SQL 쿼리를 실행할 수 있습니다. 이 방식은 쿼리를 하나씩 실행하는 것보다 성능이 훨씬 뛰어납니다. 아래 예시는 Person 테이블에 두 행을 삽입합니다:

```python
# Sample data
sample_data = [
  [1, "John", 30],
  [2, "Jane", 32],
  [3, "Bob", 28]
]

# Insert data (fixed table name)
cursor.executemany('INSERT INTO Person VALUES(?, ?, ?)', sample_data)
```

## 쿼리 결과 가져오기 {#getting-query-results}

커서는 실행한 작업에 대한 참조를 유지합니다. 작업이 결과를 반환하면(예: `SELECT`) 그 결과도 커서에 저장됩니다. 이후 `fetchone()` 메서드로 커서에서 쿼리 결과를 가져올 수 있습니다:

```python
# Query data
cursor.execute('SELECT * FROM Person ORDER BY id')
results = cursor.fetchall()

print("All persons in database:")
for row in results:
  print(f"ID: {row[0]}, Name: {row[1]}, Age: {row[2]}")
```

## 트랜잭션 다루기 {#working-with-transactions}

기본적으로 데이터베이스 작업에 필요한 트랜잭션은 암시적으로 처리됩니다. 하지만 자동 트랜잭션 처리를 비활성화하고 커밋을 수동으로 처리할 수도 있습니다.

이렇게 하려면 먼저 자동 커밋을 비활성화하세요:

```python
conn.autocommit = False
```

자동 커밋을 비활성화한 후에는 작업을 수동으로 커밋해야 합니다:

```python
# Insert valid records
cursor.execute('INSERT INTO Person VALUES(?, ?, ?)', [4, "Alice", 29])
cursor.execute('INSERT INTO Person VALUES(?, ?, ?)', [5, "Charlie", 31])

cursor.execute('INSERT INTO Person VALUES(?, ?, ?)', [6, "Invalid", new_age])

conn.commit()
print("Transaction committed successfully")
```

커밋하지 않은 작업은 클러스터로 전송되지만 아직 테이블에 기록되지는 않습니다. 테이블은 `commit` 메서드를 호출할 때만 갱신됩니다. 커밋하지 않은 모든 작업은 `rollback` 명령으로 롤백할 수 있습니다:

```python
with conn.cursor() as cursor:
  try:
    # Insert valid records
    cursor.execute('INSERT INTO Person VALUES(?, ?, ?)', [4, "Alice", 29])
    cursor.execute('INSERT INTO Person VALUES(?, ?, ?)', [5, "Charlie", 31])

    cursor.execute('INSERT INTO Person VALUES(?, ?, ?)', [6, "Invalid", new_age])

    conn.commit()
    print("Transaction committed successfully")

  except Exception as e:
    # Rollback on any error
    conn.rollback()
    print(f"Transaction rolled back due to error: {e}")
```

:::note
`rollback` 명령은 커밋하지 않은 모든 데이터를 롤백합니다.
:::
