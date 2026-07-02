---
id: disaster-recovery-system-groups
title: 시스템 그룹 재해 복구
sidebar_label: 시스템 그룹 복구
---

Apache Ignite 클러스터에는 두 개의 시스템 RAFT 그룹이 있으며, 둘 다 클러스터의 정상 운영에 필수적입니다.

- [클러스터 관리 그룹(CMG)](/configure-and-operate/operations/lifecycle#cluster-management-group)
- [메타스토리지 그룹(MG)](/configure-and-operate/operations/lifecycle#cluster-metastorage-group)

영구적인 *과반수 상실*을 복구하려면 *시스템 RAFT 그룹*에 *재해 복구* 작업을 수행합니다. 시스템 RAFT 그룹이 과반수를 잃으면 사용할 수 없게 됩니다. CMG를 사용할 수 없으면 클러스터 자체는 제한된 상태로 계속 사용할 수 있습니다. 대부분의 작업은 처리할 수 있지만, 새 노드를 합류시키거나 기존 노드를 시작·재시작하거나 새 인덱스 구축을 시작할 수는 없습니다. MG를 사용할 수 없으면 클러스터를 아예 사용할 수 없으며, GET/PUT/SQL 요청조차 처리하지 못합니다.

:::note
[데이터 파티션](/configure-and-operate/operations/disaster-recovery-partitions)의 재해 복구는 별도 페이지에서 설명합니다.
:::

과반수 상실 여부는 콘솔의 클러스터 로그나 [순환 로그 파일](https://en.wikipedia.org/wiki/Log_rotation)에서 확인할 수 있습니다. RAFT 그룹을 사용할 수 없게 되면 로그에 `Send with retry timed out [retryCount = 11, groupId = cmg_group].` 또는 `Send with retry timed out [retryCount = 11, groupId = metastorage_group].`와 같은 메시지가 나타납니다.

CMG가 다운됐다는 신호는 `restart` 명령 이후에도 노드가 시작되지 않는 것입니다. 이때 로그에는 `Local CMG state recovered, starting the CMG`가 나타나지만 그 뒤에 `Successfully joined the cluster`가 이어지지 않습니다.

CMG는 사용할 수 있지만 MG는 사용할 수 없는 상태에서 노드가 시작을 시도하면, 로그에 `Metastorage info on start`가 나타나지만 그 뒤에 `Performing MetaStorage recovery`가 이어지지 않습니다.

:::warning
시스템 노드 그룹에 재해 복구 명령어를 적용할 때는 주의하세요. 이 명령어는 *스플릿 브레인*(클러스터가 두 개의 클러스터로 갈라지는 현상)을 일으킬 수 있습니다. 복구 명령어는 CMG/MG의 과반수가 영구적으로 상실된 경우에만 최후의 수단으로 사용하세요.
:::

## 클러스터 관리 그룹 {#cluster-management-group}

CMG가 과반수를 잃은 경우:

1. CMG 노드를 재시작하여 잃어버린 과반수를 복구합니다.
2. 위 방법이 실패하면 다음 [CLI 명령어](/tools/cli-commands)로 (수동으로 또는 REST로) 새 과반수를 강제로 지정합니다: `recovery cluster reset --url=<node-url> --cluster-management-group=<new-cmg-nodes>`.

이 명령어는 `--url` 매개변수가 가리키는 노드로 전송되며, 그 노드는 `new-cmg-nodes` RAFT 그룹에 속해 있어야 합니다. 이 노드가 *복구 지휘자*(Repair Conductor)가 되어 `reset` 절차를 시작합니다.

위 절차는 다음과 같은 이유로 실패할 수 있습니다.

- `new-cmg-nodes`에 지정한 노드 중 일부가 물리 토폴로지에 없습니다.
- 복구 지휘자가 절차를 시작하는 데 필요한 정보를 모두 확보하지 못했습니다.

3. 일부 노드가 다운되었거나 네트워크 분할로 사용할 수 없어 복구에 참여하지 못한 경우:
   1. 해당 노드를 시작합니다(또는 네트워크 연결을 복원하고 재시작합니다).
   2. 다음 [CLI 명령어](/tools/cli-commands)로 (수동으로 또는 REST로) 해당 노드를 복구된 클러스터로 이전합니다: `recovery cluster migrate --old-cluster-url=<url-of-old-cluster-node> --new-cluster-url=<url-of-new-cluster-node>`.

## 메타스토리지 그룹 {#metastorage-group}

MG가 과반수를 잃은 경우:

1. MG 노드를(적어도 Apache Ignite 노드 내부의 RAFT 노드만이라도) 재시작합니다.
2. 위 방법이 실패하면:
   1. 시작할 수 있는 모든 노드가 시작되어 클러스터에 합류했는지 확인합니다.
   2. 다음 [CLI 명령어](/tools/cli-commands)로 (수동으로 또는 REST로) 새 과반수를 강제로 지정합니다: `recovery cluster reset --url=<existing-node-url> [--cluster-management-group=<new-cmg-nodes>] --metastorage-replication-factor=N`.

`N`은 복구 후 MG에 두려는 투표 RAFT 노드의 개수입니다. `--cluster-management-group`을 생략하면, 명령어는 현재 CMG 투표 구성원 집합을 CMG 리더에서 가져옵니다. CMG를 사용할 수 없으면 명령어가 실패합니다.

이 명령어는 `--url`로 지정한 노드로 전송됩니다. 이 노드가 *복구 지휘자*가 되어 `reset` 절차를 시작합니다.

복구 지휘자가 MG 복구에 실패하면 절차를 수동으로 반복해야 합니다(장애 조치가 없습니다).

3. 일부 노드가 다운되었거나 네트워크 분할로 사용할 수 없어 복구에 참여하지 못한 경우:
   1. 해당 노드를 시작합니다(또는 네트워크 연결을 복원하고 재시작합니다).
   2. 다음 [CLI 명령어](/tools/cli-commands)로 (수동으로 또는 REST로) 해당 노드를 복구된 클러스터로 이전합니다: `recovery cluster migrate --old-cluster-url=<url-of-old-cluster-node> --new-cluster-url=<url-of-new-cluster-node>`.

:::note
어떤 노드의 메타스토리지에 복구에 참여한 어느 노드에도 없는 리비전이 있다면, 이는 그 노드의 메타스토리지가 MG 리더의 메타스토리지와 갈라졌다는 뜻입니다. 이런 노드는 클러스터에 합류할 수 없습니다. 노드 시작이 `MetastorageDivergedException (error code META-7)` 예외로 실패합니다. 이렇게 메타스토리지가 갈라진 노드에서 데이터를 제거한 뒤, 빈 노드로 클러스터에 합류시키세요.
:::
