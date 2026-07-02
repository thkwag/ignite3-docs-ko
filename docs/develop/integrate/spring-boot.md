---
id: spring-boot
title: Spring Boot 통합
---

Apache Ignite 3는 `IgniteClient` 빈을 자동으로 구성하는 Spring Boot 스타터를 제공합니다. 이 스타터는 연결 라이프사이클을 관리하고, 속성 기반 구성과 프로그래밍 방식 커스터마이징을 모두 지원합니다.

## 사전 요구 사항 {#prerequisites}

- Java 17 이상
- Spring Boot 3.x
- 실행 중인 Ignite 3 클러스터

## 설치 {#installation}

프로젝트에 스타터 의존성을 추가하세요. 스타터 버전은 사용하는 Apache Ignite 클러스터 버전과 일치해야 합니다.

**Maven:**

```xml
<properties>
    <ignite.version>3.1.0</ignite.version>
</properties>

<dependency>
    <groupId>org.apache.ignite</groupId>
    <artifactId>spring-boot-starter-ignite-client</artifactId>
    <version>${ignite.version}</version>
</dependency>
```

**Gradle:**

```groovy
ext {
    igniteVersion = '3.1.0'
}

implementation "org.apache.ignite:spring-boot-starter-ignite-client:${igniteVersion}"
```

:::note 버전 일치
`spring-boot-starter-ignite-client` 아티팩트는 Apache Ignite의 일부로 릴리스되므로 버전이 Ignite 릴리스 버전과 일치합니다. Ignite 3.1.0에서는 `spring-boot-starter-ignite-client:3.1.0`을 사용하세요.
:::

## 기본 구성 {#basic-configuration}

`application.properties`에서 Ignite 클라이언트 연결을 구성하세요:

```properties
ignite.client.addresses=127.0.0.1:10800
```

`IgniteClient` 빈은 자동으로 생성되어 주입에 사용할 수 있습니다:

```java
@SpringBootApplication
public class MyApplication {

    public static void main(String[] args) {
        SpringApplication.run(MyApplication.class, args);
    }

    @Bean
    ApplicationRunner runner(IgniteClient client) {
        return args -> {
            client.sql().execute(null, "CREATE TABLE IF NOT EXISTS Person (id INT PRIMARY KEY, name VARCHAR)");
            client.sql().execute(null, "INSERT INTO Person (id, name) VALUES (1, 'John')");
        };
    }
}
```

## 구성 속성 {#configuration-properties}

모든 속성은 `ignite.client` 접두사를 사용합니다.

### 연결 속성 {#connection-properties}

| 속성 | 타입 | 설명 |
|----------|------|-------------|
| `addresses` | String[] | `host:port` 형식의 클러스터 노드 주소 |
| `connectTimeout` | Long | 연결 타임아웃(밀리초) |
| `operationTimeout` | Long | 작업 타임아웃(밀리초) |
| `heartbeatInterval` | Long | 하트비트 메시지 간격(밀리초) |
| `heartbeatTimeout` | Long | 하트비트 메시지 타임아웃(밀리초) |
| `backgroundReconnectInterval` | Long | 백그라운드 재연결 간격(밀리초) |
| `metricsEnabled` | Boolean | 클라이언트 메트릭 활성화 |

**예시:**

```properties
ignite.client.addresses=node1:10800,node2:10800,node3:10800
ignite.client.connectTimeout=5000
ignite.client.operationTimeout=3000
ignite.client.heartbeatInterval=30000
ignite.client.heartbeatTimeout=5000
ignite.client.backgroundReconnectInterval=30000
ignite.client.metricsEnabled=true
```

### 인증 속성 {#authentication-properties}

속성으로 기본 인증을 구성하세요:

| 속성 | 타입 | 설명 |
|----------|------|-------------|
| `auth.basic.username` | String | 인증 사용자 이름 |
| `auth.basic.password` | String | 인증 비밀번호 |

**예시:**

```properties
ignite.client.addresses=127.0.0.1:10800
ignite.client.auth.basic.username=ignite
ignite.client.auth.basic.password=ignite
```

### SSL/TLS 속성 {#ssltls-properties}

`sslConfiguration` 중첩 속성으로 SSL/TLS를 구성하세요:

| 속성 | 타입 | 설명 |
|----------|------|-------------|
| `sslConfiguration.enabled` | Boolean | SSL/TLS 활성화 |
| `sslConfiguration.keyStorePath` | String | 키스토어 파일 경로 |
| `sslConfiguration.keyStorePassword` | String | 키스토어 비밀번호 |
| `sslConfiguration.trustStorePath` | String | 트러스트스토어 파일 경로 |
| `sslConfiguration.trustStorePassword` | String | 트러스트스토어 비밀번호 |
| `sslConfiguration.ciphers` | List | 허용된 암호화 방식 목록 |

**예시:**

```properties
ignite.client.addresses=127.0.0.1:10800
ignite.client.sslConfiguration.enabled=true
ignite.client.sslConfiguration.keyStorePath=/path/to/keystore.jks
ignite.client.sslConfiguration.keyStorePassword=changeit
ignite.client.sslConfiguration.trustStorePath=/path/to/truststore.jks
ignite.client.sslConfiguration.trustStorePassword=changeit
```

## 프로그래밍 방식 커스터마이징 {#programmatic-customization}

속성으로 표현할 수 없는 구성은 `IgniteClientPropertiesCustomizer`를 구현하세요:

```java
@SpringBootApplication
public class MyApplication {

    public static void main(String[] args) {
        SpringApplication.run(MyApplication.class, args);
    }

    @Bean
    public IgniteClientPropertiesCustomizer customizeClient() {
        return config -> {
            config.setRetryPolicy(new RetryLimitPolicy().retryLimit(5));
            config.setLoggerFactory(System::getLogger);
        };
    }
}
```

### 사용자 지정 인증기 {#custom-authenticator}

사용자 지정 인증기를 제공해 기본 인증을 재정의하세요:

```java
@Bean
public IgniteClientPropertiesCustomizer customizeClient() {
    return config -> config.setAuthenticator(
        BasicAuthenticator.builder()
            .username("ignite")
            .password("ignite")
            .build()
    );
}
```

속성 기반 인증(`auth.basic.*`)과 프로그래밍 방식 인증기가 모두 구성되면, 프로그래밍 방식 인증기가 우선 적용됩니다.

## 사용 가능한 커스터마이징 옵션 {#available-customization-options}

`IgniteClientPropertiesCustomizer`를 사용하면 모든 `IgniteClientProperties` 세터에 접근할 수 있습니다:

| 메서드 | 설명 |
|--------|-------------|
| `setAddresses(String[])` | 클러스터 노드 주소 |
| `setRetryPolicy(RetryPolicy)` | 요청 재시도 정책 |
| `setLoggerFactory(LoggerFactory)` | 사용자 지정 로거 팩토리 |
| `setAddressFinder(IgniteClientAddressFinder)` | 동적 주소 검색 |
| `setAuthenticator(IgniteClientAuthenticator)` | 사용자 지정 인증기 |
| `setAsyncContinuationExecutor(Executor)` | 비동기 연속 작업용 실행기 |

## 클라이언트 사용 {#using-the-client}

애플리케이션 어디서든 `IgniteClient`를 주입하세요:

```java
@Service
public class PersonService {

    private final IgniteClient client;

    public PersonService(IgniteClient client) {
        this.client = client;
    }

    public void createPerson(int id, String name) {
        client.sql().execute(null,
            "INSERT INTO Person (id, name) VALUES (?, ?)",
            id, name);
    }

    public void createPersonInTransaction(int id, String name) {
        Transaction tx = client.transactions().begin();
        try {
            client.sql().execute(tx,
                "INSERT INTO Person (id, name) VALUES (?, ?)",
                id, name);
            tx.commit();
        } catch (Exception e) {
            tx.rollback();
            throw e;
        }
    }
}
```

## 다음 단계 {#next-steps}

- [Spring Data 통합](./spring-data) - 저장소 기반 데이터 접근
- [Java 클라이언트](../ignite-clients/java-client) - 클라이언트 API 참조
- [트랜잭션](../work-with-data/transactions) - 트랜잭션 관리
