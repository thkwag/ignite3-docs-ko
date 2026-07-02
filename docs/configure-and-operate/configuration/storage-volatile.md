---
id: config-storage-volatile
title: 휘발성 스토리지
sidebar_label: 휘발성 스토리지
---

## 개요 {#overview}

Apache Ignite 휘발성(volatile) 스토리지는 데이터 영속성(persistence)을 보장하지 않는 대신, 빠르고 응답성이 좋은 스토리지를 제공하도록 설계되었습니다.

데이터 영역(data region)에서 휘발성 스토리지를 활성화하면 Apache Ignite는 해당 데이터 영역의 모든 데이터를 RAM에 저장합니다. 클러스터를 종료하면 데이터가 모두 사라지므로, 영속 스토리지를 위한 별도의 데이터 영역을 반드시 마련하세요.

## 프로파일 구성 {#profile-configuration}

Apache Ignite의 각 스토리지 엔진(storage engine)은 여러 스토리지 프로파일(storage profile)을 둘 수 있습니다. 각 프로파일에는 다음과 같은 속성이 있습니다:

| 속성 | 기본값 | 설명 |
|---|---|---|
| engine | | 스토리지 엔진 이름. |
| name | | 스토리지 프로파일 이름. |
| initSizeBytes | 268435456 | 메모리 영역의 초기 크기(바이트). 사용 중인 메모리 크기가 이 값을 넘으면 새로운 메모리 청크가 할당됩니다. |
| maxSizeBytes | 268435456 | 메모리 영역의 최대 크기(바이트). |

## 구성 예시 {#configuration-example}

Apache Ignite 3에서는 구성을 HOCON 또는 JSON 형식으로 작성하고 관리할 수 있습니다. 구성 파일에는 `ignite`라는 이름의 단일 루트 "노드"가 있습니다. 모든 구성 섹션은 이 노드의 자식, 손자 등에 해당합니다. 아래 예시는 휘발성 스토리지를 사용하는 데이터 영역 하나를 구성하는 방법을 보여줍니다.

```json
{
  "ignite" : {
    "storage" : {
      "profiles" : [
        {
           "engine": "aimem",
           "name": "default_aimem",
           "initSizeBytes": 268435456,
           "maxSizeBytes": 268435456
          }
      ]
    }
  }
}
```

그런 다음 이 프로파일(여기서는 `default_aimem`)을 분산 영역(distribution zone) 구성에서 사용할 수 있습니다.
