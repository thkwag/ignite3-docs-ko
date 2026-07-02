---
id: config-cluster-and-nodes
title: 클러스터 및 노드 구성
sidebar_label: 클러스터와 노드
---

Ignite 3에서는 [CLI 도구](/tools/cli-commands)로 구성(configuration)을 수행합니다. Ignite 3 구성은 HOCON 형식으로 저장됩니다. 클러스터 실행 중이든 클러스터 시작 시점이든 언제든지 매개변수를 관리하고 구성할 수 있습니다.

Ignite 3에서는 HOCON 또는 JSON으로 구성을 생성하고 관리할 수 있습니다. 구성 파일에는 `ignite`라는 단일 루트 "노드"가 있습니다. 모든 구성 섹션은 이 노드 아래에 자식, 손자 형태로 계층을 이룹니다.

## CLI에서 구성 업데이트 {#updating-configuration-from-cli}

### 클러스터 및 노드 구성 조회 {#getting-cluster-and-node-configuration}

`cluster config show` 명령어로 클러스터 구성을 조회하고, `node config show` 명령어로 현재 연결된 노드의 구성을 조회할 수 있습니다.

### 클러스터 및 노드 구성 업데이트 {#updating-cluster-and-node-configuration}

`cluster config update`와 `node config update` 명령어에 유효한 HOCON 문자열을 매개변수로 전달해 구성을 업데이트할 수 있습니다. 다음은 구성을 업데이트하는 몇 가지 예시입니다:

#### 단일 매개변수 업데이트 {#updating-a-single-parameter}

단일 매개변수는 해당 매개변수를 지정하고 새 값을 할당해 업데이트합니다:

```shell
node config update ignite.network.shutdownTimeoutMillis=20000
```

#### 여러 매개변수 업데이트 {#updating-multiple-parameters}

여러 매개변수를 한 번에 업데이트하려면 유효한 HOCON 구성을 Ignite에 전달합니다. 그러면 CLI 도구가 이를 파싱해 필요한 모든 변경을 한꺼번에 적용합니다.

```shell
cluster config update "{ignite{security.authentication.providers:[{name:basic,password:admin_password,type:basic,username:admin_user,roles:[admin]}],security.authentication.enabled:true}}"
```

## 구성 파일 {#configuration-files}

Ignite 노드는 시작할 때 `etc/ignite-config.conf` 파일에서 시작 구성을 읽습니다. 이 파일을 수정하면 노드를 항상 지정된 구성으로 일관되게 시작할 수 있습니다.

클러스터 구성은 클러스터 노드에 저장되며 클러스터의 모든 노드에 자동으로 공유됩니다. 이 구성은 CLI 도구로 관리하세요.

Ignite는 노드나 클러스터 운영과 무관한 속성을 정의하기 위해 여러 환경 매개변수도 사용합니다. 노드는 시작할 때 이 매개변수들을 `etc/vars.env` 파일에서 읽어들입니다. 작업 관련 폴더의 위치, JVM 속성, 그리고 `IGNITE3_EXTRA_JVM_ARGS` 매개변수로 전달하는 추가 JVM 인수를 구성하려면 이 파일을 편집하세요.
