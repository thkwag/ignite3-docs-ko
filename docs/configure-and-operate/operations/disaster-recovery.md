---
id: disaster-recovery
title: 재해 복구
sidebar_label: 개요
---

재해 복구(disaster recovery) 작업은 일관성 문제로 데이터 작업을 수행할 수 없을 때 Apache Ignite 클러스터를 복원합니다. 이런 상황은 보통 노드에 장애가 발생하거나 노드에 접근할 수 없을 때 나타나며, 데이터를 다시 일관된 상태로 되돌리거나 현재 상태를 일관된 것으로 선언하려면 별도의 조치가 필요합니다.

Apache Ignite 3는 다음 두 가지 유형의 장애에 대응하는 복구 메커니즘을 제공합니다:

## 데이터 파티션 복구 {#data-partition-recovery}

데이터 파티션은 애플리케이션 데이터를 여러 분산 영역(distribution zone)에 나누어 저장합니다. 파티션 복제본을 사용할 수 없거나 일관성이 깨지면, 데이터에 다시 접근하기 위해 복제본을 복구해야 합니다. 복구 절차는 영향을 받은 복제본이 소수(minority)인지 과반수(majority)인지에 따라 달라집니다.

자세한 절차는 [데이터 파티션 복구](disaster-recovery-partitions.md)를 참고하세요.

## 시스템 그룹 복구 {#system-group-recovery}

시스템 그룹은 클러스터 메타데이터를 유지하고 노드 간 조정을 담당합니다. Apache Ignite는 두 가지 핵심 시스템 그룹을 사용합니다:

- **클러스터 관리 그룹(Cluster Management Group, CMG)**: 클러스터 토폴로지와 노드 구성원을 관리합니다
- **메타스토리지 그룹(Metastorage Group)**: 클러스터 메타데이터와 구성을 저장합니다

이러한 그룹은 클러스터 운영에서 맡는 역할 때문에 데이터 파티션과는 다른 복구 절차가 필요합니다.

자세한 절차는 [시스템 그룹 복구](disaster-recovery-system-groups.md)를 참고하세요.

## 복구 도구 {#recovery-tools}

Apache Ignite는 재해 복구 작업에 사용할 CLI 명령어를 제공합니다:

- `recovery partition states`: 파티션의 상태와 가용성을 확인합니다
- `recovery partitions restart`: 파티션을 재시작해 문제를 해결합니다
- `recovery partitions reset`: 파티션을 일관된 상태로 재설정합니다

전체 명령어 참조는 [CLI 명령어](/tools/cli-commands)를 참고하세요.
