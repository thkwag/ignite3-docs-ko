---
id: cpp-client
title: C++ 클라이언트
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Ignite 3 클라이언트는 표준 소켓 연결로 클러스터에 연결합니다. Ignite 2.x와 달리 Ignite 3에는 씬 클라이언트(thin client)와 씩 클라이언트(thick client)의 구분이 없으며, 모든 클라이언트가 씬 클라이언트입니다.

클라이언트는 클러스터 토폴로지에 합류하지 않고, 데이터를 전혀 보유하지 않으며, 컴퓨트 연산의 대상으로도 사용되지 않습니다.

## 시작하기 {#getting-started}

### 사전 요구 사항 {#prerequisites}

C++ 클라이언트를 실행하려면 `cmake` 명령어를 실행할 수 있는 C++ 빌드 환경이 필요합니다:

- C++ 17을 지원하는 C++ 컴파일러
- CMake 3.10 이상
- 빌드 시스템 중 하나: make, ninja, MS Visual Studio 등

### 설치 {#build-ref}

C++ 클라이언트의 소스 코드는 Ignite 3 배포판에 포함되어 있습니다. 빌드하려면 다음 명령어를 사용하세요:

<Tabs groupId="os">
<TabItem value="windows" label="Windows">

```bat
mkdir cmake-build-release
cd cmake-build-release
cmake ..
cmake --build . -j8
```

</TabItem>
<TabItem value="linux" label="Linux">

```bash
mkdir cmake-build-release
cd cmake-build-release
cmake .. -DCMAKE_BUILD_TYPE=Release
cmake --build . -j8
```

</TabItem>
<TabItem value="macos" label="MacOS">

```bash
mkdir cmake-build-release
cd cmake-build-release
cmake .. -DCMAKE_BUILD_TYPE=Release
cmake --build . -j8
```

</TabItem>
</Tabs>

### CentOS 7 및 RHEL 7에서 C++ 클라이언트 빌드하기 {#building-c-client-on-centos-7-and-rhel-7}

구형 시스템에서 실행 중이라면 다음과 같이 환경을 구성해야 합니다:

1. `epel-release`와 `centos-release-scl`을 설치합니다:

```bash
yum install epel-release centos-release-scl
```

2. yum을 업데이트하고 `epel-release` 키를 승인합니다:

```bash
yum update
```

3. 메인 저장소에서 빌드 도구와 `devtoolset-11`을 설치합니다:

```bash
yum install devtoolset-11-gcc devtoolset-11-gcc-c++ cmake3 git java-11-openjdk-devel gtest-devel gmock-devel
```

4. `cmake3`을 사용하도록 `cmake`의 alternatives를 만들고 업데이트합니다:
   - 우선순위 10으로 `cmake2` alternative를 만듭니다:

```bash
sudo alternatives --install /usr/local/bin/cmake cmake /usr/bin/cmake 10 \
--slave /usr/local/bin/ctest ctest /usr/bin/ctest \
--slave /usr/local/bin/cpack cpack /usr/bin/cpack \
--slave /usr/local/bin/ccmake ccmake /usr/bin/ccmake \
--family cmake
```

   - 우선순위 20으로 `cmake3` alternative를 만듭니다:

```bash
sudo alternatives --install /usr/local/bin/cmake cmake /usr/bin/cmake3 20 \
--slave /usr/local/bin/ctest ctest /usr/bin/ctest3 \
--slave /usr/local/bin/cpack cpack /usr/bin/cpack3 \
--slave /usr/local/bin/ccmake ccmake /usr/bin/ccmake3 \
--family cmake
```

   - 기본 alternative가 `cmake3`을 가리키는지 확인합니다:

```bash
sudo alternatives --config cmake
```

5. `devtoolset-11` 컴파일러를 활성화하고 업데이트된 PATH로 bash를 시작합니다:

```bash
scl enable devtoolset-11 bash
```

6. 설정한 셸에서 [빌드](#build-ref)를 시작합니다.

## 클라이언트 커넥터 구성 {#client-connector-configuration}

클라이언트 연결 매개변수는 클라이언트 커넥터 구성으로 제어합니다. 기본적으로 Ignite는 10800 포트에서 클라이언트 연결을 받습니다. 노드 구성은 언제든지 [CLI 도구](/tools/cli-commands)로 변경할 수 있습니다.

JSON 형식의 클라이언트 커넥터 구성은 다음과 같습니다.

:::note
Ignite 3에서는 JSON 또는 HOCON 형식으로 구성을 만들고 관리할 수 있습니다.
:::

```json
"ignite" : {
  "clientConnector" : {
    "port" : 10800,
    "idleTimeoutMillis" :3000,
    "sendServerExceptionStackTraceToClient" : true,
    "ssl" : {
      "enabled" : true,
      "clientAuth" : "require",
      "keyStore" : {
        "path" : "KEYSTORE_PATH",
        "password" : "SSL_STORE_PASS"
      },
      "trustStore" : {
        "path" : "TRUSTSTORE_PATH",
        "password" : "SSL_STORE_PASS"
      },
    },
  },
}
```

아래 표는 클라이언트 커넥터 구성을 설명합니다:

| 속성 | 기본값 | 설명 |
|----------|---------|-------------|
| connectTimeoutMillis | 5000 | 연결 시도 타임아웃(밀리초). |
| idleTimeoutMillis | 0 | 연결이 끊기기 전까지 클라이언트가 유휴 상태로 있을 수 있는 시간(밀리초). 기본적으로 제한이 없습니다. |
| metricsEnabled | `false` | 클라이언트 메트릭 수집 여부를 정의합니다. |
| port | 10800 | 클라이언트 커넥터가 수신 대기할 포트. |
| sendServerExceptionStackTraceToClient | `false` | 클러스터 예외를 클라이언트에 전송할지 정의합니다. |
| ssl.ciphers | | SSL 통신에 사용하는 암호화 방식. |
| ssl.clientAuth | | 클라이언트가 사용하는 클라이언트 인증 유형. 자세한 내용은 [SSL/TLS](/configure-and-operate/configuration/config-ssl-tls)를 참고하세요. |
| ssl.enabled | | SSL 활성화 여부를 정의합니다. |
| ssl.keyStore.password | | SSL 키스토어 비밀번호. |
| ssl.keyStore.path | | SSL 키스토어 경로. |
| ssl.keyStore.type | `PKCS12` | 사용하는 SSL 키스토어 유형. |
| ssl.trustStore.password | | SSL 키스토어 비밀번호. |
| ssl.trustStore.path | | SSL 키스토어 경로. |
| ssl.trustStore.type | `PKCS12` | 사용하는 SSL 키스토어 유형. |

매개변수는 다음과 같이 변경할 수 있습니다:

```
node config update clientConnector.port=10469
```

## 클러스터에 연결 {#connecting-to-cluster}

클라이언트를 초기화하려면 `IgniteClient` 클래스를 사용하고 구성 정보를 전달합니다:

<Tabs groupId="languages">
<TabItem value="cpp" label="C++">

```cpp
using namespace ignite;

ignite_client_configuration cfg{"127.0.0.1"};
auto client = ignite_client::start(cfg, std::chrono::seconds(5));
```

</TabItem>
</Tabs>

## 인증 {#authentication}

인증 정보를 전달하려면 `IgniteClient` 빌더에 전달합니다:

<Tabs groupId="languages">
<TabItem value="cpp" label="C++">

```cpp
auto authenticator = std::make_shared<ignite::basic_authenticator>("myUser", "myPassword");

ignite::ignite_client_configuration cfg{"127.0.0.1:10800"};
cfg.set_authenticator(authenticator);
auto client = ignite_client::start(std::move(cfg), std::chrono::seconds(30));
```

</TabItem>
</Tabs>

## 사용자 객체 직렬화 {#user-object-serialization}

Ignite는 사용자 객체를 테이블 튜플에 매핑하는 것을 지원합니다. 덕분에 어떤 프로그래밍 언어로 만든 객체든 키-값 작업에 직접 사용할 수 있습니다.

### 제한 사항 {#limitations}

이러한 매핑에 사용할 수 있는 사용자 타입에는 제한이 있습니다. 일부 제한은 공통이고, 일부는 사용하는 프로그래밍 언어에 따라 달라지는 플랫폼별 제한입니다.

- 평면 필드 구조만 지원합니다. 즉, 사용자 객체를 중첩할 수 없습니다. Ignite 테이블, 그리고 그에 따른 튜플 자체가 평면 구조이기 때문입니다.
- 필드는 Ignite 타입에 매핑해야 합니다.
- 사용자 타입의 모든 필드는 테이블 컬럼에 매핑하거나 명시적으로 제외해야 합니다.
- 테이블의 모든 컬럼은 사용자 타입의 어떤 필드에 매핑해야 합니다.
- *C++ 전용*: 사용자 타입 구조로부터 마샬링 함수를 생성하는 리플렉션이 없으므로, 사용자가 마샬링 함수를 명시적으로 제공해야 합니다.

### 사용 예시 {#usage-examples}

<Tabs groupId="languages">
<TabItem value="cpp" label="C++">

```cpp
struct account {
  account() = default;
  account(std::int64_t id) : id(id) {}
  account(std::int64_t id, std::int64_t balance) : id(id), balance(balance) {}

  std::int64_t id{0};
  std::int64_t balance{0};
};

namespace ignite {

  template<>
  ignite_tuple convert_to_tuple(account &&value) {
    ignite_tuple tuple;

    tuple.set("id", value.id);
    tuple.set("balance", value.balance);

    return tuple;
  }

  template<>
  account convert_from_tuple(ignite_tuple&& value) {
    account res;

    res.id = value.get<std::int64_t>("id");

    // Sometimes only key columns are returned, i.e. "id",
    // so we have to check whether there are any other columns.
    if (value.column_count() > 1)
      res.balance = value.get<std::int64_t>("balance");

    return res;
  }

} // namespace ignite
```

</TabItem>
</Tabs>

## SQL API {#sql-api}

Ignite 3는 SQL 중심으로 설계되었으며, SQL API가 데이터를 다루는 기본 방법입니다. 지원하는 SQL 문에 대한 자세한 내용은 [SQL 참조](/sql/reference/language-definition/ddl) 섹션에서 확인할 수 있습니다. SQL 요청은 다음과 같이 보낼 수 있습니다:

<Tabs groupId="languages">
<TabItem value="cpp" label="C++">

```cpp
result_set result = client.get_sql().execute(nullptr, {"select name from tbl where id = ?"}, {std::int64_t{42}});
std::vector<ignite_tuple> page = result_set.current_page();
ignite_tuple& row = page.front();
```

</TabItem>
</Tabs>

### SQL 스크립트 {#sql-scripts}

기본 API는 SQL 문을 한 번에 하나씩 실행합니다. 큰 SQL 문을 실행하려면 `executeScript()` 메서드에 전달하세요. 이렇게 전달한 문은 순서대로 실행됩니다.

<Tabs groupId="languages">
<TabItem value="cpp" label="C++">

```cpp
std::string script = ""
	+ "CREATE TABLE IF NOT EXISTS Person (id int primary key, city_id int, name varchar, age int, company varchar);"
	+ "INSERT INTO Person (1,3, 'John', 43, 'Sample')";

client.get_sql().execute_script(script);
```

</TabItem>
</Tabs>

:::note
각 문의 실행은 첫 페이지를 반환할 준비가 되면 완료된 것으로 간주합니다. 따라서 큰 데이터 집합을 다룰 때는 같은 스크립트 내 뒤쪽 문이 SELECT 문에 영향을 줄 수 있습니다.
:::

## 트랜잭션 {#transactions}

Ignite 3의 모든 테이블 작업은 트랜잭션으로 처리됩니다. 모든 Table API와 SQL API 호출의 첫 번째 인수로 명시적 트랜잭션을 전달할 수 있습니다. 명시적 트랜잭션을 전달하지 않으면 호출마다 암시적 트랜잭션이 생성됩니다.

트랜잭션은 다음과 같이 명시적으로 전달할 수 있습니다:

<Tabs groupId="languages">
<TabItem value="cpp" label="C++">

```cpp
auto accounts = table.get_key_value_view<account, account>();

account init_value(42, 16'000);
accounts.put(nullptr, {42}, init_value);

auto tx = client.get_transactions().begin();

std::optional<account> res_account = accounts.get(&tx, {42});
res_account->balance += 500;
accounts.put(&tx, {42}, res_account);

assert(accounts.get(&tx, {42})->balance == 16'500);

tx.rollback();

assert(accounts.get(&tx, {42})->balance == 16'000);
```

</TabItem>
</Tabs>

## Table API {#table-api}

특정 테이블에서 테이블 작업을 실행하려면 해당 테이블의 특정 뷰를 가져와 그 메서드 중 하나를 사용합니다. 새 테이블은 SQL API로만 만들 수 있습니다.

테이블을 다룰 때는 내부적으로 키-값 쌍의 집합인 내장 Tuple 타입을 사용하거나, 타입 지정 접근을 위해 데이터를 직접 정의한 타입에 매핑할 수 있습니다. 테이블은 다음과 같이 다룹니다:

### 테이블 인스턴스 가져오기 {#getting-a-table-instance}

먼저 테이블 인스턴스를 가져옵니다. 테이블 인스턴스를 얻으려면 `IgniteTables.table(String)` 메서드를 사용합니다. `IgniteTables.tables()` 메서드로 기존 테이블을 모두 나열할 수도 있습니다.

<Tabs groupId="languages">
<TabItem value="cpp" label="C++">

```cpp
using namespace ignite;

auto table_api = client.get_tables();
std::vector<table> existing_tables = table_api.get_tables();
table first_table = existing_tables.front();

std::optional<table> my_table = table_api.get_table("MY_TABLE");
```

</TabItem>
</Tabs>

### 기본 테이블 작업 {#basic-table-operations}

테이블을 가져왔으면 테이블 레코드를 어떻게 다룰지 선택할 수 있도록 특정 뷰를 가져와야 합니다.

#### 바이너리 레코드 뷰 {#binary-record-view}

바이너리 레코드 뷰입니다. 테이블 튜플을 직접 다루는 데 사용합니다.

<Tabs groupId="languages">
<TabItem value="cpp" label="C++">

```cpp
record_view<ignite_tuple> view = table.get_record_binary_view();

ignite_tuple record{
  {"id", 42},
  {"name", "John Doe"}
};

view.upsert(nullptr, record);
std::optional<ignite_tuple> res_record = view.get(nullptr, {"id", 42});

assert(res_record.has_value());
assert(res_record->column_count() == 2);
assert(res_record->get<std::int64_t>("id") == 42);
assert(res_record->get<std::string>("name") == "John Doe");
```

</TabItem>
</Tabs>

#### 레코드 뷰 {#record-view}

사용자 타입에 매핑된 레코드 뷰입니다. 테이블 튜플에 매핑된 사용자 객체로 테이블을 다루는 데 사용합니다.

<Tabs groupId="languages">
<TabItem value="cpp" label="C++">

```cpp
record_view<person> view = table.get_record_view<person>();

person record(42, "John Doe");

view.upsert(nullptr, record);
std::optional<person> res_record = view.get(nullptr, person{42});

assert(res.has_value());
assert(res->id == 42);
assert(res->name == "John Doe");
```

</TabItem>
</Tabs>

#### 키-값 바이너리 뷰 {#key-value-binary-view}

바이너리 키-값 뷰입니다. 키 튜플과 값 튜플을 분리해 테이블을 다루는 데 사용합니다.

<Tabs groupId="languages">
<TabItem value="cpp" label="C++">

```cpp
key_value_view<ignite_tuple, ignite_tuple> kv_view = table.get_key_value_binary_view();

ignite_tuple key_tuple{{"id", 42}};
ignite_tuple val_tuple{{"name", "John Doe"}};

kv_view.put(nullptr, key_tuple, val_tuple);
std::optional<ignite_tuple> res_tuple = kv_view.get(nullptr, key_tuple);

assert(res_tuple.has_value());
assert(res_tuple->column_count() == 2);
assert(res_tuple->get<std::int64_t>("id") == 42);
assert(res_tuple->get<std::string>("name") == "John Doe");
```

</TabItem>
</Tabs>

#### 키-값 뷰 {#key-value-view}

사용자 객체를 사용하는 키-값 뷰입니다. 테이블 튜플에 매핑된 키 사용자 객체와 값 사용자 객체로 테이블을 다루는 데 사용합니다.

<Tabs groupId="languages">
<TabItem value="cpp" label="C++">

```cpp
key_value_view<person, person> kv_view = table.get_key_value_view<person, person>();

kv_view.put(nullptr, {42}, {"John Doe"});
std::optional<person> res = kv_view.get(nullptr, {42});

assert(res.has_value());
assert(res->id == 42);
assert(res->name == "John Doe");
```

</TabItem>
</Tabs>
