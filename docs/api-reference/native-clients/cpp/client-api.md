---
title: Client API
id: client-api
sidebar_position: 1
---

# Client API

C++ 클라이언트는 Apache Ignite 클러스터에 씬 클라이언트 연결을 제공합니다. 네트워크 연결을 관리하고 인증을 처리하며, 단일 진입점에서 모든 Ignite API에 접근할 수 있게 합니다.

## 핵심 개념 {#key-concepts}

### 클라이언트 라이프사이클 {#client-lifecycle}

클라이언트는 정적 팩터리 메서드로 연결을 맺습니다. 시작 메서드는 연결이 성공하거나 타임아웃될 때까지 블로킹됩니다. 클라이언트는 구성 가능한 하트비트 간격으로 활성 연결을 유지합니다.

### 구성 {#configuration}

클라이언트 구성은 연결 엔드포인트, 인증, SSL/TLS 설정, 연결 매개변수를 지정합니다. 엔드포인트는 `host:port` 형식을 사용하며 기본 포트는 10800입니다. 클라이언트는 구성 가능한 한도로 연결 풀을 유지합니다.

### API 접근 {#api-access}

클라이언트는 전용 getter로 모든 Ignite API에 접근할 수 있게 합니다:

- `get_tables()` - 테이블 작업
- `get_sql()` - SQL 실행
- `get_transactions()` - 트랜잭션 관리
- `get_compute()` - 분산 컴퓨트
- `get_cluster_nodes()` - 클러스터 토폴로지

## 기본 사용법 {#basic-usage}

### 클라이언트 시작 {#starting-a-client}

기본 구성으로 클라이언트를 시작합니다:

```cpp
using namespace ignite;

ignite_client_configuration cfg{{"localhost:10800"}};
ignite_client client = ignite_client::start(cfg, std::chrono::seconds(30));
```

연결 매개변수를 구성합니다:

```cpp
ignite_client_configuration cfg{{"host1:10800", "host2:10800"}};
cfg.set_connection_limit(10);
cfg.set_heartbeat_interval(std::chrono::seconds(30));

ignite_client client = ignite_client::start(cfg, std::chrono::seconds(30));
```

### 비동기 시작 {#asynchronous-startup}

블로킹 없이 클라이언트를 시작합니다:

```cpp
ignite_client_configuration cfg{{"localhost:10800"}};

ignite_client::start_async(cfg, std::chrono::seconds(30),
    [](ignite_result<ignite_client> result) {
        if (!result.has_error()) {
            ignite_client client = std::move(result).value();
            // Use client
        }
    });
```

### 인증 {#authentication}

기본 인증을 구성합니다:

```cpp
ignite_client_configuration cfg{{"localhost:10800"}};
cfg.set_authenticator(std::make_shared<basic_authenticator>("username", "password"));

ignite_client client = ignite_client::start(cfg, std::chrono::seconds(30));
```

### SSL/TLS 구성 {#ssltls-configuration}

인증서로 SSL을 활성화합니다:

```cpp
ignite_client_configuration cfg{{"localhost:10800"}};
cfg.set_ssl_mode(ssl_mode::REQUIRE);
cfg.set_ssl_cert_file("/path/to/client.pem");
cfg.set_ssl_key_file("/path/to/client.key");
cfg.set_ssl_ca_file("/path/to/ca.pem");

ignite_client client = ignite_client::start(cfg, std::chrono::seconds(30));
```

### API 접근하기 {#accessing-apis}

테이블 작업에 접근합니다:

```cpp
auto tables = client.get_tables();
auto table = tables.get_table("my_table");
```

SQL에 접근합니다:

```cpp
auto sql = client.get_sql();
auto result = sql.execute(nullptr, nullptr, sql_statement("SELECT * FROM t"), {});
```

트랜잭션에 접근합니다:

```cpp
auto transactions = client.get_transactions();
auto tx = transactions.begin();
// Perform operations
tx.commit();
```

컴퓨트에 접근합니다:

```cpp
auto compute = client.get_compute();
auto nodes = client.get_cluster_nodes();
```

### 구성 조회 {#configuration-retrieval}

활성 구성을 조회합니다:

```cpp
const ignite_client_configuration& config = client.configuration();
auto endpoints = config.get_endpoints();
auto connection_limit = config.get_connection_limit();
```

## 구성 옵션 {#configuration-options}

### 연결 설정 {#connection-settings}

- `set_endpoints(std::vector<std::string>)` - 서버 엔드포인트(필수, 비어 있으면 안 됨)
- `set_connection_limit(uint32_t)` - 최대 활성 연결 수
- `set_heartbeat_interval(std::chrono::microseconds)` - 하트비트 간격(0이면 하트비트 비활성화)

### 보안 설정 {#security-settings}

- `set_authenticator(std::shared_ptr<ignite_client_authenticator>)` - 인증 공급자
- `set_ssl_mode(ssl_mode)` - SSL/TLS 모드(DISABLE, REQUIRE)
- `set_ssl_cert_file(std::string)` - 클라이언트 인증서 경로
- `set_ssl_key_file(std::string)` - 개인 키 경로
- `set_ssl_ca_file(std::string)` - CA 인증서 경로

### 로깅 {#logging}

- `set_logger(std::shared_ptr<ignite_logger>)` - 사용자 지정 로거 구현

## 오류 처리 {#error-handling}

클라이언트 작업은 실패 시 `ignite_error`를 던집니다. 비동기 작업은 콜백 결과로 오류를 전달합니다:

```cpp
ignite_client::start_async(cfg, timeout, [](ignite_result<ignite_client> result) {
    if (result.has_error()) {
        // Handle error
        std::cerr << "Connection failed: " << result.error().what_str() << std::endl;
    } else {
        auto client = std::move(result).value();
        // Use client
    }
});
```

## 연결 관리 {#connection-management}

### 하트비트 {#heartbeat}

하트비트는 유휴 기간 동안 연결을 유지합니다. 기본 간격은 30초입니다. 비활성화하려면 0으로 설정하세요:

```cpp
cfg.set_heartbeat_interval(std::chrono::seconds(0)); // Disable heartbeat
```

하트비트를 비활성화하면 서버가 유휴 연결을 닫을 수 있습니다.

### 연결 풀링 {#connection-pooling}

클라이언트는 클러스터 노드와의 연결 풀을 유지합니다. 최대 풀 크기를 구성합니다:

```cpp
cfg.set_connection_limit(20); // Allow up to 20 active connections
```

연결 관리는 작업 분산에 따라 자동으로 이루어집니다.

## 참조 {#reference}

- [C++ API 문서](https://ignite.apache.org/releases/ignite3/cppdoc/)
- [Tables API](./tables-api)
- [SQL API](./sql-api)
- [Transactions API](./transactions-api)
- [Compute API](./compute-api)
- [Network API](./network-api)
