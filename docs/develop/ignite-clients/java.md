---
id: java-client
title: Java 클라이언트
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Ignite 3 클라이언트는 표준 소켓 연결로 클러스터에 연결합니다. Ignite 2.x와 달리 Ignite 3에는 씬 클라이언트(thin client)와 씩 클라이언트(thick client)의 구분이 없으며, 모든 클라이언트가 씬 클라이언트입니다.

클라이언트는 클러스터 토폴로지에 합류하지 않고, 데이터를 전혀 보유하지 않으며, 컴퓨트 연산의 대상으로도 사용되지 않습니다.

## 시작하기 {#getting-started}

### 사전 요구 사항 {#prerequisites}

Java 씬 클라이언트를 사용하려면 Java 11 이상이 필요합니다.

### 설치 {#installation}

Java 클라이언트는 Maven으로 프로젝트에 추가합니다:

```xml
<dependency>
    <groupId>org.apache.ignite</groupId>
    <artifactId>ignite-client</artifactId>
    <version>3.0.0</version>
</dependency>
```

## 클러스터에 연결 {#connecting-to-cluster}

클라이언트를 초기화하려면 `IgniteClient` 클래스를 사용하고 구성 정보를 전달합니다:

<Tabs groupId="languages">
<TabItem value="java" label="Java">

```java
try (IgniteClient client = IgniteClient.builder()
  .addresses("127.0.0.1:10800")
  .build()
) {
  // Your code goes here
}
```

</TabItem>
</Tabs>

## 인증 {#authentication}

[인증](/configure-and-operate/configuration/config-authentication) 정보를 전달하려면 `IgniteClientAuthenticator` 클래스를 사용하고 `IgniteClient` 빌더에 전달합니다:

<Tabs groupId="languages">
<TabItem value="java" label="Java">

```java
IgniteClientAuthenticator auth = BasicAuthenticator.builder().username("myUser").password("myPassword").build();
IgniteClient.builder()
    .addresses("127.0.0.1:10800")
    .authenticator(auth)
    .build();
```

</TabItem>
</Tabs>

## 로깅 {#logging}

클라이언트 로깅을 구성하려면 `loggerFactory`를 추가합니다:

```java
IgniteClient client = IgniteClient.builder()
    .addresses("127.0.0.1")
    .loggerFactory(System::getLogger)  // Optional: this is the default
    .build();
```

클라이언트는 연결 오류, 재연결, 재시도를 기록합니다. 기본적으로 로깅은 INFO 레벨로 `java.util.logging`(JUL)에 전달됩니다.

Logback, Log4j2, JUL을 사용한 세부 구성은 [Java 클라이언트 로깅](../work-with-data/java-client-logging)을 참고하세요.

## 클라이언트 메트릭 {#client-metrics}

### Java {#java}

Java 클라이언트를 실행할 때는 클라이언트 빌더에서 메트릭을 활성화해야 합니다:

```java
IgniteClient client = IgniteClient.builder()
  .addresses("127.0.0.1:10800")
  .metricsEnabled(true)
  .build();
```

활성화 후에는 [JDK Mission Control](https://www.oracle.com/java/technologies/jdk-mission-control.html)과 같은 모든 Java 모니터링 도구에서 클라이언트 메트릭을 사용할 수 있습니다.

#### 사용 가능한 Java 메트릭 {#available-java-metrics}

| 메트릭 이름 | 설명 |
|-------------|-------------|
| ConnectionsActive | 현재 활성 연결 수. |
| ConnectionsEstablished | 수립된 연결 수. |
| ConnectionsLost | 끊어진 연결 수. |
| ConnectionsLostTimeout | 타임아웃으로 끊어진 연결 수. |
| HandshakesFailed | 실패한 핸드셰이크 수. |
| HandshakesFailedTimeout | 타임아웃으로 실패한 핸드셰이크 수. |
| RequestsActive | 현재 활성 요청 수. |
| RequestsSent | 전송된 요청 수. |
| RequestsCompleted | 완료된 요청 수. 요청은 응답을 받으면 완료됩니다. |
| RequestsRetried | 요청 재시도 수. |
| RequestsFailed | 실패한 요청 수. |
| BytesSent | 전송된 바이트 수. |
| BytesReceived | 수신된 바이트 수. |
| StreamerBatchesSent | 전송된 데이터 스트리머 배치 수. |
| StreamerItemsSent | 전송된 데이터 스트리머 항목 수. |
| StreamerBatchesActive | 전송 중인 데이터 스트리머 배치 수. |
| StreamerItemsQueued | 대기 중인 데이터 스트리머 항목 수. |

## 클라이언트 연결 구성 {#client-connection-configuration}

클라이언트와 Ignite 클러스터 간 연결을 관리하는 구성 속성은 여러 가지가 있습니다:

```java
IgniteClient client = IgniteClient.builder()
  .addresses("127.0.0.1:10800")
  .connectTimeout(5000)
  .heartbeatInterval(30000)
  .heartbeatTimeout(5000)
  .operationTimeout(3000)
  .backgroundReconnectInterval(30000)
  .retryPolicy(new RetryLimitPolicy().retryLimit(8))
  .build();
```

| 구성 이름 | 설명 |
|--------------------|-------------|
| connectTimeout | 클라이언트 연결 타임아웃(밀리초). |
| heartbeatInterval | 하트비트 메시지 간격(밀리초). |
| heartbeatTimeout | 하트비트 메시지 타임아웃(밀리초). |
| operationTimeout | 작업 타임아웃(밀리초). |
| backgroundReconnectInterval | 백그라운드 재연결 간격(밀리초). |
| retryPolicy | 재시도 정책. 기본적으로 모든 읽기 작업은 최대 16회까지 재시도되고, 쓰기 작업은 재시도되지 않습니다. |
