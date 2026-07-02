---
title: Security API
id: security-api
sidebar_position: 11
---

# Security API

Security API는 클라이언트 연결의 인증을 구성합니다. 애플리케이션은 보안이 설정된 Ignite 클러스터에 연결을 맺을 때 자격 증명을 제공합니다. 이 API는 기본적인 사용자 이름과 비밀번호 인증을 지원하며, 사용자 지정 인증 메커니즘으로 확장할 수 있습니다.

## 핵심 개념 {#key-concepts}

인증은 클라이언트가 연결을 맺는 과정에서 이뤄집니다. 클라이언트는 연결을 생성하기 전에 빌더 패턴으로 인증기를 구성합니다. 인증기는 검증을 위해 서버에 신원 정보와 비밀 정보를 제공합니다.

기본 인증은 사용자 이름과 비밀번호 자격 증명을 전송합니다. 클라이언트는 연결 요청에 인증 타입과 자격 증명을 포함합니다. 서버는 연결을 수락하기 전에 자격 증명을 검증합니다.

## 기본 인증 {#basic-authentication}

사용자 이름과 비밀번호로 기본 인증을 구성합니다:

```java
IgniteClient client = IgniteClient.builder()
    .addresses("localhost:10800")
    .authenticator(BasicAuthenticator.builder()
        .username("admin")
        .password("password")
        .build())
    .build();

try {
    String nodeName = client.name();
    System.out.println("Authenticated to: " + nodeName);
} finally {
    client.close();
}
```

## 인증 구성 {#authentication-configuration}

클라이언트를 생성하는 동안 인증기를 설정합니다:

```java
BasicAuthenticator authenticator = BasicAuthenticator.builder()
    .username("myUsername")
    .password("myPassword")
    .build();

IgniteClient client = IgniteClient.builder()
    .addresses("server1:10800", "server2:10800")
    .authenticator(authenticator)
    .build();
```

이 인증기는 클라이언트가 맺는 모든 연결에 적용됩니다.

## 인증 타입 {#authentication-types}

인증 타입 정보에 접근합니다:

```java
BasicAuthenticator authenticator = BasicAuthenticator.builder()
    .username("user")
    .password("pass")
    .build();

String type = authenticator.type();
System.out.println("Authentication type: " + type);
```

BASIC 타입은 사용자 이름과 비밀번호 인증을 나타냅니다.

## 인증 실패 처리 {#authentication-failure-handling}

인증 오류를 처리합니다:

```java
try {
    IgniteClient client = IgniteClient.builder()
        .addresses("localhost:10800")
        .authenticator(BasicAuthenticator.builder()
            .username("user")
            .password("wrongpass")
            .build())
        .build();
} catch (IgniteException e) {
    System.err.println("Authentication failed: " + e.getMessage());
}
```

잘못된 자격 증명으로 연결에 실패하면 클라이언트를 생성하는 동안 예외가 발생합니다.

## 인증 없음 {#no-authentication}

인증 없이 연결하려면 인증기를 생략합니다:

```java
IgniteClient client = IgniteClient.builder()
    .addresses("localhost:10800")
    .build();
```

인증기가 없는 클라이언트는 인증이 필요하지 않은 클러스터에 연결합니다.

## TLS를 사용한 인증 {#authentication-with-tls}

인증과 TLS 암호화를 함께 사용합니다:

```java
SslConfiguration ssl = SslConfiguration.builder()
    .enabled(true)
    .trustStorePath("/path/to/truststore.jks")
    .trustStorePassword("trustpass")
    .build();

IgniteClient client = IgniteClient.builder()
    .addresses("localhost:10800")
    .ssl(ssl)
    .authenticator(BasicAuthenticator.builder()
        .username("admin")
        .password("password")
        .build())
    .build();
```

TLS는 연결을 암호화하고, 인증은 신원을 검증합니다.

## 사용자 지정 인증기 {#custom-authenticators}

사용자 지정 인증 메커니즘을 구현합니다:

```java
public class TokenAuthenticator implements IgniteClientAuthenticator {
    private final String token;

    public TokenAuthenticator(String token) {
        this.token = token;
    }

    @Override
    public String type() {
        return "TOKEN";
    }

    @Override
    public Object identity() {
        return token;
    }

    @Override
    public Object secret() {
        return "";
    }
}
```

사용자 지정 인증기는 적절한 형식으로 신원 정보와 비밀 정보를 제공합니다.

## 인증 타입 파싱 {#authentication-type-parsing}

type() 메서드는 문자열 식별자를 반환합니다:

```java
BasicAuthenticator authenticator = BasicAuthenticator.builder()
    .username("user")
    .password("pass")
    .build();

String typeString = authenticator.type();
System.out.println("Type: " + typeString);
```

## 자격 증명 관리 {#credential-management}

자격 증명을 애플리케이션 코드 밖에 안전하게 저장합니다:

```java
String username = System.getenv("IGNITE_USERNAME");
String password = System.getenv("IGNITE_PASSWORD");

if (username == null || password == null) {
    throw new IllegalStateException("Credentials not configured");
}

IgniteClient client = IgniteClient.builder()
    .addresses("localhost:10800")
    .authenticator(BasicAuthenticator.builder()
        .username(username)
        .password(password)
        .build())
    .build();
```

환경 변수, 구성 파일, 자격 증명 관리자에서 자격 증명을 가져옵니다.

## 인증을 사용한 비동기 연결 {#asynchronous-connection-with-authentication}

인증된 클라이언트를 비동기로 생성합니다:

```java
CompletableFuture<IgniteClient> clientFuture = IgniteClient.builder()
    .addresses("localhost:10800")
    .authenticator(BasicAuthenticator.builder()
        .username("admin")
        .password("password")
        .build())
    .buildAsync();

clientFuture.thenAccept(client -> {
    System.out.println("Authenticated to: " + client.name());
}).exceptionally(ex -> {
    System.err.println("Authentication failed: " + ex.getMessage());
    return null;
});
```

## 인증을 사용한 연결 재시도 {#connection-retry-with-authentication}

재시도 정책은 인증된 연결에도 적용됩니다:

```java
IgniteClient client = IgniteClient.builder()
    .addresses("localhost:10800")
    .authenticator(BasicAuthenticator.builder()
        .username("user")
        .password("pass")
        .build())
    .retryPolicy(new RetryReadPolicy())
    .build();
```

인증에 성공한 뒤에는 실패한 작업이 정책에 따라 재시도됩니다.

## 서버 측 인증 {#server-side-authentication}

서버 구성이 인증 요구 사항을 결정합니다. 클라이언트는 서버의 인증 설정과 일치해야 합니다. 인증 설정 방법은 서버 구성 문서를 참고하세요.

## 인증 인터페이스 {#authentication-interface}

IgniteClientAuthenticator 인터페이스는 인증 방식을 정의합니다:

```java
public interface IgniteClientAuthenticator {
    String type();
    Object identity();
    Object secret();
}
```

구현체는 인증 타입과 자격 증명 데이터를 제공합니다.

## 신원과 비밀 데이터 {#identity-and-secret-data}

인증기는 신원 정보와 비밀 정보를 분리합니다:

```java
BasicAuthenticator auth = BasicAuthenticator.builder()
    .username("username")
    .password("password")
    .build();

Object identity = auth.identity();
Object secret = auth.secret();
```

BasicAuthenticator는 사용자 이름을 신원으로, 비밀번호를 비밀 정보로 반환합니다.

## 임베디드 노드 인증 {#embedded-node-authentication}

임베디드 노드는 구성 파일로 인증을 설정합니다. 클라이언트 인증은 씬 클라이언트 연결에만 적용됩니다.

## 참조 {#reference}

- 인증기 인터페이스: `org.apache.ignite.client.IgniteClientAuthenticator`
- 기본 인증: `org.apache.ignite.client.BasicAuthenticator`
- 인증 타입: `org.apache.ignite.security.AuthenticationType`

### IgniteClientAuthenticator 인터페이스 {#igniteclientauthenticator-interface}

- `String type()` - 인증 타입 조회
- `Object identity()` - 신원 데이터 조회(사용자 이름, 토큰 등)
- `Object secret()` - 비밀 데이터 조회(비밀번호, 키 등)

### BasicAuthenticator {#basicauthenticator}

- `static Builder builder()` - 인증기 빌더 생성
- `Builder.username(String)` - 사용자 이름 설정, Builder 반환
- `Builder.password(String)` - 비밀번호 설정, Builder 반환
- `Builder.build()` - BasicAuthenticator 인스턴스 생성
- `String type()` - "BASIC" 반환
- `Object identity()` - 사용자 이름 반환
- `Object secret()` - 비밀번호 반환

### AuthenticationType {#authenticationtype}

- `static AuthenticationType parse(String)` - 문자열에서 파싱
- `BASIC` - 사용자 이름/비밀번호 기본 인증

### 클라이언트 빌더 인증 {#client-builder-authentication}

- `authenticator(IgniteClientAuthenticator)` - 연결의 인증기 설정

### 인증 모범 사례 {#authentication-best-practices}

- 자격 증명은 코드가 아닌 안전한 구성 저장소에 저장하세요
- 환경 변수나 자격 증명 관리 시스템을 사용하세요
- 완전한 보안을 갖추려면 인증과 TLS를 함께 사용하세요
- 애플리케이션을 배포하기 전에 자격 증명을 검증하세요
- 보안 정책에 따라 자격 증명을 주기적으로 교체하세요
- 인증 실패는 적절한 오류 메시지로 안정적으로 처리하세요
- 프로덕션 환경에 배포하기 전에 개발 환경에서 인증을 테스트하세요
