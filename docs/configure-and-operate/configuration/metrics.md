---
id: metrics-configuration
title: 메트릭 구성
sidebar_label: 메트릭
---

메트릭은 [Ignite CLI 도구](/tools/cli-commands)로 관리합니다.

## 메트릭 소스 목록 조회 {#listing-metric-sources}

노드 또는 전체 클러스터에서 사용 가능한 모든 메트릭 소스 목록을 조회할 수 있습니다.

```bash
node metric source list
cluster metric source list
```

## 메트릭 목록 조회 {#listing-metrics}

노드의 모든 메트릭 목록을 조회할 수 있습니다.

:::note
메트릭 목록을 보려면 관련 메트릭 소스를 활성화해야 합니다. [메트릭 소스 활성화](#enabling-metric-sources)를 참고하세요.
:::

```bash
node metric list
```

위 명령어는 현재 사용 가능한 모든 메트릭 목록을 익스포터별로 정리해 반환합니다.

## 메트릭 소스 활성화 {#enabling-metric-sources}

메트릭 수집은 애플리케이션 성능에 영향을 줄 수 있으므로 기본적으로 모든 메트릭 소스가 비활성화되어 있습니다.

메트릭 소스는 다음과 같은 방법으로 활성화할 수 있습니다:

- 노드 단위: `-u` 매개변수로 노드 URL을, `-n` 매개변수로 노드 이름을 지정해 대상 노드를 선택할 수 있습니다.
- 클러스터 전체 단위.

예시:

```bash
node metric source enable -n=defaultNode jvm
cluster metric source enable jvm
```

## 메트릭 소스 비활성화 {#disabling-metric-sources}

메트릭 소스는 다음과 같은 방법으로 비활성화할 수 있습니다:

- 노드 단위: `-u` 매개변수로 노드 URL을, `-n` 매개변수로 노드 이름을 지정해 대상 노드를 선택할 수 있습니다.
- 클러스터 전체 단위.

예시:

```bash
node metric source disable -n=defaultNode jvm
cluster metric source disable jvm
```

## 메트릭 익스포터 구성 {#configuring-metrics-exporters}

외부 도구로 수집된 메트릭에 접근하려면 메트릭 익스포터를 구성해야 합니다.

### JMX {#jmx}

JMX 익스포터는 Ignite 노드 정보를 JMX(Java Management Extensions) 형식으로 제공합니다. 익스포터가 활성화되면 노드는 모니터링 도구에 메트릭을 노출합니다.

다음과 같은 방법으로 JMX 익스포터를 활성화할 수 있습니다:

```bash
cluster config update ignite.metrics.exporters.myJmxExporter.exporterName=jmx
```

이렇게 하면 JMX 모니터링 도구가 지정된 노드에서 활성화된 메트릭을 수집할 수 있습니다.

JMX에 필요한 내부 JDK 모듈을 열거나, 원격 JMX 에이전트를 활성화하거나, 연결 포트·인증·SSL을 구성할 수도 있습니다. Ignite 노드 구성에 다음 JVM 옵션을 추가하세요:

```bash
--add-opens=jdk.management/com.sun.management.internal=ALL-UNNAMED

-Dcom.sun.management.jmxremote
-Dcom.sun.management.jmxremote.port=<PORT_NUMBER>
-Dcom.sun.management.jmxremote.authenticate=true|false
-Dcom.sun.management.jmxremote.ssl=true|false
```

### 로그 익스포터 {#log-exporter}

로그 익스포터는 메트릭 데이터를 애플리케이션 로그에 기록해, 로그 수집기가 사용하거나 수동으로 확인할 수 있게 합니다. 구성하려면 다음 매개변수를 사용하세요:

| 이름 | 설명 | 기본값 |
|---|---|---|
| periodMillis | 메트릭을 내보내는 주기(밀리초 단위). | 30000 |
| oneLinePerMetricSource | 한 메트릭 소스의 모든 메트릭을 로그 한 줄에 출력할지 여부를 정의합니다. | true |
| enabledMetrics | 활성화할 메트릭 소스 목록. 이 목록이 비어 있지 않으면 나열된 메트릭 소스만 출력하고 나머지는 건너뜁니다. 접두사를 매칭하는 와일드카드를 사용할 수 있습니다(예: `jvm.*`). 기본적으로 일부 백그라운드 작업의 메트릭이 출력됩니다. | "metastorage", "placement-driver", "resource.vacuum" |

클러스터 익스포터 목록에 로그 익스포터를 추가하려면 다음 명령어를 실행하고, 출력할 모든 메트릭을 `enabledMetrics` 목록에 정의하세요:

```bash
cluster config update ignite.metrics.exporters.logPush '{"exporterName":"logPush","periodMillis":30000,"oneLinePerMetricSource":true,"enabledMetrics":[]}'
```

업데이트된 익스포터 구성은 다음과 같습니다:

```hocon
exporters=[
    {
        enabledMetrics=[]
        exporterName=logPush
        name=logPush
        oneLinePerMetricSource=true
        periodMillis=30000
    }
]
```

### OpenTelemetry {#opentelemetry}

[OpenTelemetry](https://opentelemetry.io/) 익스포터는 구성에 지정된 OpenTelemetry 서비스에 연결해 클러스터 정보를 전송합니다. 각 노드는 독립적으로 메트릭을 전송하며, 지정된 엔드포인트에 접근할 수 있어야 합니다.

아래 예시는 기본적인 OpenTelemetry 구성을 보여줍니다. OpenTelemetry 서비스마다 URL 형식이 다르고 헤더가 필요할 수 있으므로, 이 예시가 사용자의 환경에서는 동작하지 않을 수 있습니다.

```bash
cluster config update ignite.metrics.exporters.test: {exporterName:otlp, endpoint:"http://localhost:9090/api/v1/otlp/v1/metrics", protocol:"http/protobuf"}
```

이 명령어로 생성된 OpenTelemetry 익스포터는 다음과 같습니다:

```hocon
{
    compression=gzip
    endpoint="http://localhost:9090/api/v1/otlp/v1/metrics"
    exporterName=otlp
    headers=[]
    name=test
    periodMillis=30000
    protocol="http/protobuf"
    ssl {
        ciphers=""
        clientAuth=none
        enabled=false
        keyStore {
            password="********"
            path=""
            type=PKCS12
        }
        trustStore {
            password="********"
            path=""
            type=PKCS12
        }
    }
}
```

구성 매개변수 설명은 다음과 같습니다:

| 이름 | 설명 | 기본값 |
|---|---|---|
| compression | 페이로드를 압축하는 방식. 가능한 값: `none`, `gzip`. | `gzip` |
| endpoint | OpenTelemetry 엔드포인트. 각 노드가 개별적으로 엔드포인트를 확인합니다. | |
| exporterName | 익스포터 이름. OpenTelemetry를 사용하려면 `otlp`여야 합니다. | |
| headers | 요청 헤더(있는 경우). | |
| name | 사용자가 정의한 익스포터 이름으로, Ignite에서 참조할 때 사용합니다. | |
| periodMillis | 메트릭을 내보내는 주기(밀리초 단위). | 30000 |
| protocol | OpenTelemetry 데이터를 전송하는 데 사용하는 프로토콜. 가능한 값: `grpc`, `http/protobuf`. | `grpc` |
| ssl.ciphers | 활성화할 암호화 방식 목록(쉼표로 구분). 비워두면 암호화 방식을 자동으로 선택합니다. | |
| ssl.clientAuth | SSL 클라이언트 인증 활성화 여부와 필수 여부. | |
| ssl.enabled | SSL 활성화 여부를 정의합니다. | `false` |
| ssl.keyStore.password | SSL 키스토어 비밀번호. | |
| ssl.keyStore.path | SSL 키스토어 경로. | |
| ssl.keyStore.type | 키스토어 유형. | `PKCS12` |
| ssl.trustStore.password | 트러스트스토어 비밀번호. | |
| ssl.trustStore.path | 트러스트스토어 경로. | |
| ssl.trustStore.type | 트러스트스토어 유형. | `PKCS12` |

#### Grafana 연결 {#connection-to-grafana}

Grafana Cloud에 연결할 때는 protobuf 프로토콜을 사용하고 구성에 Authorization 헤더를 전달해야 합니다:

```shell
cluster config update ignite.metrics.exporters.test: {exporterName:otlp, endpoint:"https://otlp-gateway-prod-eu-west-2.grafana.net/otlp", protocol:"http/protobuf", headers {Authorization.header="Basic myBasicAuthKey"}}
```

#### Prometheus 연결 {#connection-to-prometheus}

Prometheus에 연결할 때는 protobuf 프로토콜을 사용해야 하며, [Prometheus 문서](https://prometheus.io/docs/guides/opentelemetry/)에 설명된 대로 OTLP 메트릭 수신기를 활성화한 뒤 `/api/v1/otlp/v1/metrics`로 메트릭을 전송해야 합니다:

```shell
cluster config update ignite.metrics.exporters.test: {exporterName:otlp, endpoint:"http://localhost:9090/api/v1/otlp/v1/metrics", protocol:"http/protobuf"}
```
