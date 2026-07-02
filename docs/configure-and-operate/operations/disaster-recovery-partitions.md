---
id: disaster-recovery-partitions
title: 데이터 파티션 재해 복구
sidebar_label: 데이터 파티션 복구
---

Apache Ignite가 데이터 일관성을 보장할 수 없어 클러스터 노드에서 데이터 작업을 수행할 수 없게 된 상황을 복구하려면 *재해 복구*(disaster recovery) 작업을 수행합니다. 이런 경우에는 데이터를 다시 일관된 상태로 되돌리거나 현재 상태를 일관된 것으로 선언해야 합니다.

:::note
시스템 그룹([클러스터 관리 그룹](/configure-and-operate/operations/disaster-recovery-system-groups#cluster-management-group), [메타스토리지 그룹](/configure-and-operate/operations/disaster-recovery-system-groups#metastorage-group))의 재해 복구는 별도 페이지에서 설명합니다.
:::

## 재해 시나리오와 복구 절차 {#disaster-scenarios-and-recovery-instructions}

### 소수 오프라인 {#minority-offline}

*소수*(minority)는 분산 영역(distribution zone, DZ)에 구성된 *복제본*(replica) 수의 절반 미만을 뜻합니다. 예를 들어 DZ1에 복제본 2개, DZ2에 복제본 3개가 구성되어 있다면, Apache Ignite 노드 하나를 잃는 것은 DZ1에는 과반수 손실이지만 DZ2에는 소수 손실입니다.

클러스터 노드 하나 이상이 오프라인 상태인지는 여러 방법으로 확인할 수 있습니다. 예를 들어 `--global` 옵션을 지정한 `recovery partition states` [CLI 명령어](/tools/cli-commands)를 실행하면, 오프라인 노드에 대해 `Read-only partition`, `Degraded partition`, `Unavailable partition` 중 하나가 표시됩니다.

소수 오프라인 상태를 발견했다면 다음 절차를 따르세요:

1. 시스템에 오프라인 노드를 온라인 상태로 전환하도록 명령합니다.

시스템은 지정된 노드를 온라인 상태로 전환하려고 시도합니다. 가능한 결과는 다음과 같습니다.

- 노드가 (축소 타임아웃 전에) 제때 온라인 상태로 복귀하고 유효한 데이터를 갖고 있습니다. 시스템은 로그 복제 또는 전체 상태 전송 절차 중 하나를 사용해 누락된 데이터(있는 경우)를 복제합니다.
- 노드가 제때 온라인 상태로 복귀했지만 데이터가 없습니다. 시스템은 전체 상태 전송 절차를 사용해 데이터를 복제합니다.
- 노드가 축소 타임아웃 전에 온라인 상태로 복귀하지 못합니다. 시스템은 새 노드에 복제본을 배치하고 리밸런싱 절차를 시작합니다.
- 노드가 일관되지 않은 데이터를 가진 채 온라인 상태로 복귀합니다 - 4단계와 5단계를 참고하세요.

:::note
전체 상태 전송과 리밸런싱은 오랜 시간(수십 분)이 걸릴 수 있습니다. 노드가 오프라인 상태임을 발견하는 즉시 복구하는 것을 권장합니다.
:::

2. 해당하는 영역/노드/파티션에서 `recovery partition states` 명령어를 실행해 [파티션 상태](#partition-states)를 확인합니다.
3. 상태가 `Healthy` 또는 `Available partition`이면 복구가 완료된 것으로 간주합니다.
4. 상태가 `Broken`이면:
   1. `recovery partitions restart` 명령어를 사용해 Apache Ignite 노드 또는 해당 파티션을 재시작합니다.
   2. `recovery partition states` 명령어를 다시 실행합니다.
   3. 파티션 상태가 여전히 `Broken`이면, `recovery partitions restart --with-cleanup` 명령어를 사용해 삭제와 함께 파티션을 재설정합니다. 로컬 파티션 데이터가 삭제되고 클러스터에서 복원됩니다.
5. 파티션 상태가 `Read-only partition`, `Degraded partition`, `Unavailable partition` 중 하나이면, `recovery reset partitions` 명령어를 사용해 해당 파티션을 재설정합니다.

### 과반수 오프라인 {#majority-offline}

*과반수*(majority)는 분산 영역(DZ)에 구성된 복제본 수의 절반 이상을 뜻합니다. 예를 들어 DZ1에 복제본 2개, DZ2에 복제본 3개가 구성되어 있다면, Apache Ignite 노드 하나를 잃는 것은 DZ1에는 과반수 손실이지만 DZ2에는 소수 손실입니다.

클러스터 노드 하나 이상이 오프라인 상태인지는 여러 방법으로 확인할 수 있습니다. 예를 들어 `--global` 옵션을 지정한 `recovery partition states` CLI 명령어를 실행하면, 오프라인 노드에 대해 `Read-only partition`, `Degraded partition`, `Unavailable partition` 중 하나가 표시됩니다.

온라인 상태로 남은 노드에 프라이머리 복제본이 포함되어 있으면 파티션은 `Read-only partition`이 됩니다([전역 파티션 상태](#global-partition-states) 참고). 리스가 만료될 때까지는 모든 데이터를 읽을 수 있습니다. 온라인 상태로 남은 노드에 프라이머리 복제본이 *포함되어 있지 않으면* 파티션은 `Unavailable partition`이 됩니다.

과반수 오프라인 상태를 발견했다면 다음 절차를 따르세요:

1. 시스템에 오프라인 노드를 온라인 상태로 전환하도록 명령합니다.

시스템은 지정된 노드를 온라인 상태로 전환하려고 시도합니다. 가능한 결과는 다음과 같습니다.

- 노드가 (축소 타임아웃 전에) 제때 온라인 상태로 복귀하고 유효한 데이터를 갖고 있습니다. 리더가 선출되고, 시스템은 로그 복제 또는 전체 상태 전송 절차 중 하나를 사용해 누락된 데이터(있는 경우)를 복제하며, 리스홀더가 선출됩니다.
- 노드가 일관되지 않은 데이터를 가진 채 온라인 상태로 복귀합니다 - 4단계와 5단계를 참고하세요.

:::note
전체 상태 전송과 리밸런싱은 오랜 시간(수십 분)이 걸릴 수 있습니다. 노드가 오프라인 상태임을 발견하는 즉시 복구하는 것을 권장합니다.
:::

2. 해당하는 영역/노드/파티션에서 `recovery partition states` 명령어를 실행해 [파티션 상태](#partition-states)를 확인합니다.
3. 상태가 `Healthy` 또는 `Available partition`이면 복구가 완료된 것으로 간주합니다.
4. 상태가 `Broken`이면:
   1. `recovery partitions restart` 명령어를 사용해 Apache Ignite 노드 또는 해당 파티션을 재시작합니다.
   2. `recovery partition states` 명령어를 다시 실행합니다.
   3. 파티션 상태가 여전히 `Broken`이면, `recovery partitions restart --with-cleanup` 명령어를 사용해 삭제와 함께 파티션을 재설정합니다. 로컬 파티션 데이터가 삭제되고 클러스터에서 복원됩니다.
5. 파티션 상태가 `Read-only partition`, `Degraded partition`, `Unavailable partition` 중 하나이면, `recovery partitions reset` CLI 명령어를 사용해 해당 파티션을 재설정합니다.

과반수 오프라인 시나리오에서는 일반적으로 데이터 일부를 잃게 됩니다. 예를 들어 파티션 B가 `Available partition` 상태인 동안 파티션 A를 재설정하면 다음을 잃게 됩니다:

- `recovery partitions reset`으로 복원한 파티션 A의 최신 데이터
- 파티션 A에도 데이터를 삽입한 트랜잭션에서 파티션 B에 삽입되었던 최신 데이터 일부

### 파티션 손실 {#partition-loss}

이 시나리오에서는 [과반수 오프라인](#majority-offline) 상태에 더해 파티션(예: 파티션 A)의 복제본을 모두 잃습니다. `recovery partitions reset` CLI 명령어를 실행하면 파티션 A의 데이터를 *전부* 잃게 되며, 다른 파티션의 최근 업데이트 일부도 함께 잃을 수 있습니다.

[과반수 오프라인](#majority-offline) 시나리오에서 설명한 대로 노드를 다시 온라인 상태로 되돌려 보세요.

## 파티션 상태 {#partition-states}

이 섹션에서는 파티션의 가용성과 사용 준비 상태를 정의하는 데이터 파티션 상태를 설명합니다.

### 로컬 파티션 상태 {#local-partition-states}

*로컬 파티션 상태*(local partition state)는 파티션과 연관된 복제본, 스토리지, 상태 머신 등의 로컬 속성입니다.

- `Healthy` - 상태 머신이 문제없이 실행되고 있습니다.
- `Initializing` - 노드는 온라인 상태이지만 해당 RAFT 그룹의 초기화가 아직 완료되지 않았습니다.
- `Snapshot installation` - 전체 상태 전송이 진행 중입니다. 전송이 끝나면 파티션은 `healthy` 또는 `catching-up` 상태가 됩니다. 그 전까지는 데이터를 읽을 수 없으며 로그 복제도 일시 중지됩니다.
- `Catching-up` - 노드가 리더로부터 데이터를 복제하는 중이며, 데이터가 약간 과거 시점입니다. 구체적으로는 노드가 로그 항목 100개에 해당하는 로그의 꼬리 부분을 아직 복제하지 않은 상태입니다.
- `Broken` - 상태 머신에 문제가 발생했습니다(대개 예외의 결과입니다). 일부 데이터를 읽지 못할 수 있으며 로그를 복제할 수 없습니다. 이 상태는 자동으로 바뀌지 않으며 개입이 필요합니다.
- `Unavailable` - 파티션 상태를 현재 알 수 없습니다. 파티션이 아직 시작되지 않았거나 이미 중지되는 중일 때 발생할 수 있습니다.

### 전역 파티션 상태 {#global-partition-states}

*전역 파티션 상태*(global partition state)는 사용자 관점에서 드러나는 기능을 나타내는, 파티션의 전역 속성입니다.

- `Available` - 읽기 요청과 쓰기 요청을 모두 처리할 수 있는 정상 파티션입니다. 현재 모든 피어가 정상 상태임을 뜻합니다.
- `Read-only` - 읽기 요청은 처리할 수 있지만 쓰기 요청은 처리할 수 없는 파티션입니다. 정상 상태인 과반수가 없습니다. 다만 과거 시점 데이터를 조회하는 읽기 전용 쿼리를 처리할 수 있는, 살아 있는(정상/캐치업) 피어가 최소 하나는 있습니다.
- `Unavailable` - 어떤 요청도 처리할 수 없는 파티션입니다.
- `Degraded` - 사용자가 사용할 수 있는 파티션이지만 다른 파티션보다 문제가 발생할 위험이 높습니다. 예를 들어 그룹의 피어 중 하나가 오프라인 상태인 경우입니다. 과반수는 여전히 유지되지만 백업 계수가 낮습니다.
