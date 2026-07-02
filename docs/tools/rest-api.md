---
id: rest-api
title: REST API
sidebar_position: 2
---

# REST API

Apache Ignite 클러스터는 표준 REST 방식으로 Apache Ignite를 사용할 수 있는 [OpenAPI](https://www.openapis.org/) 명세를 제공합니다.

## REST 커넥터 구성 {#rest-connector-configuration}

기본적으로 REST 커넥터는 10300 포트에서 시작합니다. 이 포트는 `ignite.rest` [노드 구성](/configure-and-operate/reference/node-configuration)에서 구성할 수 있습니다.

## HTTP 도구 사용 {#using-http-tools}

클러스터가 시작되면 외부 도구를 사용해 HTTP로 클러스터를 모니터링하거나 관리할 수 있습니다. 이 예시에서는 [curl](https://curl.se/)로 클러스터 상태를 가져옵니다.

```bash
curl 'http://localhost:10300/management/v1/cluster/state'
```

모니터링만 가능한 것은 아닙니다. Apache Ignite REST API는 클러스터를 관리할 수 있는 엔드포인트도 제공합니다. 예를 들어 REST로 [스냅샷](/configure-and-operate/operations/disaster-recovery-partitions)을 생성할 수 있습니다.

```bash
curl -H "Content-Type: application/json" -d '{"snapshotType": "FULL","tableNames": "table1,table2","startTimeEpochMilli": 0}' http://localhost:10300/management/v1/snapshot/create
```

## Java 프로젝트 구성 {#java-project-configuration}

애플리케이션에 Apache Ignite REST API를 더 긴밀하게 통합하려면 [OpenAPI generator](https://github.com/OpenAPITools/openapi-generator)로 Java 클라이언트를 생성하는 것을 권장합니다. 클라이언트를 생성한 후에는 코드에서 REST API를 사용할 수 있습니다. 예를 들면 다음과 같습니다.

```java
ApiClient client = Configuration.getDefaultApiClient();
// Set base URL
client.setBasePath("http://localhost:10300");

// Get cluster configuration.
ClusterConfigurationApi clusterConfigurationApi = new ClusterConfigurationApi(client);
String configuration = clusterConfigurationApi.getClusterConfiguration();
```
