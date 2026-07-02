---
id: config-storage
title: 스토리지 프로파일
sidebar_label: 스토리지 프로파일
---

## 스토리지 프로파일이란? {#what-is-a-storage-profile}

스토리지 프로파일(storage profile)은 스토리지 엔진(storage engine)과 그 구성 매개변수를 정의하는 Apache Ignite 노드 엔티티입니다. 스토리지 프로파일은 테이블과, 데이터를 저장하는 기반 스토리지 엔진 사이를 연결합니다.

스토리지 프로파일은 다음을 정의합니다:

- 데이터를 저장하는 데 사용할 스토리지 엔진
- 특정 스토리지 엔진의 구성 속성에 지정할 값

Apache Ignite 클러스터의 각 노드에는 여러 스토리지 프로파일을 정의할 수 있지만, 테이블 하나에는 스토리지 프로파일을 하나만 정의할 수 있습니다.

## 스토리지 프로파일과 분산 영역 {#storage-profiles-and-distribution-zones}

분산 영역(distribution zone)은 미리 선언한 스토리지 프로파일 집합을 사용하도록 구성해야 합니다. 이렇게 하면 해당 영역에서 생성되는 테이블마다 서로 다른 스토리지 엔진을 지정할 수 있습니다. 분산 영역을 생성할 때 사용할 스토리지 프로파일을 지정합니다:

```sql
CREATE ZONE exampleZone (PARTITIONS 2, REPLICAS 3) STORAGE PROFILES ['profile1, profile3'];
```

이 경우 이 분산 영역에서 생성된 테이블은 `profile1` 또는 `profile3`만 사용할 수 있습니다.

## 기본 스토리지 프로파일 {#default-storage-profile}

Apache Ignite는 데이터를 저장할 때 영속 Apache Ignite 스토리지 엔진(`aipersist`)을 사용하는 `default` 스토리지 프로파일을 생성합니다. 별도로 지정하지 않으면 분산 영역은 이 스토리지 프로파일로 데이터를 저장합니다.

노드에서 현재 사용 가능한 프로파일을 확인하려면 다음 명령어를 사용하세요:

```bash
node config show ignite.storage.profiles
```

## 스토리지 프로파일 생성 및 사용 {#creating-and-using-storage-profiles}

기본적으로는 `default` 스토리지 프로파일만 생성되지만, 노드에는 스토리지 프로파일을 원하는 만큼 둘 수 있습니다. 새 프로파일을 생성하려면 프로파일 구성을 `storage.profiles` 매개변수에 전달하세요:

```bash
node config update "ignite.storage.profiles:{rocksProfile{engine:rocksdb,size:10000}}"
```

구성을 업데이트한 뒤에는 반드시 노드를 재시작하세요. 생성된 스토리지 프로파일은 재시작 후에 분산 영역에서 사용할 수 있습니다.

## 스토리지 프로파일로 테이블 정의 {#defining-tables-with-storage-profiles}

스토리지 프로파일과 분산 영역을 정의한 뒤에는 SQL이나 코드로 그 안에 테이블을 생성할 수 있습니다. 영역과 스토리지 프로파일은 모두 테이블을 생성한 뒤에는 변경할 수 없습니다.

예를 들어, 간단한 테이블은 다음과 같이 생성합니다:

```sql
CREATE TABLE exampleTable (key INT PRIMARY KEY, my_value VARCHAR) ZONE exampleZone STORAGE PROFILE 'profile1';
```

이 경우 `exampleTable` 테이블은 `profile1` 스토리지 프로파일에 지정된 매개변수로 스토리지 엔진을 사용합니다. 노드에 `profile1`이 없으면 해당 노드에는 이 테이블이 저장되지 않습니다. 노드마다 `profile1` 구성이 다를 수 있으며, 데이터는 각 노드의 로컬 구성에 따라 저장됩니다.
