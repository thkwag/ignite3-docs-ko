---
title: 구성 팁
---

## 기본 클러스터 스토리지 구성 {#configuring-default-cluster-storage}

클러스터를 생성하면 스토리지 구성에 기본 분산 영역(distribution zone)을 사용합니다. 클러스터마다 별도의 분산 영역을 만드는 것을 권장하지만, 기본 영역을 그대로 사용하면서 필요에 맞게 구성할 수도 있습니다.

기본 스토리지 구성을 확인하려면 `cluster config show ignite.zone` 명령어를 사용하세요. 다음은 JSON 형식의 기본 구성 예시입니다.

:::note
Ignite 3에서는 JSON 또는 HOCON 형식으로 구성을 작성하고 관리합니다.
:::

```json
{
  "ignite" : {
    "zone" : {
      "defaultDataStorage" : "aipersist",
      "defaultDistributionZone" : {
        "dataNodesAutoAdjustScaleDown" : 2147483647,
        "dataNodesAutoAdjustScaleUp" : 0,
        "dataStorage" : {
          "dataRegion" : "default",
          "name" : "aipersist"
        },
        "filter" : "$..*",
        "partitions" : 25,
        "replicas" : 1,
        "zoneId" : 0
      },
      "distributionZones" : [ ],
      "globalIdCounter" : 0
    }
  }
}
```

새 분산 영역에서 사용할 스토리지 유형을 변경하려면 `zone.defaultDataStorage` 값을 `aimem` 또는 `rocksDb`로 설정하세요. `zone.defaultDistributionZone.dataStorage.dataRegion` 매개변수를 설정해 새 분산 영역에서 사용할 기본 데이터 영역을 변경할 수도 있습니다. 데이터 영역 매개변수를 변경한 후에는 클러스터를 재시작해야 합니다.

직접 생성한 [분산 영역](/sql/reference/language-definition/distribution-zones)에서도 이 속성을 변경할 수 있습니다.

`cluster config show ignite.aipersist` CLI 명령어로 데이터 영역 정보를 확인합니다. 기본 데이터 영역은 다음과 같습니다.

```json
{
  "ignite" : {
    "checkpoint" : {
      "checkpointDelayMillis" : 200,
      "checkpointThreads" : 4,
      "compactionThreads" : 4,
      "frequency" : 180000,
      "frequencyDeviation" : 40,
      "logReadLockThresholdTimeoutMillis" : 0,
      "readLockTimeoutMillis" : 10000,
      "useAsyncFileIoFactory" : true
    },
    "defaultRegion" : {
      "memoryAllocator" : {
        "type" : "unsafe"
      },
      "replacementMode" : "CLOCK",
      "size" : 268435456
    },
    "pageSizeBytes" : 16384,
    "regions" : [ ]
  }
}
```

기본 영역의 크기를 변경하려면 `cluster config update` 명령어를 사용하세요.

```shell
cluster config update --url http://localhost:10300 ignite.aipersist.defaultRegion.size:9999999
```

## 로컬 경로 구성 {#configuring-local-paths}

기본적으로 Ignite가 생성하는 모든 파일은 설치 폴더에 저장됩니다. 하지만 환경에 따라 파일 경로를 변경해야 할 수도 있습니다. `{IGNITE_HOME}\etc\vars.env` 파일을 사용하면 파일 저장 경로를 변경할 수 있습니다. 변경 가능한 경로는 다음과 같습니다.

* 데이터가 저장되는 작업 디렉터리.
* 로그가 저장되는 로그 폴더.
* 라이브러리를 불러오는 폴더.
* 기본 노드 설정에 사용하는 구성 파일.

노드 구성에서도 다음을 설정할 수 있습니다.

* `ignite.system.cmgPath` 속성으로 CMG 정보가 저장되는 위치.
* `ignite.system.metastoragePath` 속성으로 메타스토리지 정보가 저장되는 위치.
* `ignite.system.partitionsBasePath` 속성으로 데이터 파티션이 저장되는 위치.
* `ignite.system.partitionsLogPath` 속성으로 RAFT 로그가 저장되는 위치. 이 로그는 노드 로그와 별도로 관리됩니다.

## 힙 사용량 구성 {#configuring-heap-usage}

Ignite는 필요에 따라 각 [스토리지 엔진](/configure-and-operate/configuration/config-storage-overview)에 개별적으로 예약된 오프힙 메모리에 데이터를 저장합니다. 하지만 워크로드가 생성하는 중간 객체를 처리하는 데는 Java 힙 메모리도 사용합니다. 예를 들면 다음과 같습니다.

* 클러스터 및 노드 메타데이터. 여기에는 클러스터에 속한 노드 정보, 내부 로그, 테이블 [버전 체인](/understand/core-concepts/data-partitioning#version-storage), 트랜잭션을 위해 잠긴 키, Ignite가 정상적으로 동작하는 데 필요한 그 밖의 모든 정보가 포함됩니다.
* 중간 쿼리 결과. 특히 대용량 데이터 세트에서 쿼리를 실행할 때는 힙 메모리가 더 필요할 수 있습니다.
* [컴퓨트](/develop/work-with-data/compute) 작업은 데이터를 저장하는 데 힙 메모리를 사용하는 경우가 많습니다. 컴퓨트 작업의 구체적인 요구 사항은 수행하는 작업에 따라 다릅니다.

기본적으로 Ignite는 힙 스토리지에 16GB를 할당합니다. 환경과 워크로드에 따라 이 값을 변경하는 것이 좋습니다. 힙이 작을수록 가비지 컬렉션은 빨라지지만 Ignite에 할당되는 리소스는 줄어듭니다. 힙이 클수록 더 많은 객체를 처리할 수 있지만 가비지 컬렉션에 시간이 더 걸릴 수 있습니다.

할당된 힙을 구성하려면 `{IGNITE_HOME}\etc\vars.env` 파일에 있는 `JVM_MAX_MEM`, `JVM_MIN_MEM` 변수를 사용하세요. 이 변수는 JVM의 `Xmx`, `Xms` 변수를 설정하는 것과 같습니다.

## 서버 로깅 구성 {#configuring-server-logging}

기본적으로 Ignite 3는 `java.util.logging`(JUL) 로깅 프레임워크를 사용합니다. `etc/ignite.java.util.logging.properties` 구성을 사용하며, `LOG_DIR` 변수가 가리키는 폴더로 로그를 출력합니다(`etc/vars.env` 파일에서 설정할 수 있음). 기본적으로 로그는 `{IGNITE_HOME}/log` 폴더에 저장됩니다. `java.util.logging.config.file` 속성으로 사용자 지정 구성 파일을 지정할 수 있습니다.

JUL 로깅 구성을 자세히 알아보려면 Oracle 문서의 [Java 로깅 개요](https://docs.oracle.com/en/java/javase/11/core/java-logging-overview.html)를 참조하세요.

:::note
[Java 클라이언트](/develop/ignite-clients/java-client)의 클라이언트 로깅도 구성할 수 있습니다.
:::
