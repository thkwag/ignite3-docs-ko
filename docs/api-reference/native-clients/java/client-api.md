---
title: Client API
id: client-api
sidebar_position: 1
---

# Client API

IgniteClient는 Ignite 클러스터에 가벼운 연결을 제공합니다. 애플리케이션은 전체 클러스터 노드를 실행하지 않고도 이 클라이언트로 데이터에 접근하고 작업을 실행합니다. 클라이언트는 연결 풀을 유지하고 자동 재연결을 처리하며 인증과 TLS 암호화를 지원합니다.

## 핵심 개념 {#key-concepts}

클라이언트는 Ignite 인터페이스를 구현하고 연결 관리 기능을 추가합니다. 임베디드 노드와 달리 클라이언트는 데이터를 저장하지 않고 클러스터 합의에도 참여하지 않습니다. 클라이언트는 TCP 기반 바이너리 프로토콜로 서버 노드에 연결합니다.

클라이언트는 빌더 패턴으로 클러스터에 연결하기 전에 연결 매개변수를 구성합니다. 생성한 뒤에는 테이블, SQL, 트랜잭션, 컴퓨트, 카탈로그 API에 접근할 수 있습니다.

## 연결 구성 {#connection-configuration}

빌더로 클라이언트를 구성합니다:

```java
try (IgniteClient client = IgniteClient.builder()
    .addresses("localhost:10800", "server2:10800")
    .connectTimeout(5000)
    .operationTimeout(30000)
    .heartbeatInterval(3000)
    .heartbeatTimeout(5000)
    .retryPolicy(new RetryReadPolicy())
    .build()) {

    String nodeName = client.name();
    System.out.println("Connected to: " + nodeName);
}
```

`addresses()` 메서드는 여러 서버 엔드포인트를 받습니다. 클라이언트는 순서대로 연결을 시도하며, 부하 분산을 위해 연결 가능한 모든 서버와 활성 연결을 유지합니다.

## 연결 복원력 {#connection-resilience}

클라이언트는 연결이 실패하면 자동으로 재연결합니다. 타임아웃과 간격 설정으로 재연결 동작을 구성합니다:

```java
IgniteClient client = IgniteClient.builder()
    .addresses("server1:10800", "server2:10800")
    .backgroundReconnectInterval(1000)
    .build();
```

`backgroundReconnectInterval()` 매개변수는 클라이언트가 끊어진 연결을 복구하려는 시도 빈도를 제어합니다.

## 재시도 정책 {#retry-policies}

재시도 정책은 실패한 작업 중 어떤 것을 재시도할지 결정합니다. 중복 쓰기를 방지하면서 읽기 전용 작업만 재시도하려면 RetryReadPolicy를 사용하세요.

```java
IgniteClient client = IgniteClient.builder()
    .addresses("localhost:10800")
    .retryPolicy(new RetryReadPolicy())
    .build();
```

RetryPolicy 인터페이스를 구현하면 사용자 지정 재시도 정책을 만들 수 있습니다. 이 정책은 실패한 작업의 컨텍스트를 받아 재시도 여부를 반환합니다.

## 인증 {#authentication}

authenticator 빌더 매개변수로 인증을 구성합니다:

```java
IgniteClient client = IgniteClient.builder()
    .addresses("localhost:10800")
    .authenticator(BasicAuthenticator.builder()
        .username("username")
        .password("password")
        .build())
    .build();
```

BasicAuthenticator는 사용자 이름과 비밀번호 인증을 제공합니다. 클라이언트는 연결을 맺는 동안 자격 증명을 전송합니다.

## TLS 구성 {#tls-configuration}

클라이언트-서버 통신을 암호화하려면 TLS를 활성화합니다:

```java
SslConfiguration ssl = SslConfiguration.builder()
    .enabled(true)
    .trustStorePath("/path/to/truststore.jks")
    .trustStorePassword("password")
    .build();

IgniteClient client = IgniteClient.builder()
    .addresses("localhost:10800")
    .ssl(ssl)
    .build();
```

클라이언트 인증서 인증을 사용할 때는 키스토어 설정을 구성합니다.

## 비동기 연결 {#asynchronous-connection}

연결을 맺는 동안 블로킹을 피하려면 클라이언트를 비동기로 생성합니다:

```java
CompletableFuture<IgniteClient> clientFuture = IgniteClient.builder()
    .addresses("localhost:10800")
    .buildAsync();

clientFuture.thenAccept(client -> {
    // Use client
}).exceptionally(ex -> {
    // Handle connection failure
    return null;
});
```

비동기 생성은 즉시 반환되며, 클라이언트는 백그라운드에서 연결을 맺습니다.

## 활성 연결 {#active-connections}

활성 서버 연결 정보를 조회합니다:

```java
List<ClusterNode> connections = client.connections();
for (ClusterNode node : connections) {
    System.out.println("Connected to: " + node.name());
}
```

connections 목록은 현재 활성 상태인 클라이언트-서버 연결을 반영합니다.

## 리소스 관리 {#resource-management}

네트워크 연결과 리소스를 해제하려면 클라이언트를 닫습니다:

```java
try (IgniteClient client = IgniteClient.builder()
    .addresses("localhost:10800")
    .build()) {

    // Use client
} // Automatically closed
```

적절한 정리를 보장하려면 try-with-resources를 사용하세요. 클라이언트를 닫으면 모든 활성 작업과 연결이 종료됩니다.

## 구성 접근 {#configuration-access}

현재 클라이언트 구성에 접근합니다:

```java
IgniteClientConfiguration config = client.configuration();
long timeout = config.operationTimeout();
```

구성 객체는 연결 설정을 읽기 전용으로 제공합니다.

## 참조 {#reference}

- 핵심 인터페이스: `org.apache.ignite.client.IgniteClient`
- 빌더: `IgniteClient.Builder`
- 구성: `org.apache.ignite.client.IgniteClientConfiguration`
- 인증: `org.apache.ignite.client.IgniteClientAuthenticator`, `org.apache.ignite.client.BasicAuthenticator`
- TLS: `org.apache.ignite.client.SslConfiguration`
- 재시도: `org.apache.ignite.client.RetryPolicy`, `org.apache.ignite.client.RetryReadPolicy`

### 빌더 구성 메서드 {#builder-configuration-methods}

- `addresses(String...)` - 서버 엔드포인트(host:port 형식)
- `connectTimeout(long)` - 밀리초 단위 소켓 연결 타임아웃
- `operationTimeout(long)` - 밀리초 단위 기본 작업 타임아웃
- `heartbeatInterval(long)` - 밀리초 단위 하트비트 메시지 간격
- `heartbeatTimeout(long)` - 밀리초 단위 하트비트 타임아웃
- `backgroundReconnectInterval(long)` - 밀리초 단위 재연결 시도 간격
- `retryPolicy(RetryPolicy)` - 실패한 작업의 재시도 정책
- `authenticator(IgniteClientAuthenticator)` - 인증 구성
- `ssl(SslConfiguration)` - TLS 구성
- `metricsEnabled(boolean)` - JMX 메트릭 수집 활성화
- `loggerFactory(LoggerFactory)` - 사용자 지정 로거 팩토리
- `build()` - 클라이언트 동기 생성
- `buildAsync()` - 클라이언트 비동기 생성
