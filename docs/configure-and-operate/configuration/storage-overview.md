---
id: config-storage-overview
title: 스토리지
sidebar_label: 스토리지 개요
---

Apache Ignite 3는 데이터를 저장할 위치와 방식을 세밀하게 구성할 수 있는 최신 스토리지 시스템을 제공합니다. 이 문서에서는 Apache Ignite의 스토리지 원칙을 개괄적으로 설명합니다.

아래 다이어그램은 테이블, 분산 영역(distribution zone), 스토리지 프로파일(storage profile), 스토리지 엔진(storage engine) 간의 관계를 보여줍니다:

![Storage architecture](/img/storage.png)

Apache Ignite에서 스토리지는 클러스터 전역 구성 요소와 노드별 구성 요소로 이루어집니다:

- **클러스터 전역 구성 요소**: 테이블 정의, 분산 영역 구성, 프로파일 이름/유형은 클러스터 전체에서 동일합니다.
- **노드별 구성 요소**: 스토리지 프로파일의 실제 구현은 각 노드에서 로컬로 구성합니다.

Apache Ignite 아키텍처는 다음과 같은 구조로 이루어집니다:

- 테이블은 데이터를 담고 있으며, 분산 영역에 할당됩니다
- 분산 영역은 클러스터 전체에서 데이터가 파티셔닝되고 분산되는 방식을 결정합니다
- 스토리지 프로파일은 어떤 스토리지 엔진을 사용할지, 그리고 이를 어떻게 구성할지 정의합니다
- 스토리지 엔진은 데이터의 실제 저장과 조회를 처리합니다

예를 들어 `fast_storage`라는 프로파일을 사용하는 모든 노드는 동일한 엔진 유형(예: `aimem`)으로 구성해야 하지만, 메모리 할당량 같은 스토리지 프로파일 설정은 각 노드의 사양에 따라 다르게 지정할 수 있습니다.

## 스토리지 엔진이란? {#what-is-a-storage-engine}

스토리지 엔진은 데이터가 스토리지 매체에 물리적으로 기록되고 읽히는 방식을 처리합니다. 각 엔진은 서로 다른 사용 패턴에 최적화된 고유한 방식으로 데이터를 구성하고 접근합니다. 스토리지 엔진은 다음을 정의합니다:

- 저장된 데이터의 바이너리 형식
- 특정 데이터 형식에 대한 구성 속성

Apache Ignite는 다양한 스토리지 엔진을 지원하며, 예상 데이터베이스 워크로드에 따라 이를 상호 교환하여 사용할 수 있습니다.

## 사용 가능한 스토리지 엔진 {#available-storage-engines}

### AIMemory 스토리지(휘발성) {#aimemory-storage-volatile}

Apache Ignite 휘발성 스토리지는 영속성을 보장하지 않는 대신 빠른 인메모리 스토리지를 제공합니다. 모든 데이터는 RAM에 저장되며 클러스터가 종료되면 사라집니다.

### AIPersist 스토리지(B+ 트리) {#aipersist-storage-b-tree}

Apache Ignite 영속성은 응답성이 좋은 영속 스토리지를 제공합니다. 모든 데이터를 디스크에 저장하고, 처리를 위해 가능한 한 많은 데이터를 RAM에 적재합니다. 각 파티션은 인덱스, 메타데이터와 함께 별도의 파일에 저장됩니다.

### RocksDB 스토리지(LSM 트리) {#rocksdb-storage-lsm-tree}

RocksDB는 Log-Structured Merge(LSM) 트리를 기반으로 하는 실험적인 영속 스토리지 엔진으로, 쓰기 요청이 많은 환경에 최적화되어 있습니다.

## 스토리지 엔진 구성 {#configuring-storage-engines}

스토리지 엔진 구성은 해당 엔진을 사용하는 모든 프로파일에 적용됩니다. 모든 스토리지 엔진은 각자의 기본 구성으로 시작합니다. 스토리지 엔진 구성을 변경하려면 CLI 도구를 사용하세요:

```shell
node config show ignite.storage.engines
node config update ignite.storage.engines.aipersist.checkpoint.intervalMillis = 16000
```

구성을 업데이트한 뒤에는 변경 사항이 적용되도록 노드를 재시작하세요.

## 스토리지 프로파일이란? {#what-is-a-storage-profile}

스토리지 프로파일은 스토리지 엔진의 구성 매개변수를 정의하는 Apache Ignite 노드 엔티티입니다. [분산 영역](/sql/reference/language-definition/distribution-zones)은 노드 구성에서 선언한 스토리지 프로파일 집합을 사용하도록 구성해야 합니다. 테이블에는 주 스토리지 프로파일을 하나만 정의할 수 있습니다.

스토리지 프로파일은 다음을 정의합니다:

- 데이터를 저장하는 데 사용할 스토리지 엔진
- 해당 스토리지 엔진의 구성 값

노드에는 스토리지 프로파일을 원하는 만큼 선언할 수 있습니다.

## 기본 스토리지 프로파일 {#default-storage-profile}

Apache Ignite는 영속 Apache Ignite 스토리지 엔진(`aipersist`)을 사용하는 `default` 스토리지 프로파일을 생성합니다. 별도로 지정하지 않으면 분산 영역은 이 스토리지 프로파일을 사용합니다. 노드에서 현재 사용 가능한 프로파일을 확인하려면 다음 명령어를 사용하세요:

```shell
node config show ignite.storage.profiles
```

## 스토리지 프로파일 생성 및 사용 {#creating-and-using-storage-profiles}

Apache Ignite는 `default` 스토리지 프로파일을 자동으로 생성하지만, 필요에 따라 추가 프로파일을 만들 수 있습니다. 새 프로파일을 만들려면 프로파일 구성을 `storage.profiles` 매개변수에 전달하세요:

```shell
node config update "ignite.storage.profiles:{rocksProfile{engine:rocksdb,sizeBytes:10000}}"
```

구성을 업데이트하고 노드를 재시작하면 새 스토리지 프로파일을 분산 영역에서 사용할 수 있습니다.

## 스토리지 프로파일로 테이블 정의 {#defining-tables-with-storage-profiles}

스토리지 프로파일과 [분산 영역](/sql/reference/language-definition/distribution-zones)을 정의한 뒤에는 SQL이나 [코드](/develop/work-with-data/java-to-tables)로 테이블을 생성할 수 있습니다. 영역과 스토리지 프로파일은 모두 테이블을 생성한 뒤에는 변경할 수 없습니다.

특정 스토리지 프로파일로 테이블을 생성하려면:

```sql
CREATE ZONE IF NOT EXISTS exampleZone STORAGE PROFILES ['default, profile1'];

CREATE TABLE exampleTable (key INT PRIMARY KEY, my_value VARCHAR)
ZONE exampleZone STORAGE PROFILE 'profile1';
```

이 경우 `exampleTable` 테이블은 `profile1` 스토리지 프로파일에 지정된 매개변수로 스토리지 엔진을 사용합니다. 노드에 `profile1`이 구성되어 있지 않으면 해당 노드에는 이 테이블이 저장되지 않습니다. 노드마다 `profile1` 구성이 다를 수 있으며, 데이터는 각 노드의 로컬 구성에 따라 저장됩니다.
