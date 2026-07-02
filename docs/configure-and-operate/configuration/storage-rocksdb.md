---
id: config-storage-rocksdb
title: RocksDB 스토리지
sidebar_label: RocksDB 스토리지
---

RocksDB는 Log-Structured Merge(LSM) 트리를 기반으로 하는 영속 스토리지 엔진입니다. 쓰기 요청이 많은 환경에 가장 적합합니다.

## 프로파일 구성 {#profile-configuration}

각 Apache Ignite 스토리지 엔진에는 여러 스토리지 프로파일을 둘 수 있습니다. 각 프로파일에는 다음 속성이 있습니다.

| 속성 | 기본값 | 설명 |
|---|---|---|
| engine | | 스토리지 엔진의 이름입니다. |
| sizeBytes | `256 * 1024 * 1024` | 스토리지 프로파일에 할당되는 공간을 바이트 단위로 설정합니다. |
| writeBufferSizeBytes | `64 * 1024 * 1024` | RocksDB 쓰기 버퍼의 크기입니다. |

## 구성 예시 {#configuration-example}

Apache Ignite 3에서는 구성을 HOCON 또는 JSON 형식으로 작성하고 관리할 수 있습니다. 구성 파일에는 `ignite`라는 단일 루트 "노드"가 하나 있습니다. 모든 구성 섹션은 이 노드 아래에 자식, 손자 등으로 중첩됩니다. 아래 예시는 RocksDB 스토리지로 스토리지 프로파일을 구성하는 방법을 보여줍니다.

```json
{
  "ignite" : {
    "storage" : {
      "profiles" : [
        {
          "name" : "rocks_profile",
          "engine" : "rocksDb",
          "sizeBytes" : 2560000
        }
      ]
    }
  }
}
```

그런 다음 이 프로파일(여기서는 `rocks_profile`)을 분산 영역(distribution zone) 구성에서 사용할 수 있습니다.
