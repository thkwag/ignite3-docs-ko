---
id: events
title: 이벤트 다루기
---

Apache Ignite는 클러스터에서 일어나는 다양한 작업에 대한 이벤트를 생성해 애플리케이션에 알릴 수 있습니다. 캐시 이벤트, 노드 검색 이벤트, 분산 작업 실행 이벤트 등 다양한 이벤트 유형이 있습니다.

## 이벤트 활성화 {#enabling-events}

Ignite 3에서 이벤트는 [클러스터 구성](/configure-and-operate/configuration/config-cluster-and-nodes)에서 클러스터 전체 단위로 구성됩니다. 이벤트는 **이벤트 채널**로 구성되며, 각 채널은 하나 이상의 이벤트 유형을 추적합니다. 개별 이벤트를 활성화하거나 비활성화할 수는 없고, 대신 이벤트 채널을 비활성화해야 합니다.

이벤트 채널을 생성하려면 다음과 같이 하세요.

```shell
cluster config update ignite.eventlog.channels.exampleChannel.events=["USER_AUTHENTICATION_SUCCESS"]
```

이 채널은 `USER_AUTHENTICATION_SUCCESS`를 추적하지만, 아직 이벤트가 발생하지는 않습니다. 이벤트가 발생하려면 **싱크**를 구성해야 합니다. 싱크는 이벤트 정보를 구성된 로거 카테고리에 구성된 레벨로 전송합니다. 현재는 `log` 싱크 유형만 지원되며, 출력을 Apache Ignite 로그에 기록합니다. CLI 도구로 로그 싱크를 활성화하는 방법은 다음과 같습니다.

```shell
cluster config update ignite.eventlog.sinks.exampleSink = {type="log", channel="exampleChannel"}
```

이제 인가 이벤트가 로그에 기록됩니다. 이벤트는 다음과 같은 형태로 나타날 수 있습니다.

```
2024-06-04 16:19:29:840 +0300 [INFO][%defaultNode%sql-execution-pool-1][EventLog] {"type":"USER_AUTHORIZATION_SUCCESS","timestamp":1717507169840,"productVersion":"3.0.0","user":{"username":"ignite","authenticationProvider":"basic"},"fields":{"privileges":[{"action":"CREATE_TABLE","on":{"objectType":"TABLE","objectName":"TEST2","schema":"PUBLIC"}}],"roles":["system"]}}
```

다음은 클러스터 구성을 JSON으로 나타낸 것입니다.

:::note
Apache Ignite 3에서는 구성을 JSON 또는 HOCON 형식으로 작성하고 유지할 수 있습니다.
:::

```json
{
  "ignite" : {
    "eventlog" : {
        "channels" : [ {
          "enabled" : true,
          "events" : [ "USER_AUTHENTICATION_SUCCESS" ],
          "name" : "exampleChannel"
        } ],
        "sinks" : [ {
          "channel" : "exampleChannel",
          "criteria" : "EventLog",
          "format" : "JSON",
          "level" : "INFO",
          "name" : "sampleSink",
          "type" : "log"
        } ]
    }
  }
}
```

## 싱크 구조 {#sink-structure}

Apache Ignite 3에서 데이터 싱크 구성은 다음과 같은 구조입니다.

```json
{
  "channel" : "exampleChannel",
  "criteria" : "EventLog",
  "format" : "JSON",
  "level" : "INFO",
  "name" : "sampleSink",
  "type" : "log"
}
```

| 필드 | 설명 |
|-------|-------------|
| channel | 데이터 싱크가 데이터를 기록하는 대상 이벤트 채널의 이름입니다. |
| criteria | 로깅 기준입니다. 기본적으로 EventLog 메시지만 기록됩니다. |
| format | 출력 형식입니다. 현재는 `JSON` 메시지만 지원됩니다. |
| level | 메시지가 게시되는 로그 레벨입니다. 지원되는 값: `ALL`, `TRACE`, `DEBUG`, `INFO`, `WARNING`, `ERROR`, `OFF`. 기본값: `INFO`. |
| name | 임의의 싱크 이름입니다. |
| type | 이벤트 싱크 유형입니다. 현재는 `log` 싱크만 지원되며, 이벤트를 로그에 기록하는 데 사용됩니다. |

## 채널 구조 {#channel-structure}

Apache Ignite 3에서 이벤트 채널 구성은 다음과 같은 구조입니다.

```json
{
  "enabled" : true,
  "events" : [ "USER_AUTHENTICATION_SUCCESS" ],
  "name" : "exampleChannel"
}
```

| 필드 | 설명 |
|-------|-------------|
| enabled | 이 이벤트 채널의 활성화 여부를 정의합니다. |
| events | 이벤트 채널이 추적하는 이벤트 목록입니다. 전체 이벤트 유형 목록은 [이벤트 목록](./events-list)을 참고하세요. |
| name | 임의의 채널 이름입니다. |

## 이벤트 구조 {#event-structure}

Apache Ignite 3의 모든 이벤트는 아래에 설명된 것과 같은 기본 구조를 따릅니다. 일부 이벤트는 `data` 필드에 추가 컨텍스트를 제공합니다.

```json
{
  "type": "AUTHENTICATION",
  "user": { "username": "John", "authenticationProvider": "basic" },
  "timestamp": 1715169617,
  "productVersion": "3.0.0",
  "fields": {}
}
```

| 필드 | 설명 |
|-------|-------------|
| type | 이벤트 유형입니다. 전체 이벤트 유형 목록은 [이벤트 목록](./events-list)을 참고하세요. |
| user | 사용자 이름과 인가에 사용된 [인증](/configure-and-operate/configuration/config-authentication) 공급자입니다. |
| timestamp | UNIX epoch 시간으로 표시한 이벤트 발생 시각입니다. |
| productVersion | 클라이언트가 사용하는 Apache Ignite 버전입니다. |
| fields | 이벤트별 데이터입니다. |
