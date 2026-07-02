---
id: java-client-logging
title: Java 클라이언트 로깅
---

Apache Ignite 3 Java 씬 클라이언트(thin client)는 Java 9에서 도입된 `System.Logger` API를 사용합니다. 이 API는 합리적인 기본값을 제공하면서도 원하는 로깅 프레임워크와 통합할 수 있습니다.

## 클라이언트 로깅 동작 방식 {#how-client-logging-works}

Ignite 3 클라이언트는 빌더 API로 `LoggerFactory`를 받습니다. 이 팩토리는 내부 컴포넌트마다 `System.Logger` 인스턴스를 생성합니다. 팩토리를 지정하지 않으면 클라이언트는 `System::getLogger`를 사용하며, 이는 JDK 플랫폼 로깅 시스템에 위임합니다.

```java
IgniteClient client = IgniteClient.builder()
    .addresses("127.0.0.1:10800")
    .loggerFactory(System::getLogger)  // Optional: this is the default
    .build();
```

JDK 플랫폼 로깅 시스템은 기본적으로 로그를 `java.util.logging`(JUL)으로 라우팅합니다. 즉 별도로 구성하지 않으면 로그 출력이 INFO 레벨로 콘솔(표준 오류)에 나타납니다.

## 로그 레벨 이름 매핑 {#log-level-name-mapping}

서로 다른 로깅 프레임워크는 같은 로그 레벨에도 다른 이름을 사용합니다. 구성 파일에 잘못된 이름을 쓰면 파싱 오류가 발생하므로 이 차이를 구분하는 것이 중요합니다.

| 심각도 | System.Logger | java.util.logging | Logback / Log4j2 |
|----------|---------------|-------------------|------------------|
| 가장 상세함 | `TRACE` | `FINER` | `TRACE` |
| 진단 | `DEBUG` | `FINE` | `DEBUG` |
| 정보 | `INFO` | `INFO` | `INFO` |
| 잠재적 문제 | `WARNING` | `WARNING` | `WARN` |
| 실패 | `ERROR` | `SEVERE` | `ERROR` |

**JUL은 다음 레벨 이름만 허용합니다:** `SEVERE`, `WARNING`, `INFO`, `CONFIG`, `FINE`, `FINER`, `FINEST`, `ALL`, `OFF`

`logging.properties` 파일에 `DEBUG`나 `TRACE` 같은 System.Logger 이름을 쓰면 `IllegalArgumentException: Bad level "DEBUG"`가 발생합니다. 이는 흔한 구성 오류 원인입니다.

## java.util.logging 구성(기본값) {#configuring-javautillogging-default}

기본 로거 팩토리를 사용할 때는 JUL로 로깅을 구성합니다. 속성 파일이나 프로그래밍 방식 구성 중 하나를 사용할 수 있습니다.

### 속성 파일 구성 {#properties-file-configuration}

`logging.properties`라는 이름으로 파일을 생성합니다.

```properties
# Set the Ignite client package to FINE (equivalent to DEBUG)
# Both the logger and handler levels must be set for messages to appear
org.apache.ignite.internal.client.level = FINE

# The handler acts as a secondary filter on log output
java.util.logging.ConsoleHandler.level = FINE
java.util.logging.ConsoleHandler.formatter = java.util.logging.SimpleFormatter

# File output (optional)
java.util.logging.FileHandler.pattern = %h/ignite-client%u.log
java.util.logging.FileHandler.level = FINE
java.util.logging.FileHandler.formatter = java.util.logging.SimpleFormatter
handlers = java.util.logging.ConsoleHandler, java.util.logging.FileHandler
```

JVM 시작 시 구성을 불러옵니다.

```bash
java -Djava.util.logging.config.file=/path/to/logging.properties -jar your-app.jar
```

**파일 출력 위치:** `%h` 토큰은 사용자 홈 디렉터리를 가리킵니다. `%u` 토큰은 여러 JVM이 동시에 실행될 때 파일 충돌을 막기 위해 고유 번호를 추가합니다. 경로 예시: `/home/user/ignite-client0.log`

### 프로그래밍 방식 구성 {#programmatic-configuration}

클라이언트를 생성하기 전에 JUL을 구성합니다. JVM 시작 매개변수를 수정할 수 없는 경우에 이 방식을 사용합니다.

```java
import java.util.logging.*;
import java.io.IOException;

public class IgniteClientApp {
    public static void main(String[] args) {
        configureLogging();

        try (IgniteClient client = IgniteClient.builder()
                .addresses("127.0.0.1:10800")
                .build()) {
            // Application code
        }
    }

    private static void configureLogging() {
        Logger igniteLogger = Logger.getLogger("org.apache.ignite.internal.client");
        igniteLogger.setLevel(Level.FINE);

        ConsoleHandler consoleHandler = new ConsoleHandler();
        consoleHandler.setLevel(Level.FINE);
        igniteLogger.addHandler(consoleHandler);

        try {
            FileHandler fileHandler = new FileHandler("ignite-client.log", true);
            fileHandler.setLevel(Level.FINE);
            fileHandler.setFormatter(new SimpleFormatter());
            igniteLogger.addHandler(fileHandler);
        } catch (IOException e) {
            System.err.println("Failed to create log file: " + e.getMessage());
        }
    }
}
```

**파일 출력 위치:** 상대 경로를 지정하면 `FileHandler`가 현재 작업 디렉터리에 기록합니다. 파일 위치를 예측 가능하게 하려면 `/var/log/myapp/ignite-client.log`와 같은 절대 경로를 사용하세요.

## Logback 구성 {#configuring-logback}

Logback과 SLF4J는 JUL 이름이 아니라 자체 레벨 이름(DEBUG, TRACE, WARN, ERROR)을 사용합니다. `logback.xml`에서 로깅을 구성합니다.

```xml
<configuration>
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>logs/ignite-client.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>logs/ignite-client.%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n</pattern>
        </encoder>
    </appender>

    <logger name="org.apache.ignite.internal.client" level="DEBUG" additivity="false">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="FILE"/>
    </logger>

    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
    </root>
</configuration>
```

**파일 출력 위치:** 로그는 작업 디렉터리 기준 상대 경로인 `logs/ignite-client.log`에 기록됩니다. 롤링 정책은 `logs/ignite-client.2024-01-15.log`와 같은 이름으로 매일 파일을 보관합니다.

### SLF4J와 System.Logger 통합 {#integrating-slf4j-with-systemlogger}

Ignite 클라이언트는 `System.Logger`를 요구하지만, Logback은 SLF4J 로거를 제공합니다. 둘을 연결하는 어댑터를 만듭니다.

```java
import org.apache.ignite.lang.LoggerFactory;

public class Slf4jLoggerFactory implements LoggerFactory {
    @Override
    public System.Logger forName(String name) {
        return new Slf4jSystemLoggerAdapter(
            org.slf4j.LoggerFactory.getLogger(name)
        );
    }
}
```

어댑터를 클라이언트 빌더에 전달합니다.

```java
IgniteClient client = IgniteClient.builder()
    .addresses("127.0.0.1:10800")
    .loggerFactory(new Slf4jLoggerFactory())
    .build();
```

## Log4j2 구성 {#configuring-log4j2}

Log4j2는 Logback과 비슷한 레벨 이름을 사용합니다. `log4j2.xml`에서 구성합니다.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="WARN">
    <Appenders>
        <Console name="Console" target="SYSTEM_OUT">
            <PatternLayout pattern="%d{HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n"/>
        </Console>
        <RollingFile name="File"
                     fileName="logs/ignite-client.log"
                     filePattern="logs/ignite-client-%d{yyyy-MM-dd}-%i.log.gz">
            <PatternLayout pattern="%d{yyyy-MM-dd HH:mm:ss.SSS} [%t] %-5level %logger{50} - %msg%n"/>
            <Policies>
                <TimeBasedTriggeringPolicy/>
                <SizeBasedTriggeringPolicy size="100 MB"/>
            </Policies>
        </RollingFile>
    </Appenders>
    <Loggers>
        <Logger name="org.apache.ignite.internal.client" level="DEBUG" additivity="false">
            <AppenderRef ref="Console"/>
            <AppenderRef ref="File"/>
        </Logger>
        <Root level="INFO">
            <AppenderRef ref="Console"/>
        </Root>
    </Loggers>
</Configuration>
```

**파일 출력 위치:** 로그는 `logs/ignite-client.log`에 기록됩니다. 롤링 정책은 날짜가 바뀌거나 파일 크기가 100 MB에 도달하면 트리거되며, 보관된 파일을 gzip 형식으로 압축합니다.

## 로그 카테고리 {#log-categories}

클라이언트는 정규화된 클래스 이름으로 로거를 생성합니다. 특정 컴포넌트의 로그 상세도를 제어하려면 아래 카테고리를 대상으로 지정하세요.

| 카테고리 | 내용 |
|----------|---------|
| `org.apache.ignite.internal.client.TcpClientChannel` | 연결 수립, 하트비트, 요청/응답 주기 |
| `org.apache.ignite.internal.client.ReliableChannel` | 장애 조치 결정, 재시도, 채널 선택 |
| `org.apache.ignite.internal.client.sql.ClientSql` | SQL 쿼리 실행, 파티션 인식(partition awareness) 라우팅 |
| `org.apache.ignite.internal.client.table.ClientTable` | 테이블 작업, 스키마 버전 관리 |
| `org.apache.ignite.internal.client.table.ClientDataStreamer` | 대량 데이터 스트리밍, 일괄 처리 |
| `org.apache.ignite.internal.client.ClientTimeoutWorker` | 작업 타임아웃 감지 및 처리 |

상위 카테고리 `org.apache.ignite.internal.client`를 사용하면 하나의 구성 항목으로 클라이언트 로깅 전체를 제어할 수 있습니다.

## 각 레벨이 기록하는 내용 {#what-each-level-logs}

### TRACE (JUL: FINER) {#trace-jul-finer}

작업 코드와 대상 주소를 포함해 모든 발신 요청을 기록합니다. 출력량이 많으므로 특정 요청 수준 문제를 진단할 때만 활성화하세요.

### DEBUG (JUL: FINE) {#debug-jul-fine}

- 원격 주소를 포함한 연결 수립·종료 이벤트
- 테이블 ID와 버전을 포함한 스키마 로딩 완료
- 시도 횟수와 작업 유형을 보여주는 재시도 결정
- SQL 파티션 인식 라우팅 결과

### INFO {#info}

- 클러스터의 파티션 할당 변경 알림

### WARN (JUL: WARNING) {#warn-jul-warning}

- 연결 종료 실패
- 요청 전송 실패
- 채널 종료를 유발하는 하트비트 타임아웃
- 핸드셰이크 프로토콜 실패
- 작업 중 스키마 버전을 찾지 못함

### ERROR (JUL: SEVERE) {#error-jul-severe}

- 응답 역직렬화 실패
- 예기치 않은 응답 ID 불일치
- 서버 알림 처리 실패
- 트랜잭션 커밋·롤백 실패

## 프로덕션 권장 사항 {#production-recommendations}

프로덕션 환경에서는 로그량이 과도해지지 않으면서도 연결 문제와 실패를 포착할 수 있도록 클라이언트 로거를 WARN으로 설정하세요.

**Logback / Log4j2:**
```xml
<logger name="org.apache.ignite.internal.client" level="WARN"/>
```

**java.util.logging:**
```properties
org.apache.ignite.internal.client.level = WARNING
```

연결이나 장애 조치 문제를 해결할 때는 일시적으로 DEBUG를 활성화하세요. 특정 요청 실패를 조사할 때는 짧은 진단 세션에서만 TRACE를 활성화하세요.

## 문제 해결 {#troubleshooting}

### 로그 출력이 나타나지 않음 {#no-log-output-appears}

로거 레벨과 핸들러 레벨이 모두 설정되어 있는지 확인하세요. JUL에서 핸들러는 로거와 독립적으로 메시지를 필터링합니다. 로거를 FINE으로 설정해도 핸들러가 INFO로 설정되어 있으면 FINE 레벨 출력이 나타나지 않습니다.

### 시작 시 "Bad level" 예외 발생 {#bad-level-exception-at-startup}

JUL 구성 파일에 System.Logger나 Logback 레벨 이름을 사용했기 때문입니다. `DEBUG`는 `FINE`으로, `TRACE`는 `FINER`로, `ERROR`는 `SEVERE`로, `WARN`은 `WARNING`으로 바꾸세요.

### 콘솔에는 로그가 나타나지만 파일에는 나타나지 않음 {#logs-appear-on-console-but-not-in-file}

파일 핸들러가 등록되어 있는지 확인하세요. JUL에서는 `handlers` 속성에 추가해야 합니다. 애플리케이션에 대상 디렉터리 쓰기 권한이 있는지 확인하세요.

### 로그 메시지 중복 {#duplicate-log-messages}

Logback/Log4j2 구성에서 Ignite 로거에 `additivity="false"`를 설정하세요. 메시지가 루트 로거로 전파되어 두 번 나타나는 것을 방지합니다.
